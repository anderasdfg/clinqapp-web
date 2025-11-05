// src/components/onboarding/FileUpload.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  accept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/svg+xml': ['.svg'],
  },
  maxSize = 2 * 1024 * 1024, // 2MB
  className,
}: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(value || null);
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);

      try {
        const supabase = createClient();

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('organizations')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('organizations')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('No se pudo obtener la URL pública');
        }

        // Create local preview for immediate feedback
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Set the actual Supabase URL
        onChange(urlData.publicUrl);
        toast.success('Logo subido exitosamente');
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Error al subir el archivo. Intenta de nuevo.');
        onChange(null);
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          isDragActive
            ? 'border-clinq-cyan-500 bg-clinq-cyan-500/10'
            : 'border-clinq-cyan-500/30 hover:border-clinq-cyan-500/50 bg-clinq-purple-900/30',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />

        {preview ? (
          <div className="relative w-full h-full p-4">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            {isUploading ? (
              <>
                <Upload className="h-8 w-8 text-clinq-cyan-500 animate-pulse" />
                <p className="text-sm text-white/70">Subiendo...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-clinq-cyan-500" />
                <p className="text-sm text-white/70 text-center px-4">
                  {isDragActive
                    ? 'Suelta el archivo aquí'
                    : 'Arrastra una imagen o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-white/50">
                  PNG, JPG, SVG (máx. 2MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

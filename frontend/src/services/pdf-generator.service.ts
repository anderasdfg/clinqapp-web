import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfGeneratorService = {
  async generateSalesReportPDF(
    htmlContent: HTMLElement,
    filename: string = 'reporte-ventas.pdf'
  ): Promise<void> {
    try {
      const canvas = await html2canvas(htmlContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Error al generar el PDF');
    }
  },

  /** Generates a PDF that always fits on exactly ONE A4 page, scaling down if needed */
  async generateSinglePagePDF(
    htmlContent: HTMLElement,
    filename: string = 'comprobante.pdf'
  ): Promise<void> {
    try {
      const canvas = await html2canvas(htmlContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const margin = 10; // mm
      const maxW = pageWidth - margin * 2;
      const maxH = pageHeight - margin * 2;

      // Calculate dimensions to fit the image within one page
      let imgW = maxW;
      let imgH = (canvas.height * imgW) / canvas.width;

      // If still taller than one page, scale down to fit height
      if (imgH > maxH) {
        imgH = maxH;
        imgW = (canvas.width * imgH) / canvas.height;
      }

      // Center horizontally if narrower than page
      const xOffset = margin + (maxW - imgW) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, margin, imgW, imgH);
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating single-page PDF:', error);
      throw new Error('Error al generar el comprobante PDF');
    }
  },
};


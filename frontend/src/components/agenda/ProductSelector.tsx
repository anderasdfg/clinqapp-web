import { useState, useEffect } from 'react';
import { Product, productService } from '@/services/inventory.service';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';

export interface SelectedProduct {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    currentStock: number;
}

interface ProductSelectorProps {
    selectedProducts: SelectedProduct[];
    onProductsChange: (products: SelectedProduct[]) => void;
}

const ProductSelector = ({ selectedProducts, onProductsChange }: ProductSelectorProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showProductList, setShowProductList] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [searchTerm]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const response = await productService.getAll({
                search: searchTerm,
                limit: 20,
            });
            setProducts(response.products.filter(p => p.isActive && p.currentStock > 0));
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addProduct = (product: Product) => {
        const existing = selectedProducts.find(p => p.productId === product.id);
        if (existing) {
            updateQuantity(product.id, existing.quantity + 1);
        } else {
            onProductsChange([
                ...selectedProducts,
                {
                    productId: product.id,
                    name: product.name,
                    quantity: 1,
                    unitPrice: Number(product.salePrice),
                    unit: product.unit,
                    currentStock: Number(product.currentStock),
                },
            ]);
        }
        setSearchTerm('');
        setShowProductList(false);
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        const product = selectedProducts.find(p => p.productId === productId);
        if (!product) return;

        if (newQuantity <= 0) {
            removeProduct(productId);
            return;
        }

        if (newQuantity > product.currentStock) {
            alert(`Stock insuficiente. Disponible: ${product.currentStock}`);
            return;
        }

        onProductsChange(
            selectedProducts.map(p =>
                p.productId === productId ? { ...p, quantity: newQuantity } : p
            )
        );
    };

    const updatePrice = (productId: string, newPrice: number) => {
        if (newPrice < 0) return;
        onProductsChange(
            selectedProducts.map(p =>
                p.productId === productId ? { ...p, unitPrice: newPrice } : p
            )
        );
    };

    const removeProduct = (productId: string) => {
        onProductsChange(selectedProducts.filter(p => p.productId !== productId));
    };

    const filteredProducts = products.filter(p =>
        !selectedProducts.some(sp => sp.productId === p.id)
    );

    const subtotal = selectedProducts.reduce(
        (sum, p) => sum + p.quantity * p.unitPrice,
        0
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                    Agregar Productos (Opcional)
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-secondary))]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowProductList(true);
                        }}
                        onFocus={() => setShowProductList(true)}
                        placeholder="Buscar productos..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                </div>

                {showProductList && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-[rgb(var(--bg-card))] border border-[rgb(var(--border-primary))] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-[rgb(var(--text-secondary))]">
                                Cargando...
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-[rgb(var(--text-secondary))]">
                                No se encontraron productos
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => addProduct(product)}
                                    className="w-full px-4 py-3 text-left hover:bg-[rgb(var(--bg-secondary))] transition-colors border-b border-[rgb(var(--border-primary))] last:border-b-0"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-[rgb(var(--text-primary))]">
                                                {product.name}
                                            </p>
                                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                                                Stock: {product.currentStock} {product.unit}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-primary">
                                            S/ {Number(product.salePrice).toFixed(2)}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {selectedProducts.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-[rgb(var(--text-primary))]">
                            Productos Seleccionados
                        </h4>
                        <span className="text-xs text-[rgb(var(--text-secondary))]">
                            {selectedProducts.length} producto(s)
                        </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedProducts.map((product) => (
                            <div
                                key={product.productId}
                                className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg space-y-2"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-medium text-[rgb(var(--text-primary))] text-sm">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">
                                            Stock disponible: {product.currentStock} {product.unit}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(product.productId)}
                                        className="text-error hover:text-error/80 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-[rgb(var(--text-secondary))] mb-1">
                                            Cantidad
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.productId, product.quantity - 1)}
                                                className="p-1 rounded bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-primary))] transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={product.currentStock}
                                                value={product.quantity}
                                                onChange={(e) => updateQuantity(product.productId, parseInt(e.target.value) || 1)}
                                                className="w-full px-2 py-1 text-center text-sm rounded border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.productId, product.quantity + 1)}
                                                className="p-1 rounded bg-[rgb(var(--bg-card))] hover:bg-[rgb(var(--bg-primary))] transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs text-[rgb(var(--text-secondary))] mb-1">
                                            Precio Unit. (S/)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={product.unitPrice}
                                            onChange={(e) => updatePrice(product.productId, parseFloat(e.target.value) || 0)}
                                            className="w-full px-2 py-1 text-sm rounded border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-1 border-t border-[rgb(var(--border-primary))]">
                                    <span className="text-xs text-[rgb(var(--text-secondary))]">
                                        Subtotal:
                                    </span>
                                    <span className="text-sm font-semibold text-primary">
                                        S/ {(product.quantity * product.unitPrice).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-[rgb(var(--border-primary))]">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-[rgb(var(--text-primary))]">
                                Total Productos:
                            </span>
                            <span className="text-lg font-bold text-primary">
                                S/ {subtotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSelector;

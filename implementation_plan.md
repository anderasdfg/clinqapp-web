# Módulo: Inventario & Venta de Productos

Actualmente ClinqApp solo registra pagos de **servicios vinculados a citas**. Este módulo agrega la capacidad de:
- Gestionar un **catálogo de productos físicos** (con categorías y stock por organización)
- Registrar **ventas de productos** (con o sin paciente asociado)
- Combinar venta de productos + servicio en **un solo comprobante** (reutilizando el modelo `Payment`)
- Llevar un **historial de movimientos de inventario** (entradas, salidas, ajustes)
- Alertas de **stock mínimo**

> [!IMPORTANT]
> Esto requiere una **migración de base de datos** con nuevas tablas. Deben correrse las migraciones antes de desplegar el backend.

---

## Propuesta de Cambios

### Backend — Schema & Base de Datos

#### [MODIFY] [schema.prisma](file:///Users/anderleycandela/Developer/projects/clinqapp-web/backend/prisma/schema.prisma)

Agregar los siguientes modelos nuevos:

```prisma
// ============================================
// PRODUCT CATEGORIES
// ============================================
model ProductCategory {
  id             String       @id @default(uuid()) @db.Uuid
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime     @updatedAt @map("updated_at") @db.Timestamptz

  organizationId String       @map("organization_id") @db.Uuid
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name           String
  description    String?
  isActive       Boolean      @default(true) @map("is_active")

  products       Product[]

  @@map("product_categories")
  @@index([organizationId])
}

// ============================================
// PRODUCTS (Catálogo + Stock)
// ============================================
model Product {
  id             String          @id @default(uuid()) @db.Uuid
  createdAt      DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime        @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt      DateTime?       @map("deleted_at") @db.Timestamptz

  organizationId String          @map("organization_id") @db.Uuid
  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  categoryId     String?         @map("category_id") @db.Uuid
  category       ProductCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  name           String
  description    String?
  sku            String?         // Código interno
  barcode        String?         // Código de barras

  purchasePrice  Decimal         @map("purchase_price") @db.Decimal(10, 2)  // Precio de compra/costo
  salePrice      Decimal         @map("sale_price") @db.Decimal(10, 2)       // Precio de venta

  stockQuantity  Int             @default(0) @map("stock_quantity")          // Stock actual
  minStockAlert  Int             @default(5) @map("min_stock_alert")         // Alerta de stock mínimo
  unit           String          @default("unidad")                          // unidad, caja, ml, etc.

  isActive       Boolean         @default(true) @map("is_active")

  // Relations
  saleItems      ProductSaleItem[]
  movements      InventoryMovement[]

  @@map("products")
  @@index([organizationId])
  @@index([categoryId])
  @@index([organizationId, deletedAt, isActive])
}

// ============================================
// INVENTORY MOVEMENTS (Historial de stock)
// ============================================
enum MovementType {
  PURCHASE    // Entrada por compra
  SALE        // Salida por venta
  ADJUSTMENT  // Ajuste manual
  RETURN      // Devolución
}

model InventoryMovement {
  id             String        @id @default(uuid()) @db.Uuid
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz

  organizationId String        @map("organization_id") @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  productId      String        @map("product_id") @db.Uuid
  product        Product       @relation(fields: [productId], references: [id], onDelete: Cascade)

  performedById  String?       @map("performed_by_id") @db.Uuid
  performedBy    User?         @relation(fields: [performedById], references: [id], onDelete: SetNull)

  type           MovementType
  quantity       Int           // Positivo = entrada, Negativo = salida
  previousStock  Int           @map("previous_stock")
  newStock       Int           @map("new_stock")
  reason         String?       // Descripción del movimiento

  // Referencia opcional a una venta
  productSaleId  String?       @map("product_sale_id") @db.Uuid

  @@map("inventory_movements")
  @@index([organizationId])
  @@index([productId])
  @@index([createdAt])
}

// ============================================
// PRODUCT SALES (Venta de productos)
// ============================================
model ProductSale {
  id             String        @id @default(uuid()) @db.Uuid
  createdAt      DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt      DateTime      @updatedAt @map("updated_at") @db.Timestamptz

  organizationId String        @map("organization_id") @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Paciente opcional (puede ser venta directa sin paciente)
  patientId      String?       @map("patient_id") @db.Uuid
  patient        Patient?      @relation(fields: [patientId], references: [id], onDelete: SetNull)

  // Vendedor
  soldById       String?       @map("sold_by_id") @db.Uuid
  soldBy         User?         @relation(fields: [soldById], references: [id], onDelete: SetNull)

  // Pago (referencia opcional a Payment — para comprobante unificado con servicio)
  paymentId      String?       @unique @map("payment_id") @db.Uuid
  payment        Payment?      @relation(fields: [paymentId], references: [id], onDelete: SetNull)

  subtotal       Decimal       @db.Decimal(10, 2)
  discount       Decimal       @default(0) @db.Decimal(10, 2)
  total          Decimal       @db.Decimal(10, 2)
  notes          String?

  items          ProductSaleItem[]

  @@map("product_sales")
  @@index([organizationId])
  @@index([patientId])
  @@index([createdAt])
}

// ============================================
// PRODUCT SALE ITEMS (Líneas de venta)
// ============================================
model ProductSaleItem {
  id            String      @id @default(uuid()) @db.Uuid

  productSaleId String      @map("product_sale_id") @db.Uuid
  productSale   ProductSale @relation(fields: [productSaleId], references: [id], onDelete: Cascade)

  productId     String      @map("product_id") @db.Uuid
  product       Product     @relation(fields: [productId], references: [id], onDelete: Restrict)

  quantity      Int
  unitPrice     Decimal     @map("unit_price") @db.Decimal(10, 2)   // Precio al momento de venta
  subtotal      Decimal     @db.Decimal(10, 2)

  @@map("product_sale_items")
  @@index([productSaleId])
  @@index([productId])
}
```

También actualizar `Organization`, `User`, y `Patient` con las nuevas relaciones:
- `Organization`: + `productCategories`, `products`, `inventoryMovements`, `productSales`
- `User`: + `inventoryMovementsPerformed`, `productSalesSold`
- `Patient`: + `productSales`
- `Payment`: + `productSale` (relación 1:1 opcional)

---

### Backend — API

#### [NEW] `inventory.controller.ts`

Endpoints:
- `GET /api/inventory/categories` — listar categorías
- `POST /api/inventory/categories` — crear categoría
- `PUT /api/inventory/categories/:id` — editar categoría
- `DELETE /api/inventory/categories/:id` — eliminar categoría
- `GET /api/inventory/products` — listar productos con stock, filtros por categoría / bajo stock
- `POST /api/inventory/products` — crear producto
- `PUT /api/inventory/products/:id` — editar producto
- `DELETE /api/inventory/products/:id` — soft-delete producto
- `POST /api/inventory/products/:id/stock` — ajuste manual de stock (crea `InventoryMovement`)
- `GET /api/inventory/products/:id/movements` — historial de movimientos de un producto
- `GET /api/inventory/low-stock` — productos bajo stock mínimo

#### [NEW] `product-sales.controller.ts`

Endpoints:
- `GET /api/product-sales` — listar ventas (paginado, filtros por fecha/paciente)
- `POST /api/product-sales` — crear venta (descuenta stock automáticamente, crea `InventoryMovement` por cada item)
- `GET /api/product-sales/:id` — detalle de una venta
- `GET /api/product-sales/export` — exportar CSV

#### [NEW] `inventory.routes.ts` & `product-sales.routes.ts`
#### [MODIFY] [src/index.ts](file:///Users/anderleycandela/Developer/projects/clinqapp-web/backend/src/index.ts) — registrar nuevas rutas bajo `/api/inventory` y `/api/product-sales`

---

### Frontend — Stores & Services

#### [NEW] `frontend/src/services/inventory.service.ts`
#### [NEW] `frontend/src/services/product-sales.service.ts`
#### [NEW] `frontend/src/stores/useInventoryStore.ts`
#### [NEW] `frontend/src/stores/useProductSalesStore.ts`

---

### Frontend — Páginas

#### [NEW] `frontend/src/pages/dashboard/InventoryPage.tsx`

- Tabla de productos con: nombre, categoría, stock actual, stock mínimo, precio de venta
- Badge rojo/amarillo cuando el stock está bajo mínimo
- Filtros por categoría y por estado (activo/inactivo)
- Botones: "Nuevo producto", "Categorías", "Ajustar stock"

#### [NEW] `frontend/src/pages/dashboard/CreateProductPage.tsx` / `EditProductPage.tsx`

- Formulario: nombre, SKU, descripción, categoría, unidad, precio de compra, precio de venta, stock inicial, stock mínimo

#### [NEW] `frontend/src/pages/dashboard/ProductSalesPage.tsx`

Vista en 2 partes:
1. **Nueva Venta** — seleccionar productos del catálogo (con cantidad), asociar paciente (opcional), método de pago, descuento → genera `ProductSale` + `Payment`
2. **Historial** — tabla de ventas pasadas (filtros por fecha, paciente)

---

### Frontend — Routing

#### [MODIFY] [frontend/src/App.tsx](file:///Users/anderleycandela/Developer/projects/clinqapp-web/frontend/src/App.tsx)

Agregar rutas:
```tsx
<Route path="inventory" element={<InventoryPage />} />
<Route path="inventory/new" element={<CreateProductPage />} />
<Route path="inventory/:id/edit" element={<EditProductPage />} />
<Route path="product_sales" element={<ProductSalesPage />} />
```

#### [MODIFY] [frontend/src/lib/constants/navigation.ts](file:///Users/anderleycandela/Developer/projects/clinqapp-web/frontend/src/lib/constants/navigation.ts)

Agregar el icono `box` al mapa `NAVIGATION_ICONS`.

---

## Diagrama de Relaciones

```
Organization (1) ──< ProductCategory (N)
Organization (1) ──< Product (N)
Organization (1) ──< ProductSale (N)
Organization (1) ──< InventoryMovement (N)

Product (1) ──< ProductSaleItem (N)
Product (1) ──< InventoryMovement (N)
ProductCategory (1) ──< Product (N)

ProductSale (1) ──< ProductSaleItem (N)
ProductSale (N) >── Patient (1) [opcional]
ProductSale (1) ── Payment (1) [opcional, comprobante unificado]

User ── InventoryMovement (quien ajustó)
User ── ProductSale (quien vendió)
```

---

## Plan de Verificación

### Manual (navegador)

1. Ir a `/app/dashboard/inventory` → debe cargar la página de inventario
2. Crear una categoría "Cremas podológicas"
3. Crear un producto "Crema antifúngica" con stock inicial 20, mínimo 5, precio de compra S/10, venta S/25
4. Ajustar stock manual a 3 → debe aparecer badge de stock bajo
5. Ir a `/app/dashboard/product_sales` → crear una venta de 2 unidades de ese producto → verificar que el stock queda en 1
6. Verificar el historial de movimientos del producto: debe mostrar entrada de 20, salida de 2
7. Crear una venta sin paciente → debe funcionar
8. Verificar que los datos solo pertenecen a la organización del usuario logueado

> [!NOTE]
> No existen tests automatizados en el proyecto actualmente. La verificación será manual.

# Persistencia de la demo gastronómica

## Estado actual

Esta rama conserva el sitio estático. Los catálogos, productos creados e inventario se guardan en `sessionStorage` bajo `appnova-demo-gastronomica-v1`. La información se limita a la pestaña de prueba y se elimina al cerrar esa sesión del navegador o con **Reiniciar prueba**. No se envía a ningún servidor ni altera la demo publicada.

Cada tipo de local tiene su catálogo editable independiente. El inventario de prueba es común a la sesión. Los pedidos históricos y otros módulos siguen usando datos de ejemplo en memoria; no se presentan como registros persistentes.

## Backend propuesto para una siguiente etapa

Usar una API con autenticación y PostgreSQL. Un `tenant_id` representa cada local; un `demo_session_id` aleatorio y con vencimiento representa cada prueba anónima. Todas las consultas y mutaciones se filtran por uno de esos identificadores, nunca por un valor suministrado sin validación. No se debe reutilizar la base de datos de producción para las pruebas.

Tablas mínimas:

- `demo_sessions(id, created_at, expires_at, business_type)`
- `products(id, demo_session_id, business_type, name, category, description, price_clp, image_url, active, created_at)`
- `inventory_items(id, demo_session_id, name, category, unit, stock, minimum_stock, active, created_at)`
- `inventory_movements(id, demo_session_id, item_id, kind, quantity, stock_before, stock_after, reason, created_at)`

Crear insumo y stock inicial debe ocurrir en **una transacción**: validar cantidad, insertar el insumo y, si es mayor que cero, insertar el movimiento de entrada. Los movimientos posteriores se crean desde la edición del insumo, con bloqueo de fila y actualización de stock en la misma transacción. El precio se almacena como entero en pesos chilenos; las cantidades admiten decimales según la unidad. La API valida nombre, URL de imagen, límites numéricos y pertenencia a la sesión, aunque el formulario ya valide en el navegador.

Antes de implementar esta etapa hay que acordar proveedor de hosting, acceso de usuarios, duración de sesiones de prueba, política de limpieza e integración con pedidos. No hay migraciones ni credenciales de producción en esta rama.

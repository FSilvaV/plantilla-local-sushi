-- Diseño para una base PostgreSQL exclusiva de pruebas. No ejecutar en producción.
CREATE TABLE demo_sessions (
    id uuid PRIMARY KEY,
    business_type text NOT NULL CHECK (business_type IN ('sushi','rapida','pizzeria','parrilla','variada')),
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);

CREATE TABLE products (
    id uuid PRIMARY KEY,
    demo_session_id uuid NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    business_type text NOT NULL CHECK (business_type IN ('sushi','rapida','pizzeria','parrilla','variada')),
    name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 90),
    category text NOT NULL,
    description text NOT NULL DEFAULT '',
    price_clp integer NOT NULL CHECK (price_clp >= 0),
    image_url text,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_session_type ON products(demo_session_id, business_type);

CREATE TABLE inventory_items (
    id uuid PRIMARY KEY,
    demo_session_id uuid NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text NOT NULL,
    unit text NOT NULL,
    stock numeric(14,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    minimum_stock numeric(14,2) NOT NULL DEFAULT 0 CHECK (minimum_stock >= 0),
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (demo_session_id, name),
    UNIQUE (id, demo_session_id)
);

CREATE TABLE inventory_movements (
    id uuid PRIMARY KEY,
    demo_session_id uuid NOT NULL,
    item_id uuid NOT NULL,
    kind text NOT NULL CHECK (kind IN ('entrada','salida','merma','ajuste')),
    quantity numeric(14,2) NOT NULL CHECK (quantity > 0),
    stock_before numeric(14,2) NOT NULL CHECK (stock_before >= 0),
    stock_after numeric(14,2) NOT NULL CHECK (stock_after >= 0),
    reason text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (item_id, demo_session_id) REFERENCES inventory_items(id, demo_session_id) ON DELETE CASCADE
);
CREATE INDEX inventory_movements_session_item ON inventory_movements(demo_session_id, item_id, created_at DESC);

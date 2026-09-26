/* =========================================================
   MENÚ / PRODUCTOS
========================================================= */

const categoriasMenu = [
    "Todos",
    "Promoción",
    "Sushi",
    "Handroll",
    "Colaciones",
    "Bebidas",
    "Extra"
];

let filtroCategoriaMenu = "Todos";
let busquedaMenu = "";


/* =========================================================
   RENDER PRINCIPAL
========================================================= */

function renderMenu() {

    const productos =
        obtenerProductosFiltrados();

    return `

        <div class="module-toolbar">

            <div>

                <h3>Productos del menú</h3>

                <p>
                    Administra los productos disponibles
                    para la creación de pedidos.
                </p>

            </div>

            <button
                class="btn btn-primary"
                onclick="abrirModalProducto()"
            >
                ＋ Nuevo producto
            </button>

        </div>


        <!-- RESUMEN -->

        <div class="menu-summary">

            <div class="mini-stat">

                <span>Total productos</span>

                <strong>
                    ${ScartData.productos.length}
                </strong>

            </div>


            <div class="mini-stat">

                <span>Disponibles</span>

                <strong>
                    ${
                        ScartData.productos
                            .filter(p => p.activo)
                            .length
                    }
                </strong>

            </div>


            <div class="mini-stat">

                <span>No disponibles</span>

                <strong>
                    ${
                        ScartData.productos
                            .filter(p => !p.activo)
                            .length
                    }
                </strong>

            </div>


            <div class="mini-stat">

                <span>Categorías</span>

                <strong>
                    ${
                        new Set(
                            ScartData.productos.map(
                                p => p.categoria
                            )
                        ).size
                    }
                </strong>

            </div>

        </div>


        <!-- BUSCADOR -->

        <div class="menu-controls">

            <div class="search-box">

                <span>⌕</span>

                <input
                    type="text"
                    id="menu-search"
                    placeholder="Buscar producto..."
                    value="${busquedaMenu}"
                    oninput="buscarProductoMenu(this.value)"
                >

            </div>

        </div>


        <!-- CATEGORÍAS -->

        <div class="category-filters">

            ${categoriasMenu.map(categoria => `

                <button
                    class="category-btn
                    ${
                        filtroCategoriaMenu === categoria
                            ? "active"
                            : ""
                    }"
                    onclick="
                        filtrarCategoriaMenu(
                            '${categoria}'
                        )
                    "
                >
                    ${categoria}
                </button>

            `).join("")}

        </div>


        <!-- PRODUCTOS -->

        <div class="products-grid">

            ${
                productos.length

                ? productos.map(
                    producto =>
                        crearCardProducto(producto)
                  ).join("")

                : `
                    <div class="empty-state">

                        <span>🍣</span>

                        <h3>
                            No encontramos productos
                        </h3>

                        <p>
                            Prueba otra búsqueda
                            o categoría.
                        </p>

                    </div>
                `
            }

        </div>


        <!-- MODAL -->

        <div
            id="product-modal"
            class="modal-overlay"
        >

            <div class="modal">

                <div class="modal-header">

                    <div>

                        <h3 id="product-modal-title">
                            Nuevo producto
                        </h3>

                        <p>
                            Información del producto
                            del menú.
                        </p>

                    </div>

                    <button
                        class="modal-close"
                        onclick="cerrarModalProducto()"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="product-form"
                    onsubmit="
                        guardarProducto(event)
                    "
                >

                    <input
                        type="hidden"
                        id="product-id"
                    >


                    <div class="form-group">

                        <label>
                            Nombre
                        </label>

                        <input
                            id="product-name"
                            type="text"
                            placeholder="Ej: California Roll"
                            required
                        >

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Categoría
                            </label>

                            <select
                                id="product-category"
                                required
                            >

                                ${categoriasMenu
                                    .filter(
                                        c => c !== "Todos"
                                    )
                                    .map(c => `
                                        <option value="${c}">
                                            ${c}
                                        </option>
                                    `)
                                    .join("")
                                }

                            </select>

                        </div>


                        <div class="form-group">

                            <label>
                                Precio
                            </label>

                            <input
                                id="product-price"
                                type="number"
                                min="0"
                                placeholder="8900"
                                required
                            >

                        </div>

                    </div>


                    <div class="form-group">

                        <label>
                            Ingredientes / descripción
                        </label>

                        <textarea
                            id="product-description"
                            rows="3"
                            placeholder="
Salmón, palta, queso crema...
                            "
                        ></textarea>

                    </div>


                    <div class="form-group">

                        <label>
                            URL de imagen
                            <span class="optional">
                                Opcional
                            </span>
                        </label>

                        <input
                            id="product-image"
                            type="text"
                            placeholder="
assets/img/california-roll.jpg
                            "
                        >

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="
                                cerrarModalProducto()
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                        >
                            Guardar producto
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;
}


/* =========================================================
   CARD PRODUCTO
========================================================= */

function crearCardProducto(producto) {

    return `

        <article
            class="
                product-card
                ${producto.activo ? "" : "disabled"}
            "
        >

            <div class="product-image">

                ${
                    producto.imagen

                    ? `
                        <img
                            src="${producto.imagen}"
                            alt="${producto.nombre}"
                        >
                    `

                    : `
                        <div class="product-placeholder">
                            🍣
                        </div>
                    `
                }


                <span
                    class="
                        availability-badge
                        ${
                            producto.activo
                                ? "available"
                                : "unavailable"
                        }
                    "
                >
                    ${
                        producto.activo
                            ? "Disponible"
                            : "No disponible"
                    }
                </span>

            </div>


            <div class="product-body">

                <span class="product-category">
                    ${producto.categoria}
                </span>

                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    ${
                        producto.descripcion ||
                        "Sin descripción registrada."
                    }
                </p>


                <div class="product-bottom">

                    <strong class="product-price">
                        ${formatearDinero(
                            producto.precio
                        )}
                    </strong>


                    <div class="product-actions">

                        <button
                            title="Editar"
                            onclick="
                                editarProducto(
                                    ${producto.id}
                                )
                            "
                        >
                            ✎
                        </button>

                        <button
                            title="
                                Cambiar disponibilidad
                            "
                            onclick="
                                cambiarDisponibilidadProducto(
                                    ${producto.id}
                                )
                            "
                        >
                            ${
                                producto.activo
                                    ? "✓"
                                    : "○"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </article>

    `;
}


/* =========================================================
   FILTROS
========================================================= */

function obtenerProductosFiltrados() {

    return ScartData.productos.filter(
        producto => {

            const categoriaOK =
                filtroCategoriaMenu === "Todos" ||
                producto.categoria ===
                    filtroCategoriaMenu;


            const texto =
                (
                    producto.nombre +
                    " " +
                    producto.categoria +
                    " " +
                    (producto.descripcion || "")
                )
                .toLowerCase();


            const busquedaOK =
                texto.includes(
                    busquedaMenu.toLowerCase()
                );


            return categoriaOK && busquedaOK;
        }
    );
}


function filtrarCategoriaMenu(categoria) {

    filtroCategoriaMenu = categoria;

    refrescarMenu();
}


function buscarProductoMenu(valor) {

    busquedaMenu = valor;

    refrescarMenu(true);
}


/* =========================================================
   DISPONIBILIDAD
========================================================= */

function cambiarDisponibilidadProducto(id) {

    const producto =
        ScartData.productos.find(
            p => p.id === id
        );


    if (!producto) return;


    producto.activo =
        !producto.activo;


    mostrarToast(
        producto.activo
            ? `${producto.nombre} disponible`
            : `${producto.nombre} marcado como no disponible`
    );


    refrescarMenu();
}


/* =========================================================
   MODAL
========================================================= */

function abrirModalProducto() {

    document
        .getElementById("product-form")
        .reset();


    document
        .getElementById("product-id")
        .value = "";


    document
        .getElementById(
            "product-modal-title"
        )
        .textContent =
            "Nuevo producto";


    document
        .getElementById("product-modal")
        .classList.add("show");
}


function cerrarModalProducto() {

    document
        .getElementById("product-modal")
        ?.classList.remove("show");
}


/* =========================================================
   GUARDAR
========================================================= */

function guardarProducto(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "product-id"
        ).value;


    const nombre =
        document.getElementById(
            "product-name"
        ).value.trim();


    const categoria =
        document.getElementById(
            "product-category"
        ).value;


    const precio =
        Number(
            document.getElementById(
                "product-price"
            ).value
        );


    const descripcion =
        document.getElementById(
            "product-description"
        ).value.trim();


    const imagen =
        document.getElementById(
            "product-image"
        ).value.trim();


    if (id) {

        const producto =
            ScartData.productos.find(
                p => p.id === Number(id)
            );


        if (!producto) return;


        producto.nombre = nombre;
        producto.categoria = categoria;
        producto.precio = precio;
        producto.descripcion = descripcion;
        producto.imagen = imagen;


        mostrarToast(
            "Producto actualizado"
        );

    } else {

        const nuevoId =
            ScartData.productos.length
                ? Math.max(
                    ...ScartData.productos.map(
                        p => p.id
                    )
                ) + 1
                : 1;


        ScartData.productos.push({

            id: nuevoId,

            nombre,

            categoria,

            precio,

            descripcion,

            imagen,

            activo: true

        });


        mostrarToast(
            "Producto creado correctamente"
        );
    }


    cerrarModalProducto();

    refrescarMenu();
}


/* =========================================================
   EDITAR
========================================================= */

function editarProducto(id) {

    const producto =
        ScartData.productos.find(
            p => p.id === id
        );


    if (!producto) return;


    document
        .getElementById("product-id")
        .value =
            producto.id;


    document
        .getElementById("product-name")
        .value =
            producto.nombre;


    document
        .getElementById("product-category")
        .value =
            producto.categoria;


    document
        .getElementById("product-price")
        .value =
            producto.precio;


    document
        .getElementById(
            "product-description"
        )
        .value =
            producto.descripcion || "";


    document
        .getElementById("product-image")
        .value =
            producto.imagen || "";


    document
        .getElementById(
            "product-modal-title"
        )
        .textContent =
            "Editar producto";


    document
        .getElementById("product-modal")
        .classList.add("show");
}


/* =========================================================
   REFRESCAR
========================================================= */

function refrescarMenu(
    mantenerFoco = false
) {

    const posicionCursor =
        document.activeElement?.selectionStart;


    appContent.innerHTML =
        renderMenu();


    if (mantenerFoco) {

        const input =
            document.getElementById(
                "menu-search"
            );


        if (input) {

            input.focus();

            if (
                posicionCursor !== undefined &&
                posicionCursor !== null
            ) {
                input.setSelectionRange(
                    posicionCursor,
                    posicionCursor
                );
            }
        }
    }
}
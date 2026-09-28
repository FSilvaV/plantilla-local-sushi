/* =========================================================
   SCART SUSHI
   MÓDULO: INVENTARIO
========================================================= */

let filtroInventario = "todos";
let busquedaInventario = "";


/* =========================================================
   RENDER PRINCIPAL
========================================================= */

function renderInventario() {
    const inventario = ScartData.inventario || [];

    const total = inventario.length;

    const stockBajo = inventario.filter(
        item =>
            item.activo !== false &&
            item.stock > 0 &&
            item.stock <= item.stockMinimo
    ).length;

    const sinStock = inventario.filter(
        item =>
            item.activo !== false &&
            item.stock <= 0
    ).length;

    const categorias = [
        ...new Set(
            inventario.map(item => item.categoria)
        )
    ];

    const items = obtenerInventarioFiltrado();

    return `
        <div class="inventario-page">

            <div class="inventario-header">
                <div>
                    <h2>Inventario</h2>
                    <p>
                        Control de ingredientes, insumos y existencias.
                    </p>
                </div>

<div class="inventario-header-acciones">

    <button
        class="btn-secondary"
        onclick="abrirNuevoInsumo()"
    >
        + Nuevo insumo
    </button>

    <button
        class="btn-primary"
        onclick="abrirMovimientoInventario()"
    >
        + Registrar movimiento
    </button>

            </div>
            </div>


            <!-- RESUMEN -->

            <div class="inventario-resumen">

                <div class="inventario-resumen-card">
                    <span>Insumos registrados</span>
                    <strong>${total}</strong>
                </div>

                <div class="inventario-resumen-card">
                    <span>Stock bajo</span>
                    <strong>${stockBajo}</strong>
                </div>

                <div class="inventario-resumen-card">
                    <span>Sin stock</span>
                    <strong>${sinStock}</strong>
                </div>

                <div class="inventario-resumen-card">
                    <span>Categorías</span>
                    <strong>${categorias.length}</strong>
                </div>

            </div>


            <!-- BUSCADOR Y FILTROS -->

            <div class="inventario-toolbar">

                <div class="inventario-busqueda">
                    <input
                        type="search"
                        placeholder="Buscar ingrediente o insumo..."
                        value="${busquedaInventario}"
                        oninput="buscarInventario(this.value)"
                    >
                </div>

                <div class="inventario-filtros">

                    <button
                        class="inventario-filtro ${
                            filtroInventario === "todos"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroInventario('todos')"
                    >
                        Todos
                    </button>

                    <button
                        class="inventario-filtro ${
                            filtroInventario === "bajo"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroInventario('bajo')"
                    >
                        Stock bajo
                    </button>

                    <button
                        class="inventario-filtro ${
                            filtroInventario === "sin-stock"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroInventario('sin-stock')"
                    >
                        Sin stock
                    </button>

                </div>

            </div>


            <!-- TABLA -->

            <div class="inventario-tabla-contenedor">

                <table class="inventario-tabla">

                    <thead>
                        <tr>
                            <th>Insumo</th>
                            <th>Categoría</th>
                            <th>Stock actual</th>
                            <th>Stock mínimo</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            items.length
                                ? items
                                    .map(renderInventarioFila)
                                    .join("")
                                : `
                                    <tr>
                                        <td
                                            colspan="6"
                                            class="inventario-vacio"
                                        >
                                            No se encontraron insumos.
                                        </td>
                                    </tr>
                                `
                        }

                    </tbody>

                </table>

            </div>


            <!-- MOVIMIENTOS -->

            ${renderUltimosMovimientosInventario()}

        </div>
    `;
}


/* =========================================================
   FILA DE INVENTARIO
========================================================= */

function renderInventarioFila(item) {
    const estado = obtenerEstadoInventario(item);

    return `
        <tr class="${!item.activo ? "inventario-inactivo" : ""}">

            <td>
                <div class="inventario-producto">

                    <div class="inventario-producto-icono">
                        ${obtenerIconoCategoria(item.categoria)}
                    </div>

                    <div>
                        <strong>
                            ${item.nombre}
                        </strong>

                        <span>
                            ID ${String(item.id).padStart(3, "0")}
                            ${!item.activo ? " · Inactivo" : ""}
                        </span>
                    </div>

                </div>
            </td>

            <td>
                ${item.categoria}
            </td>

            <td>
                <strong>
                    ${formatearCantidadInventario(item.stock)}
                    ${item.unidad}
                </strong>
            </td>

            <td>
                ${formatearCantidadInventario(item.stockMinimo)}
                ${item.unidad}
            </td>

            <td>
                <span class="inventario-estado ${estado.clase}">
                    ${estado.texto}
                </span>
            </td>

            <td>
                <div class="inventario-acciones">

                    <button
                        class="btn-secondary"
                        onclick="abrirEditarInsumo(${item.id})"
                    >
                        Editar
                    </button>

                    <button
                        class="btn-secondary"
                        onclick="abrirMovimientoInventario(${item.id})"
                        ${!item.activo ? "disabled" : ""}
                    >
                        Movimiento
                    </button>

                    <button
                        class="btn-secondary"
                        onclick="cambiarEstadoInsumo(${item.id})"
                    >
                        ${item.activo ? "Desactivar" : "Activar"}
                    </button>

                </div>
            </td>

        </tr>
    `;
}


/* =========================================================
   ESTADO DEL STOCK
========================================================= */

function obtenerEstadoInventario(item) {

    if (!item.activo) {
        return {
            texto: "Inactivo",
            clase: "inactivo"
        };
    }

    if (item.stock <= 0) {
        return {
            texto: "Sin stock",
            clase: "sin-stock"
        };
    }

    if (item.stock <= item.stockMinimo) {
        return {
            texto: "Stock bajo",
            clase: "stock-bajo"
        };
    }

    return {
        texto: "Disponible",
        clase: "disponible"
    };
}


/* =========================================================
   FILTROS Y BÚSQUEDA
========================================================= */

function obtenerInventarioFiltrado() {
    let items = [...(ScartData.inventario || [])];

    if (filtroInventario === "bajo") {
        items = items.filter(
            item =>
                item.stock > 0 &&
                item.stock <= item.stockMinimo
        );
    }

    if (filtroInventario === "sin-stock") {
        items = items.filter(
            item => item.stock <= 0
        );
    }

    if (busquedaInventario.trim()) {
        const texto = busquedaInventario
            .toLowerCase()
            .trim();

        items = items.filter(
            item =>
                item.nombre
                    .toLowerCase()
                    .includes(texto) ||
                item.categoria
                    .toLowerCase()
                    .includes(texto)
        );
    }

    return items;
}


function cambiarFiltroInventario(filtro) {
    filtroInventario = filtro;

    refrescarInventario();
}


function buscarInventario(texto) {
    busquedaInventario = texto;

    refrescarInventario();

    const input = document.querySelector(
        ".inventario-busqueda input"
    );

    if (input) {
        input.focus();

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );
    }
}

/* =========================================================
   NUEVO INSUMO
========================================================= */

function abrirNuevoInsumo() {
    cerrarNuevoInsumo();

    const modal = document.createElement("div");

    modal.id = "inventario-nuevo-insumo-modal";
    modal.className = "pedido-modal-overlay";

    modal.innerHTML = `
        <div class="pedido-modal inventario-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Inventario
                    </span>

                    <h2>Nuevo insumo</h2>

                    <p>
                        Registra un ingrediente, material
                        o insumo utilizado por el local.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarNuevoInsumo()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="inventario-form-grid">

                    <label>
                        <span>Nombre del insumo</span>

                        <input
                            id="nuevo-insumo-nombre"
                            type="text"
                            placeholder="Ej: Salmón"
                        >
                    </label>


                    <label>
                        <span>Categoría</span>

                        <select id="nuevo-insumo-categoria">

                            <option value="">
                                Seleccionar categoría
                            </option>

                            <option value="Base">
                                Base
                            </option>

                            <option value="Proteínas">
                                Proteínas
                            </option>

                            <option value="Refrigerados">
                                Refrigerados
                            </option>

                            <option value="Vegetales">
                                Vegetales
                            </option>

                            <option value="Apanados">
                                Apanados
                            </option>

                            <option value="Condimentos">
                                Condimentos
                            </option>

                            <option value="Salsas">
                                Salsas
                            </option>

                            <option value="Cocina">
                                Cocina
                            </option>

                            <option value="Packaging">
                                Packaging
                            </option>

                            <option value="Desechables">
                                Desechables
                            </option>

                            <option value="Otros">
                                Otros
                            </option>

                        </select>
                    </label>


                    <label>
                        <span>Unidad de medida</span>

                        <select id="nuevo-insumo-unidad">

                            <option value="">
                                Seleccionar unidad
                            </option>

                            <option value="kg">
                                Kilogramos (kg)
                            </option>

                            <option value="g">
                                Gramos (g)
                            </option>

                            <option value="litros">
                                Litros
                            </option>

                            <option value="ml">
                                Mililitros (ml)
                            </option>

                            <option value="unidades">
                                Unidades
                            </option>

                            <option value="hojas">
                                Hojas
                            </option>

                            <option value="paquetes">
                                Paquetes
                            </option>

                        </select>
                    </label>

                    <label>
                        <span>Stock mínimo</span>

                        <input
                            id="nuevo-insumo-minimo"
                            type="number"
                            min="0"
                            step="0.01"
                            value="0"
                        >
                    </label>

                </div>


                <div class="inventario-ayuda">

                    <strong>
                        ¿Qué es el stock mínimo?
                    </strong>

                    <p>
                        Es la cantidad a partir de la cual
                        el sistema mostrará una alerta de
                        stock bajo.
                    </p>

                    <p>
                        Ejemplo: si quedan 2 kg de salmón
                        y el mínimo configurado es 2 kg,
                        aparecerá como stock bajo.
                    </p>

                </div>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarNuevoInsumo()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="guardarNuevoInsumo()"
                >
                    Guardar insumo
                </button>

            </div>

        </div>
    `;


    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                cerrarNuevoInsumo();
            }
        }
    );


    document.body.appendChild(modal);


    setTimeout(() => {
        const input = document.getElementById(
            "nuevo-insumo-nombre"
        );

        if (input) {
            input.focus();
        }
    }, 50);
}


/* =========================================================
   GUARDAR NUEVO INSUMO
========================================================= */

function guardarNuevoInsumo() {
    const nombre = document
        .getElementById("nuevo-insumo-nombre")
        .value
        .trim();

    const categoria = document
        .getElementById("nuevo-insumo-categoria")
        .value;

    const unidad = document
        .getElementById("nuevo-insumo-unidad")
        .value;

    const stockMinimo = Number(
        document.getElementById(
            "nuevo-insumo-minimo"
        ).value
    );


    /* VALIDACIONES */

    if (!nombre) {
        mostrarToast(
            "Ingresa el nombre del insumo."
        );

        return;
    }


    if (!categoria) {
        mostrarToast(
            "Selecciona una categoría."
        );

        return;
    }


    if (!unidad) {
        mostrarToast(
            "Selecciona una unidad de medida."
        );

        return;
    }


    if (stockMinimo < 0) {
        mostrarToast(
            "El stock no puede ser negativo."
        );

        return;
    }


    /* EVITAR DUPLICADOS */

    const existe = (ScartData.inventario || [])
        .some(
            item =>
                item.nombre
                    .trim()
                    .toLowerCase() ===
                nombre.toLowerCase()
        );


    if (existe) {
        mostrarToast(
            "Ya existe un insumo con ese nombre."
        );

        return;
    }


    /* GENERAR ID */

    const nuevoId =
        ScartData.inventario.length
            ? Math.max(
                ...ScartData.inventario.map(
                    item => Number(item.id)
                )
            ) + 1
            : 1;


    /* CREAR INSUMO */

    const nuevoInsumo = {
        id: nuevoId,
        nombre: nombre,
        categoria: categoria,
        unidad: unidad,
        stock: 0,
        stockMinimo: Number(
            stockMinimo.toFixed(2)
        ),
        activo: true
    };


    ScartData.inventario.push(
        nuevoInsumo
    );

    cerrarNuevoInsumo();

    mostrarToast(
        `${nuevoInsumo.nombre} agregado al inventario`
    );

    refrescarInventario();
    }

    /* =========================================================
   EDITAR INSUMO
========================================================= */

function abrirEditarInsumo(itemId) {

    cerrarEditarInsumo();

    const item = ScartData.inventario.find(
        item => Number(item.id) === Number(itemId)
    );

    if (!item) {
        mostrarToast("No se encontró el insumo.");
        return;
    }

    const modal = document.createElement("div");

    modal.id = "inventario-editar-insumo-modal";
    modal.className = "pedido-modal-overlay";

    modal.innerHTML = `
        <div class="pedido-modal inventario-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Inventario
                    </span>

                    <h2>Editar insumo</h2>

                    <p>
                        Modifica los datos generales del insumo.
                        El stock se administra mediante movimientos.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarEditarInsumo()"
                >
                    ×
                </button>

            </div>

            <div class="pedido-modal-body">

                <div class="inventario-form-grid">

                    <label>
                        <span>Nombre</span>

                        <input
                            id="editar-insumo-nombre"
                            type="text"
                            value="${item.nombre}"
                        >
                    </label>

                    <label>
                        <span>Categoría</span>

                        <select id="editar-insumo-categoria">

                            ${crearOpcionesCategoriaInventario(
                                item.categoria
                            )}

                        </select>
                    </label>

                    <label>
                        <span>Unidad de medida</span>

                        <select id="editar-insumo-unidad">

                            ${crearOpcionesUnidadInventario(
                                item.unidad
                            )}

                        </select>
                    </label>

                    <label>
                        <span>Stock mínimo</span>

                        <input
                            id="editar-insumo-minimo"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${item.stockMinimo}"
                        >
                    </label>

                </div>

                <div class="inventario-ayuda">

                    <strong>
                        Stock actual
                    </strong>

                    <p>
                        ${formatearCantidadInventario(item.stock)}
                        ${item.unidad}
                    </p>

                    <p>
                        Para corregir o modificar esta cantidad,
                        utiliza Registrar movimiento.
                    </p>

                </div>

            </div>

            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarEditarInsumo()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="guardarEdicionInsumo(${item.id})"
                >
                    Guardar cambios
                </button>

            </div>

        </div>
    `;

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                cerrarEditarInsumo();
            }
        }
    );

    document.body.appendChild(modal);
}


function guardarEdicionInsumo(itemId) {

    const item = ScartData.inventario.find(
        item => Number(item.id) === Number(itemId)
    );

    if (!item) {
        mostrarToast("No se encontró el insumo.");
        return;
    }

    const nombre = document
        .getElementById("editar-insumo-nombre")
        .value
        .trim();

    const categoria = document
        .getElementById("editar-insumo-categoria")
        .value;

    const unidad = document
        .getElementById("editar-insumo-unidad")
        .value;

    const stockMinimo = Number(
        document.getElementById(
            "editar-insumo-minimo"
        ).value
    );

    if (!nombre) {
        mostrarToast("Ingresa el nombre del insumo.");
        return;
    }

    if (!categoria) {
        mostrarToast("Selecciona una categoría.");
        return;
    }

    if (!unidad) {
        mostrarToast("Selecciona una unidad.");
        return;
    }

    if (stockMinimo < 0) {
        mostrarToast(
            "El stock mínimo no puede ser negativo."
        );
        return;
    }

    const duplicado = ScartData.inventario.some(
        otro =>
            Number(otro.id) !== Number(itemId) &&
            otro.nombre.trim().toLowerCase() ===
                nombre.toLowerCase()
    );

    if (duplicado) {
        mostrarToast(
            "Ya existe otro insumo con ese nombre."
        );
        return;
    }

    item.nombre = nombre;
    item.categoria = categoria;
    item.unidad = unidad;
    item.stockMinimo = Number(
        stockMinimo.toFixed(2)
    );

    cerrarEditarInsumo();

    mostrarToast(
        `${item.nombre} actualizado`
    );

    refrescarInventario();
}


function cerrarEditarInsumo() {

    const modal = document.getElementById(
        "inventario-editar-insumo-modal"
    );

    if (modal) {
        modal.remove();
    }
}

function crearOpcionesCategoriaInventario(
    seleccionada = ""
) {

    const categorias = [
        "Base",
        "Proteínas",
        "Refrigerados",
        "Vegetales",
        "Apanados",
        "Condimentos",
        "Salsas",
        "Cocina",
        "Packaging",
        "Desechables",
        "Limpieza",
        "Otros"
    ];

    return categorias
        .map(categoria => `
            <option
                value="${categoria}"
                ${
                    categoria === seleccionada
                        ? "selected"
                        : ""
                }
            >
                ${categoria}
            </option>
        `)
        .join("");
}


function crearOpcionesUnidadInventario(
    seleccionada = ""
) {

    const unidades = [
        ["kg", "Kilogramos (kg)"],
        ["g", "Gramos (g)"],
        ["litros", "Litros"],
        ["ml", "Mililitros (ml)"],
        ["unidades", "Unidades"],
        ["hojas", "Hojas"],
        ["paquetes", "Paquetes"]
    ];

    return unidades
        .map(([valor, nombre]) => `
            <option
                value="${valor}"
                ${
                    valor === seleccionada
                        ? "selected"
                        : ""
                }
            >
                ${nombre}
            </option>
        `)
        .join("");
}

function cambiarEstadoInsumo(itemId) {

    const item = ScartData.inventario.find(
        item => Number(item.id) === Number(itemId)
    );

    if (!item) {
        mostrarToast("No se encontró el insumo.");
        return;
    }

    const accion = item.activo
        ? "desactivar"
        : "activar";

    const confirmar = window.confirm(
        `¿Deseas ${accion} "${item.nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    item.activo = !item.activo;

    mostrarToast(
        item.activo
            ? `${item.nombre} activado`
            : `${item.nombre} desactivado`
    );

    refrescarInventario();
}

/* =========================================================
   CERRAR NUEVO INSUMO
========================================================= */

function cerrarNuevoInsumo() {
    const modal = document.getElementById(
        "inventario-nuevo-insumo-modal"
    );

    if (modal) {
        modal.remove();
    }
}

/* =========================================================
   MODAL DE MOVIMIENTO
========================================================= */

function abrirMovimientoInventario(itemId = "") {
    cerrarMovimientoInventario();

    const opciones = (ScartData.inventario || [])
        .filter(item => item.activo !== false)
        .map(item => `
            <option
                value="${item.id}"
                ${
                    Number(itemId) === Number(item.id)
                        ? "selected"
                        : ""
                }
            >
                ${item.nombre}
                (${formatearCantidadInventario(item.stock)} ${item.unidad})
            </option>
        `)
        .join("");

    const modal = document.createElement("div");

    modal.id = "inventario-movimiento-modal";
    modal.className = "pedido-modal-overlay";

    modal.innerHTML = `
        <div class="pedido-modal inventario-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Inventario
                    </span>

                    <h2>
                        Registrar movimiento
                    </h2>

                    <p>
                        Registra entradas, salidas, mermas
                        o ajustes de inventario.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarMovimientoInventario()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="inventario-form-grid">

                    <label>
                        <span>Insumo</span>

                        <select
                            id="inventario-movimiento-item"
                            onchange="actualizarUnidadMovimiento()"
                        >
                            <option value="">
                                Seleccionar insumo
                            </option>

                            ${opciones}

                        </select>
                    </label>


                    <label>
                        <span>Tipo de movimiento</span>

                        <select
                            id="inventario-movimiento-tipo"
                            onchange="actualizarMotivosMovimiento()"
                        >

                            <option value="entrada">
                                Entrada
                            </option>

                            <option value="salida">
                                Salida
                            </option>

                            <option value="merma">
                                Merma
                            </option>

                            <option value="ajuste">
                                Ajuste de stock
                            </option>

                        </select>
                    </label>


                    <label>
                        <span>Cantidad</span>

                        <div class="inventario-cantidad-input">

                            <input
                                id="inventario-movimiento-cantidad"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                            >

                            <strong
                                id="inventario-movimiento-unidad"
                            >
                                -
                            </strong>

                        </div>
                    </label>


                    <label>
                        <span>Motivo</span>

                        <select
                            id="inventario-movimiento-motivo"
                        >
                        </select>
                    </label>

                </div>


                <label class="inventario-observacion">
                    <span>Observación</span>

                    <textarea
                        id="inventario-movimiento-observacion"
                        rows="3"
                        placeholder="Información adicional opcional..."
                    ></textarea>
                </label>


                <div class="inventario-ayuda">

                    <strong>
                        Tipos de movimiento
                    </strong>

                    <p>
                        <b>Entrada:</b>
                        aumenta las existencias disponibles.
                    </p>

                    <p>
                        <b>Salida:</b>
                        registra un retiro o consumo manual.
                    </p>

                    <p>
                        <b>Merma:</b>
                        registra existencias perdidas,
                        vencidas o no utilizables.
                    </p>

                    <p>
                        <b>Ajuste:</b>
                        establece la cantidad real encontrada
                        durante un conteo físico.
                    </p>

                </div>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarMovimientoInventario()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="guardarMovimientoInventario()"
                >
                    Registrar movimiento
                </button>

            </div>

        </div>
    `;

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                cerrarMovimientoInventario();
            }
        }
    );

    document.body.appendChild(modal);

    actualizarUnidadMovimiento();
    actualizarMotivosMovimiento();
}

function actualizarMotivosMovimiento() {

    const tipoSelect = document.getElementById(
        "inventario-movimiento-tipo"
    );

    const motivoSelect = document.getElementById(
        "inventario-movimiento-motivo"
    );

    if (!tipoSelect || !motivoSelect) {
        return;
    }

    const motivos = {

        entrada: [
            "Compra proveedor",
            "Devolución",
            "Reposición",
            "Corrección",
            "Otro"
        ],

        salida: [
            "Consumo interno",
            "Retiro manual",
            "Devolución a proveedor",
            "Traslado",
            "Otro"
        ],

        merma: [
            "Producto vencido",
            "Producto dañado",
            "Error de preparación",
            "Derrame",
            "Mala conservación",
            "Otro"
        ],

        ajuste: [
            "Conteo físico",
            "Corrección de inventario",
            "Diferencia encontrada",
            "Otro"
        ]
    };

    const opciones =
        motivos[tipoSelect.value] || [];

    motivoSelect.innerHTML = opciones
        .map(motivo => `
            <option value="${motivo}">
                ${motivo}
            </option>
        `)
        .join("");
}

/* =========================================================
   ACTUALIZAR UNIDAD DEL INSUMO
========================================================= */

function actualizarUnidadMovimiento() {
    const select = document.getElementById(
        "inventario-movimiento-item"
    );

    const unidad = document.getElementById(
        "inventario-movimiento-unidad"
    );

    if (!select || !unidad) {
        return;
    }

    const item = ScartData.inventario.find(
        item =>
            Number(item.id) ===
            Number(select.value)
    );

    unidad.textContent = item
        ? item.unidad
        : "-";
}


/* =========================================================
   GUARDAR MOVIMIENTO
========================================================= */

function guardarMovimientoInventario() {

    const itemId = Number(
        document.getElementById(
            "inventario-movimiento-item"
        ).value
    );

    const tipo = document.getElementById(
        "inventario-movimiento-tipo"
    ).value;

    const cantidad = Number(
        document.getElementById(
            "inventario-movimiento-cantidad"
        ).value
    );

    const motivo = document.getElementById(
        "inventario-movimiento-motivo"
    ).value;

    const observacion = document.getElementById(
        "inventario-movimiento-observacion"
    ).value.trim();


    const item = ScartData.inventario.find(
        item =>
            Number(item.id) === itemId
    );


    /* VALIDAR INSUMO */

    if (!item) {
        mostrarToast(
            "Selecciona un insumo."
        );

        return;
    }


    /* VALIDAR ESTADO */

    if (item.activo === false) {
        mostrarToast(
            "El insumo está desactivado."
        );

        return;
    }


    /* VALIDAR CANTIDAD */

    if (!cantidad || cantidad <= 0) {
        mostrarToast(
            "Ingresa una cantidad válida."
        );

        return;
    }


    const stockAnterior =
        Number(item.stock);

    let stockNuevo =
        stockAnterior;


    /* ENTRADA */

    if (tipo === "entrada") {

        stockNuevo =
            stockAnterior + cantidad;
    }


    /* SALIDA */

    if (tipo === "salida") {

        if (cantidad > stockAnterior) {

            mostrarToast(
                "La cantidad supera el stock disponible."
            );

            return;
        }

        stockNuevo =
            stockAnterior - cantidad;
    }


    /* MERMA */

    if (tipo === "merma") {

        if (cantidad > stockAnterior) {

            mostrarToast(
                "La merma supera el stock disponible."
            );

            return;
        }

        stockNuevo =
            stockAnterior - cantidad;
    }


    /* AJUSTE */

    if (tipo === "ajuste") {

        stockNuevo =
            cantidad;
    }


    /* ACTUALIZAR STOCK */

    item.stock = Number(
        stockNuevo.toFixed(2)
    );


    /* CREAR HISTORIAL SI NO EXISTE */

    if (!ScartData.movimientosInventario) {
        ScartData.movimientosInventario = [];
    }


    /* REGISTRAR MOVIMIENTO */

    ScartData.movimientosInventario.unshift({

        id: Date.now(),

        itemId: item.id,

        itemNombre: item.nombre,

        tipo: tipo,

        cantidad: cantidad,

        unidad: item.unidad,

        stockAnterior:
            stockAnterior,

        stockNuevo:
            item.stock,

        motivo:
            motivo || "Sin motivo",

        observacion:
            observacion || "",

        fecha:
            new Date().toISOString()
    });


    cerrarMovimientoInventario();

    mostrarToast(
        `Movimiento registrado en ${item.nombre}`
    );

    refrescarInventario();
}


/* =========================================================
   ÚLTIMOS MOVIMIENTOS
========================================================= */

function renderUltimosMovimientosInventario() {
    const movimientos = (
        ScartData.movimientosInventario || []
    ).slice(0, 8);

    return `
        <section class="inventario-movimientos">

            <div class="inventario-movimientos-header">

                <div>
                    <h3>
                        Últimos movimientos
                    </h3>

                    <p>
                        Registro reciente de cambios
                        realizados en inventario.
                    </p>
                </div>

            </div>


            ${
                movimientos.length
                    ? `
                        <div class="inventario-movimientos-lista">

                            ${
                                movimientos
                                    .map(renderMovimientoInventario)
                                    .join("")
                            }

                        </div>
                    `
                    : `
                        <div class="inventario-sin-movimientos">

                            Todavía no se han registrado
                            movimientos de inventario.

                        </div>
                    `
            }

        </section>
    `;
}


/* =========================================================
   FILA DE MOVIMIENTO
========================================================= */

function renderMovimientoInventario(movimiento) {
    const nombres = {
        entrada: "Entrada",
        salida: "Salida",
        merma: "Merma",
        ajuste: "Ajuste"
    };

    const fecha = new Date(
        movimiento.fecha
    );

    const fechaTexto = fecha.toLocaleString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    return `
        <div class="inventario-movimiento">

            <div>

                <strong>
                    ${movimiento.itemNombre}
                </strong>

                <span>
                    ${movimiento.motivo}
                </span>

            </div>


            <div class="inventario-movimiento-datos">

                <span
                    class="movimiento-tipo ${movimiento.tipo}"
                >
                    ${nombres[movimiento.tipo]}
                </span>

                <strong>
                    ${formatearCantidadInventario(
                        movimiento.cantidad
                    )}
                    ${movimiento.unidad}
                </strong>

                <small>
                    ${fechaTexto}
                </small>

            </div>

        </div>
    `;
}


/* =========================================================
   ICONOS POR CATEGORÍA
========================================================= */

function obtenerIconoCategoria(categoria) {
    const iconos = {
        "Base": "🍚",
        "Proteínas": "🐟",
        "Refrigerados": "🧀",
        "Vegetales": "🥑",
        "Apanados": "🍤",
        "Condimentos": "🌱",
        "Salsas": "🥢",
        "Cocina": "🍳",
        "Packaging": "📦",
        "Desechables": "🥡"
    };

    return iconos[categoria] || "📦";
}


/* =========================================================
   FORMATEAR CANTIDAD
========================================================= */

function formatearCantidadInventario(valor) {
    return Number(valor).toLocaleString(
        "es-CL",
        {
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarMovimientoInventario() {
    const modal = document.getElementById(
        "inventario-movimiento-modal"
    );

    if (modal) {
        modal.remove();
    }
}


/* =========================================================
   REFRESCAR INVENTARIO
========================================================= */

function refrescarInventario() {
    const contenedor = document.getElementById(
        "app-content"
    );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML =
        renderInventario();
}
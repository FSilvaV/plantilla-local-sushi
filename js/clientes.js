
/* =========================================================
   MÓDULO DE CLIENTES
   SISTEMA DE GESTIÓN PARA LOCALES
========================================================= */

const CLAVE_CLIENTES_DEMO = "appnova_clientes_demo_v1";

/* =========================================================
   UTILIDADES
========================================================= */

function escaparTextoCliente(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}

function cargarClientesGuardados() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(CLAVE_CLIENTES_DEMO) || "[]"
        );

        if (Array.isArray(datos)) {
            ScartData.clientes = datos;
        }
    } catch (error) {
        console.error("Error al cargar clientes:", error);
    }
}

function guardarClientes() {
    try {
        localStorage.setItem(
            CLAVE_CLIENTES_DEMO,
            JSON.stringify(ScartData.clientes)
        );
        return true;
    } catch (error) {
        console.error("Error al guardar clientes:", error);
        mostrarToast("No fue posible guardar los clientes");
        return false;
    }
}

/* =========================================================
   PANTALLA PRINCIPAL
========================================================= */

function renderClientes() {
    return `
        <section class="clientes-modulo">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:12px;
                flex-wrap:wrap;
                margin-bottom:20px;
            ">
                <div>
                    <h2>Clientes</h2>
                    <p>Registro y administración de clientes.</p>
                </div>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="mostrarFormularioCliente()"
                >
                    + Nuevo cliente
                </button>
            </div>

            <div id="cliente-formulario"></div>

            <input
                id="buscar-cliente"
                type="search"
                placeholder="Buscar por nombre, teléfono o RUT"
                oninput="actualizarListaClientes()"
                style="
                    width:100%;
                    padding:12px;
                    margin-bottom:16px;
                "
            >

            <div id="clientes-lista"></div>

        </section>
    `;
}

function iniciarClientes() {
    actualizarListaClientes();
}

/* =========================================================
   LISTADO Y BÚSQUEDA
========================================================= */

function actualizarListaClientes() {
    const contenedor = document.getElementById("clientes-lista");

    if (!contenedor) return;

    const busqueda = String(
        document.getElementById("buscar-cliente")?.value || ""
    ).trim().toLowerCase();

    const clientes = ScartData.clientes.filter(cliente =>
        [
            cliente.nombre,
            cliente.apellido,
            cliente.telefono,
            cliente.rut
        ].some(valor =>
            String(valor || "").toLowerCase().includes(busqueda)
        )
    );

    if (clientes.length === 0) {
        contenedor.innerHTML = `
            <p>No se encontraron clientes.</p>
        `;
        return;
    }

    contenedor.innerHTML = `
        <div style="overflow-x:auto;">
            <table style="
                width:100%;
                border-collapse:collapse;
                text-align:left;
            ">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>RUT</th>
                        <th>Fiados</th>
                        <th>Cupo límite</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    ${clientes.map(cliente => `
                        <tr>
                            <td>
                                ${escaparTextoCliente(cliente.nombre)}
                                ${escaparTextoCliente(cliente.apellido)}
                            </td>

                            <td>
                                ${escaparTextoCliente(cliente.telefono)}
                            </td>

                            <td>
                                ${escaparTextoCliente(cliente.rut || "—")}
                            </td>

                            <td>
                                ${cliente.autorizaFiado
                                    ? "Autorizado"
                                    : "No autorizado"}
                            </td>

                            <td>
                                ${cliente.tieneCupoLimite
                                    ? formatearDinero(cliente.cupoMaximo)
                                    : "Sin límite definido"}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    class="btn"
                                    onclick="mostrarFormularioCliente(${Number(cliente.id)})"
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

/* =========================================================
   FORMULARIO DE CLIENTES
========================================================= */

function mostrarFormularioCliente(id = null) {
    const cliente = id === null
        ? null
        : ScartData.clientes.find(c => c.id === id);

    const contenedor = document.getElementById("cliente-formulario");

    if (!contenedor) return;

    contenedor.innerHTML = `
        <form
            id="form-cliente"
            onsubmit="guardarFormularioCliente(event, ${id === null ? "null" : Number(id)})"
            style="
                padding:20px;
                border:1px solid #ccc;
                border-radius:12px;
                margin-bottom:20px;
            "
        >
            <h3>
                ${cliente ? "Editar cliente" : "Nuevo cliente"}
            </h3>

            <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                gap:12px;
            ">

                <label>
                    Nombre *
                    <input
                        name="nombre"
                        required
                        value="${escaparTextoCliente(cliente?.nombre)}"
                    >
                </label>

                <label>
                    Apellido *
                    <input
                        name="apellido"
                        required
                        value="${escaparTextoCliente(cliente?.apellido)}"
                    >
                </label>

                <label>
                    Teléfono *
                    <input
                        name="telefono"
                        type="tel"
                        required
                        value="${escaparTextoCliente(cliente?.telefono)}"
                    >
                </label>

                <label>
                    RUT (opcional)
                    <input
                        name="rut"
                        value="${escaparTextoCliente(cliente?.rut)}"
                    >
                </label>

                <label>
                    Dirección (opcional)
                    <input
                        name="direccion"
                        value="${escaparTextoCliente(cliente?.direccion)}"
                    >
                </label>

            </div>

            <label style="display:block;margin-top:12px;">
                Observaciones (opcional)

                <textarea name="observaciones">${escaparTextoCliente(cliente?.observaciones)}</textarea>
            </label>

            <label style="display:block;margin-top:14px;">
                <input
                    type="checkbox"
                    name="autorizaFiado"
                    ${cliente?.autorizaFiado ? "checked" : ""}
                >
                Autorizar fiados
            </label>

            <label style="display:block;margin-top:10px;">
                <input
                    type="checkbox"
                    id="cliente-tiene-cupo"
                    name="tieneCupoLimite"
                    onchange="alternarCupoCliente()"
                    ${cliente?.tieneCupoLimite ? "checked" : ""}
                >
                Establecer cupo límite (opcional)
            </label>

            <div
                id="cliente-cupo-campo"
                style="
                    display:${cliente?.tieneCupoLimite ? "block" : "none"};
                    margin-top:12px;
                "
            >
                <label>
                    Cupo máximo (CLP)

                    <input
                        type="number"
                        name="cupoMaximo"
                        min="1"
                        step="1"
                        value="${cliente?.tieneCupoLimite
                            ? Number(cliente.cupoMaximo)
                            : ""}"
                    >
                </label>
            </div>

            <div style="
                display:flex;
                gap:10px;
                margin-top:20px;
            ">
                <button type="submit" class="btn btn-primary">
                    Guardar cliente
                </button>

                <button
                    type="button"
                    class="btn"
                    onclick="cerrarFormularioCliente()"
                >
                    Cancelar
                </button>
            </div>
        </form>
    `;

    alternarCupoCliente();
}

function alternarCupoCliente() {
    const marcado =
        document.getElementById("cliente-tiene-cupo")?.checked;

    const campo =
        document.getElementById("cliente-cupo-campo");

    if (!campo) return;

    campo.style.display = marcado ? "block" : "none";

    const input = campo.querySelector('[name="cupoMaximo"]');

    if (input) {
        input.required = Boolean(marcado);
        input.disabled = !marcado;
    }
}

function cerrarFormularioCliente() {
    const contenedor = document.getElementById("cliente-formulario");

    if (contenedor) {
        contenedor.innerHTML = "";
    }
}

/* =========================================================
   GUARDAR Y EDITAR CLIENTES
========================================================= */

function guardarFormularioCliente(event, id) {
    event.preventDefault();

    const datos = new FormData(event.currentTarget);

    const nombre = String(datos.get("nombre") || "").trim();
    const apellido = String(datos.get("apellido") || "").trim();
    const telefono = String(datos.get("telefono") || "").trim();
    const rut = String(datos.get("rut") || "").trim();

    const tieneCupoLimite = datos.has("tieneCupoLimite");

    const cupoMaximo = tieneCupoLimite
        ? Number(datos.get("cupoMaximo"))
        : null;

    if (!nombre || !apellido || !telefono) {
        mostrarToast("Completa los campos obligatorios");
        return;
    }

    if (
        tieneCupoLimite &&
        (!Number.isSafeInteger(cupoMaximo) || cupoMaximo <= 0)
    ) {
        mostrarToast("Ingresa un cupo máximo válido");
        return;
    }

    const rutNormalizado =
        rut.replace(/[.\s-]/g, "").toUpperCase();

    const rutDuplicado = rutNormalizado &&
        ScartData.clientes.some(cliente =>
            cliente.id !== id &&
            String(cliente.rut || "")
                .replace(/[.\s-]/g, "")
                .toUpperCase() === rutNormalizado
        );

    if (rutDuplicado) {
        mostrarToast("Ya existe un cliente con ese RUT");
        return;
    }

    const anterior = id === null
        ? null
        : ScartData.clientes.find(cliente => cliente.id === id);

    const cliente = {
        id: anterior?.id ??
            Math.max(
                0,
                ...ScartData.clientes.map(c => Number(c.id) || 0)
            ) + 1,

        nombre,
        apellido,
        telefono,
        rut,

        direccion: String(datos.get("direccion") || "").trim(),
        observaciones: String(datos.get("observaciones") || "").trim(),

        autorizaFiado: datos.has("autorizaFiado"),
        tieneCupoLimite,
        cupoMaximo,

        fechaCreacion:
            anterior?.fechaCreacion || new Date().toISOString(),

        fechaActualizacion: new Date().toISOString()
    };

    const copiaAnterior = [...ScartData.clientes];

    if (anterior) {
        const posicion = ScartData.clientes.findIndex(
            c => c.id === id
        );

        ScartData.clientes[posicion] = cliente;
    } else {
        ScartData.clientes.push(cliente);
    }

    if (!guardarClientes()) {
        ScartData.clientes = copiaAnterior;
        return;
    }

    cerrarFormularioCliente();
    actualizarListaClientes();

    mostrarToast(
        anterior ? "Cliente actualizado" : "Cliente registrado"
    );
}

/* =========================================================
   INICIALIZACIÓN
========================================================= */

cargarClientesGuardados();

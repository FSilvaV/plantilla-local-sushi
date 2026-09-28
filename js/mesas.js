/* =========================================================
   SCART SUSHI
   MÓDULO: MESAS
========================================================= */

let filtroMesas = "todas";
let mesaSeleccionadaId = null;


/* =========================================================
   RENDER PRINCIPAL
========================================================= */

function renderMesas() {
    const mesas = ScartData.mesas || [];

    const disponibles = mesas.filter(
        mesa => mesa.estado === "disponible"
    ).length;

    const ocupadas = mesas.filter(
        mesa => mesa.estado === "ocupada"
    ).length;

    const mesasFiltradas = obtenerMesasFiltradas();

    return `
        <div class="mesas-page">

            <div class="mesas-header">

                <div>
                    <h2>Mesas</h2>

                    <p>
                        Estado actual del salón
                    </p>
                </div>

            </div>


            <!-- =========================
                 RESUMEN
            ========================== -->

            <div class="mesas-resumen">

                <div class="mesa-resumen-card">

                    <div class="mesa-resumen-icon disponible">
                        ✓
                    </div>

                    <div>
                        <strong>
                            ${disponibles}
                        </strong>

                        <span>
                            Disponibles
                        </span>
                    </div>

                </div>


                <div class="mesa-resumen-card">

                    <div class="mesa-resumen-icon ocupada">
                        ●
                    </div>

                    <div>
                        <strong>
                            ${ocupadas}
                        </strong>

                        <span>
                            Ocupadas
                        </span>
                    </div>

                </div>


                <div class="mesa-resumen-card">

                    <div class="mesa-resumen-icon total">
                        ▦
                    </div>

                    <div>
                        <strong>
                            ${mesas.length}
                        </strong>

                        <span>
                            Total mesas
                        </span>
                    </div>

                </div>

            </div>


            <!-- =========================
                 FILTROS
            ========================== -->

            <div class="mesas-toolbar">

                <div class="mesas-filtros">

                    <button
                        class="mesa-filtro ${
                            filtroMesas === "todas"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroMesas('todas')"
                    >
                        Todas (${mesas.length})
                    </button>


                    <button
                        class="mesa-filtro ${
                            filtroMesas === "disponible"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroMesas('disponible')"
                    >
                        Disponibles (${disponibles})
                    </button>


                    <button
                        class="mesa-filtro ${
                            filtroMesas === "ocupada"
                                ? "active"
                                : ""
                        }"
                        onclick="cambiarFiltroMesas('ocupada')"
                    >
                        Ocupadas (${ocupadas})
                    </button>

                </div>

            </div>


            <!-- =========================
                 CONTENIDO
            ========================== -->

            <div
                class="
                    mesas-layout
                    ${
                        mesaSeleccionadaId
                            ? "con-detalle"
                            : ""
                    }
                "
            >

                <div class="mesas-grid">

                    ${
                        mesasFiltradas.length
                            ? mesasFiltradas
                                .map(renderMesaCard)
                                .join("")
                            : `
                                <div class="mesas-vacio">
                                    No hay mesas en esta categoría.
                                </div>
                            `
                    }

                </div>


                ${
                    mesaSeleccionadaId
                        ? renderDetalleMesa(
                            mesaSeleccionadaId
                        )
                        : ""
                }

            </div>

        </div>
    `;
}


/* =========================================================
   FILTROS
========================================================= */

function obtenerMesasFiltradas() {
    const mesas = ScartData.mesas || [];

    if (filtroMesas === "todas") {
        return mesas;
    }

    return mesas.filter(
        mesa => mesa.estado === filtroMesas
    );
}


function cambiarFiltroMesas(filtro) {
    filtroMesas = filtro;

    refrescarMesas();
}


/* =========================================================
   CARD DE MESA
========================================================= */

function renderMesaCard(mesa) {
    const ocupada =
        mesa.estado === "ocupada";

    const pedido =
        ocupada
            ? obtenerPedidoDeMesa(mesa)
            : null;

    const minutos =
        ocupada
            ? obtenerTiempoMesa(mesa)
            : 0;

    const seleccionada =
        Number(mesaSeleccionadaId) ===
        Number(mesa.id);

    return `
        <article
            class="
                mesa-card
                ${ocupada ? "ocupada" : "disponible"}
                ${seleccionada ? "seleccionada" : ""}
            "
            onclick="seleccionarMesa(${mesa.id})"
        >

            <div class="mesa-card-header">

                <div>
                    <span class="mesa-numero-label">
                        Mesa
                    </span>

                    <h3>
                        ${formatearNumeroMesa(mesa)}
                    </h3>
                </div>


                <span
                    class="
                        mesa-estado
                        ${
                            ocupada
                                ? "ocupada"
                                : "disponible"
                        }
                    "
                >
                    <span class="mesa-estado-dot"></span>

                    ${
                        ocupada
                            ? "Ocupada"
                            : "Disponible"
                    }
                </span>

            </div>


            <div class="mesa-card-visual">

                <div class="mesa-icono-grande">
                    ▦
                </div>

            </div>


            <div class="mesa-card-info">

                ${
                    ocupada
                        ? `
                            <div>
                                <span>Tiempo</span>

                                <strong
                                    data-mesa-tiempo="${mesa.id}"
                                >
                                    ${minutos} min
                                </strong>
                            </div>

                            <div>
                                <span>Pedido</span>

                                <strong>
                                    ${
                                        pedido
                                            ? pedido.numero
                                            : "Sin pedido"
                                    }
                                </strong>
                            </div>
                        `
                        : `
                            <div>
                                <span>Estado</span>

                                <strong>
                                    Lista para recibir clientes
                                </strong>
                            </div>
                        `
                }

            </div>

        </article>
    `;
}


/* =========================================================
   SELECCIONAR MESA
========================================================= */

function seleccionarMesa(id) {
    mesaSeleccionadaId =
        Number(id);

    refrescarMesas();
}


function cerrarDetalleMesa() {
    mesaSeleccionadaId = null;

    refrescarMesas();
}


/* =========================================================
   PANEL DERECHO
========================================================= */

function renderDetalleMesa(id) {
    const mesa = ScartData.mesas.find(
        mesa =>
            Number(mesa.id) ===
            Number(id)
    );

    if (!mesa) {
        return "";
    }

    const ocupada =
        mesa.estado === "ocupada";

    const pedido =
        ocupada
            ? obtenerPedidoDeMesa(mesa)
            : null;

    const minutos =
        ocupada
            ? obtenerTiempoMesa(mesa)
            : 0;

    const cliente =
        pedido
            ? obtenerNombreClientePedido(pedido)
            : "";

    const horaIngreso =
        obtenerHoraIngresoMesa(mesa);

    return `
        <aside class="mesa-detalle">

            <!-- CABECERA -->

            <div class="mesa-detalle-header">

                <div>

                    <span class="mesa-numero-label">
                        Mesa
                    </span>

                    <h2>
                        ${formatearNumeroMesa(mesa)}
                    </h2>

                </div>


                <button
                    class="mesa-detalle-cerrar"
                    onclick="cerrarDetalleMesa()"
                    aria-label="Cerrar"
                >
                    ×
                </button>

            </div>


            <!-- ESTADO -->

            <div
                class="
                    mesa-detalle-estado
                    ${
                        ocupada
                            ? "ocupada"
                            : "disponible"
                    }
                "
            >

                <span class="mesa-estado-dot"></span>

                ${
                    ocupada
                        ? "Ocupada"
                        : "Disponible"
                }

            </div>


            <!-- IMAGEN PLACEHOLDER -->

            <div class="mesa-imagen-placeholder">

                <div class="mesa-placeholder-icon">
                    ▦
                </div>

                <strong>
                    Imagen de mesa
                </strong>

                <span>
                    Placeholder
                </span>

            </div>


            <!-- INFORMACIÓN -->

            <div class="mesa-detalle-box">

                <h3>
                    Información de la mesa
                </h3>


                <div class="mesa-info-fila">

                    <span>Número</span>

                    <strong>
                        ${formatearNumeroMesa(mesa)}
                    </strong>

                </div>


                <div class="mesa-info-fila">

                    <span>Estado</span>

                    <strong
                        class="${
                            ocupada
                                ? "texto-ocupada"
                                : "texto-disponible"
                        }"
                    >
                        ${
                            ocupada
                                ? "Ocupada"
                                : "Disponible"
                        }
                    </strong>

                </div>


                ${
                    ocupada
                        ? `
                            <div class="mesa-info-fila">

                                <span>
                                    Tiempo ocupada
                                </span>

                                <strong
                                    data-mesa-tiempo="${mesa.id}"
                                >
                                    ${minutos} min
                                </strong>

                            </div>


                            <div class="mesa-info-fila">

                                <span>
                                    Pedido actual
                                </span>

                                <strong>
                                    ${
                                        pedido
                                            ? pedido.numero
                                            : "Sin pedido"
                                    }
                                </strong>

                            </div>


                            <div class="mesa-info-fila">

                                <span>
                                    Cliente
                                </span>

                                <strong>
                                    ${
                                        cliente ||
                                        "Sin información"
                                    }
                                </strong>

                            </div>


                            <div class="mesa-info-fila">

                                <span>
                                    Tipo
                                </span>

                                <strong>
                                    Atención local
                                </strong>

                            </div>


                            <div class="mesa-info-fila">

                                <span>
                                    Ingreso
                                </span>

                                <strong>
                                    ${
                                        horaIngreso ||
                                        "--:--"
                                    }
                                </strong>

                            </div>
                        `
                        : `
                            <div class="mesa-info-mensaje">

                                Esta mesa se encuentra
                                disponible para recibir
                                un nuevo pedido.

                            </div>
                        `
                }

            </div>


            <!-- ACCIONES -->

            ${
                ocupada
                    ? `
                        <div class="mesa-detalle-acciones">

                            ${
                                pedido
                                    ? `
                                        <button
                                            class="btn-secondary"
                                            onclick="verPedidoDesdeMesa(${pedido.id})"
                                        >
                                            Ver pedido
                                        </button>
                                    `
                                    : ""
                            }


                            <button
                                class="btn-primary"
                                onclick="liberarMesa(${mesa.id})"
                            >
                                Liberar mesa
                            </button>

                        </div>
                    `
                    : ""
            }

        </aside>
    `;
}


/* =========================================================
   DATOS RELACIONADOS
========================================================= */

function obtenerPedidoDeMesa(mesa) {
    if (!ScartData.pedidos) {
        return null;
    }

    // Si la mesa tiene un pedido asociado
    // directamente, primero intentamos usarlo.
    if (mesa.pedidoId) {
        const pedidoDirecto =
            ScartData.pedidos.find(
                pedido =>
                    Number(pedido.id) ===
                    Number(mesa.pedidoId) &&
                    ![
                        "entregado",
                        "anulado"
                    ].includes(
                        pedido.estado
                    )
            );

        if (pedidoDirecto) {
            return pedidoDirecto;
        }
    }


    // Si no existe pedidoId, buscamos un
    // pedido ACTIVO asociado a la mesa.
    const pedidosMesa =
        ScartData.pedidos
            .filter(
                pedido =>
                    Number(pedido.mesaId) ===
                        Number(mesa.id) &&
                    pedido.tipo === "local" &&
                    ![
                        "entregado",
                        "anulado"
                    ].includes(
                        pedido.estado
                    )
            )
            .sort(
                (a, b) =>
                    new Date(b.fechaCreacion) -
                    new Date(a.fechaCreacion)
            );


    return pedidosMesa[0] || null;
}


function obtenerTiempoMesa(mesa) {
    if (!mesa.fechaOcupacion) {
        return 0;
    }

    const inicio =
        new Date(
            mesa.fechaOcupacion
        ).getTime();

    const ahora =
        Date.now();

    return Math.max(
        0,
        Math.floor(
            (ahora - inicio) /
            60000
        )
    );
}


function obtenerHoraIngresoMesa(mesa) {
    if (!mesa.fechaOcupacion) {
        return "";
    }

    return new Date(
        mesa.fechaOcupacion
    ).toLocaleTimeString(
        "es-CL",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatearNumeroMesa(mesa) {
    if (mesa.nombre) {
        return mesa.nombre.replace(
            /^Mesa\s*/i,
            ""
        );
    }

    return String(
        mesa.id
    ).padStart(2, "0");
}


/* =========================================================
   VER PEDIDO
========================================================= */

function verPedidoDesdeMesa(idPedido) {
    navegar("pedidos");

    setTimeout(
        () => {
            verDetallePedido(idPedido);
        },
        50
    );
}


/* =========================================================
   LIBERAR MESA
========================================================= */

function liberarMesa(id) {
    const mesa =
        ScartData.mesas.find(
            mesa =>
                Number(mesa.id) ===
                Number(id)
        );

    if (!mesa) {
        mostrarToast(
            "No se encontró la mesa."
        );

        return;
    }


    const pedido =
        obtenerPedidoDeMesa(mesa);


    const confirmar =
        window.confirm(
            `¿Deseas liberar la Mesa ${formatearNumeroMesa(mesa)}?`
        );


    if (!confirmar) {
        return;
    }


    const ahora =
        new Date().toISOString();


    // =========================
    // LIBERAR MESA
    // =========================

    mesa.estado =
        "disponible";

    mesa.fechaLiberacion =
        ahora;

    mesa.fechaOcupacion =
        null;

    mesa.pedidoId =
        null;


    // =========================
    // HISTORIAL DEL PEDIDO
    // =========================

    if (pedido) {

        if (!pedido.historial) {
            pedido.historial = [];
        }

        pedido.historial.push({
            tipo: "mesa",
            fecha: ahora,
            detalle:
                `Mesa ${formatearNumeroMesa(mesa)} liberada`
        });


        // Quitamos la relación activa
        // con la mesa.
        pedido.mesaId = null;
    }


    // =========================
    // CERRAR PANEL
    // =========================

    mesaSeleccionadaId =
        null;


    mostrarToast(
        `Mesa ${formatearNumeroMesa(mesa)} liberada`
    );


    refrescarMesas();
}


/* =========================================================
   REFRESCAR
========================================================= */

function refrescarMesas() {
    const contenedor =
        document.getElementById(
            "appContent"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML =
        renderMesas();
}


/* =========================================================
   CRONÓMETRO
========================================================= */

function actualizarCronometrosMesas() {
    const elementos =
        document.querySelectorAll(
            "[data-mesa-tiempo]"
        );

    elementos.forEach(
        elemento => {

            const id =
                Number(
                    elemento.dataset.mesaTiempo
                );

            const mesa =
                ScartData.mesas.find(
                    mesa =>
                        Number(mesa.id) === id
                );

            if (!mesa) {
                return;
            }

            elemento.textContent =
                `${obtenerTiempoMesa(mesa)} min`;
        }
    );
}


setInterval(
    actualizarCronometrosMesas,
    1000
);
function renderVentas() {

    const pedidos = ScartData.pedidos || [];

    /*
        Una venta efectiva requiere pago confirmado.

        El estado operativo del pedido y el estado financiero
        se mantienen separados.
    */
    const ventas = pedidos
        .filter(pedido =>
            pedido.pago?.estado === "pagado" &&
            pedido.estado !== "anulado" &&
            pedido.estado !== "cancelado"
        )
        .sort((a, b) => {
            const fechaA = new Date(
                a.pago?.fechaPago || a.fechaActualizacion || a.fechaCreacion
            );

            const fechaB = new Date(
                b.pago?.fechaPago || b.fechaActualizacion || b.fechaCreacion
            );

            return fechaB - fechaA;
        });


    const anulaciones = pedidos
        .filter(pedido =>
            pedido.estado === "anulado" ||
            pedido.estado === "cancelado"
        )
        .sort((a, b) =>
            new Date(b.fechaActualizacion || b.fechaCreacion) -
            new Date(a.fechaActualizacion || a.fechaCreacion)
        );


    const totalVentas = ventas.reduce(
        (total, pedido) =>
            total + Number(pedido.total || 0),
        0
    );


    const totalEfectivo = calcularVentasPorMetodo(
        ventas,
        "efectivo"
    );

    const totalDebito = calcularVentasPorMetodo(
        ventas,
        "debito"
    );

    const totalCredito = calcularVentasPorMetodo(
        ventas,
        "credito"
    );

    const totalTransferencia = calcularVentasPorMetodo(
        ventas,
        "transferencia"
    );


    return `
        <section class="ventas-page">

            <div class="ventas-header">

                <div>
                    <span class="ventas-label">
                        Gestión comercial
                    </span>

                    <h1>Ventas</h1>

                    <p>
                        Consulta las ventas registradas,
                        medios de pago y transacciones.
                    </p>
                </div>

            </div>


            <div class="ventas-resumen">

                ${renderVentaResumenCard(
                    "Ventas totales",
                    totalVentas,
                    ventas.length
                )}

                ${renderVentaResumenCard(
                    "Efectivo",
                    totalEfectivo,
                    contarVentasPorMetodo(
                        ventas,
                        "efectivo"
                    )
                )}

                ${renderVentaResumenCard(
                    "Débito",
                    totalDebito,
                    contarVentasPorMetodo(
                        ventas,
                        "debito"
                    )
                )}

                ${renderVentaResumenCard(
                    "Crédito",
                    totalCredito,
                    contarVentasPorMetodo(
                        ventas,
                        "credito"
                    )
                )}

                ${renderVentaResumenCard(
                    "Transferencia",
                    totalTransferencia,
                    contarVentasPorMetodo(
                        ventas,
                        "transferencia"
                    )
                )}

            </div>


            <div class="ventas-tabs">

                <button
                    class="ventas-tab activo"
                    data-ventas-tab="ventas"
                    onclick="cambiarVistaVentas('ventas')"
                >
                    Ventas registradas
                    <span>${ventas.length}</span>
                </button>

                <button
                    class="ventas-tab"
                    data-ventas-tab="anulaciones"
                    onclick="cambiarVistaVentas('anulaciones')"
                >
                    Anulaciones
                    <span>${anulaciones.length}</span>
                </button>

            </div>


            <div
                id="ventas-vista-ventas"
                class="ventas-vista"
            >

                ${renderFiltrosVentas()}

                <div
                    id="ventas-listado"
                    class="ventas-listado"
                >
                    ${renderListadoVentas(ventas)}
                </div>

            </div>


            <div
                id="ventas-vista-anulaciones"
                class="ventas-vista"
                style="display: none;"
            >

                ${renderListadoAnulaciones(anulaciones)}

            </div>

        </section>
    `;
}


/* =========================================================
   RESUMEN
========================================================= */

function renderVentaResumenCard(
    titulo,
    total,
    cantidad
) {

    return `
        <article class="ventas-resumen-card">

            <span>
                ${titulo}
            </span>

            <strong>
                ${formatearDineroVentas(total)}
            </strong>

            <small>
                ${cantidad}
                ${cantidad === 1
                    ? "transacción"
                    : "transacciones"}
            </small>

        </article>
    `;
}


/* =========================================================
   FILTROS
========================================================= */

function renderFiltrosVentas() {

    return `
        <div class="ventas-filtros">

            <label>
                <span>Período</span>

                <select
                    id="ventas-filtro-periodo"
                    onchange="aplicarFiltrosVentas()"
                >
                    <option value="hoy">
                        Hoy
                    </option>

                    <option value="7dias">
                        Últimos 7 días
                    </option>

                    <option value="30dias">
                        Últimos 30 días
                    </option>

                    <option value="todo">
                        Todo
                    </option>
                </select>
            </label>


            <label>
                <span>Canal</span>

                <select
                    id="ventas-filtro-canal"
                    onchange="aplicarFiltrosVentas()"
                >
                    <option value="todos">
                        Todos
                    </option>

                    <option value="local">
                        Local
                    </option>

                    <option value="retiro">
                        Retiro
                    </option>

                    <option value="delivery">
                        Delivery
                    </option>
                </select>
            </label>


            <label>
                <span>Medio de pago</span>

                <select
                    id="ventas-filtro-pago"
                    onchange="aplicarFiltrosVentas()"
                >
                    <option value="todos">
                        Todos
                    </option>

                    <option value="efectivo">
                        Efectivo
                    </option>

                    <option value="debito">
                        Débito
                    </option>

                    <option value="credito">
                        Crédito
                    </option>

                    <option value="transferencia">
                        Transferencia
                    </option>
                </select>
            </label>


            <label class="ventas-busqueda">
                <span>Buscar</span>

                <input
                    id="ventas-filtro-busqueda"
                    type="text"
                    placeholder="Pedido o cliente..."
                    oninput="aplicarFiltrosVentas()"
                >
            </label>

        </div>
    `;
}


/* =========================================================
   LISTADO DE VENTAS
========================================================= */

function renderListadoVentas(ventas) {

    if (!ventas.length) {

        return `
            <div class="ventas-vacio">

                <strong>
                    No hay ventas registradas
                </strong>

                <p>
                    Las operaciones pagadas aparecerán
                    automáticamente en esta sección.
                </p>

            </div>
        `;
    }


    return `
        <div class="ventas-tabla-wrapper">

            <table class="ventas-tabla">

                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Canal</th>
                        <th>Pago</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>

                    ${ventas.map(pedido =>
                        renderFilaVenta(pedido)
                    ).join("")}

                </tbody>

            </table>

        </div>
    `;
}


function renderFilaVenta(pedido) {

    const cliente = obtenerNombreClienteVenta(
        pedido
    );

    const metodo = obtenerMetodoPagoVenta(
        pedido
    );

    const fecha =
        pedido.pago?.fechaPago ||
        pedido.fechaActualizacion ||
        pedido.fechaCreacion;


    return `
        <tr>

            <td>
                <strong>
                    ${pedido.numero}
                </strong>
            </td>

            <td>
                ${formatearFechaVenta(fecha)}
            </td>

            <td>
                ${cliente}
            </td>

            <td>
                <span class="venta-canal">
                    ${formatearCanalVenta(
                        pedido.tipo
                    )}
                </span>
            </td>

            <td>
                ${formatearMetodoVenta(
                    metodo
                )}
            </td>

            <td>
                <strong>
                    ${formatearDineroVentas(
                        pedido.total
                    )}
                </strong>
            </td>

            <td>
                <button
                    class="btn-secondary"
                    onclick="verDetalleVenta(${pedido.id})"
                >
                    Ver detalle
                </button>
            </td>

        </tr>
    `;
}


/* =========================================================
   ANULACIONES
========================================================= */

function renderListadoAnulaciones(pedidos) {

    if (!pedidos.length) {

        return `
            <div class="ventas-vacio">

                <strong>
                    No existen anulaciones registradas
                </strong>

                <p>
                    Las ventas o pedidos anulados
                    aparecerán separados del registro
                    de ventas efectivas.
                </p>

            </div>
        `;
    }


    return `
        <div class="ventas-tabla-wrapper">

            <table class="ventas-tabla">

                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Canal</th>
                        <th>Total</th>
                        <th>Estado</th>
                    </tr>
                </thead>

                <tbody>

                    ${pedidos.map(pedido => `
                        <tr>

                            <td>
                                <strong>
                                    ${pedido.numero}
                                </strong>
                            </td>

                            <td>
                                ${formatearFechaVenta(
                                    pedido.fechaActualizacion ||
                                    pedido.fechaCreacion
                                )}
                            </td>

                            <td>
                                ${obtenerNombreClienteVenta(
                                    pedido
                                )}
                            </td>

                            <td>
                                ${formatearCanalVenta(
                                    pedido.tipo
                                )}
                            </td>

                            <td>
                                <strong>
                                    ${formatearDineroVentas(
                                        pedido.total
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${pedido.estado === "anulado"
                                    ? "Anulado"
                                    : "Cancelado"}
                            </td>

                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =========================================================
   CAMBIAR PESTAÑA
========================================================= */

function cambiarVistaVentas(vista) {

    const vistaVentas = document.getElementById(
        "ventas-vista-ventas"
    );

    const vistaAnulaciones = document.getElementById(
        "ventas-vista-anulaciones"
    );

    if (!vistaVentas || !vistaAnulaciones) {
        return;
    }


    vistaVentas.style.display =
        vista === "ventas"
            ? ""
            : "none";

    vistaAnulaciones.style.display =
        vista === "anulaciones"
            ? ""
            : "none";


    document
        .querySelectorAll(".ventas-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "activo",
                tab.dataset.ventasTab === vista
            );

        });
}


/* =========================================================
   FILTRAR
========================================================= */

function aplicarFiltrosVentas() {

    const periodo =
        document.getElementById(
            "ventas-filtro-periodo"
        )?.value || "hoy";

    const canal =
        document.getElementById(
            "ventas-filtro-canal"
        )?.value || "todos";

    const pago =
        document.getElementById(
            "ventas-filtro-pago"
        )?.value || "todos";

    const busqueda =
        document.getElementById(
            "ventas-filtro-busqueda"
        )?.value
        .trim()
        .toLowerCase() || "";


    let ventas = (ScartData.pedidos || [])
        .filter(pedido =>
            pedido.pago?.estado === "pagado" &&
            pedido.estado !== "anulado" &&
            pedido.estado !== "cancelado"
        );


    ventas = ventas.filter(pedido => {

        if (
            canal !== "todos" &&
            pedido.tipo !== canal
        ) {
            return false;
        }


        const metodo =
            obtenerMetodoPagoVenta(pedido);

        if (
            pago !== "todos" &&
            metodo !== pago
        ) {
            return false;
        }


        if (
            !ventaDentroPeriodo(
                pedido,
                periodo
            )
        ) {
            return false;
        }


        if (busqueda) {

            const texto = `
                ${pedido.numero || ""}
                ${pedido.cliente?.nombre || ""}
                ${pedido.cliente?.apellido || ""}
                ${pedido.cliente?.telefono || ""}
            `.toLowerCase();

            if (!texto.includes(busqueda)) {
                return false;
            }
        }


        return true;
    });


    ventas.sort((a, b) => {

        const fechaA = new Date(
            a.pago?.fechaPago ||
            a.fechaActualizacion ||
            a.fechaCreacion
        );

        const fechaB = new Date(
            b.pago?.fechaPago ||
            b.fechaActualizacion ||
            b.fechaCreacion
        );

        return fechaB - fechaA;
    });


    const contenedor =
        document.getElementById(
            "ventas-listado"
        );

    if (contenedor) {
        contenedor.innerHTML =
            renderListadoVentas(ventas);
    }
}


/* =========================================================
   PERÍODOS
========================================================= */

function ventaDentroPeriodo(
    pedido,
    periodo
) {

    if (periodo === "todo") {
        return true;
    }

    const fecha = new Date(
        pedido.pago?.fechaPago ||
        pedido.fechaActualizacion ||
        pedido.fechaCreacion
    );

    const ahora = new Date();

    if (periodo === "hoy") {

        return (
            fecha.getFullYear() === ahora.getFullYear() &&
            fecha.getMonth() === ahora.getMonth() &&
            fecha.getDate() === ahora.getDate()
        );
    }

    const diferencia =
        ahora.getTime() -
        fecha.getTime();

    const dias =
        diferencia /
        (1000 * 60 * 60 * 24);

    if (periodo === "7dias") {
        return dias >= 0 && dias <= 7;
    }

    if (periodo === "30dias") {
        return dias >= 0 && dias <= 30;
    }

    return true;
}


/* =========================================================
   DETALLE
========================================================= */

function verDetalleVenta(pedidoId) {

    const pedido =
        (ScartData.pedidos || []).find(
            pedido =>
                Number(pedido.id) ===
                Number(pedidoId)
        );

    if (!pedido) {
        return;
    }


    const metodo =
        obtenerMetodoPagoVenta(pedido);


    const productos = (
        pedido.productos || []
    )
        .map(producto => `

            <div class="venta-detalle-producto">

                <span>
                    ${producto.cantidad} ×
                    ${producto.nombre}
                </span>

                <strong>
                    ${formatearDineroVentas(
                        Number(producto.precio) *
                        Number(producto.cantidad)
                    )}
                </strong>

            </div>

        `)
        .join("");


    const modal =
        document.createElement("div");

    modal.id =
        "venta-detalle-modal";

    modal.className =
        "pedido-modal-overlay";


    modal.innerHTML = `
        <div class="pedido-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Venta
                    </span>

                    <h2>
                        ${pedido.numero}
                    </h2>

                    <p>
                        ${formatearFechaVenta(
                            pedido.pago?.fechaPago ||
                            pedido.fechaActualizacion ||
                            pedido.fechaCreacion
                        )}
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarDetalleVenta()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="venta-detalle-info">

                    <p>
                        <span>Cliente</span>
                        <strong>
                            ${obtenerNombreClienteVenta(
                                pedido
                            )}
                        </strong>
                    </p>

                    <p>
                        <span>Canal</span>
                        <strong>
                            ${formatearCanalVenta(
                                pedido.tipo
                            )}
                        </strong>
                    </p>

                    <p>
                        <span>Medio de pago</span>
                        <strong>
                            ${formatearMetodoVenta(
                                metodo
                            )}
                        </strong>
                    </p>

                </div>


                <div class="venta-detalle-productos">

                    <h3>
                        Productos
                    </h3>

                    ${productos}

                </div>


                ${
                    Number(pedido.propina || 0) > 0
                        ? `
                            <div class="venta-detalle-linea">
                                <span>Subtotal</span>
                                <strong>
                                    ${formatearDineroVentas(
                                        pedido.subtotal
                                    )}
                                </strong>
                            </div>

                            <div class="venta-detalle-linea">
                                <span>Propina</span>
                                <strong>
                                    ${formatearDineroVentas(
                                        pedido.propina
                                    )}
                                </strong>
                            </div>
                        `
                        : ""
                }


                ${
                    metodo === "efectivo"
                        ? `
                            <div class="venta-detalle-efectivo">

                                <p>
                                    <span>Recibido</span>
                                    <strong>
                                        ${formatearDineroVentas(
                                            pedido.pago?.montoRecibido
                                        )}
                                    </strong>
                                </p>

                                <p>
                                    <span>Vuelto</span>
                                    <strong>
                                        ${formatearDineroVentas(
                                            pedido.pago?.vuelto
                                        )}
                                    </strong>
                                </p>

                            </div>
                        `
                        : ""
                }


                <div class="venta-detalle-total">

                    <span>
                        Total venta
                    </span>

                    <strong>
                        ${formatearDineroVentas(
                            pedido.total
                        )}
                    </strong>

                </div>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarDetalleVenta()"
                >
                    Cerrar
                </button>

            </div>

        </div>
    `;


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                cerrarDetalleVenta();
            }

        }
    );


    document.body.appendChild(modal);
}


function cerrarDetalleVenta() {

    document.getElementById(
        "venta-detalle-modal"
    )?.remove();
}


/* =========================================================
   HELPERS
========================================================= */

function obtenerMetodoPagoVenta(pedido) {

    return (
        pedido.pago?.metodoFinal ||
        pedido.pago?.metodoPrevisto ||
        pedido.pago?.metodo ||
        ""
    );
}


function calcularVentasPorMetodo(
    ventas,
    metodo
) {

    return ventas
        .filter(pedido =>
            obtenerMetodoPagoVenta(
                pedido
            ) === metodo
        )
        .reduce(
            (total, pedido) =>
                total +
                Number(pedido.total || 0),
            0
        );
}


function contarVentasPorMetodo(
    ventas,
    metodo
) {

    return ventas.filter(
        pedido =>
            obtenerMetodoPagoVenta(
                pedido
            ) === metodo
    ).length;
}


function obtenerNombreClienteVenta(
    pedido
) {

    const nombre =
        pedido.cliente?.nombre || "";

    const apellido =
        pedido.cliente?.apellido || "";

    const completo =
        `${nombre} ${apellido}`.trim();

    return completo || "Sin nombre";
}


function formatearCanalVenta(tipo) {

    const canales = {
        delivery: "Delivery",
        retiro: "Retiro",
        local: "Local"
    };

    return canales[tipo] || tipo || "-";
}


function formatearMetodoVenta(metodo) {

    const metodos = {
        efectivo: "Efectivo",
        debito: "Débito",
        credito: "Crédito",
        transferencia: "Transferencia"
    };

    return metodos[metodo] ||
        metodo ||
        "-";
}


function formatearDineroVentas(valor) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(
        Number(valor || 0)
    );
}


function formatearFechaVenta(fecha) {

    if (!fecha) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(
        new Date(fecha)
    );
}
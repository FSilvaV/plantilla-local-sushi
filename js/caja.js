function renderCaja() {

    const caja = ScartData.caja;


    if (
        !caja ||
        caja.estado !== "abierta"
    ) {

        return renderCajaCerrada();
    }


    return renderCajaAbierta(caja);
}


function renderCajaCerrada() {

    return `
        <section class="caja-page">

            <div class="caja-header">

                <div>
                    <span class="caja-label">
                        Control de efectivo
                    </span>

                    <h1>Caja</h1>

                    <p>
                        Apertura, movimientos y cierre de caja.
                    </p>
                </div>

            </div>


            <div class="caja-estado-vacio">

                <div class="caja-estado-icono">
                    $
                </div>

                <h2>
                    Caja cerrada
                </h2>

                <p>
                    Inicia una nueva jornada registrando
                    el efectivo disponible al momento
                    de la apertura.
                </p>

                <button
                    class="btn-primary"
                    onclick="abrirCaja()"
                >
                    Abrir caja
                </button>

            </div>

        </section>
    `;
}

function obtenerVentasEfectivoCaja(caja) {

    if (!caja?.fechaApertura) {
        return [];
    }

    const fechaApertura =
        new Date(caja.fechaApertura).getTime();

    return (ScartData.pedidos || [])
        .filter(pedido => {

            const metodo =
                pedido.pago?.metodoFinal ||
                pedido.pago?.metodoPrevisto ||
                pedido.pago?.metodo ||
                "";

            const pagado =
                pedido.pago?.estado === "pagado";

            const fechaPago =
                pedido.pago?.fechaPago;

            const anulado =
                pedido.estado === "anulado" ||
                pedido.estado === "cancelado";

            if (
                !pagado ||
                metodo !== "efectivo" ||
                !fechaPago ||
                anulado
            ) {
                return false;
            }

            return (
                new Date(fechaPago).getTime() >=
                fechaApertura
            );
        })
        .sort((a, b) =>
            new Date(a.pago.fechaPago) -
            new Date(b.pago.fechaPago)
        );
}


function calcularVentasEfectivoCaja(caja) {

    return obtenerVentasEfectivoCaja(caja)
        .reduce(
            (total, pedido) =>
                total +
                Number(pedido.total || 0),
            0
        );
}


function calcularOtrosMovimientosCaja(caja) {

    return (caja.movimientos || [])
        .filter(movimiento =>
            movimiento.tipo !== "apertura"
        )
        .reduce(
            (total, movimiento) =>
                total +
                Number(movimiento.monto || 0),
            0
        );
}

function renderCajaAbierta(caja) {

    const ventasEfectivo =
        obtenerVentasEfectivoCaja(caja);

    const totalVentasEfectivo =
        calcularVentasEfectivoCaja(caja);

    const otrosMovimientos =
        calcularOtrosMovimientosCaja(caja);

    const efectivoEsperado =
        Number(caja.montoInicial || 0) +
        totalVentasEfectivo +
        otrosMovimientos;


    const movimientosManuales =
        (caja.movimientos || [])
            .map(movimiento => `
                <div class="caja-movimiento">

                    <div>
                        <strong>
                            ${movimiento.descripcion}
                        </strong>

                        <span>
                            ${formatearFechaCaja(
                                movimiento.fecha
                            )}
                        </span>
                    </div>

                    <strong>
                        ${formatearDineroCaja(
                            movimiento.monto
                        )}
                    </strong>

                </div>
            `)
            .join("");


    const movimientosVentas =
        ventasEfectivo
            .map(pedido => `
                <div class="caja-movimiento">

                    <div>

                        <strong>
                            Venta ${pedido.numero}
                        </strong>

                        <span>
                            ${formatearFechaCaja(
                                pedido.pago.fechaPago
                            )}
                            · Efectivo
                        </span>

                    </div>

                    <strong>
                        +${formatearDineroCaja(
                            pedido.total
                        )}
                    </strong>

                </div>
            `)
            .join("");


    return `
        <section class="caja-page">

            <div class="caja-header">

                <div>
                    <span class="caja-label">
                        Control de efectivo
                    </span>

                    <h1>Caja</h1>

                    <p>
                        Apertura, movimientos y cierre de caja.
                    </p>
                </div>


                <div class="caja-estado-abierta">
                    <span></span>
                    Caja abierta
                </div>

            </div>


            <div class="caja-resumen">

                <article class="caja-resumen-card">

                    <span>
                        Monto inicial
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            caja.montoInicial
                        )}
                    </strong>

                    <small>
                        Fondo de apertura
                    </small>

                </article>


                <article class="caja-resumen-card">

                    <span>
                        Ventas en efectivo
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            totalVentasEfectivo
                        )}
                    </strong>

                    <small>
                        ${ventasEfectivo.length}
                        ${
                            ventasEfectivo.length === 1
                                ? "venta"
                                : "ventas"
                        }
                    </small>

                </article>


                <article class="caja-resumen-card">

                    <span>
                        Otros movimientos
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            otrosMovimientos
                        )}
                    </strong>

                    <small>
                        Entradas y retiros
                    </small>

                </article>


                <article class="caja-resumen-card destacado">

                    <span>
                        Efectivo esperado
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            efectivoEsperado
                        )}
                    </strong>

                    <small>
                        Disponible en caja
                    </small>

                </article>

            </div>


            <div class="caja-panel">

                <div class="caja-panel-header">

                    <div>

                        <h2>
                            Movimientos de caja
                        </h2>

                        <p>
                            Apertura y movimientos
                            registrados durante la jornada.
                        </p>

                    </div>

                </div>


                <div class="caja-movimientos">

                    ${movimientosManuales}

                    ${movimientosVentas}

                </div>

            </div>

        </section>
    `;
}


function abrirCaja() {

    cerrarModalAperturaCaja();

    const modal = document.createElement("div");

    modal.id = "caja-apertura-modal";
    modal.className = "pedido-modal-overlay";

    modal.innerHTML = `
        <div class="pedido-modal caja-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Caja
                    </span>

                    <h2>
                        Apertura de caja
                    </h2>

                    <p>
                        Registra el efectivo disponible
                        al comenzar la jornada.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarModalAperturaCaja()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="caja-apertura-info">

                    <div>
                        <span>Fecha</span>
                        <strong>
                            ${formatearFechaCaja(new Date())}
                        </strong>
                    </div>

                    <div>
                        <span>Responsable</span>
                        <strong>
                            Administrador
                        </strong>
                    </div>

                </div>


                <label class="caja-campo">

                    <span>
                        Monto inicial en efectivo
                    </span>

                    <div class="caja-input-dinero">

                        <span>$</span>

                        <input
                            id="caja-monto-inicial"
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="50000"
                            autofocus
                        >

                    </div>

                    <small>
                        Dinero físico disponible en caja
                        antes de comenzar las ventas.
                    </small>

                </label>


                <label class="caja-campo">

                    <span>
                        Observación
                    </span>

                    <textarea
                        id="caja-apertura-observacion"
                        rows="3"
                        placeholder="Observación opcional..."
                    ></textarea>

                </label>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarModalAperturaCaja()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="confirmarAperturaCaja()"
                >
                    Abrir caja
                </button>

            </div>

        </div>
    `;


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                cerrarModalAperturaCaja();
            }

        }
    );


    document.body.appendChild(modal);
}

function confirmarAperturaCaja() {

    const montoInicial = Number(
        document.getElementById(
            "caja-monto-inicial"
        )?.value
    );

    const observacion =
        document.getElementById(
            "caja-apertura-observacion"
        )?.value.trim() || "";


    if (
        Number.isNaN(montoInicial) ||
        montoInicial < 0
    ) {

        mostrarToast(
            "Ingresa un monto inicial válido."
        );

        return;
    }


    ScartData.caja = {

        estado: "abierta",

        fechaApertura:
            new Date().toISOString(),

        montoInicial:
            montoInicial,

        responsable:
            "Administrador",

        observacionApertura:
            observacion,

        movimientos: [
            {
                id: Date.now(),

                tipo: "apertura",

                descripcion:
                    "Monto inicial de caja",

                monto:
                    montoInicial,

                fecha:
                    new Date().toISOString()
            }
        ],

        fechaCierre: null,

        montoContado: null,

        diferencia: null
    };


    cerrarModalAperturaCaja();

    mostrarToast(
        "Caja abierta correctamente."
    );

    refrescarCaja();
}


function cerrarModalAperturaCaja() {

    document.getElementById(
        "caja-apertura-modal"
    )?.remove();
}


function refrescarCaja() {

    const appContent =
        document.getElementById(
            "app-content"
        );

    if (!appContent) {
        return;
    }

    appContent.innerHTML =
        renderCaja();
}


function formatearFechaCaja(fecha) {

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


function formatearDineroCaja(valor) {

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
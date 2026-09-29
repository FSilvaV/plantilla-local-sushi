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

    const historial =
        ScartData.historialCajas || [];

    const ultimaCaja =
        historial[0] || null;


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

                <button
                    class="btn-primary"
                    onclick="abrirCaja()"
                >
                    Abrir caja
                </button>

            </div>


            ${
                ultimaCaja
                    ? renderUltimoCierreCaja(ultimaCaja)
                    : `
                        <div class="caja-estado-vacio">

                            <div class="caja-estado-icono">
                                $
                            </div>

                            <h2>Caja cerrada</h2>

                            <p>
                                No hay jornadas de caja
                                registradas todavía.
                            </p>

                        </div>
                    `
            }

        </section>
    `;
}


function renderUltimoCierreCaja(caja) {

    const movimientos =
        caja.movimientos || [];


    const movimientosHTML =
        movimientos.length
            ? movimientos
                .map(movimiento => {

                    const esRetiro =
                        movimiento.tipo === "retiro";

                    const esEntrada =
                        movimiento.tipo === "entrada";

                    let tipoTexto = "Apertura";

                    if (esEntrada) {
                        tipoTexto = "Entrada";
                    }

                    if (esRetiro) {
                        tipoTexto = "Retiro";
                    }


                    return `
                        <div class="caja-movimiento">

                            <div class="caja-movimiento-info">

                                <div class="caja-movimiento-titulo">

                                    <strong>
                                        ${movimiento.descripcion}
                                    </strong>

                                    <span class="
                                        caja-movimiento-tipo
                                        ${esEntrada ? "entrada" : ""}
                                        ${esRetiro ? "retiro" : ""}
                                    ">
                                        ${tipoTexto}
                                    </span>

                                </div>


                                ${
                                    movimiento.observacion
                                        ? `
                                            <p class="caja-movimiento-detalle">
                                                Nota:
                                                ${movimiento.observacion}
                                            </p>
                                        `
                                        : ""
                                }


                                <span class="caja-movimiento-fecha">

                                    ${formatearFechaCaja(
                                        movimiento.fecha
                                    )}

                                </span>

                            </div>


                            <strong class="
                                caja-movimiento-monto
                                ${esRetiro ? "retiro" : ""}
                            ">

                                ${
                                    esEntrada
                                        ? "+"
                                        : ""
                                }

                                ${formatearDineroCaja(
                                    movimiento.monto
                                )}

                            </strong>

                        </div>
                    `;
                })
                .join("")

            : `
                <p>
                    No existen movimientos registrados.
                </p>
            `;


    return `
        <div class="caja-ultimo-cierre">

            <div class="caja-estado-abierta">
                Caja cerrada
            </div>


            <div class="caja-resumen">

                <article class="caja-resumen-card">

                    <span>
                        Efectivo esperado
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            caja.efectivoEsperado
                        )}
                    </strong>

                </article>


                <article class="caja-resumen-card">

                    <span>
                        Efectivo contado
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            caja.montoContado
                        )}
                    </strong>

                </article>


                <article class="caja-resumen-card">

                    <span>
                        Diferencia
                    </span>

                    <strong>
                        ${formatearDineroCaja(
                            caja.diferencia
                        )}
                    </strong>

                </article>

            </div>


            <div class="caja-panel">

                <div class="caja-panel-header">

                    <div>

                        <h2>
                            Último cierre
                        </h2>

                        <p>
                            Apertura:
                            ${formatearFechaCaja(
                                caja.fechaApertura
                            )}

                            · Cierre:
                            ${formatearFechaCaja(
                                caja.fechaCierre
                            )}
                        </p>

                    </div>

                </div>


                <div class="caja-movimientos">

                    ${movimientosHTML}

                </div>


                ${
                    caja.observacionCierre
                        ? `
                            <div class="caja-nota-cierre">

                                <strong>
                                    Observación del cierre
                                </strong>

                                <p>
                                    ${caja.observacionCierre}
                                </p>

                            </div>
                        `
                        : ""
                }

            </div>

        </div>
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
            .map(movimiento => {

                const esRetiro =
                    movimiento.tipo === "retiro";

                const esEntrada =
                    movimiento.tipo === "entrada";

                let tipoTexto = "Apertura";

                if (esEntrada) {
                    tipoTexto = "Entrada";
                }

                if (esRetiro) {
                    tipoTexto = "Retiro";
                }

                return `
                    <div class="caja-movimiento">

                        <div class="caja-movimiento-info">

                            <div class="caja-movimiento-titulo">

                                <strong>
                                    ${movimiento.descripcion}
                                </strong>

                                <span class="
                                    caja-movimiento-tipo
                                    ${esRetiro ? "retiro" : ""}
                                    ${esEntrada ? "entrada" : ""}
                                ">
                                    ${tipoTexto}
                                </span>

                            </div>

                            ${
                                movimiento.observacion
                                    ? `
                                        <p class="caja-movimiento-detalle">
                                            ${movimiento.observacion}
                                        </p>
                                    `
                                    : ""
                            }

                            <span class="caja-movimiento-fecha">
                                ${formatearFechaCaja(
                                    movimiento.fecha
                                )}
                            </span>

                        </div>


                        <strong class="
                            caja-movimiento-monto
                            ${esRetiro ? "retiro" : ""}
                        ">

                            ${
                                esEntrada
                                    ? "+"
                                    : ""
                            }

                            ${formatearDineroCaja(
                                movimiento.monto
                            )}

                        </strong>

                    </div>
                `;
            })
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


            <div class="caja-header-acciones">

                <div class="caja-estado-abierta">
                    <span></span>
                    Caja abierta
                </div>

                <button
                    class="caja-btn-movimiento"
                    onclick="abrirMovimientoCaja()"
                >
                    ＋ Registrar movimiento
                </button>

                <button
                    class="caja-btn-cierre"
                    onclick="abrirCierreCaja()"
                >
                    Cerrar caja
                </button>

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

function abrirMovimientoCaja() {

    cerrarMovimientoCaja();

    const modal = document.createElement("div");

    modal.id = "caja-movimiento-modal";
    modal.className = "pedido-modal-overlay";

    modal.innerHTML = `
        <div class="pedido-modal caja-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Caja
                    </span>

                    <h2>
                        Registrar movimiento
                    </h2>

                    <p>
                        Registra una entrada o retiro
                        manual de efectivo.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarMovimientoCaja()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="inventario-form-grid">

                    <label>

                        <span>Tipo de movimiento</span>

                        <select
                            id="caja-movimiento-tipo"
                            onchange="actualizarMotivosCaja()"
                        >

                            <option value="entrada">
                                Entrada de efectivo
                            </option>

                            <option value="retiro">
                                Retiro de efectivo
                            </option>

                        </select>

                    </label>


                    <label>

                        <span>Monto</span>

                        <div class="caja-input-dinero">

                            <span>$</span>

                            <input
                                id="caja-movimiento-monto"
                                type="number"
                                min="1"
                                step="1000"
                                placeholder="10000"
                            >

                        </div>

                    </label>


                    <label>

                        <span>Motivo</span>

                        <select
                            id="caja-movimiento-motivo"
                        >
                        </select>

                    </label>

                </div>


                <label class="caja-campo">

                    <span>Observación</span>

                    <textarea
                        id="caja-movimiento-observacion"
                        rows="3"
                        placeholder="Información adicional opcional..."
                    ></textarea>

                </label>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarMovimientoCaja()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="guardarMovimientoCaja()"
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
                cerrarMovimientoCaja();
            }

        }
    );


    document.body.appendChild(modal);

    actualizarMotivosCaja();
}


function cerrarMovimientoCaja() {

    document.getElementById(
        "caja-movimiento-modal"
    )?.remove();
}

function actualizarMotivosCaja() {

    const tipo =
        document.getElementById(
            "caja-movimiento-tipo"
        )?.value;

    const motivoSelect =
        document.getElementById(
            "caja-movimiento-motivo"
        );

    if (!motivoSelect) {
        return;
    }


    const motivos = {

        entrada: [
            "Fondo adicional",
            "Devolución de dinero",
            "Corrección de caja",
            "Otro"
        ],

        retiro: [
            "Retiro de efectivo",
            "Pago autorizado",
            "Depósito / resguardo",
            "Corrección de caja",
            "Otro"
        ]

    };


    motivoSelect.innerHTML =
        (motivos[tipo] || [])
            .map(motivo => `
                <option value="${motivo}">
                    ${motivo}
                </option>
            `)
            .join("");
}

function guardarMovimientoCaja() {

    const caja = ScartData.caja;

    if (
        !caja ||
        caja.estado !== "abierta"
    ) {

        mostrarToast(
            "No existe una caja abierta."
        );

        return;
    }


    const tipo =
        document.getElementById(
            "caja-movimiento-tipo"
        ).value;


    const monto =
        Number(
            document.getElementById(
                "caja-movimiento-monto"
            ).value
        );


    const motivo =
        document.getElementById(
            "caja-movimiento-motivo"
        ).value;


    const observacion =
        document.getElementById(
            "caja-movimiento-observacion"
        ).value.trim();


    if (
        Number.isNaN(monto) ||
        monto <= 0
    ) {

        mostrarToast(
            "Ingresa un monto válido."
        );

        return;
    }


    /*
        Las entradas son positivas.
        Los retiros se almacenan negativos.
    */

    const montoMovimiento =
        tipo === "retiro"
            ? -monto
            : monto;


    if (!caja.movimientos) {
        caja.movimientos = [];
    }


    caja.movimientos.push({

        id: Date.now(),

        tipo: tipo,

        descripcion:
            motivo,

        monto:
            montoMovimiento,

        motivo:
            motivo,

        observacion:
            observacion,

        fecha:
            new Date().toISOString()

    });


    cerrarMovimientoCaja();

    mostrarToast(
        tipo === "entrada"
            ? "Entrada registrada correctamente."
            : "Retiro registrado correctamente."
    );

    refrescarCaja();
}

function obtenerResumenCaja(caja) {

    const ventasEfectivo =
        calcularVentasEfectivoCaja(caja);

    const otrosMovimientos =
        calcularOtrosMovimientosCaja(caja);

    const montoInicial =
        Number(caja.montoInicial || 0);

    const efectivoEsperado =
        montoInicial +
        ventasEfectivo +
        otrosMovimientos;

    return {
        montoInicial,
        ventasEfectivo,
        otrosMovimientos,
        efectivoEsperado
    };
}

function abrirCierreCaja() {

    const caja = ScartData.caja;

    if (
        !caja ||
        caja.estado !== "abierta"
    ) {
        mostrarToast("No existe una caja abierta.");
        return;
    }


    cerrarModalCierreCaja();


    const resumen =
        obtenerResumenCaja(caja);


    const modal =
        document.createElement("div");

    modal.id = "caja-cierre-modal";
    modal.className = "pedido-modal-overlay";


    modal.innerHTML = `
        <div class="pedido-modal caja-modal">

            <div class="pedido-modal-header">

                <div>
                    <span class="pedido-modal-label">
                        Caja
                    </span>

                    <h2>Cerrar caja</h2>

                    <p>
                        Revisa el resumen e ingresa
                        el efectivo contado físicamente.
                    </p>
                </div>

                <button
                    class="pedido-modal-cerrar"
                    onclick="cerrarModalCierreCaja()"
                >
                    ×
                </button>

            </div>


            <div class="pedido-modal-body">

                <div class="caja-cierre-resumen">

                    <div>
                        <span>Monto inicial</span>

                        <strong>
                            ${formatearDineroCaja(
                                resumen.montoInicial
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Ventas en efectivo</span>

                        <strong>
                            +${formatearDineroCaja(
                                resumen.ventasEfectivo
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Otros movimientos</span>

                        <strong>
                            ${formatearDineroCaja(
                                resumen.otrosMovimientos
                            )}
                        </strong>
                    </div>


                    <div class="caja-cierre-total">

                        <span>
                            Efectivo esperado
                        </span>

                        <strong>
                            ${formatearDineroCaja(
                                resumen.efectivoEsperado
                            )}
                        </strong>

                    </div>

                </div>


                <label class="caja-campo">

                    <span>
                        Efectivo contado
                    </span>

                    <div class="caja-input-dinero">

                        <span>$</span>

                        <input
                            id="caja-efectivo-contado"
                            type="number"
                            min="0"
                            step="1000"
                            placeholder="0"
                            oninput="actualizarDiferenciaCierre()"
                        >

                    </div>

                </label>


                <div
                    id="caja-diferencia-cierre"
                    class="caja-diferencia-cierre"
                >

                    <span>Diferencia</span>

                    <strong>
                        ${formatearDineroCaja(0)}
                    </strong>

                    <small>
                        Ingresa el efectivo contado.
                    </small>

                </div>


                <label class="caja-campo">

                    <span>
                        Observación de cierre
                    </span>

                    <textarea
                        id="caja-observacion-cierre"
                        rows="3"
                        placeholder="Observación opcional..."
                    ></textarea>

                </label>

            </div>


            <div class="pedido-modal-footer">

                <button
                    class="btn-secondary"
                    onclick="cerrarModalCierreCaja()"
                >
                    Cancelar
                </button>

                <button
                    class="btn-primary"
                    onclick="confirmarCierreCaja()"
                >
                    Confirmar cierre
                </button>

            </div>

        </div>
    `;


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                cerrarModalCierreCaja();
            }

        }
    );


    document.body.appendChild(modal);
}

function cerrarModalCierreCaja() {

    document.getElementById(
        "caja-cierre-modal"
    )?.remove();
}


function actualizarDiferenciaCierre() {

    const caja = ScartData.caja;

    if (!caja) {
        return;
    }


    const input =
        document.getElementById(
            "caja-efectivo-contado"
        );


    const contenedor =
        document.getElementById(
            "caja-diferencia-cierre"
        );


    if (!input || !contenedor) {
        return;
    }


    if (input.value === "") {

        contenedor.innerHTML = `
            <span>Diferencia</span>

            <strong>
                ${formatearDineroCaja(0)}
            </strong>

            <small>
                Ingresa el efectivo contado.
            </small>
        `;

        return;
    }


    const contado =
        Number(input.value);


    const resumen =
        obtenerResumenCaja(caja);


    const diferencia =
        contado -
        resumen.efectivoEsperado;


    let mensaje =
        "Caja cuadrada correctamente.";


    if (diferencia < 0) {

        mensaje =
            `Faltan ${formatearDineroCaja(
                Math.abs(diferencia)
            )}`;

    } else if (diferencia > 0) {

        mensaje =
            `Sobran ${formatearDineroCaja(
                diferencia
            )}`;
    }


    contenedor.innerHTML = `
        <span>Diferencia</span>

        <strong>
            ${diferencia > 0 ? "+" : ""}
            ${formatearDineroCaja(diferencia)}
        </strong>

        <small>
            ${mensaje}
        </small>
    `;
}

function confirmarCierreCaja() {

    const caja = ScartData.caja;

    if (
        !caja ||
        caja.estado !== "abierta"
    ) {
        mostrarToast("No existe una caja abierta.");
        return;
    }


    const inputContado =
        document.getElementById(
            "caja-efectivo-contado"
        );


    if (
        !inputContado ||
        inputContado.value === ""
    ) {
        mostrarToast(
            "Ingresa el efectivo contado."
        );
        return;
    }


    const montoContado =
        Number(inputContado.value);


    if (
        Number.isNaN(montoContado) ||
        montoContado < 0
    ) {
        mostrarToast(
            "Ingresa un monto válido."
        );
        return;
    }


    const observacion =
        document.getElementById(
            "caja-observacion-cierre"
        )?.value.trim() || "";


    const resumen =
        obtenerResumenCaja(caja);


    const diferencia =
        montoContado -
        resumen.efectivoEsperado;


    caja.estado = "cerrada";

    caja.fechaCierre =
        new Date().toISOString();

    caja.montoContado =
        montoContado;

    caja.efectivoEsperado =
        resumen.efectivoEsperado;

    caja.diferencia =
        diferencia;

    caja.observacionCierre =
        observacion;

            if (!ScartData.historialCajas) {
        ScartData.historialCajas = [];
    }

    ScartData.historialCajas.unshift({
        ...caja,
        movimientos: (caja.movimientos || []).map(
            movimiento => ({
                ...movimiento
            })
        )
    });


    cerrarModalCierreCaja();


    mostrarToast(
        diferencia === 0
            ? "Caja cerrada correctamente."
            : "Caja cerrada con diferencia."
    );


    refrescarCaja();
}
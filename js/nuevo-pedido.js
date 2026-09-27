/* =========================================================
   NUEVO PEDIDO
========================================================= */

let nuevoPedido = crearPedidoVacio();

let pasoNuevoPedido = 1;
let categoriaPedido = "Todos";
let busquedaPedido = "";


/* =========================================================
   PEDIDO VACÍO
========================================================= */

function crearPedidoVacio() {

    return {
        productos: [],

        cliente: {
            nombre: "",
            apellido: "",
            telefono: "",
            tipo: "delivery",
            direccion: "",
            referencia: "",
            mesaId: "",
            esperaMesa: false
        },

        pago: {
            metodo: "",
            estado: "pendiente",
            momento: "",
            montoPago: 0,
            codigo: "",
            transferenciaConfirmada: false
        },

        observaciones: ""
    };
}


/* =========================================================
   RENDER GENERAL
========================================================= */

function renderNuevoPedido() {

    return `

        <div class="order-wizard">

            ${renderPasosPedido()}

            <div class="order-layout">

                <div class="order-main">

                    ${renderPasoActualPedido()}

                </div>

                <aside class="order-summary">

                    ${renderResumenPedido()}

                </aside>

            </div>

        </div>

    `;
}


/* =========================================================
   INDICADOR DE PASOS
========================================================= */

function renderPasosPedido() {

    const pasos = [
        ["1", "Productos"],
        ["2", "Cliente / Entrega"],
        ["3", "Pago"],
        ["4", "Confirmación"]
    ];

    return `

        <div class="wizard-steps">

            ${pasos.map((paso, index) => {

                const numero = index + 1;

                let estado = "";

                if (numero === pasoNuevoPedido) {
                    estado = "active";
                }

                if (numero < pasoNuevoPedido) {
                    estado = "completed";
                }

                return `

                    <div class="wizard-step ${estado}">

                        <div class="step-number">
                            ${
                                numero < pasoNuevoPedido
                                    ? "✓"
                                    : paso[0]
                            }
                        </div>

                        <span>
                            ${paso[1]}
                        </span>

                    </div>

                `;

            }).join("")}

        </div>

    `;
}


/* =========================================================
   PASO ACTUAL
========================================================= */

function renderPasoActualPedido() {

    switch (pasoNuevoPedido) {

        case 1:
            return renderPasoProductos();

        case 2:
            return renderPasoCliente();

        case 3:
            return renderPasoPago();

        case 4:
            return renderPasoConfirmacion();

        default:
            return "";
    }
}


/* =========================================================
   PASO 1 - PRODUCTOS
========================================================= */

function renderPasoProductos() {

    const categorias = [
        "Todos",
        ...new Set(
            ScartData.productos.map(
                producto => producto.categoria
            )
        )
    ];

    const productos =
        ScartData.productos.filter(producto => {

            if (!producto.activo) {
                return false;
            }

            const categoriaOK =
                categoriaPedido === "Todos" ||
                producto.categoria === categoriaPedido;

            const texto =
                (
                    producto.nombre +
                    " " +
                    producto.categoria +
                    " " +
                    (producto.descripcion || "")
                ).toLowerCase();

            const busquedaOK =
                texto.includes(
                    busquedaPedido.toLowerCase()
                );

            return categoriaOK && busquedaOK;
        });

    return `

        <div class="order-panel">

            <div class="order-panel-header">

                <div>
                    <h3>Seleccionar productos</h3>

                    <p>
                        Agrega los productos solicitados
                        por el cliente.
                    </p>
                </div>

            </div>


            <div class="order-search">

                <span>⌕</span>

                <input
                    id="order-product-search"
                    type="text"
                    placeholder="Buscar plato o producto..."
                    value="${busquedaPedido}"
                    oninput="buscarProductoPedido(this.value)"
                >

            </div>


            <div class="order-categories">

                ${categorias.map(categoria => `

                    <button
                        class="
                            order-category
                            ${
                                categoriaPedido === categoria
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            cambiarCategoriaPedido(
                                '${categoria}'
                            )
                        "
                    >
                        ${categoria}
                    </button>

                `).join("")}

            </div>


            <div class="order-products-grid">

                ${
                    productos.length

                    ? productos.map(producto => `

                        <article class="order-product">

                            <div class="order-product-image">

                                ${
                                    producto.imagen

                                    ? `
                                        <img
                                            src="${producto.imagen}"
                                            alt="${producto.nombre}"
                                        >
                                    `

                                    : `
                                        <span>🍣</span>
                                    `
                                }

                            </div>


                            <div class="order-product-info">

                                <small>
                                    ${producto.categoria}
                                </small>

                                <h4>
                                    ${producto.nombre}
                                </h4>

                                <p>
                                    ${
                                        producto.descripcion ||
                                        "Sin descripción"
                                    }
                                </p>

                                <div class="order-product-footer">

                                    <strong>
                                        ${formatearDinero(
                                            producto.precio
                                        )}
                                    </strong>

                                    <button
                                        onclick="
                                            agregarProductoPedido(
                                                ${producto.id}
                                            )
                                        "
                                    >
                                        ＋
                                    </button>

                                </div>

                            </div>

                        </article>

                    `).join("")

                    : `

                        <div class="order-empty">

                            <span>🍣</span>

                            <strong>
                                Sin resultados
                            </strong>

                            <p>
                                No hay productos disponibles
                                con este filtro.
                            </p>

                        </div>

                    `
                }

            </div>


            <div class="wizard-actions right">

                <button
                    class="btn btn-primary"
                    onclick="irPasoPedido(2)"
                    ${nuevoPedido.productos.length ? "" : "disabled"}
                >
                    Siguiente →
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   PASO 2 - CLIENTE / ENTREGA
========================================================= */

function renderPasoCliente() {

    const cliente = nuevoPedido.cliente;

    const mesasDisponibles =
        ScartData.mesas.filter(
            mesa => mesa.estado === "disponible"
        );

    return `

        <div class="order-panel">

            <div class="order-panel-header">

                <div>
                    <h3>Cliente y tipo de pedido</h3>

                    <p>
                        Define cómo será entregado
                        este pedido.
                    </p>
                </div>

            </div>


            <div class="order-type-selector">

                ${crearTipoPedido(
                    "delivery",
                    "🛵",
                    "Delivery"
                )}

                ${crearTipoPedido(
                    "retiro",
                    "🛍",
                    "Retiro"
                )}

                ${crearTipoPedido(
                    "local",
                    "🍽",
                    "Servicio Local"
                )}

            </div>


            <div class="form-section">

                <h4>Datos del cliente</h4>

                <div class="form-row">

                    <div class="form-group">

                        <label>Nombre</label>

                        <input
                            type="text"
                            value="${cliente.nombre}"
                            oninput="
                                actualizarCliente(
                                    'nombre',
                                    this.value
                                )
                            "
                            placeholder="Nombre"
                        >

                    </div>


                    <div class="form-group">

                        <label>Apellido</label>

                        <input
                            type="text"
                            value="${cliente.apellido}"
                            oninput="
                                actualizarCliente(
                                    'apellido',
                                    this.value
                                )
                            "
                            placeholder="Apellido"
                        >

                    </div>

                </div>


                <div class="form-group">

                    <label>Teléfono</label>

                    <input
                        type="text"
                        value="${cliente.telefono}"
                        oninput="
                            actualizarCliente(
                                'telefono',
                                this.value
                            )
                        "
                        placeholder="+56 9..."
                    >

                </div>

            </div>


            ${renderDatosTipoPedido(
                cliente,
                mesasDisponibles
            )}


            <div class="form-section">

                <h4>Observaciones</h4>

                <div class="form-group">

                    <textarea
                        rows="3"
                        placeholder="
Ej: sin sésamo, poco arroz,
sin cebollín...
                        "
                        oninput="
                            actualizarObservacionesPedido(
                                this.value
                            )
                        "
                    >${nuevoPedido.observaciones}</textarea>

                </div>

            </div>


            <div class="wizard-actions">

                <button
                    class="btn btn-secondary"
                    onclick="irPasoPedido(1)"
                >
                    ← Volver
                </button>

                <button
                    class="btn btn-primary"
                    onclick="irPasoPedido(3)"
                >
                    Siguiente →
                </button>

            </div>

        </div>

    `;
}


/* =========================================================
   TIPO PEDIDO
========================================================= */

function crearTipoPedido(
    tipo,
    icono,
    nombre
) {

    const activo =
        nuevoPedido.cliente.tipo === tipo;

    return `

        <button
            class="
                order-type-card
                ${activo ? "active" : ""}
            "
            onclick="
                cambiarTipoPedido('${tipo}')
            "
        >

            <span>
                ${icono}
            </span>

            <strong>
                ${nombre}
            </strong>

        </button>

    `;
}


/* =========================================================
   DATOS SEGÚN TIPO
========================================================= */

function renderDatosTipoPedido(
    cliente,
    mesasDisponibles
) {

    if (cliente.tipo === "delivery") {

        return `

            <div class="form-section">

                <h4>Datos de entrega</h4>

                <div class="form-group">

                    <label>Dirección</label>

                    <input
                        type="text"
                        value="${cliente.direccion}"
                        oninput="
                            actualizarCliente(
                                'direccion',
                                this.value
                            )
                        "
                        placeholder="
Ej: Av. Principal 123
                        "
                    >

                </div>


                <div class="form-group">

                    <label>
                        Referencia
                    </label>

                    <input
                        type="text"
                        value="${cliente.referencia}"
                        oninput="
                            actualizarCliente(
                                'referencia',
                                this.value
                            )
                        "
                        placeholder="
Ej: Casa esquina, portón negro
                        "
                    >

                </div>

            </div>

        `;
    }


    if (cliente.tipo === "local") {

        return `

            <div class="form-section">

                <h4>
                    Asignación de mesa
                </h4>


                <label class="waiting-table">

                    <input
                        type="checkbox"
                        ${
                            cliente.esperaMesa
                                ? "checked"
                                : ""
                        }
                        onchange="
                            cambiarEsperaMesa(
                                this.checked
                            )
                        "
                    >

                    <span>
                        Cliente en espera de mesa
                    </span>

                </label>


                ${
                    !cliente.esperaMesa

                    ? `

                        <div class="table-selector">

                            ${
                                mesasDisponibles.length

                                ? mesasDisponibles.map(
                                    mesa => `

                                        <button
                                            class="
                                                table-select-card
                                                ${
                                                    Number(
                                                        cliente.mesaId
                                                    ) === mesa.id
                                                        ? "active"
                                                        : ""
                                                }
                                            "
                                            onclick="
                                                seleccionarMesaPedido(
                                                    ${mesa.id}
                                                )
                                            "
                                        >
                                            ${mesa.nombre}
                                        </button>

                                    `
                                ).join("")

                                : `

                                    <div class="order-warning">
                                        No hay mesas disponibles.
                                    </div>

                                `
                            }

                        </div>

                    `

                    : `

                        <div class="order-info">
                            El pedido continuará sin mesa
                            asignada. Podrá asignarse una
                            posteriormente.
                        </div>

                    `
                }

            </div>

        `;
    }


    return `

        <div class="order-info">

            El pedido será retirado por el cliente
            en el local.

        </div>

    `;
}


/* =========================================================
   PASO 3 - PAGO
========================================================= */

function renderPasoPago() {

    const pago = nuevoPedido.pago;
    const tipo = nuevoPedido.cliente.tipo;
    const total = calcularTotalPedido();

    const montoPago =
        Number(pago.montoPago) || 0;

    const vuelto =
        Math.max(
            montoPago - total,
            0
        );


    /* =====================================================
       MÉTODOS DISPONIBLES SEGÚN TIPO DE PEDIDO
    ===================================================== */

    let metodosDisponibles = [];

    if (tipo === "delivery") {

        metodosDisponibles = [
            ["transferencia", "↔", "Transferencia"],
            ["efectivo", "💵", "Efectivo"]
        ];

    } else {

        metodosDisponibles = [
            ["transferencia", "↔", "Transferencia"],
            ["debito", "💳", "Débito"],
            ["credito", "💳", "Crédito"],
            ["efectivo", "💵", "Efectivo"]
        ];
    }


    return `

        <div class="order-panel">

            <div class="order-panel-header">

                <div>

                    <h3>Método de pago</h3>

                    <p>
                        ${
                            tipo === "delivery"
                                ? "Define cómo pagará el cliente al realizar el Delivery."
                                : tipo === "retiro"
                                    ? "El cliente puede pagar anticipadamente o al retirar."
                                    : "El pago puede registrarse ahora o quedar pendiente durante el servicio."
                        }
                    </p>

                </div>

            </div>


            <div class="
                payment-methods
                ${tipo === "delivery" ? "two-methods" : ""}
            ">

                ${metodosDisponibles.map(
                    metodo => crearMetodoPago(
                        metodo[0],
                        metodo[1],
                        metodo[2]
                    )
                ).join("")}

            </div>


            ${
                !pago.metodo

                ? `

                    <div class="payment-help">

                        <span>💳</span>

                        <div>

                            <strong>
                                Selecciona un método de pago
                            </strong>

                            <p>
                                Las opciones disponibles dependen
                                del tipo de pedido.
                            </p>

                        </div>

                    </div>

                `

                : renderDetallePago(
                    tipo,
                    pago,
                    total,
                    montoPago,
                    vuelto
                )
            }


            <div class="wizard-actions">

                <button
                    class="btn btn-secondary"
                    onclick="irPasoPedido(2)"
                >
                    ← Volver
                </button>

                <button
                    class="btn btn-primary"
                    onclick="validarPasoPago()"
                    ${pago.metodo ? "" : "disabled"}
                >
                    Revisar pedido →
                </button>

            </div>

        </div>

    `;
}

function renderDetallePago(
    tipo,
    pago,
    total,
    montoPago,
    vuelto
) {

    /* =====================================================
       TRANSFERENCIA
    ===================================================== */

    if (pago.metodo === "transferencia") {

        return `

            <div class="payment-detail">

                <div class="payment-detail-title">

                    <span>↔</span>

                    <div>

                        <strong>
                            Pago por transferencia
                        </strong>

                        <p>
                            ${
                                tipo === "delivery"
                                    ? "Para Delivery la transferencia debe estar confirmada antes de gestionar el pedido."
                                    : "Registra si la transferencia ya fue recibida."
                            }
                        </p>

                    </div>

                </div>


                <div class="form-group">

                    <label>
                        Código / referencia
                        <span class="optional">
                            Opcional
                        </span>
                    </label>

                    <input
                        type="text"
                        value="${pago.codigo}"
                        oninput="
                            actualizarPagoSinRender(
                                'codigo',
                                this.value
                            )
                        "
                        placeholder="Ej: TRX-984521"
                    >

                </div>


                <label class="payment-confirm-check">

                    <input
                        type="checkbox"
                        ${pago.transferenciaConfirmada ? "checked" : ""}
                        onchange="
                            confirmarTransferencia(
                                this.checked
                            )
                        "
                    >

                    <span>

                        <strong>
                            Transferencia recibida y confirmada
                        </strong>

                        <small>
                            Verifiqué que el pago fue recibido.
                        </small>

                    </span>

                </label>


                ${
                    tipo === "delivery" &&
                    !pago.transferenciaConfirmada

                    ? `

                        <div class="payment-alert warning">

                            <span>⚠️</span>

                            <div>

                                <strong>
                                    Pago aún no confirmado
                                </strong>

                                <p>
                                    El pedido Delivery no podrá
                                    confirmarse hasta verificar
                                    la transferencia.
                                </p>

                            </div>

                        </div>

                    `

                    : ""
                }


                ${
                    pago.transferenciaConfirmada

                    ? `

                        <div class="payment-ticket paid">

                            <div class="payment-ticket-icon">
                                ✓
                            </div>

                            <div>

                                <span>
                                    ESTADO DEL PAGO
                                </span>

                                <strong>
                                    Transferencia pagada
                                </strong>

                                <small>
                                    Pago confirmado por
                                    ${formatearDinero(total)}
                                </small>

                            </div>

                        </div>

                    `

                    : ""
                }

            </div>

        `;
    }


    /* =====================================================
       EFECTIVO
    ===================================================== */

    if (pago.metodo === "efectivo") {

        const esDelivery =
            tipo === "delivery";

        return `

            <div class="payment-detail">

                <div class="payment-detail-title">

                    <span>💵</span>

                    <div>

                        <strong>
                            ${
                                esDelivery
                                    ? "Cobro en Delivery"
                                    : "Pago en efectivo"
                            }
                        </strong>

                        <p>
                            ${
                                esDelivery
                                    ? "Indica con cuánto pagará el cliente para preparar el vuelto."
                                    : "El pago puede realizarse ahora o quedar pendiente."
                            }
                        </p>

                    </div>

                </div>


                <div class="payment-amount-box">

                    <div>

                        <span>
                            Total del pedido
                        </span>

                        <strong>
                            ${formatearDinero(total)}
                        </strong>

                    </div>

                </div>


                <div class="form-group">

                    <label>
                        ${
                            esDelivery
                                ? "Cliente pagará con"
                                : "Monto recibido"
                        }
                    </label>

                    <input
                        id="cash-payment-input"
                        type="number"
                        min="0"
                        step="1"
                        value="${
                            pago.montoPago || ""
                        }"
                        oninput="
                            actualizarMontoEfectivo(
                                this.value
                            )
                        "
                        placeholder="Ej: 50000"
                    >

                </div>


                <div class="cash-change">

                    <span>
                        ${
                            esDelivery
                                ? "Vuelto que debe llevar el repartidor"
                                : "Vuelto"
                        }
                    </span>

                    <strong id="cash-change-value">
                        ${formatearDinero(vuelto)}
                    </strong>

                </div>


                ${
                    esDelivery

                    ? `

                        <div class="payment-ticket delivery">

                            <div class="payment-ticket-icon">
                                💵
                            </div>

                            <div>

                                <span>
                                    COBRO EN DELIVERY
                                </span>

                                <strong>
                                    ${
                                        montoPago > 0
                                            ? `Cliente pagará con ${formatearDinero(montoPago)}`
                                            : "Monto de pago no indicado"
                                    }
                                </strong>

                                <small id="delivery-change-text">

                                    ${
                                        montoPago >= total

                                        ? `Llevar ${formatearDinero(vuelto)} de vuelto`

                                        : "Indicar monto para calcular vuelto"
                                    }

                                </small>

                            </div>

                        </div>

                    `

                    : renderMomentoPago(
                        tipo,
                        pago
                    )
                }

            </div>

        `;
    }


    /* =====================================================
       DÉBITO / CRÉDITO
    ===================================================== */

    if (
        pago.metodo === "debito" ||
        pago.metodo === "credito"
    ) {

        return `

            <div class="payment-detail">

                <div class="payment-detail-title">

                    <span>💳</span>

                    <div>

                        <strong>
                            ${
                                pago.metodo === "debito"
                                    ? "Pago con débito"
                                    : "Pago con crédito"
                            }
                        </strong>

                        <p>
                            ${
                                tipo === "retiro"
                                    ? "El pago puede realizarse ahora o cuando el cliente retire."
                                    : "Indica si el pago ya fue realizado o queda pendiente."
                            }
                        </p>

                    </div>

                </div>


                ${renderMomentoPago(
                    tipo,
                    pago
                )}

            </div>

        `;
    }


    return "";
}

function renderMomentoPago(
    tipo,
    pago
) {

    const textoPendiente =
        tipo === "retiro"
            ? "Pagará al retirar"
            : "Pago pendiente";

    return `

        <div class="payment-moment">

            <span class="payment-section-label">
                Estado actual
            </span>


            <div class="payment-status-options">

                <button
                    type="button"
                    class="
                        payment-status-card
                        ${
                            pago.estado === "pagado"
                                ? "active paid"
                                : ""
                        }
                    "
                    onclick="
                        cambiarEstadoPago('pagado')
                    "
                >

                    <span>✓</span>

                    <div>

                        <strong>
                            Pagado
                        </strong>

                        <small>
                            El pago ya fue realizado
                        </small>

                    </div>

                </button>


                <button
                    type="button"
                    class="
                        payment-status-card
                        ${
                            pago.estado === "pendiente"
                                ? "active pending"
                                : ""
                        }
                    "
                    onclick="
                        cambiarEstadoPago('pendiente')
                    "
                >

                    <span>◷</span>

                    <div>

                        <strong>
                            ${textoPendiente}
                        </strong>

                        <small>
                            Se cobrará posteriormente
                        </small>

                    </div>

                </button>

            </div>

        </div>

    `;
}

/* =========================================================
   MÉTODO DE PAGO
========================================================= */

function crearMetodoPago(
    metodo,
    icono,
    nombre
) {

    const activo =
        nuevoPedido.pago.metodo === metodo;

    return `

        <button
            class="
                payment-method
                ${activo ? "active" : ""}
            "
            onclick="
                cambiarMetodoPago('${metodo}')
            "
        >

            <span>
                ${icono}
            </span>

            <strong>
                ${nombre}
            </strong>

        </button>

    `;
}

function validarPasoPago() {

    const pago =
        nuevoPedido.pago;

    const tipo =
        nuevoPedido.cliente.tipo;


    if (!pago.metodo) {

        mostrarToast(
            "Selecciona un método de pago"
        );

        return;
    }


    /*
       Delivery + transferencia:
       no permitimos avanzar sin confirmar pago.
    */

    if (
        tipo === "delivery" &&
        pago.metodo === "transferencia" &&
        !pago.transferenciaConfirmada
    ) {

        mostrarToast(
            "Confirma la transferencia antes de continuar"
        );

        return;
    }


    /*
       Delivery + efectivo:
       necesitamos saber con cuánto pagará.
    */

    if (
        tipo === "delivery" &&
        pago.metodo === "efectivo"
    ) {

        const monto =
            Number(
                pago.montoPago
            ) || 0;

        const total =
            calcularTotalPedido();

        if (monto < total) {

            mostrarToast(
                "El monto indicado es menor al total del pedido"
            );

            return;
        }
    }


    irPasoPedido(4);
}

/* =========================================================
   PASO 4 - CONFIRMACIÓN
========================================================= */

function renderPasoConfirmacion() {

    const cliente = nuevoPedido.cliente;
    const pago = nuevoPedido.pago;

    let entrega = "";

    if (cliente.tipo === "delivery") {

        entrega =
            cliente.direccion ||
            "Dirección no registrada";

    } else if (
        cliente.tipo === "retiro"
    ) {

        entrega =
            "Retiro en local";

    } else if (
        cliente.esperaMesa
    ) {

        entrega =
            "Servicio local · En espera de mesa";

    } else {

        const mesa =
            ScartData.mesas.find(
                m =>
                    m.id ===
                    Number(cliente.mesaId)
            );

        entrega =
            mesa
                ? `Servicio local · ${mesa.nombre}`
                : "Servicio local · Sin mesa";
    }

    return `

        <div class="order-panel">

            <div class="order-panel-header">

                <div>
                    <h3>Confirmar pedido</h3>

                    <p>
                        Revisa la información antes
                        de registrar el pedido.
                    </p>
                </div>

            </div>


            <div class="confirmation-grid">

                <div class="confirmation-box">

                    <span>Cliente</span>

                    <strong>
                        ${
                            (
                                cliente.nombre +
                                " " +
                                cliente.apellido
                            ).trim() ||
                            "Cliente sin nombre"
                        }
                    </strong>

                    <small>
                        ${
                            cliente.telefono ||
                            "Sin teléfono"
                        }
                    </small>

                </div>


                <div class="confirmation-box">

                    <span>Entrega</span>

                    <strong>
                        ${
                            formatearTipoPedido(
                                cliente.tipo
                            )
                        }
                    </strong>

                    <small>
                        ${entrega}
                    </small>

                </div>


                <div class="confirmation-box">

                    <span>Pago</span>

                    <strong>
                        ${
                            formatearMetodoPago(
                                pago.metodo
                            )
                        }
                    </strong>

                    <small>
                        ${
                            pago.metodo === "efectivo" &&
                            cliente.tipo === "delivery"

                                ? "Cobro en Delivery"

                                : pago.estado === "pagado"
                                    ? "Pagado"
                                    : "Pago pendiente"
                        }
                    </small>

                </div>

            </div>


            <div class="confirmation-products">

                <h4>
                    Productos
                </h4>

                ${
                    cliente.tipo === "delivery" &&
                    pago.metodo === "efectivo"

                    ? `

                        <div class="delivery-payment-summary">

                            <span>💵</span>

                            <div>

                                <strong>
                                    Cobro en Delivery
                                </strong>

                                <p>
                                    Total:
                                    ${formatearDinero(
                                        calcularTotalPedido()
                                    )}
                                    · Cliente pagará con:
                                    ${formatearDinero(
                                        pago.montoPago
                                    )}
                                    · Vuelto:
                                    ${formatearDinero(
                                        Math.max(
                                            pago.montoPago -
                                            calcularTotalPedido(),
                                            0
                                        )
                                    )}
                                </p>

                            </div>

                        </div>

                    `

                    : ""
                }
                
                ${nuevoPedido.productos.map(item => `

                    <div class="confirmation-product">

                        <span>
                            ${item.cantidad} ×
                            ${item.nombre}
                        </span>

                        <strong>
                            ${formatearDinero(
                                item.precio *
                                item.cantidad
                            )}
                        </strong>

                    </div>

                `).join("")}

            </div>


            ${
                nuevoPedido.observaciones

                ? `

                    <div class="confirmation-notes">

                        <span>
                            Observaciones
                        </span>

                        <p>
                            ${nuevoPedido.observaciones}
                        </p>

                    </div>

                `

                : ""
            }


            <div class="confirmation-total">

                <span>Total</span>

                <strong>
                    ${formatearDinero(
                        calcularTotalPedido()
                    )}
                </strong>

            </div>


            <div class="wizard-actions">

                <button
                    class="btn btn-secondary"
                    onclick="irPasoPedido(3)"
                >
                    ← Volver
                </button>


                <div class="confirmation-actions">

                    <button
                        class="btn btn-secondary"
                        onclick="
                            cancelarNuevoPedido()
                        "
                    >
                        Descartar
                    </button>

                    <button
                        class="btn btn-success"
                        onclick="
                            confirmarNuevoPedido()
                        "
                    >
                        ✓ Confirmar pedido
                    </button>

                </div>

            </div>

        </div>

    `;
}


/* =========================================================
   RESUMEN LATERAL
========================================================= */

function renderResumenPedido() {

    const total =
        calcularTotalPedido();

    const cantidad =
        nuevoPedido.productos.reduce(
            (suma, item) =>
                suma + item.cantidad,
            0
        );

    return `

        <div class="summary-header">

            <div>
                <h3>Pedido actual</h3>

                <span>
                    ${cantidad}
                    ${
                        cantidad === 1
                            ? "producto"
                            : "productos"
                    }
                </span>
            </div>

            <span class="draft-badge">
                Borrador
            </span>

        </div>


        <div class="summary-items">

            ${
                nuevoPedido.productos.length

                ? nuevoPedido.productos.map(
                    item => `

                        <div class="summary-item">

                            <div>

                                <strong>
                                    ${item.nombre}
                                </strong>

                                <span>
                                    ${formatearDinero(
                                        item.precio
                                    )}
                                </span>

                            </div>


                            <div class="quantity-control">

                                <button
                                    onclick="
                                        cambiarCantidadPedido(
                                            ${item.id},
                                            -1
                                        )
                                    "
                                >
                                    −
                                </button>

                                <span>
                                    ${item.cantidad}
                                </span>

                                <button
                                    onclick="
                                        cambiarCantidadPedido(
                                            ${item.id},
                                            1
                                        )
                                    "
                                >
                                    +
                                </button>

                            </div>

                        </div>

                    `
                ).join("")

                : `

                    <div class="summary-empty">

                        <span>🛒</span>

                        <p>
                            Aún no agregas productos.
                        </p>

                    </div>

                `
            }

        </div>


        <div class="summary-total">

            <span>Total</span>

            <strong>
                ${formatearDinero(total)}
            </strong>

        </div>

    `;
}


/* =========================================================
   PRODUCTOS
========================================================= */

function agregarProductoPedido(id) {

    const producto =
        ScartData.productos.find(
            p => p.id === id
        );

    if (!producto || !producto.activo) {
        return;
    }

    const existente =
        nuevoPedido.productos.find(
            p => p.id === id
        );

    if (existente) {

        existente.cantidad++;

    } else {

        nuevoPedido.productos.push({

            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1

        });
    }

    mostrarToast(
        `${producto.nombre} agregado`
    );

    refrescarNuevoPedido();
}


function cambiarCantidadPedido(
    id,
    cambio
) {

    const producto =
        nuevoPedido.productos.find(
            p => p.id === id
        );

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {

        nuevoPedido.productos =
            nuevoPedido.productos.filter(
                p => p.id !== id
            );
    }

    refrescarNuevoPedido();
}


function calcularTotalPedido() {

    return nuevoPedido.productos.reduce(
        (total, item) =>
            total +
            item.precio *
            item.cantidad,
        0
    );
}


/* =========================================================
   FILTROS
========================================================= */

function cambiarCategoriaPedido(
    categoria
) {

    categoriaPedido = categoria;

    refrescarNuevoPedido();
}


function buscarProductoPedido(valor) {

    busquedaPedido = valor;

    refrescarNuevoPedido(true);
}


/* =========================================================
   CLIENTE
========================================================= */

function cambiarTipoPedido(tipo) {

    const tipoAnterior =
        nuevoPedido.cliente.tipo;

    nuevoPedido.cliente.tipo =
        tipo;


    if (tipo !== "local") {

        nuevoPedido.cliente.mesaId = "";
        nuevoPedido.cliente.esperaMesa = false;
    }


    /*
       Si cambia el tipo de pedido,
       reiniciamos la configuración de pago
       para evitar combinaciones inválidas.
    */

    if (tipoAnterior !== tipo) {

        nuevoPedido.pago = {
            metodo: "",
            estado: "pendiente",
            momento: "",
            montoPago: 0,
            codigo: "",
            transferenciaConfirmada: false
        };
    }


    refrescarNuevoPedido();
}


function actualizarCliente(
    campo,
    valor
) {

    nuevoPedido.cliente[campo] =
        valor;
}


function actualizarObservacionesPedido(
    valor
) {

    nuevoPedido.observaciones =
        valor;
}


function seleccionarMesaPedido(id) {

    nuevoPedido.cliente.mesaId = id;

    refrescarNuevoPedido();
}


function cambiarEsperaMesa(estado) {

    nuevoPedido.cliente.esperaMesa =
        estado;

    if (estado) {
        nuevoPedido.cliente.mesaId = "";
    }

    refrescarNuevoPedido();
}


/* =========================================================
   PAGO
========================================================= */

function cambiarMetodoPago(metodo) {

    const tipo =
        nuevoPedido.cliente.tipo;


    nuevoPedido.pago.metodo =
        metodo;

    nuevoPedido.pago.montoPago = 0;
    nuevoPedido.pago.codigo = "";
    nuevoPedido.pago.transferenciaConfirmada = false;


    /*
       DELIVERY
       Transferencia debe confirmarse.
       Efectivo se cobra al entregar.
    */

    if (tipo === "delivery") {

        nuevoPedido.pago.estado =
            metodo === "efectivo"
                ? "pendiente"
                : "pendiente";

        nuevoPedido.pago.momento =
            metodo === "efectivo"
                ? "delivery"
                : "anticipado";
    }


    /*
       RETIRO
       Por defecto dejamos el cobro pendiente,
       salvo transferencia que deberá confirmarse.
    */

    else if (tipo === "retiro") {

        nuevoPedido.pago.estado =
            "pendiente";

        nuevoPedido.pago.momento =
            "retiro";
    }


    /*
       SERVICIO LOCAL
       Por defecto el consumo queda pendiente.
    */

    else {

        nuevoPedido.pago.estado =
            "pendiente";

        nuevoPedido.pago.momento =
            "local";
    }


    refrescarNuevoPedido();
}


function actualizarPagoSinRender(
    campo,
    valor
) {

    nuevoPedido.pago[campo] =
        valor;
}


function actualizarMontoEfectivo(valor) {

    const monto =
        Number(valor) || 0;

    nuevoPedido.pago.montoPago =
        monto;


    const total =
        calcularTotalPedido();

    const vuelto =
        Math.max(
            monto - total,
            0
        );


    /*
       Actualizamos solamente el texto.
       NO reconstruimos el formulario.
       Por eso el input conserva el foco.
    */

    const elementoVuelto =
        document.getElementById(
            "cash-change-value"
        );

    if (elementoVuelto) {

        elementoVuelto.textContent =
            formatearDinero(vuelto);
    }


    const ticket =
        document.querySelector(
            ".payment-ticket.delivery strong"
        );

    if (ticket) {

        ticket.textContent =
            monto > 0
                ? `Cliente pagará con ${formatearDinero(monto)}`
                : "Monto de pago no indicado";
    }


    const textoVuelto =
        document.getElementById(
            "delivery-change-text"
        );

    if (textoVuelto) {

        if (monto >= total) {

            textoVuelto.textContent =
                `Llevar ${formatearDinero(vuelto)} de vuelto`;

        } else {

            textoVuelto.textContent =
                "Indicar monto para calcular vuelto";
        }
    }
}


function confirmarTransferencia(
    confirmado
) {

    nuevoPedido.pago.transferenciaConfirmada =
        confirmado;

    nuevoPedido.pago.estado =
        confirmado
            ? "pagado"
            : "pendiente";

    refrescarNuevoPedido();
}


function cambiarEstadoPago(
    estado
) {

    nuevoPedido.pago.estado =
        estado;

    refrescarNuevoPedido();
}


/* =========================================================
   PASOS
========================================================= */

function irPasoPedido(paso) {

    if (
        paso > 1 &&
        nuevoPedido.productos.length === 0
    ) {

        mostrarToast(
            "Agrega al menos un producto"
        );

        return;
    }

    pasoNuevoPedido = paso;

    refrescarNuevoPedido();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   FORMATO
========================================================= */

function formatearTipoPedido(tipo) {

    const tipos = {
        delivery: "Delivery",
        retiro: "Retiro",
        local: "Servicio Local"
    };

    return tipos[tipo] || tipo;
}


function formatearMetodoPago(
    metodo
) {

    const metodos = {
        efectivo: "Efectivo",
        debito: "Débito",
        credito: "Crédito",
        transferencia: "Transferencia"
    };

    return metodos[metodo] || metodo;
}


/* =========================================================
   CANCELAR
========================================================= */

function cancelarNuevoPedido() {

    const confirmar =
        window.confirm(
            "¿Descartar este pedido? Se perderán los datos ingresados."
        );

    if (!confirmar) return;

    nuevoPedido = crearPedidoVacio();

    pasoNuevoPedido = 1;
    categoriaPedido = "Todos";
    busquedaPedido = "";

    mostrarToast(
        "Pedido descartado"
    );

    refrescarNuevoPedido();
}


/* =========================================================
   CONFIRMAR
========================================================= */

function confirmarNuevoPedido() {
    // =========================
    // 1. VALIDACIONES
    // =========================

    if (!nuevoPedido.productos || nuevoPedido.productos.length === 0) {
        mostrarToast("Debes agregar al menos un producto.");
        return;
    }

    const tipoPedido = nuevoPedido.cliente?.tipo || "";

    if (!tipoPedido) {
        mostrarToast("Debes seleccionar el tipo de pedido.");
        return;
    }

    const total = calcularTotalPedido();
    const ahora = new Date().toISOString();


    // =========================
    // 2. GENERAR ID Y NÚMERO
    // =========================

    if (!ScartData.pedidos) {
        ScartData.pedidos = [];
    }

    const nuevoId =
        ScartData.pedidos.length > 0
            ? Math.max(
                ...ScartData.pedidos.map(
                    pedido => Number(pedido.id) || 0
                )
            ) + 1
            : 1;

    const numeroPedido =
        `P-${String(nuevoId).padStart(3, "0")}`;


    // =========================
    // 3. MESA
    // =========================

    let mesaId = null;

    if (
        tipoPedido === "local" &&
        nuevoPedido.cliente.mesaId &&
        !nuevoPedido.cliente.esperaMesa
    ) {
        mesaId = Number(
            nuevoPedido.cliente.mesaId
        );
    }


    // =========================
    // 4. PRODUCTOS
    // =========================

    const productos = nuevoPedido.productos.map(
        item => ({
            id: item.id,
            nombre: item.nombre,
            cantidad: Number(item.cantidad) || 1,
            precio: Number(item.precio) || 0
        })
    );


    // =========================
    // 5. PAGO
    // =========================

    const pagoActual = nuevoPedido.pago || {};

    const metodoPago =
        pagoActual.metodo || "";

    const estadoPago =
        pagoActual.estado === "pagado"
            ? "pagado"
            : "pendiente";

    const montoRecibido =
        Number(pagoActual.montoPago) || 0;

    const vuelto =
        metodoPago === "efectivo"
            ? Math.max(
                0,
                montoRecibido - total
            )
            : 0;

    const pago = {
        metodoPrevisto: metodoPago,

        metodoFinal:
            estadoPago === "pagado"
                ? metodoPago
                : "",

        estado: estadoPago,

        monto: total,

        montoRecibido: montoRecibido,

        vuelto: vuelto,

        codigoTransferencia:
            pagoActual.codigo || "",

        fechaPago:
            estadoPago === "pagado"
                ? ahora
                : null
    };


    // =========================
    // 6. CLIENTE
    // =========================

    const cliente = {
        nombre:
            nuevoPedido.cliente?.nombre || "",

        apellido:
            nuevoPedido.cliente?.apellido || "",

        telefono:
            nuevoPedido.cliente?.telefono || "",

        direccion:
            nuevoPedido.cliente?.direccion || "",

        referencia:
            nuevoPedido.cliente?.referencia || ""
    };


    // =========================
    // 7. CREAR PEDIDO
    // =========================

    const pedido = {
        id: nuevoId,

        numero: numeroPedido,

        tipo: tipoPedido,

        // Futuro:
        // personal | tablet | qr
        origen: "personal",

        cliente: cliente,

        productos: productos,

        subtotal: total,

        // Preparado para futura propina
        propina: 0,

        total: total,

        pago: pago,

        estado: "recibido",

        observaciones:
            nuevoPedido.observaciones || "",

        fechaCreacion: ahora,

        fechaActualizacion: ahora,

        mesaId: mesaId,

        esperaMesa:
            tipoPedido === "local"
                ? Boolean(
                    nuevoPedido.cliente.esperaMesa
                )
                : false,

        historial: [
            {
                tipo: "creacion",
                fecha: ahora,
                detalle:
                    "Pedido creado desde Nuevo Pedido"
            }
        ]
    };


    // =========================
    // 8. GUARDAR PEDIDO
    // =========================

    ScartData.pedidos.push(pedido);


    // =========================
    // 9. OCUPAR MESA
    // =========================

    if (mesaId) {
        const mesa = ScartData.mesas.find(
            mesa =>
                Number(mesa.id) === mesaId
        );

        if (mesa) {
            mesa.estado = "ocupada";

            mesa.pedidoId =
                pedido.id;

            mesa.fechaOcupacion =
                ahora;
        }
    }


    // =========================
    // 10. CONFIRMACIÓN
    // =========================

    console.log(
        "Pedido creado correctamente:",
        pedido
    );

    mostrarToast(
        `${numeroPedido} creado correctamente`
    );


    // =========================
    // 11. LIMPIAR FORMULARIO
    // =========================

    nuevoPedido =
        crearPedidoVacio();

    pasoNuevoPedido = 1;

    categoriaPedido =
        "Todos";

    busquedaPedido =
        "";


    // =========================
    // 12. IR A PEDIDOS
    // =========================

    navegar("pedidos");
}


/* =========================================================
   REFRESCAR
========================================================= */

function refrescarNuevoPedido(
    mantenerFoco = false
) {

    const posicion =
        document.activeElement
            ?.selectionStart;

    appContent.innerHTML =
        renderNuevoPedido();

    if (mantenerFoco) {

        const input =
            document.getElementById(
                "order-product-search"
            );

        if (input) {

            input.focus();

            if (
                posicion !== undefined &&
                posicion !== null
            ) {

                input.setSelectionRange(
                    posicion,
                    posicion
                );
            }
        }
    }
}
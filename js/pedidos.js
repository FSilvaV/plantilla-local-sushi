function renderPedidos() {
    const pedidosActivos = ScartData.pedidos.filter(
        pedido => !["entregado", "anulado"].includes(pedido.estado)
    );

    const delivery = pedidosActivos.filter(p => p.tipo === "delivery");
    const retiro = pedidosActivos.filter(p => p.tipo === "retiro");
    const local = pedidosActivos.filter(p => p.tipo === "local");

    return `
        <div class="pedidos-page">

            <div class="pedidos-header">
                <div>
                    <h2>Pedidos activos</h2>
                    <p>Seguimiento operacional en tiempo real.</p>
                </div>

                <div class="pedidos-resumen">
                    <div class="pedido-resumen-item">
                        <span>Activos</span>
                        <strong>${pedidosActivos.length}</strong>
                    </div>

                    <div class="pedido-resumen-item">
                        <span>Delivery</span>
                        <strong>${delivery.length}</strong>
                    </div>

                    <div class="pedido-resumen-item">
                        <span>Retiro</span>
                        <strong>${retiro.length}</strong>
                    </div>

                    <div class="pedido-resumen-item">
                        <span>Local</span>
                        <strong>${local.length}</strong>
                    </div>
                </div>
            </div>

            <div class="pedidos-board">

                ${renderGrupoPedidos(
                    "Delivery",
                    "Pedidos para despacho",
                    delivery,
                    "delivery"
                )}

                ${renderGrupoPedidos(
                    "Retiro",
                    "Pedidos para retirar en local",
                    retiro,
                    "retiro"
                )}

                ${renderGrupoPedidos(
                    "Servicio Local",
                    "Pedidos asociados a mesas",
                    local,
                    "local"
                )}

            </div>
        </div>
    `;
}


function renderGrupoPedidos(titulo, descripcion, pedidos, tipo) {
    return `
        <section class="pedidos-grupo">

            <div class="pedidos-grupo-header">
                <div>
                    <h3>${titulo}</h3>
                    <p>${descripcion}</p>
                </div>

                <span class="pedidos-grupo-count">
                    ${pedidos.length}
                </span>
            </div>

            <div class="pedidos-lista" data-grupo="${tipo}">
                ${
                    pedidos.length
                        ? pedidos
                            .sort(
                                (a, b) =>
                                    new Date(a.fechaCreacion) -
                                    new Date(b.fechaCreacion)
                            )
                            .map(renderPedidoCard)
                            .join("")
                        : `
                            <div class="pedidos-vacio">
                                No hay pedidos activos.
                            </div>
                        `
                }
            </div>

        </section>
    `;
}


function renderPedidoCard(pedido) {
    const minutos = obtenerMinutosPedido(pedido.fechaCreacion);
    const urgencia = obtenerUrgenciaPedido(minutos);

    const cliente = obtenerNombreClientePedido(pedido);

    return `
        <article
            class="pedido-card urgencia-${urgencia}"
            data-pedido-id="${pedido.id}"
        >

            <div class="pedido-card-top">

                <div>
                    <strong class="pedido-numero">
                        ${pedido.numero}
                    </strong>

                    <span class="pedido-cliente">
                        ${cliente}
                    </span>
                </div>

                <div class="pedido-tiempo">
                    <span>Tiempo</span>

                    <strong
                        class="pedido-cronometro"
                        data-fecha="${pedido.fechaCreacion}"
                        data-pedido="${pedido.id}"
                    >
                        ${minutos} min
                    </strong>
                </div>

            </div>

            <div class="pedido-productos">
                ${pedido.productos
                    .map(
                        producto => `
                            <div class="pedido-producto-linea">
                                <strong>${producto.cantidad}x</strong>
                                <span>${producto.nombre}</span>
                            </div>
                        `
                    )
                    .join("")}
            </div>

            ${
                pedido.observaciones
                    ? `
                        <div class="pedido-observacion">
                            <strong>Obs:</strong>
                            ${pedido.observaciones}
                        </div>
                    `
                    : ""
            }

            <div class="pedido-info-grid">

                <div>
                    <span>Total</span>
                    <strong>${formatearDinero(pedido.total)}</strong>
                </div>

                <div>
                    <span>Pago</span>
                    <strong>
                        ${formatearMetodoPago(pedido.pago)}
                    </strong>
                </div>

                <div>
                    <span>Estado pago</span>
                    ${renderEstadoPago(pedido.pago.estado)}
                </div>

            </div>

            <div class="pedido-status">

                <span>Estado del pedido</span>

                <select
                    class="pedido-status-select"
                    onchange="cambiarEstadoPedido(
                        ${pedido.id},
                        this.value
                    )"
                >
                    ${renderOpcionesEstado(pedido.estado)}
                </select>

            </div>

            <div class="pedido-card-footer">

                <button
                    class="btn-secondary"
                    onclick="verDetallePedido(${pedido.id})"
                >
                    Ver detalle
                </button>

                <button
                    class="btn-primary"
                    onclick="avanzarEstadoPedido(${pedido.id})"
                >
                    Avanzar
                </button>

            </div>

        </article>
    `;
}


function obtenerNombreClientePedido(pedido) {
    if (pedido.tipo === "local" && pedido.mesaId) {
        const mesa = ScartData.mesas.find(
            mesa => mesa.id === pedido.mesaId
        );

        if (mesa) {
            return mesa.nombre;
        }
    }

    const nombre = pedido.cliente?.nombre || "";
    const apellido = pedido.cliente?.apellido || "";

    return `${nombre} ${apellido}`.trim() || "Sin nombre";
}


function obtenerMinutosPedido(fechaCreacion) {
    const inicio = new Date(fechaCreacion).getTime();
    const ahora = Date.now();

    return Math.max(
        0,
        Math.floor((ahora - inicio) / 60000)
    );
}


function obtenerUrgenciaPedido(minutos) {
    const objetivo =
        ScartData.configuracion.tiempoObjetivoPedido || 30;

    if (minutos < objetivo * 0.6) {
        return "verde";
    }

    if (minutos < objetivo) {
        return "amarillo";
    }

    return "rojo";
}


function formatearMetodoPago(pago) {
    const metodo =
        pago.metodoFinal ||
        pago.metodoPrevisto ||
        "Pendiente";

    const nombres = {
        efectivo: "Efectivo",
        transferencia: "Transferencia",
        debito: "Débito",
        credito: "Crédito"
    };

    return nombres[metodo] || "Pendiente";
}


function renderEstadoPago(estado) {
    const clases = {
        pagado: "pagado",
        pendiente: "pendiente"
    };

    const nombres = {
        pagado: "Pagado",
        pendiente: "Pendiente"
    };

    return `
        <strong class="estado-pago ${clases[estado] || "pendiente"}">
            ${nombres[estado] || "Pendiente"}
        </strong>
    `;
}


function renderOpcionesEstado(estadoActual) {
    const estados = [
        ["recibido", "Recibido"],
        ["confirmado", "Confirmado"],
        ["preparacion", "En preparación"],
        ["listo", "Listo"],
        ["entregado", "Entregado"]
    ];

    return estados
        .map(
            ([valor, nombre]) => `
                <option
                    value="${valor}"
                    ${valor === estadoActual ? "selected" : ""}
                >
                    ${nombre}
                </option>
            `
        )
        .join("");
}


function cambiarEstadoPedido(id, nuevoEstado) {
    const pedido = ScartData.pedidos.find(
        pedido => pedido.id === id
    );

    if (!pedido) return;

    const estadoAnterior = pedido.estado;

    pedido.estado = nuevoEstado;
    pedido.fechaActualizacion = new Date().toISOString();

    pedido.historial.push({
        tipo: "estado",
        fecha: new Date().toISOString(),
        detalle: `${estadoAnterior} → ${nuevoEstado}`
    });

    mostrarToast(
        `Pedido ${pedido.numero}: ${nuevoEstado}`
    );

    refrescarPedidos();
}


function avanzarEstadoPedido(id) {
    const pedido = ScartData.pedidos.find(
        pedido => pedido.id === id
    );

    if (!pedido) return;

    const flujo = [
        "recibido",
        "confirmado",
        "preparacion",
        "listo",
        "entregado"
    ];

    const posicion = flujo.indexOf(pedido.estado);

    if (posicion === -1 || posicion === flujo.length - 1) {
        return;
    }

    cambiarEstadoPedido(
        id,
        flujo[posicion + 1]
    );
}


function refrescarPedidos() {
    const contenido = document.getElementById("app-content");

    if (!contenido) return;

    contenido.innerHTML = renderPedidos();
}


function actualizarCronometrosPedidos() {
    document
        .querySelectorAll(".pedido-cronometro")
        .forEach(elemento => {

            const fecha = elemento.dataset.fecha;
            const minutos = obtenerMinutosPedido(fecha);

            elemento.textContent = `${minutos} min`;

            const card = elemento.closest(".pedido-card");

            if (!card) return;

            card.classList.remove(
                "urgencia-verde",
                "urgencia-amarillo",
                "urgencia-rojo"
            );

            card.classList.add(
                `urgencia-${obtenerUrgenciaPedido(minutos)}`
            );
        });
}


function verDetallePedido(id) {
    const pedido = ScartData.pedidos.find(
        pedido => pedido.id === id
    );

    if (!pedido) return;

    console.log("Detalle pedido:", pedido);

    mostrarToast(
        `Detalle ${pedido.numero} disponible en consola por ahora.`
    );
}


setInterval(actualizarCronometrosPedidos, 1000);
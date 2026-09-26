/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const data = ScartData.dashboard;

    const totalTipos =
        data.tiposPedido.local +
        data.tiposPedido.delivery +
        data.tiposPedido.retiro;


    const porcentaje = (cantidad) => {

        if (!totalTipos) return 0;

        return Math.round(
            (cantidad / totalTipos) * 100
        );
    };


    const maxActividad = Math.max(
        ...data.actividadHoraria.map(
            item => item.pedidos
        )
    );


    const actividadHTML =
        data.actividadHoraria.map(item => {

            const altura =
                (item.pedidos / maxActividad) * 150;

            return `
                <div class="hour-item">

                    <div
                        class="hour-bar"
                        style="height:${altura}px"
                    >
                        <span>
                            ${item.pedidos}
                        </span>
                    </div>

                    <div class="hour-label">
                        ${item.hora}:00
                    </div>

                </div>
            `;

        }).join("");


    return `

        <div class="dashboard-header">

            <div>
                <strong>
                    Rendimiento del local
                </strong>
            </div>

            <div class="period-selector">

                <button class="active">
                    Hoy
                </button>

                <button>
                    Semana
                </button>

                <button>
                    Mes
                </button>

                <button>
                    Personalizado
                </button>

            </div>

        </div>


        <!-- KPI -->

        <div class="kpi-grid">

            <div class="kpi-card">

                <span class="kpi-label">
                    Pedidos
                </span>

                <strong class="kpi-value">
                    ${data.pedidosHoy}
                </strong>

                <span class="kpi-footer">
                    Total registrados hoy
                </span>

            </div>


            <div class="kpi-card">

                <span class="kpi-label">
                    Ventas
                </span>

                <strong class="kpi-value">
                    ${formatearDinero(data.ventasHoy)}
                </strong>

                <span class="kpi-footer">
                    Ventas concretadas
                </span>

            </div>


            <div class="kpi-card">

                <span class="kpi-label">
                    Tiempo promedio
                </span>

                <strong class="kpi-value">
                    ${data.tiempoPromedio} min
                </strong>

                <span class="kpi-footer">
                    Preparación / atención
                </span>

            </div>


            <div class="kpi-card">

                <span class="kpi-label">
                    Fuera de tiempo
                </span>

                <strong class="kpi-value">
                    ${data.pedidosFueraTiempo}
                </strong>

                <span class="kpi-footer">
                    Meta:
                    ${ScartData.configuracion.tiempoObjetivoPedido}
                    min
                </span>

            </div>

        </div>


        <!-- GRÁFICOS -->

        <div class="dashboard-grid">


            <!-- DISTRIBUCIÓN -->

            <div class="card">

                <div class="card-header">

                    <h3>
                        Pedidos por tipo
                    </h3>

                    <span>
                        ${totalTipos} pedidos
                    </span>

                </div>


                <div class="distribution-list">


                    <div class="distribution-row">

                        <span>
                            Local
                        </span>

                        <div class="progress">

                            <div
                                class="progress-bar"
                                style="
                                width:
                                ${porcentaje(
                                    data.tiposPedido.local
                                )}%
                                "
                            ></div>

                        </div>

                        <strong>
                            ${porcentaje(
                                data.tiposPedido.local
                            )}%
                        </strong>

                    </div>


                    <div class="distribution-row">

                        <span>
                            Delivery
                        </span>

                        <div class="progress">

                            <div
                                class="progress-bar blue"
                                style="
                                width:
                                ${porcentaje(
                                    data.tiposPedido.delivery
                                )}%
                                "
                            ></div>

                        </div>

                        <strong>
                            ${porcentaje(
                                data.tiposPedido.delivery
                            )}%
                        </strong>

                    </div>


                    <div class="distribution-row">

                        <span>
                            Retiro
                        </span>

                        <div class="progress">

                            <div
                                class="progress-bar orange"
                                style="
                                width:
                                ${porcentaje(
                                    data.tiposPedido.retiro
                                )}%
                                "
                            ></div>

                        </div>

                        <strong>
                            ${porcentaje(
                                data.tiposPedido.retiro
                            )}%
                        </strong>

                    </div>


                </div>

            </div>


            <!-- ACTIVIDAD -->

            <div class="card">

                <div class="card-header">

                    <h3>
                        Pedidos por hora
                    </h3>

                    <span>
                        Hoy
                    </span>

                </div>


                <div class="hour-chart">

                    ${actividadHTML}

                </div>

            </div>

        </div>


        <!-- OPERACIÓN -->

        <div class="card">

            <div class="card-header">

                <h3>
                    Resumen operacional
                </h3>

            </div>


            <div class="operation-grid">

                <div class="operation-item">

                    <strong>
                        10:00 - 17:00
                    </strong>

                    <span>
                        Bloque AM
                    </span>

                </div>


                <div class="operation-item">

                    <strong>
                        17:00 - 00:00
                    </strong>

                    <span>
                        Bloque PM
                    </span>

                </div>


                <div class="operation-item">

                    <strong>
                        20:00
                    </strong>

                    <span>
                        Hora de mayor actividad
                    </span>

                </div>

            </div>

        </div>

    `;
}
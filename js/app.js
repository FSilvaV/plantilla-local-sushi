/* =========================================================
   SCART SUSHI
   CONTROL GENERAL DE LA APLICACIÓN
========================================================= */


/* =========================================================
   REFERENCIAS
========================================================= */

const appContent =
    document.getElementById("app-content");

const pageTitle =
    document.getElementById("page-title");

const pageDescription =
    document.getElementById("page-description");

const currentDate =
    document.getElementById("current-date");

const currentTime =
    document.getElementById("current-time");


/* =========================================================
   CONFIGURACIÓN DE PÁGINAS
========================================================= */

const pages = {

    dashboard: {
        title: "Dashboard",
        description:
            "Resumen general de la operación"
    },

    "nuevo-pedido": {
        title: "Nuevo Pedido",
        description:
            "Registrar un nuevo pedido"
    },

    pedidos: {
        title: "Pedidos",
        description:
            "Seguimiento y gestión de pedidos"
    },

    mesas: {
        title: "Mesas",
        description:
            "Disponibilidad y ocupación del local"
    },

    ventas: {
        title: "Ventas",
        description:
            "Registro y estadísticas de ventas"
    },

    inventario: {
        title: "Inventario",
        description:
            "Ingredientes, insumos y movimientos"
    },

    menu: {
        title: "Menú / Productos",
        description:
            "Administración del catálogo"
    },

    configuracion: {
        title: "Configuración",
        description:
            "Configuración general del sistema"
    }
};


/* =========================================================
   NAVEGACIÓN
========================================================= */

function navegar(page) {

    const config = pages[page];

    if (!config) return;


    pageTitle.textContent =
        config.title;

    pageDescription.textContent =
        config.description;


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.page === page
            ) {
                item.classList.add("active");
            }

        });


    cargarPagina(page);
}


/* =========================================================
   CARGAR PÁGINA
========================================================= */

function cargarPagina(page) {

    switch (page) {

        case "dashboard":

            appContent.innerHTML =
                renderDashboard();

            break;


        case "nuevo-pedido":

            appContent.innerHTML =
                renderNuevoPedido();

            break;


        case "pedidos":

            mostrarPlaceholder(
                "▤",
                "Pedidos",
                "Aquí aparecerán Delivery, Retiro y Servicio Local en tiempo real."
            );

            break;


        case "mesas":

            mostrarPlaceholder(
                "▣",
                "Mesas",
                "Aquí veremos mesas disponibles, ocupadas y sus tiempos."
            );

            break;


        case "ventas":

            mostrarPlaceholder(
                "$",
                "Ventas",
                "Aquí aparecerá el registro de ventas y métodos de pago."
            );

            break;


        case "inventario":

            mostrarPlaceholder(
                "▧",
                "Inventario",
                "Aquí administraremos ingredientes, insumos, movimientos y mermas."
            );

            break;


        case "menu":

            appContent.innerHTML =
                renderMenu();

            break;


        case "configuracion":

            mostrarPlaceholder(
                "⚙",
                "Configuración",
                "Configuración del local, tiempos, mesas y parámetros."
            );

            break;

    }

}


/* =========================================================
   PLACEHOLDER
========================================================= */

function mostrarPlaceholder(
    icono,
    titulo,
    descripcion
) {

    appContent.innerHTML = `

        <div class="module-placeholder">

            <span>
                ${icono}
            </span>

            <h2>
                ${titulo}
            </h2>

            <p>
                ${descripcion}
            </p>

        </div>

    `;
}


/* =========================================================
   RELOJ GLOBAL
========================================================= */

function actualizarReloj() {

    const ahora = new Date();


    currentTime.textContent =
        ahora.toLocaleTimeString(
            "es-CL",
            {
                hour12: false
            }
        );


    currentDate.textContent =
        ahora.toLocaleDateString(
            "es-CL",
            {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


actualizarReloj();

setInterval(
    actualizarReloj,
    1000
);


/* =========================================================
   FORMATO DINERO
========================================================= */

function formatearDinero(valor) {

    return new Intl.NumberFormat(
        "es-CL",
        {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        }
    ).format(valor);
}


/* =========================================================
   TOAST
========================================================= */

function mostrarToast(mensaje) {

    const container =
        document.getElementById(
            "toast-container"
        );


    const toast =
        document.createElement("div");


    toast.className = "toast";

    toast.textContent = mensaje;


    container.appendChild(toast);


    setTimeout(() => {

        toast.remove();

    }, 3000);
}


/* =========================================================
   EVENTOS NAVEGACIÓN
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const navItem =
            event.target.closest(
                "[data-page]"
            );


        if (navItem) {

            navegar(
                navItem.dataset.page
            );

            return;
        }


        const goButton =
            event.target.closest(
                "[data-go]"
            );


        if (goButton) {

            navegar(
                goButton.dataset.go
            );
        }

    }
);


/* =========================================================
   INICIO
========================================================= */

navegar("dashboard");
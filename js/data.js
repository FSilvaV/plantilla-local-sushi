/* =========================================================
   DATOS DEMO - SCART SUSHI
========================================================= */

const ScartData = {

    configuracion: {
        nombre: "Scart Sushi",

        horario: {
            apertura: "10:00",
            cierre: "00:00"
        },

        tiempoObjetivoPedido: 30,

        bloques: {
            am: {
                nombre: "AM",
                inicio: "10:00",
                fin: "17:00"
            },

            pm: {
                nombre: "PM",
                inicio: "17:00",
                fin: "00:00"
            }
        }
    },


    dashboard: {

        pedidosHoy: 128,

        ventasHoy: 1485600,

        tiempoPromedio: 24,

        pedidosFueraTiempo: 7,

        tiposPedido: {
            local: 52,
            delivery: 48,
            retiro: 28
        },

        actividadHoraria: [
            { hora: "10", pedidos: 8 },
            { hora: "12", pedidos: 18 },
            { hora: "14", pedidos: 26 },
            { hora: "16", pedidos: 14 },
            { hora: "18", pedidos: 31 },
            { hora: "20", pedidos: 42 },
            { hora: "22", pedidos: 35 },
            { hora: "00", pedidos: 12 }
        ]
    },


    mesas: [
        {
            id: 1,
            nombre: "Mesa 01",
            estado: "disponible"
        },

        {
            id: 2,
            nombre: "Mesa 02",
            estado: "ocupada"
        },

        {
            id: 3,
            nombre: "Mesa 03",
            estado: "disponible"
        },

        {
            id: 4,
            nombre: "Mesa 04",
            estado: "ocupada"
        },

        {
            id: 5,
            nombre: "Mesa 05",
            estado: "disponible"
        },

        {
            id: 6,
            nombre: "Mesa 06",
            estado: "disponible"
        }
    ],


    productos: [
        {
            id: 1,
            nombre: "California Roll",
            categoria: "Sushi",
            precio: 8900,
            activo: true
        },

        {
            id: 2,
            nombre: "Handroll Pollo",
            categoria: "Handroll",
            precio: 5500,
            activo: true
        },

        {
            id: 3,
            nombre: "Salmón Roll",
            categoria: "Sushi",
            precio: 9900,
            activo: true
        },

        {
            id: 4,
            nombre: "Bebida 1.5L",
            categoria: "Bebidas",
            precio: 3000,
            activo: true
        }
    ]
};
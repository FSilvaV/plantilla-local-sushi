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
        descripcion:
            "Kanikama, palta y queso crema.",
        precio: 8900,
        imagen: "",
        activo: true
    },

    {
        id: 2,
        nombre: "Handroll Pollo",
        categoria: "Handroll",
        descripcion:
            "Pollo, queso crema y cebollín.",
        precio: 5500,
        imagen: "",
        activo: true
    },

    {
        id: 3,
        nombre: "Salmón Roll",
        categoria: "Sushi",
        descripcion:
            "Salmón, palta y queso crema.",
        precio: 9900,
        imagen: "",
        activo: true
    },

    {
        id: 4,
        nombre: "Bebida 1.5L",
        categoria: "Bebidas",
        descripcion:
            "Bebida familiar 1.5 litros.",
        precio: 3000,
        imagen: "",
        activo: true
    },

    {
        id: 5,
        nombre: "Promo 30 piezas",
        categoria: "Promoción",
        descripcion:
            "Selección de 30 piezas variadas.",
        precio: 16990,
        imagen: "",
        activo: true
    },

    {
        id: 6,
        nombre: "Papas Fritas",
        categoria: "Extra",
        descripcion:
            "Porción de papas fritas.",
        precio: 3500,
        imagen: "",
        activo: false
    }

],

inventario: [
    // aquí van Arroz para sushi, Alga Nori,
    // Salmón, Camarón, Pollo, Queso crema,
    // Palta, etc.
],

movimientosInventario: [],

pedidos: [
    {
        id: 1,
        numero: "P-001",
        tipo: "delivery",
        origen: "personal",

        cliente: {
            nombre: "Camila",
            apellido: "Rojas",
            telefono: "912345678",
            direccion: "Villa El Portal, Ovalle",
            referencia: "Casa esquina"
        },

        productos: [
            {
                id: 1,
                nombre: "California Roll",
                cantidad: 2,
                precio: 8900
            },
            {
                id: 4,
                nombre: "Bebida 1.5L",
                cantidad: 1,
                precio: 3000
            }
        ],

        subtotal: 20800,
        propina: 0,
        total: 20800,

        pago: {
            metodoPrevisto: "efectivo",
            metodoFinal: "",
            estado: "pendiente",
            monto: 20800,
            montoRecibido: 25000,
            vuelto: 4200,
            codigoTransferencia: "",
            fechaPago: null
        },

        estado: "recibido",
        observaciones: "Sin cebollín",

        fechaCreacion: new Date(Date.now() - 12 * 60000).toISOString(),
        fechaActualizacion: new Date().toISOString(),

        mesaId: null,

        historial: [
            {
                tipo: "creacion",
                fecha: new Date(Date.now() - 12 * 60000).toISOString(),
                detalle: "Pedido creado"
            }
        ]
    },

    {
        id: 2,
        numero: "P-002",
        tipo: "retiro",
        origen: "personal",

        cliente: {
            nombre: "Diego",
            apellido: "Muñoz",
            telefono: "987654321",
            direccion: "",
            referencia: ""
        },

        productos: [
            {
                id: 5,
                nombre: "Promo 30 piezas",
                cantidad: 1,
                precio: 16990
            }
        ],

        subtotal: 16990,
        propina: 0,
        total: 16990,

        pago: {
            metodoPrevisto: "debito",
            metodoFinal: "",
            estado: "pendiente",
            monto: 16990,
            montoRecibido: 0,
            vuelto: 0,
            codigoTransferencia: "",
            fechaPago: null
        },

        estado: "preparacion",
        observaciones: "",

        fechaCreacion: new Date(Date.now() - 21 * 60000).toISOString(),
        fechaActualizacion: new Date().toISOString(),

        mesaId: null,

        historial: [
            {
                tipo: "creacion",
                fecha: new Date(Date.now() - 21 * 60000).toISOString(),
                detalle: "Pedido creado"
            }
        ]
    },

    {
        id: 3,
        numero: "P-003",
        tipo: "local",
        origen: "personal",

        cliente: {
            nombre: "Mesa 02",
            apellido: "",
            telefono: "",
            direccion: "",
            referencia: ""
        },

        productos: [
            {
                id: 3,
                nombre: "Salmón Roll",
                cantidad: 2,
                precio: 9900
            },
            {
                id: 2,
                nombre: "Handroll Pollo",
                cantidad: 1,
                precio: 5500
            }
        ],

        subtotal: 25300,
        propina: 0,
        total: 25300,

        pago: {
            metodoPrevisto: "",
            metodoFinal: "",
            estado: "pendiente",
            monto: 25300,
            montoRecibido: 0,
            vuelto: 0,
            codigoTransferencia: "",
            fechaPago: null
        },

        estado: "confirmado",
        observaciones: "Agregar bastante salsa",

        fechaCreacion: new Date(Date.now() - 34 * 60000).toISOString(),
        fechaActualizacion: new Date().toISOString(),

        mesaId: 2,

        historial: [
            {
                tipo: "creacion",
                fecha: new Date(Date.now() - 34 * 60000).toISOString(),
                detalle: "Pedido creado"
            }
        ]
    },

    {
    id: 4,
    numero: "P-004",
    tipo: "delivery",
    origen: "personal",

    cliente: {
        nombre: "Valentina",
        apellido: "Castillo",
        telefono: "956781234",
        direccion: "Villa Los Presidentes, Ovalle",
        referencia: "Portón negro"
    },

    productos: [
        {
            id: 5,
            nombre: "Promo 30 piezas",
            cantidad: 1,
            precio: 16990
        },
        {
            id: 4,
            nombre: "Bebida 1.5L",
            cantidad: 1,
            precio: 3000
        }
    ],

    subtotal: 19990,
    propina: 0,
    total: 19990,

    pago: {
        metodoPrevisto: "transferencia",
        metodoFinal: "transferencia",
        estado: "pagado",
        monto: 19990,
        montoRecibido: 0,
        vuelto: 0,
        codigoTransferencia: "TRX-4821",
        fechaPago: new Date(
            Date.now() - 35 * 60000
        ).toISOString()
    },

    estado: "entregado",
    observaciones: "",

    fechaCreacion: new Date(
        Date.now() - 55 * 60000
    ).toISOString(),

    fechaActualizacion: new Date(
        Date.now() - 30 * 60000
    ).toISOString(),

    mesaId: null,

    historial: []
},

{
    id: 5,
    numero: "P-005",
    tipo: "local",
    origen: "personal",

    cliente: {
        nombre: "Mesa 04",
        apellido: "",
        telefono: "",
        direccion: "",
        referencia: ""
    },

    productos: [
        {
            id: 3,
            nombre: "Salmón Roll",
            cantidad: 2,
            precio: 9900
        },
        {
            id: 4,
            nombre: "Bebida 1.5L",
            cantidad: 1,
            precio: 3000
        }
    ],

    subtotal: 22800,
    propina: 0,
    total: 22800,

    pago: {
        metodoPrevisto: "debito",
        metodoFinal: "debito",
        estado: "pagado",
        monto: 22800,
        montoRecibido: 0,
        vuelto: 0,
        codigoTransferencia: "",
        fechaPago: new Date(
            Date.now() - 75 * 60000
        ).toISOString()
    },

    estado: "entregado",
    observaciones: "",

    fechaCreacion: new Date(
        Date.now() - 105 * 60000
    ).toISOString(),

    fechaActualizacion: new Date(
        Date.now() - 70 * 60000
    ).toISOString(),

    mesaId: null,

    historial: []
},

{
    id: 6,
    numero: "P-006",
    tipo: "retiro",
    origen: "personal",

    cliente: {
        nombre: "Francisca",
        apellido: "Vega",
        telefono: "934567812",
        direccion: "",
        referencia: ""
    },

    productos: [
        {
            id: 2,
            nombre: "Handroll Pollo",
            cantidad: 2,
            precio: 5500
        }
    ],

    subtotal: 11000,
    propina: 0,
    total: 11000,

    pago: {
        metodoPrevisto: "efectivo",
        metodoFinal: "efectivo",
        estado: "pagado",
        monto: 11000,

        // Cliente entregó $15.000.
        // La venta sigue siendo de $11.000.
        montoRecibido: 15000,
        vuelto: 4000,

        codigoTransferencia: "",

        fechaPago: new Date(
            Date.now() - 125 * 60000
        ).toISOString()
    },

    estado: "entregado",
    observaciones: "",

    fechaCreacion: new Date(
        Date.now() - 145 * 60000
    ).toISOString(),

    fechaActualizacion: new Date(
        Date.now() - 120 * 60000
    ).toISOString(),

    mesaId: null,

    historial: []
},

{
    id: 7,
    numero: "P-007",
    tipo: "delivery",
    origen: "personal",

    cliente: {
        nombre: "Matías",
        apellido: "Araya",
        telefono: "923456781",
        direccion: "Sector El Portal, Ovalle",
        referencia: ""
    },

    productos: [
        {
            id: 1,
            nombre: "California Roll",
            cantidad: 1,
            precio: 8900
        },
        {
            id: 2,
            nombre: "Handroll Pollo",
            cantidad: 1,
            precio: 5500
        }
    ],

    subtotal: 14400,
    propina: 0,
    total: 14400,

    pago: {
        metodoPrevisto: "credito",
        metodoFinal: "credito",
        estado: "pagado",
        monto: 14400,
        montoRecibido: 0,
        vuelto: 0,
        codigoTransferencia: "",

        fechaPago: new Date(
            Date.now() - 185 * 60000
        ).toISOString()
    },

    estado: "entregado",
    observaciones: "",

    fechaCreacion: new Date(
        Date.now() - 210 * 60000
    ).toISOString(),

    fechaActualizacion: new Date(
        Date.now() - 180 * 60000
    ).toISOString(),

    mesaId: null,

    historial: []
},

{
    id: 8,
    numero: "P-008",
    tipo: "local",
    origen: "personal",

    cliente: {
        nombre: "Mesa 06",
        apellido: "",
        telefono: "",
        direccion: "",
        referencia: ""
    },

    productos: [
        {
            id: 5,
            nombre: "Promo 30 piezas",
            cantidad: 2,
            precio: 16990
        }
    ],

    subtotal: 33980,
    propina: 0,
    total: 33980,

    pago: {
        metodoPrevisto: "transferencia",
        metodoFinal: "transferencia",
        estado: "pagado",
        monto: 33980,
        montoRecibido: 0,
        vuelto: 0,
        codigoTransferencia: "TRX-7164",

        fechaPago: new Date(
            Date.now() - 240 * 60000
        ).toISOString()
    },

    estado: "entregado",
    observaciones: "",

    fechaCreacion: new Date(
        Date.now() - 270 * 60000
    ).toISOString(),

    fechaActualizacion: new Date(
        Date.now() - 235 * 60000
    ).toISOString(),

    mesaId: null,

    historial: []
},

]

};
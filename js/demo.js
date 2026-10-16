/* Datos de prueba aislados por pestaña. No existe conexión con producción. */
const DemoGastronomica = (() => {
    const clave = 'appnova-demo-gastronomica-v1';
    const tipos = {
        sushi: { nombre: 'Sushi', icono: '🍣', productos: ScartData.productos },
        rapida: { nombre: 'Comida rápida', icono: '🍟', productos: [
            ['PAPAS FRITAS PORCIÓN', 'Papas fritas', 1500, 'Porción individual de papas fritas.'],
            ['PAPAS FRITAS MEDIANAS', 'Papas fritas', 3000, 'Porción mediana de papas fritas.'],
            ['PAPAS FRITAS FAMILIARES', 'Papas fritas', 5000, 'Porción familiar de papas fritas.'],
            ['COMPLETO ITALIANO', 'Completos', 3500, 'Vienesa, palta, tomate y mayonesa.'],
            ['COMPLETO ASS', 'Completos', 4900, 'Carne, palta, tomate y mayonesa.'],
            ['CHURRASCO ITALIANO', 'Sándwiches', 5900, 'Carne, palta, tomate y mayonesa.'],
            ['SALCHIPAPAS', 'Papas fritas', 4500, 'Papas fritas y vienesas.']
        ] },
        pizzeria: { nombre: 'Pizzería', icono: '🍕', productos: [
            ['PIZZA MARGARITA', 'Pizzas', 8990, 'Salsa de tomate, mozzarella y albahaca.'],
            ['PIZZA PEPPERONI', 'Pizzas', 10990, 'Salsa de tomate, mozzarella y pepperoni.'],
            ['PIZZA VEGETARIANA', 'Pizzas', 9990, 'Queso, pimentón, champiñones y aceitunas.']
        ] },
        parrilla: { nombre: 'Parrilla', icono: '🥩', productos: [
            ['PARRILLADA PARA DOS', 'Parrilla', 24990, 'Selección de carnes, longaniza y acompañamiento.'],
            ['LOMO VETADO', 'Cortes', 16990, 'Corte a la parrilla con acompañamiento.'],
            ['POLLO A LA PARRILLA', 'Parrilla', 11990, 'Pollo asado con ensalada o papas.']
        ] },
        variada: { nombre: 'Comida variada', icono: '🍽️', productos: [
            ['POLLO CON ARROZ', 'Platos', 7900, 'Pollo, arroz y ensalada.'],
            ['PASTEL DE CHOCLO', 'Platos', 8900, 'Pastel de choclo con pino y pollo.'],
            ['ENSALADA DE LA CASA', 'Ensaladas', 6500, 'Verduras de temporada.']
        ] }
    };
    for (const [tipo, valor] of Object.entries(tipos)) {
        valor.productos = valor.productos.map((p, i) => Array.isArray(p)
            ? { id: i + 1, nombre: p[0], categoria: p[1], precio: p[2], descripcion: p[3], imagen: '', activo: true }
            : { ...p, nombre: p.nombre.toLocaleUpperCase('es-CL') });
    }
    let estado;
    try { estado = JSON.parse(sessionStorage.getItem(clave) || 'null'); } catch (_) { estado = null; }
    if (!estado || !tipos[estado.tipo] || !estado.catalogos) estado = { tipo: 'sushi', catalogos: {}, inventario: [], movimientos: [] };
    const escapar = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const guardar = () => {
        estado.catalogos[estado.tipo] = ScartData.productos;
        estado.inventario = ScartData.inventario;
        estado.movimientos = ScartData.movimientosInventario;
        try { sessionStorage.setItem(clave, JSON.stringify(estado)); } catch (_) { mostrarToast('No se pudo guardar esta sesión de prueba.'); }
    };
    const aplicar = () => {
        const config = tipos[estado.tipo];
        ScartData.productos = estado.catalogos[estado.tipo] || structuredClone(config.productos);
        ScartData.inventario = estado.inventario || [];
        ScartData.movimientosInventario = estado.movimientos || [];
        ScartData.configuracion.nombre = `Demo ${config.nombre}`;
        document.querySelector('.brand-logo').textContent = config.icono;
        document.querySelector('.brand-text h1').textContent = config.nombre;
        document.querySelector('.user-info span').textContent = config.nombre;
        document.getElementById('tipo-local').value = estado.tipo;
        document.title = `AppNova · Demo ${config.nombre}`;
    };
    const cambiar = tipo => {
        if (!tipos[tipo] || tipo === estado.tipo) return;
        guardar();
        estado.tipo = tipo;
        aplicar();
        guardar();
        if (typeof filtroCategoriaMenu !== 'undefined') filtroCategoriaMenu = 'Todos';
        if (typeof categoriaPedido !== 'undefined') categoriaPedido = 'Todos';
        navegar(document.querySelector('.nav-item.active')?.dataset.page || 'menu');
    };
    const reiniciar = () => {
        if (!confirm('¿Reiniciar los datos de esta pestaña de prueba?')) return;
        sessionStorage.removeItem(clave);
        location.reload();
    };
    aplicar();
    return { tipos, get tipo() { return estado.tipo; }, guardar, cambiar, reiniciar, escapar };
})();

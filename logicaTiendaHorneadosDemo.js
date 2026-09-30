/* ===== DATOS ===== */
const listaProductosTienda = [
  { codigo: 1, nombre: "Budín de limón", categoria: "Budines", precio: 4500, icono: "🍋", destacado: true, descripcion: "Húmedo, con glaseado cítrico." },
  { codigo: 2, nombre: "Budín de chocolate", categoria: "Budines", precio: 4800, icono: "🍫", destacado: false, descripcion: "Con chips de chocolate semiamargo." },
  { codigo: 3, nombre: "Budín de banana y nuez", categoria: "Budines", precio: 5000, icono: "🍌", destacado: false, descripcion: "Bananas maduras y nueces tostadas." },
  { codigo: 4, nombre: "Focaccia de romero", categoria: "Panificados", precio: 5200, icono: "🍞", destacado: true, descripcion: "Masa madre, aceite de oliva y sal gruesa." },
  { codigo: 5, nombre: "Rolls de canela", categoria: "Panificados", precio: 6000, icono: "🥐", destacado: true, descripcion: "Con cobertura de queso crema." },
  { codigo: 6, nombre: "Pan de campo", categoria: "Panificados", precio: 3900, icono: "🥖", destacado: false, descripcion: "Corteza crocante, miga abierta." },
  { codigo: 7, nombre: "Galletitas de avena x12", categoria: "Galletitas", precio: 3800, icono: "🍪", destacado: false, descripcion: "Avena, pasas y un toque de miel." },
  { codigo: 8, nombre: "Alfajorcitos x6", categoria: "Galletitas", precio: 4200, icono: "🤎", destacado: false, descripcion: "Con dulce de leche y coco rallado." }
];
const listaCuponesValidos = { BIENVENIDA10: 0.10 };
const claveAlmacenamientoCarrito = "carritoTiendaHorneadosDemo";

/* ===== ESTADO ===== */
let categoriaSeleccionada = "Todas";
let itemsDelCarrito = [];
let porcentajeDescuentoAplicado = 0;

/* ===== UTILIDADES ===== */
function funcionFormatearPrecio(valorNumerico) { return "$" + Math.round(valorNumerico).toLocaleString("es-AR"); }
function funcionCrearElemento(etiqueta, clases, texto) {
  const elementoNuevo = document.createElement(etiqueta);
  if (clases) elementoNuevo.className = clases;
  if (texto !== undefined) elementoNuevo.textContent = texto;
  return elementoNuevo;
}
function funcionGuardarCarrito() { try { localStorage.setItem(claveAlmacenamientoCarrito, JSON.stringify(itemsDelCarrito)); } catch (e) {} }
function funcionCargarCarrito() { try { itemsDelCarrito = JSON.parse(localStorage.getItem(claveAlmacenamientoCarrito)) || []; } catch (e) { itemsDelCarrito = []; } }

/* ===== CATÁLOGO: FILTROS, BÚSQUEDA Y ORDEN ===== */
function funcionRenderizarFiltros() {
  const contenedor = document.getElementById("contenedorFiltrosCategoria");
  contenedor.innerHTML = "";
  const categorias = ["Todas"].concat(Array.from(new Set(listaProductosTienda.map(function (p) { return p.categoria; }))));
  categorias.forEach(function (categoria) {
    const boton = funcionCrearElemento("button", "botonFiltroCategoria" + (categoria === categoriaSeleccionada ? " botonFiltroActivo" : ""), categoria);
    boton.type = "button";
    boton.addEventListener("click", function () { categoriaSeleccionada = categoria; funcionRenderizarFiltros(); funcionRenderizarProductos(); });
    contenedor.appendChild(boton);
  });
}
function funcionObtenerProductosVisibles() {
  const textoBusqueda = document.getElementById("campoBusquedaProducto").value.trim().toLowerCase();
  const criterioOrden = document.getElementById("selectorOrdenProductos").value;
  const visibles = listaProductosTienda.filter(function (p) {
    const coincideCategoria = categoriaSeleccionada === "Todas" || p.categoria === categoriaSeleccionada;
    return coincideCategoria && p.nombre.toLowerCase().includes(textoBusqueda);
  });
  if (criterioOrden === "menorPrecio") visibles.sort(function (a, b) { return a.precio - b.precio; });
  if (criterioOrden === "mayorPrecio") visibles.sort(function (a, b) { return b.precio - a.precio; });
  if (criterioOrden === "nombre") visibles.sort(function (a, b) { return a.nombre.localeCompare(b.nombre); });
  return visibles;
}
function funcionRenderizarProductos() {
  const contenedor = document.getElementById("contenedorProductos");
  contenedor.innerHTML = "";
  const visibles = funcionObtenerProductosVisibles();
  document.getElementById("mensajeSinResultados").classList.toggle("mensajeSinResultadosVisible", visibles.length === 0);
  visibles.forEach(function (producto) {
    const tarjeta = funcionCrearElemento("article", "tarjetaProductoTienda");
    tarjeta.appendChild(funcionCrearElemento("div", "fondoIconoProducto", producto.icono));
    const titulo = funcionCrearElemento("h3", "nombreProducto", producto.nombre);
    if (producto.destacado) titulo.appendChild(funcionCrearElemento("span", "insigniaProducto", "Top"));
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(funcionCrearElemento("p", "descripcionProducto", producto.descripcion));
    tarjeta.appendChild(funcionCrearElemento("p", "precioProducto", funcionFormatearPrecio(producto.precio)));
    const botonAgregar = funcionCrearElemento("button", "botonAgregarProducto", "Agregar al carrito");
    botonAgregar.type = "button";
    botonAgregar.addEventListener("click", function () { funcionAgregarAlCarrito(producto.codigo); });
    tarjeta.appendChild(botonAgregar);
    contenedor.appendChild(tarjeta);
  });
}

/* ===== CARRITO ===== */
function funcionAgregarAlCarrito(codigoProducto) {
  const existente = itemsDelCarrito.find(function (i) { return i.codigo === codigoProducto; });
  if (existente) existente.cantidad += 1; else itemsDelCarrito.push({ codigo: codigoProducto, cantidad: 1 });
  funcionRenderizarCarrito();
  funcionAbrirPanelCarrito();
}
function funcionCambiarCantidad(codigoProducto, variacion) {
  const item = itemsDelCarrito.find(function (i) { return i.codigo === codigoProducto; });
  if (!item) return;
  item.cantidad += variacion;
  itemsDelCarrito = itemsDelCarrito.filter(function (i) { return i.cantidad > 0; });
  funcionRenderizarCarrito();
}
function funcionCalcularSubtotal() {
  return itemsDelCarrito.reduce(function (suma, item) {
    const producto = listaProductosTienda.find(function (p) { return p.codigo === item.codigo; });
    return suma + producto.precio * item.cantidad;
  }, 0);
}
function funcionRenderizarCarrito() {
  const lista = document.getElementById("listaItemsCarrito");
  lista.innerHTML = "";
  if (itemsDelCarrito.length === 0) lista.appendChild(funcionCrearElemento("li", "mensajeCarritoVacio", "Todavía no agregaste nada 🌾"));
  itemsDelCarrito.forEach(function (item) {
    const producto = listaProductosTienda.find(function (p) { return p.codigo === item.codigo; });
    const fila = funcionCrearElemento("li", "itemCarrito");
    fila.appendChild(funcionCrearElemento("span", "", producto.icono + " " + producto.nombre + " · " + funcionFormatearPrecio(producto.precio * item.cantidad)));
    const controles = funcionCrearElemento("span", "controlesCantidad");
    const botonMenos = funcionCrearElemento("button", "botonCantidad", "−");
    const botonMas = funcionCrearElemento("button", "botonCantidad", "+");
    botonMenos.type = "button"; botonMas.type = "button";
    botonMenos.addEventListener("click", function () { funcionCambiarCantidad(item.codigo, -1); });
    botonMas.addEventListener("click", function () { funcionCambiarCantidad(item.codigo, 1); });
    controles.append(botonMenos, funcionCrearElemento("span", "", String(item.cantidad)), botonMas);
    fila.appendChild(controles);
    lista.appendChild(fila);
  });
  document.getElementById("contadorItemsCarrito").textContent = String(itemsDelCarrito.reduce(function (s, i) { return s + i.cantidad; }, 0));
  funcionActualizarResumenPedido();
  funcionGuardarCarrito();
}
function funcionActualizarResumenPedido() {
  const subtotal = funcionCalcularSubtotal();
  const descuento = subtotal * porcentajeDescuentoAplicado;
  const envio = itemsDelCarrito.length ? Number(document.getElementById("selectorZonaEntrega").value) : 0;
  document.getElementById("textoSubtotal").textContent = funcionFormatearPrecio(subtotal);
  document.getElementById("textoDescuento").textContent = "-" + funcionFormatearPrecio(descuento);
  document.getElementById("textoEnvio").textContent = funcionFormatearPrecio(envio);
  document.getElementById("textoTotalPedido").textContent = funcionFormatearPrecio(subtotal - descuento + envio);
}

/* ===== PANEL LATERAL ===== */
function funcionAbrirPanelCarrito() {
  document.getElementById("panelCarritoLateral").classList.add("panelAbierto");
  document.getElementById("fondoPanelCarrito").classList.add("fondoPanelVisible");
}
function funcionCerrarPanelCarrito() {
  document.getElementById("panelCarritoLateral").classList.remove("panelAbierto");
  document.getElementById("fondoPanelCarrito").classList.remove("fondoPanelVisible");
}

/* ===== CUPÓN Y VALIDACIONES DE CHECKOUT ===== */
function funcionAplicarCupon() {
  const codigo = document.getElementById("campoCuponDescuento").value.trim().toUpperCase();
  const mensaje = document.getElementById("mensajeCupon");
  if (listaCuponesValidos[codigo]) { porcentajeDescuentoAplicado = listaCuponesValidos[codigo]; mensaje.textContent = "Cupón aplicado: " + (porcentajeDescuentoAplicado * 100) + "% de descuento."; }
  else { porcentajeDescuentoAplicado = 0; mensaje.textContent = "Cupón inválido."; }
  funcionActualizarResumenPedido();
}
function funcionMostrarError(idCampo, idError, mensaje) {
  document.getElementById(idError).textContent = mensaje;
  document.getElementById(idCampo).classList.toggle("campoConErrorFormulario", mensaje !== "");
  return mensaje === "";
}
function funcionValidarCheckout() {
  const nombre = document.getElementById("campoNombreCliente").value.trim();
  const email = document.getElementById("campoEmailCliente").value.trim();
  const nombreValido = funcionMostrarError("campoNombreCliente", "errorNombreCliente", nombre.length < 2 ? "Ingresá tu nombre." : "");
  const emailValido = funcionMostrarError("campoEmailCliente", "errorEmailCliente", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Ingresá un email válido.");
  return nombreValido && emailValido;
}
function funcionConfirmarPedido(evento) {
  evento.preventDefault();
  const mensaje = document.getElementById("mensajeConfirmacionPedido");
  if (itemsDelCarrito.length === 0) { mensaje.textContent = "Agregá al menos un producto."; return; }
  if (!funcionValidarCheckout()) { mensaje.textContent = ""; return; }
  const medioPago = document.querySelector("input[name='medioPago']:checked").value;
  mensaje.textContent = "¡Gracias " + document.getElementById("campoNombreCliente").value.trim() + "! Pedido simulado con pago por " + medioPago + " (demo, no se envía).";
  itemsDelCarrito = [];
  funcionRenderizarCarrito();
}

/* ===== EVENTOS E INICIO ===== */
document.getElementById("botonAbrirCarrito").addEventListener("click", funcionAbrirPanelCarrito);
document.getElementById("botonCerrarCarrito").addEventListener("click", funcionCerrarPanelCarrito);
document.getElementById("fondoPanelCarrito").addEventListener("click", funcionCerrarPanelCarrito);
document.getElementById("botonAplicarCupon").addEventListener("click", funcionAplicarCupon);
document.getElementById("selectorZonaEntrega").addEventListener("change", funcionActualizarResumenPedido);
document.getElementById("campoBusquedaProducto").addEventListener("input", funcionRenderizarProductos);
document.getElementById("selectorOrdenProductos").addEventListener("change", funcionRenderizarProductos);
document.getElementById("formularioCheckout").addEventListener("submit", funcionConfirmarPedido);

funcionCargarCarrito();
funcionRenderizarFiltros();
funcionRenderizarProductos();
funcionRenderizarCarrito();

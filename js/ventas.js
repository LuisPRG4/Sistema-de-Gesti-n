const clientes = JSON.parse(localStorage.getItem("clientes")) || []; 
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editVentaIndex = null;


function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));
}

function cargarClientes() {
  const select = document.getElementById("clienteVenta");
  select.innerHTML = '<option value="">Selecciona un cliente</option>';
  clientes.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente.nombre;
    option.textContent = `${cliente.nombre} (${cliente.telefono || "sin número"})`;
    select.appendChild(option);
  });
}

function mostrarOpcionesPago() {
  const tipo = document.getElementById("tipoPago").value;
  document.getElementById("opcionesContado").style.display = tipo === "contado" ? "block" : "none";
  document.getElementById("opcionesCredito").style.display = tipo === "credito" ? "block" : "none";
}

function registrarVenta() {
  const cliente = document.getElementById("clienteVenta").value.trim();
  const producto = document.getElementById("productoVenta").value.trim();
  const monto = parseFloat(document.getElementById("montoVenta").value.trim());
  const tipoPago = document.getElementById("tipoPago").value;

  if (!cliente || !producto || isNaN(monto) || !tipoPago) {
    alert("Completa todos los campos principales.");
    return;
  }

  let detallePago = {};

  if (tipoPago === "contado") {
    const metodo = document.getElementById("metodoContado").value;
    if (!metodo) {
      alert("Selecciona el método de pago.");
      return;
    }
    detallePago = { metodo };
  } else if (tipoPago === "credito") {
    const acreedor = document.getElementById("acreedor").value.trim();
    const fechaVencimiento = document.getElementById("fechaVencimiento").value;
    if (!acreedor || !fechaVencimiento) {
      alert("Completa los datos de crédito.");
      return;
    }
    detallePago = { acreedor, fechaVencimiento };
  }

  const productoEncontrado = productos.find(p => p.nombre === producto);
  if (!productoEncontrado) {
    alert("El producto no existe en inventario.");
    return;
  }

  // Si es una nueva venta, validamos el stock
  if (editVentaIndex === null && productoEncontrado.stock < 1) {
    alert("No hay suficiente stock para este producto.");
    return;
  }

  const nuevaVenta = { cliente, producto, monto, tipoPago, detallePago };

  if (editVentaIndex !== null) {
  ventas[editVentaIndex] = nuevaVenta;
  mostrarToast("Venta actualizada ✅");
  editVentaIndex = null;
  document.getElementById("btnRegistrarVenta").textContent = "Registrar Venta";
} else {
  ventas.push(nuevaVenta);
  actualizarInventarioAlVender(producto, 1); // ✅ Aquí la colocas
  mostrarToast("Venta registrada con éxito");
}

  guardarVentas();
  mostrarVentas();
  limpiarFormulario();
}


function mostrarVentas(filtradas = ventas) {
  const lista = document.getElementById("listaVentas");
  lista.innerHTML = "";

  filtradas.forEach((venta, index) => {
    let detalle = "";
    if (venta.tipoPago === "contado") {
      detalle = `Método: ${venta.detallePago.metodo}`;
    } else {
      detalle = `Acreedor: ${venta.detallePago.acreedor}<br>Vence: ${venta.detallePago.fechaVencimiento}`;
    }

    const li = document.createElement("li");
    li.innerHTML = `
    <strong>${venta.cliente}</strong><br>
    Producto: ${venta.producto}<br>
    Monto: $${venta.monto.toFixed(2)}<br>
    Pago: ${venta.tipoPago}<br>
    ${detalle}<br>
    <button onclick="cargarVenta(${index})">✏️ Editar</button>
    <button onclick="revertirVenta(${index})">↩️ Revertir</button>
    `;

    lista.appendChild(li);
  });
}

function filtrarVentas() {
  const filtro = document.getElementById("buscadorVentas").value.toLowerCase();

  const resultados = ventas.filter(venta =>
    venta.cliente.toLowerCase().includes(filtro) ||
    venta.producto.toLowerCase().includes(filtro) ||
    venta.monto.toString().includes(filtro) ||
    venta.tipoPago.toLowerCase().includes(filtro)
  );

  mostrarVentas(resultados);
}

function eliminarVenta(index) {
  if (confirm("¿Eliminar esta venta?")) {
    ventas.splice(index, 1);
    guardarVentas();
    mostrarVentas();
    mostrarToast("Venta eliminada");
  }
}

function limpiarFormulario() {
  document.getElementById("clienteVenta").value = "";
  document.getElementById("productoVenta").value = "";
  document.getElementById("montoVenta").value = "";
  document.getElementById("tipoPago").value = "";
  document.getElementById("metodoContado").value = "";
  document.getElementById("acreedor").value = "";
  document.getElementById("fechaVencimiento").value = "";
  mostrarOpcionesPago(); // Oculta todo
  editVentaIndex = null;
  document.getElementById("btnRegistrarVenta").textContent = "Registrar Venta";
}

function mostrarToast(mensaje) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function actualizarInventarioAlVender(productoNombre, cantidadVendida = 1) {
  let productos = JSON.parse(localStorage.getItem("productos")) || [];
  const index = productos.findIndex(p => p.nombre === productoNombre);
  if (index !== -1) {
    // Restar stock y sumar vendidos
    productos[index].stock = Math.max(0, productos[index].stock - cantidadVendida);
    productos[index].vendidos = (productos[index].vendidos || 0) + cantidadVendida;

    localStorage.setItem("productos", JSON.stringify(productos));
  }
}

function revertirVenta(index) {
  const venta = ventas[index];
  if (!venta) return;

  const motivo = prompt("¿Por qué deseas revertir esta venta?");
  if (motivo === null || motivo.trim() === "") {
    alert("Debes ingresar un motivo para revertir la venta.");
    return;
  }

  if (confirm(`¿Seguro que quieres revertir la venta de ${venta.producto} a ${venta.cliente}?\nMotivo: ${motivo}`)) {
    // Devolver stock y restar vendidos
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
    const prodIndex = productos.findIndex(p => p.nombre === venta.producto);
    if (prodIndex !== -1) {
      productos[prodIndex].stock += 1;
      productos[prodIndex].vendidos = Math.max(0, (productos[prodIndex].vendidos || 1) - 1);
      localStorage.setItem("productos", JSON.stringify(productos));
    }

    // Eliminar venta
    ventas.splice(index, 1);
    guardarVentas();
    mostrarVentas();
    mostrarToast("Venta revertida y stock actualizado");
  }
}

function cargarVenta(index) {
  const venta = ventas[index];
  if (!venta) return;

  document.getElementById("clienteVenta").value = venta.cliente;
  document.getElementById("productoVenta").value = venta.producto;
  document.getElementById("montoVenta").value = venta.monto;
  document.getElementById("tipoPago").value = venta.tipoPago;
  mostrarOpcionesPago();

  if (venta.tipoPago === "contado") {
    document.getElementById("metodoContado").value = venta.detallePago.metodo;
  } else {
    document.getElementById("acreedor").value = venta.detallePago.acreedor;
    document.getElementById("fechaVencimiento").value = venta.detallePago.fechaVencimiento;
  }

  editVentaIndex = index;
  document.getElementById("btnRegistrarVenta").textContent = "Actualizar Venta";
}

function cargarProductos() {
  const select = document.getElementById("productoVenta");
  select.innerHTML = '<option value="">Selecciona un producto</option>';
  productos.forEach(producto => {
    const option = document.createElement("option");
    option.value = producto.nombre;
    option.textContent = `${producto.nombre} (${producto.stock} en stock)`;
    select.appendChild(option);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  mostrarVentas();
  mostrarOpcionesPago();
  cargarClientes(); // 👉 esto es lo que llena el select
  cargarProductos(); // 👉 ahora también carga productos
});

let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));
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

  ventas.push({ cliente, producto, monto, tipoPago, detallePago });
  guardarVentas();
  mostrarVentas();
  limpiarFormulario();
  mostrarToast("Venta registrada con éxito");
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
      <button onclick="eliminarVenta(${index})">Eliminar</button>
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

document.addEventListener("DOMContentLoaded", () => {
  mostrarVentas();
  mostrarOpcionesPago();
});
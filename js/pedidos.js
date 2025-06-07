let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];

function guardarPedidos() {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function cargarProductos() {
  const select = document.getElementById("producto");
  select.innerHTML = "";

  productos.forEach((p, i) => {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = p.nombre;
    select.appendChild(option);
  });
}

function agregarPedido() {
  const cliente = document.getElementById("cliente").value.trim();
  const indexProducto = parseInt(document.getElementById("producto").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precioUnitario = parseFloat(document.getElementById("precioUnitario").value);

  if (!cliente || isNaN(indexProducto) || isNaN(cantidad) || isNaN(precioUnitario)) {
    mostrarToast("Completa todos los campos correctamente ⚠️");
    return;
  }

  const producto = productos[indexProducto];

  const pedido = {
    cliente,
    producto: producto.nombre,
    cantidad,
    precioUnitario,
    total: cantidad * precioUnitario,
    estado: "Pendiente"
  };

  pedidos.push(pedido);
  guardarPedidos();
  mostrarPedidos();

  mostrarToast("Pedido agregado 🧾");

  // Limpiar campos
  document.getElementById("cliente").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("precioUnitario").value = "";
}

function mostrarPedidos() {
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  pedidos.forEach((p, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.cliente}</strong> - ${p.producto} x ${p.cantidad} = $${p.total.toFixed(2)}
      <br>Estado: <select onchange="cambiarEstado(${index}, this.value)">
        <option ${p.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
        <option ${p.estado === "Preparado" ? "selected" : ""}>Preparado</option>
        <option ${p.estado === "Entregado" ? "selected" : ""}>Entregado</option>
      </select>
    `;
    lista.appendChild(li);
  });
}

function cambiarEstado(index, nuevoEstado) {
  pedidos[index].estado = nuevoEstado;
  guardarPedidos();
  mostrarToast(`Estado actualizado a "${nuevoEstado}" 🔄`);
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
  cargarProductos();
  mostrarPedidos();
});

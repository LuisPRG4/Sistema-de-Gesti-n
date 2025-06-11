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

  if (!cliente) {
    mostrarToast("Selecciona un cliente válido ⚠️");
    return;
  }

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

function cargarClientesList() {
  const dataList = document.getElementById("clientesList");
  dataList.innerHTML = "";
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  clientes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.nombre;
    dataList.appendChild(option);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarClientesList(); // aquí
  mostrarPedidos();

  const clienteInput = document.getElementById("cliente");
  const sugerenciasContainer = document.createElement("div");
  sugerenciasContainer.id = "sugerenciasClientes";
  sugerenciasContainer.style.position = "absolute";
  sugerenciasContainer.style.zIndex = "1000";
  sugerenciasContainer.style.background = "white";
  sugerenciasContainer.style.border = "1px solid #ccc";
  sugerenciasContainer.style.width = clienteInput.offsetWidth + "px";
  sugerenciasContainer.style.maxHeight = "150px";
  sugerenciasContainer.style.overflowY = "auto";
  sugerenciasContainer.style.display = "none";

  clienteInput.parentNode.insertBefore(sugerenciasContainer, clienteInput.nextSibling);

  clienteInput.addEventListener("input", () => {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const termino = clienteInput.value.toLowerCase();
    sugerenciasContainer.innerHTML = "";

    if (!termino) {
      sugerenciasContainer.style.display = "none";
      return;
    }

    const coincidencias = clientes.filter(c =>
      c.nombre.toLowerCase().includes(termino)
    );

    if (coincidencias.length > 0) {
      coincidencias.forEach(c => {
        const div = document.createElement("div");
        div.textContent = c.nombre;
        div.style.padding = "5px";
        div.style.cursor = "pointer";
        div.addEventListener("click", () => {
          clienteInput.value = c.nombre;
          sugerenciasContainer.style.display = "none";
        });
        sugerenciasContainer.appendChild(div);
      });
    } else {
      const div = document.createElement("div");
      div.innerHTML = `<span style="color: gray">Cliente no encontrado.</span> <button style="margin-left: 10px; background-color: #5b2d90; color: white; border: none; padding: 5px; cursor: pointer;" onclick="window.location.href='clientes.html'">+ Agregar</button>`;
      div.style.padding = "5px";
      sugerenciasContainer.appendChild(div);
    }

    sugerenciasContainer.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!sugerenciasContainer.contains(e.target) && e.target !== clienteInput) {
      sugerenciasContainer.style.display = "none";
    }
  });
});

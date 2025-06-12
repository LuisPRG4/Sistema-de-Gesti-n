// Cargar pedidos y productos desde localStorage o iniciar vacíos
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Guardar pedidos en localStorage
function guardarPedidos() {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

// Guardar productos en localStorage (cuando se actualice stock)
function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

// Cargar productos para el <select> de productos
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

// Agregar un nuevo pedido
function agregarPedido() {
  const cliente = document.getElementById("cliente").value.trim();
  const indexProducto = parseInt(document.getElementById("producto").value);
  const cantidad = parseInt(document.getElementById("cantidad").value);

  // Validar campos
  if (!cliente || isNaN(indexProducto) || isNaN(cantidad) || cantidad <= 0) {
    mostrarToast("Completa todos los campos correctamente ⚠️");
    return;
  }

  const producto = productos[indexProducto];

  // Verificar stock suficiente
  if (producto.stock < cantidad) {
    mostrarToast("No hay suficiente stock disponible 😢");
    return;
  }

  const precioUnitario = producto.precio;

  // Descontar stock y guardar
  productos[indexProducto].stock -= cantidad;
  guardarProductos();

  // Crear pedido con indexProducto para control futuro
  const pedido = {
    cliente,
    producto: producto.nombre,
    cantidad,
    precioUnitario,
    total: producto.precio * cantidad,
    estado: "Pendiente",
    indexProducto
  };

  pedidos.push(pedido);
  guardarPedidos();
  mostrarPedidos();

  mostrarToast("Pedido agregado y stock actualizado 🧾");

  // Limpiar inputs
  document.getElementById("cliente").value = "";
  document.getElementById("cantidad").value = "";
  document.getElementById("precioUnitario").value = "";
}

// Eliminar pedido y revertir stock solo si NO está entregado
function eliminarPedido(index) {
  const pedido = pedidos[index];
  if (pedido.estado !== "Entregado") {
    const indexProducto = pedido.indexProducto;
    const cantidad = pedido.cantidad;
    productos[indexProducto].stock += cantidad;
    guardarProductos();
  }
  pedidos.splice(index, 1);
  guardarPedidos();
  mostrarPedidos();

  mostrarToast("Pedido eliminado" + (pedido.estado !== "Entregado" ? " y stock revertido ❌" : " ❌"));
}

// Mostrar lista de pedidos en HTML
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
      <button onclick="eliminarPedido(${index})" style="margin-left:10px; background-color:#e74c3c; color:white; border:none; padding:5px; cursor:pointer;">Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

// Cambiar estado del pedido
function cambiarEstado(index, nuevoEstado) {
  pedidos[index].estado = nuevoEstado;
  guardarPedidos();
  mostrarToast(`Estado actualizado a "${nuevoEstado}" 🔄`);
}

// Mostrar mensaje tipo toast (notificación pequeña)
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

// Cargar lista de clientes para autocompletar input
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

// Limpiar todos los pedidos sin afectar stock (porque no modificamos stock aquí)
function limpiarPedidos() {
  pedidos = [];
  guardarPedidos();
  mostrarPedidos();
  mostrarToast("Todos los pedidos borrados sin afectar inventario 🧹");
}

// Código que corre cuando la página termina de cargar (inicialización)
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  cargarClientesList();
  mostrarPedidos();

  // Botón para limpiar todos los pedidos (sin afectar stock)
  document.getElementById("btnLimpiarPedidos").addEventListener("click", () => {
    if (confirm("¿Seguro quieres borrar todos los pedidos? Esto no afectará el inventario.")) {
      limpiarPedidos();
    }
  });

  // Actualizar precio unitario y total al cambiar producto o cantidad
  document.getElementById("producto").addEventListener("change", actualizarPrecioUnitario);
  document.getElementById("cantidad").addEventListener("input", actualizarPrecioUnitario);

  function actualizarPrecioUnitario() {
    const indexProducto = parseInt(document.getElementById("producto").value);
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precioInput = document.getElementById("precioUnitario");

    if (!isNaN(indexProducto) && !isNaN(cantidad) && cantidad > 0) {
      const producto = productos[indexProducto];
      const total = producto.precio * cantidad;
      precioInput.value = total.toFixed(2);
    } else {
      precioInput.value = "";
    }
  }
});

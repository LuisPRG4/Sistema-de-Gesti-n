let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function mostrarProductos() {
  const lista = document.getElementById("listaProductos");
  lista.innerHTML = "";

  productos.forEach((producto, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${producto.imagen || 'https://via.placeholder.com/50'}" width="50" style="vertical-align:middle" />
      <strong>${producto.nombre}</strong> - Stock: ${producto.stock}, Vendidos: ${producto.vendidos}, 
      Proveedor: ${producto.proveedor || 'N/A'}
      <br>
      <button onclick="cargarProducto(${index})">✏️ Editar</button>
      <button onclick="eliminarProducto(${index})">🗑️ Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

function guardarProducto() {
  const nombre = document.getElementById("nombre").value.trim();
  const stock = parseInt(document.getElementById("stock").value);
  const vendidos = parseInt(document.getElementById("vendidos").value);
  const imagen = document.getElementById("imagen").value.trim();
  const proveedor = document.getElementById("proveedor").value.trim();

  if (nombre && !isNaN(stock) && !isNaN(vendidos)) {
    const nuevoProducto = { nombre, stock, vendidos, imagen, proveedor };

    if (editIndex === null) {
      productos.push(nuevoProducto);
      mostrarToast("Producto guardado ✅");
    } else {
      productos[editIndex] = nuevoProducto;
      editIndex = null;
      document.getElementById("btnGuardar").textContent = "Guardar";
      mostrarToast("Producto actualizado ✏️");
    }

    guardarProductos();
    mostrarProductos();
    limpiarCampos();
  } else {
    mostrarToast("Completa todos los campos correctamente ⚠️");
  }
}

function cargarProducto(index) {
  const producto = productos[index];
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("stock").value = producto.stock;
  document.getElementById("vendidos").value = producto.vendidos;
  document.getElementById("imagen").value = producto.imagen || "";
  document.getElementById("proveedor").value = producto.proveedor || "";
  editIndex = index;
  document.getElementById("btnGuardar").textContent = "Actualizar";
}

function eliminarProducto(index) {
  if (confirm("¿Eliminar este producto?")) {
    productos.splice(index, 1);
    guardarProductos();
    mostrarProductos();
    mostrarToast("Producto eliminado 🗑️");
  }
}

function limpiarCampos() {
  document.getElementById("nombre").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("vendidos").value = "";
  document.getElementById("imagen").value = "";
  document.getElementById("proveedor").value = "";
  document.getElementById("btnGuardar").textContent = "Guardar";
  editIndex = null;
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

document.addEventListener("DOMContentLoaded", mostrarProductos);

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function mostrarProductos(filtrados = productos) {
  const lista = document.getElementById("listaProductos");
  lista.innerHTML = "";

  filtrados.forEach((producto, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${producto.imagen || 'https://via.placeholder.com/50'}" width="50" style="vertical-align:middle" />
      <strong>${producto.nombre}</strong> - Stock: ${producto.stock}, Vendidos: ${producto.vendidos}, 
      Proveedor: ${producto.proveedor || 'N/A'},
      Costo: $${producto.costo ? producto.costo.toFixed(2) : '0.00'}, 
      Precio: $${producto.precio ? producto.precio.toFixed(2) : '0.00'}
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
  const costo = parseFloat(document.getElementById("costo").value);
  const precio = parseFloat(document.getElementById("precio").value);
  const proveedor = document.getElementById("proveedor").value.trim();
  const imagenInput = document.getElementById("imagen");
  const archivo = imagenInput.files[0];

  if (archivo) {
    const lector = new FileReader();
    lector.onload = function (e) {
      const imagenBase64 = e.target.result;
      guardarProductoFinal(nombre, stock, vendidos, costo, precio, imagenBase64, proveedor);
    };
    lector.readAsDataURL(archivo);
  } else {
    const imagenBase64 = editIndex !== null ? productos[editIndex].imagen : "";
    guardarProductoFinal(nombre, stock, vendidos, costo, precio, imagenBase64, proveedor);
  }

  // Validación después de llamar a guardarProductoFinal no es efectiva, la movemos arriba
  if (!nombre || isNaN(stock) || isNaN(vendidos) || isNaN(costo) || isNaN(precio) || stock < 0 || vendidos < 0 || costo < 0 || precio < 0) {
    mostrarToast("Completa todos los campos correctamente ⚠️");
    return;
  }
}

function guardarProductoFinal(nombre, stock, vendidos, costo, precio, imagen, proveedor) {
  if (
    nombre &&
    !isNaN(stock) &&
    !isNaN(vendidos) &&
    !isNaN(costo) &&
    !isNaN(precio)
  ) {
    const nuevoProducto = { nombre, stock, vendidos, costo, precio, imagen, proveedor };

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
  
  document.getElementById("proveedor").value = producto.proveedor || "";
  editIndex = index;
    const preview = document.getElementById("imagenPreview");
      preview.src = producto.imagen || "";
      preview.style.display = producto.imagen ? "block" : "none";

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

  const preview = document.getElementById("imagenPreview");
  preview.src = "";
  preview.style.display = "none";
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

function cargarProveedores() {
  const select = document.getElementById("proveedor");
  const proveedoresGuardados = JSON.parse(localStorage.getItem("proveedores")) || [];

  // Limpiar el select antes de llenarlo
  select.innerHTML = '<option value="">Seleccione un proveedor</option>';

  // Agregar opción especial "Los SS"
  const optionSS = document.createElement("option");
  optionSS.value = "los_ss";  // valor que quieras darle
  optionSS.textContent = "Los SS";
  select.appendChild(optionSS);

  proveedoresGuardados.forEach(p => {
    const option = document.createElement("option");
    option.value = p.nombre;
    option.textContent = p.nombre;
    select.appendChild(option);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  mostrarProductos();
  cargarProveedores();

  document.getElementById("imagen").addEventListener("change", function () {
    const archivo = this.files[0];
    const preview = document.getElementById("imagenPreview");

    if (archivo) {
      const lector = new FileReader();
      lector.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      lector.readAsDataURL(archivo);
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  });
});
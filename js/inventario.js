let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editIndex = null;

function guardarProductos() {
  localStorage.setItem("productos", JSON.stringify(productos));
}

function mostrarProductos(filtrados = productos) {
  const lista = document.getElementById("listaProductos");
  lista.innerHTML = "";

  filtrados.forEach((producto, index) => {
    const card = document.createElement("div");
    card.className = "producto-card";

    card.innerHTML = `
      <img src="${producto.imagen || 'https://via.placeholder.com/80'}" alt="Imagen" class="producto-imagen" />
      <h3>${producto.nombre}</h3>
      <p><strong>Stock:</strong> ${producto.stock}</p>
      <p><strong>Vendidos:</strong> ${producto.vendidos}</p>
      <p><strong>Proveedor:</strong> ${producto.proveedor || "N/A"}</p>
      <p><strong>Costo:</strong> $${producto.costo?.toFixed(2) || "0.00"}</p>
      <p><strong>Precio:</strong> $${producto.precio?.toFixed(2) || "0.00"}</p>
      <div class="botones-producto">
        <button onclick="cargarProducto(${index})" class="btn-editar">✏️ Editar</button>
        <button onclick="eliminarProducto(${index})" class="btn-eliminar">🗑️ Eliminar</button>
      </div>
    `;

    lista.appendChild(card);
  });
}

function guardarProducto() {
  const nombre = document.getElementById("nombre").value.trim();
  const stock = parseInt(document.getElementById("stock").value) || 0;
  const vendidos = parseInt(document.getElementById("vendidos").value) || 0;
  const costo = parseFloat(document.getElementById("costo").value) || 0;
  const precio = parseFloat(document.getElementById("precio").value) || 0;
  const proveedor = document.getElementById("proveedor").value.trim();
  const imagenInput = document.getElementById("imagen");
  const archivo = imagenInput.files[0];

  if (!nombre) {
    mostrarToast("El nombre del producto es obligatorio ⚠️", "error");
    return;
  }

  if (stock < 0 || vendidos < 0 || costo < 0 || precio < 0) {
    mostrarToast("Los valores no pueden ser negativos ⚠️", "error");
    return;
  }

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
}

function guardarProductoFinal(nombre, stock, vendidos, costo, precio, imagen, proveedor) {
  if (!nombre) {
    mostrarToast("El nombre del producto es obligatorio ⚠️");
    return;
  }

  // Aseguramos que valores vacíos o inválidos se conviertan en 0
  stock = isNaN(stock) ? 0 : stock;
  vendidos = isNaN(vendidos) ? 0 : vendidos;
  costo = isNaN(costo) ? 0 : costo;
  precio = isNaN(precio) ? 0 : precio;

  // Validamos que no haya valores negativos
  if (stock < 0 || vendidos < 0 || costo < 0 || precio < 0) {
    mostrarToast("Los valores no pueden ser negativos ⚠️");
    return;
  }

  const nuevoProducto = {
    nombre,
    stock,
    vendidos,
    costo,
    precio,
    imagen,
    proveedor
  };

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
  document.getElementById("costo").value = ""; // 🟣 Agregado
  document.getElementById("precio").value = ""; // 🟣 Agregado
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

  // Agregar opción especial "Propio"
  const optionSS = document.createElement("option");
  optionSS.value = "propio";  // valor que quieras darle
  optionSS.textContent = "Propio";
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

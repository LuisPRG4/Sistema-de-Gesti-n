let proveedores = JSON.parse(localStorage.getItem("proveedores")) || [];

function guardarProveedores() {
  localStorage.setItem("proveedores", JSON.stringify(proveedores));
}

function agregarProveedor() {
  const nombre = document.getElementById("nombreProveedor").value.trim();
  const empresa = document.getElementById("empresa").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const productos = document.getElementById("productos").value.trim();
  
  
  if (nombre && empresa && telefono && productos) {
    proveedores.push({ nombre, empresa, telefono, productos });
    guardarProveedores();
    mostrarProveedores();
    limpiarFormulario();
    mostrarToast("Proveedor agregado con éxito");
  } else {
    alert("Completa todos los campos.");
  }
}

function mostrarProveedores(filtrados = proveedores) {
  const lista = document.getElementById("listaProveedores");
  lista.innerHTML = "";

  filtrados.forEach((proveedor, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${proveedor.nombre}</strong><br>
      Empresa: ${proveedor.empresa}<br>
      Telefono: ${proveedor.telefono}<br>
      Productos: ${proveedor.productos}<br>
      <button onclick="eliminarProveedor(${index})">Eliminar</button>
    `;
    lista.appendChild(li);
  });
}

function filtrarProveedores() {
  const filtro = document.getElementById("buscadorProveedores").value.toLowerCase();

  const resultados = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(filtro) ||
    proveedor.empresa.toLowerCase().includes(filtro) ||
    proveedor.telefono.toLowerCase().includes(filtro) ||
    proveedor.productos.toLowerCase().includes(filtro)
  );

  mostrarProveedores(resultados);
}

function eliminarProveedor(index) {
  if (confirm("¿Eliminar este proveedor?")) {
    proveedores.splice(index, 1);
    guardarProveedores();
    mostrarProveedores();
    mostrarToast("Proveedor eliminado");
  }
}

function limpiarFormulario() {
  document.getElementById("nombreProveedor").value = "";
  document.getElementById("contacto").value = "";
  document.getElementById("productos").value = "";
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

document.addEventListener("DOMContentLoaded", mostrarProveedores);

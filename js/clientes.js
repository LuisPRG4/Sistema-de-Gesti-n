let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

function guardarClientes() {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

function agregarCliente() {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const direccion = document.getElementById("direccion").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!nombre) {
    mostrarToast("El nombre del cliente es obligatorio ⚠️");
    return;
  }

  clientes.push({ nombre, direccion, telefono, email });
  guardarClientes();
  mostrarClientes();
  limpiarFormulario();
  mostrarToast("Cliente agregado 💼");
}

// FUNCIÓN ACTUALIZADA EL JUEVES 12 DE JUNIO DE 2025 PARA MEJORAR EL DISEÑO
function mostrarClientes() {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  clientes.forEach((cliente, index) => {
    const card = document.createElement("div");
    card.className = "cliente-card";

    card.innerHTML = `
      <h3>${cliente.nombre}</h3>
      <p><strong>Dirección:</strong> ${cliente.direccion || "No especificada"}</p>
      <p><strong>Teléfono:</strong> ${cliente.telefono || "No especificado"}</p>
      <p><strong>Email:</strong> ${cliente.email || "No especificado"}</p>
      <button onclick="eliminarCliente(${index})" class="btn-eliminar">Eliminar</button>
    `;

    lista.appendChild(card);
  });
}


function filtrarClientes() {
  const filtro = document.getElementById("buscadorClientes").value.toLowerCase();
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";

  clientes.forEach((cliente, index) => {
    const coincide = cliente.nombre.toLowerCase().includes(filtro) ||
                     cliente.direccion.toLowerCase().includes(filtro) ||
                     cliente.telefono.toLowerCase().includes(filtro) ||
                     cliente.email.toLowerCase().includes(filtro);
    
    if (coincide) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${cliente.nombre}</strong><br>
        Dirección: ${cliente.direccion}<br>
        Tel: ${cliente.telefono}<br>
        Email: ${cliente.email}<br>
        <button onclick="eliminarCliente(${index})">Eliminar</button>
      `;
      lista.appendChild(li);
    }
  });
}

function eliminarCliente(index) {
  if (confirm("¿Eliminar este cliente?")) {
    clientes.splice(index, 1);
    guardarClientes();
    mostrarClientes();
    mostrarToast("Cliente eliminado 🗑️");
  }
}


function limpiarFormulario() {
  document.getElementById("nombreCliente").value = "";
  document.getElementById("direccion").value = "";
  document.getElementById("telefono").value = "";
  document.getElementById("email").value = "";
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

document.addEventListener("DOMContentLoaded", mostrarClientes);

let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

function guardarMovimientos() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function agregarMovimiento() {
  const tipo = document.getElementById("tipoMovimiento").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha = new Date().toLocaleDateString();

  if (!isNaN(monto) && descripcion) {
    movimientos.push({ tipo, monto, descripcion, fecha });
    guardarMovimientos();
    mostrarMovimientos();
    mostrarToast("Movimiento guardado 💸");

    document.getElementById("monto").value = "";
    document.getElementById("descripcion").value = "";
  } else {
    mostrarToast("Completa todos los campos correctamente ⚠️");
  }
}

function mostrarMovimientos() {
  const lista = document.getElementById("listaMovimientos");
  const balance = document.getElementById("balanceTotal");
  lista.innerHTML = "";

  let total = 0;

  movimientos.forEach((mov, index) => {
    total += mov.tipo === "Ingreso" ? mov.monto : -mov.monto;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${mov.tipo}:</strong> $${mov.monto.toFixed(2)} - ${mov.descripcion} (${mov.fecha})
      <button onclick="eliminarMovimiento(${index})">🗑️</button>
    `;
    lista.appendChild(li);
  });

  balance.textContent = `Balance total: $${total.toFixed(2)}`;
}

function eliminarMovimiento(index) {
  if (confirm("¿Eliminar este movimiento?")) {
    movimientos.splice(index, 1);
    guardarMovimientos();
    mostrarMovimientos();
    mostrarToast("Movimiento eliminado 🗑️");
  }
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

function mostrarGrafico() {
  const ingresos = movimientos.filter(m => m.tipo === "Ingreso").reduce((acc, m) => acc + m.monto, 0);
  const gastos = movimientos.filter(m => m.tipo === "Gasto").reduce((acc, m) => acc + m.monto, 0);

  const ctx = document.getElementById("graficoFinanzas").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ingresos", "Gastos"],
      datasets: [{
        data: [ingresos, gastos],
        backgroundColor: ["#38a169", "#e53e3e"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        }
      }
    }
  });
}


document.addEventListener("DOMContentLoaded", () => {
  mostrarMovimientos();
  mostrarGrafico();
});

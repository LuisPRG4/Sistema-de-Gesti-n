let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let indiceEditando = null;

function guardarMovimientos() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function agregarMovimiento() {
  const tipo = document.getElementById("tipoMovimiento").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha = new Date().toLocaleDateString();


  if (!isNaN(monto) && descripcion) {
    if (indiceEditando !== null) {
      // Editar movimiento existente
      movimientos[indiceEditando] = { tipo, monto, descripcion, fecha };
      mostrarToast("Movimiento editado ✏️");
      indiceEditando = null;
    } else {
      // Agregar nuevo
      movimientos.push({ tipo, monto, descripcion, fecha });
      mostrarToast("Movimiento guardado 💸");
    }

    guardarMovimientos();
    mostrarMovimientos();
    mostrarResumenFinanciero();
    document.getElementById("monto").value = "";
    document.getElementById("descripcion").value = "";
  } else {
    mostrarToast("Completa todos los campos correctamente ⚠️");
  }
}

function editarMovimiento(index) {
  const mov = movimientos[index];
  document.getElementById("tipoMovimiento").value = mov.tipo;
  document.getElementById("monto").value = mov.monto;
  document.getElementById("descripcion").value = mov.descripcion;
  indiceEditando = index;
  mostrarToast("Editando movimiento 📝");
}


function mostrarMovimientos(lista = movimientos) {
  const listaElemento = document.getElementById("listaMovimientos");
  const balance = document.getElementById("balanceTotal");
  listaElemento.innerHTML = "";

  let total = 0;

  lista.forEach((mov, index) => {
    total += mov.tipo === "Ingreso" ? mov.monto : -mov.monto;

    const li = document.createElement("li");
    li.innerHTML = `
  <strong>${mov.tipo}:</strong> $${mov.monto.toFixed(2)} - ${mov.descripcion} (${mov.fecha})
  <button onclick="editarMovimiento(${index})">✏️</button>
  <button onclick="eliminarMovimiento(${index})">🗑️</button>
  `;
    listaElemento.appendChild(li);
  });

  balance.textContent = `Balance total: $${total.toFixed(2)}`;
}


function eliminarMovimiento(index) {
  if (confirm("¿Eliminar este movimiento?")) {
    movimientos.splice(index, 1);
    guardarMovimientos();
    mostrarMovimientos();
    mostrarResumenFinanciero();
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

function exportarExcel() {
  if (movimientos.length === 0) {
    mostrarToast("No hay movimientos para exportar ⚠️");
    return;
  }

  let csv = "Tipo,Monto,Descripción,Fecha\n";

  movimientos.forEach(mov => {
    csv += `${mov.tipo},${mov.monto},${mov.descripcion},"${mov.fecha}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "movimientos_financieros.csv");
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  mostrarToast("Movimientos exportados 🧾");
}


function filtrarPorFecha() {
  const desde = document.getElementById("fechaDesde").value;
  const hasta = document.getElementById("fechaHasta").value;

  if (!desde || !hasta) {
    mostrarToast("Por favor, selecciona ambas fechas para filtrar");
    return;
  }

  const desdeDate = new Date(desde);
  const hastaDate = new Date(hasta);

  if (desdeDate > hastaDate) {
    mostrarToast("La fecha 'Desde' debe ser menor o igual que la fecha 'Hasta'");
    return;
  }

  const lista = document.getElementById("listaMovimientos");
  lista.innerHTML = "";

  let total = 0;

  const filtrados = movimientos.filter(mov => {
    const fechaMov = new Date(mov.fecha);
    return fechaMov >= desdeDate && fechaMov <= hastaDate;
  });

  if (filtrados.length === 0) {
    lista.innerHTML = "<li>No hay movimientos en ese rango de fechas.</li>";
  } else {
    filtrados.forEach((mov, index) => {
      total += mov.tipo === "Ingreso" ? mov.monto : -mov.monto;
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${mov.tipo}:</strong> $${mov.monto.toFixed(2)} - ${mov.descripcion} (${mov.fecha})
        <button onclick="eliminarMovimiento(${index})">🗑️</button>
      `;
      lista.appendChild(li);
    });
  }

  document.getElementById("balanceTotal").textContent = `Balance total: $${total.toFixed(2)}`;
}

function limpiarFiltroFecha() {
  document.getElementById("fechaDesde").value = "";
  document.getElementById("fechaHasta").value = "";
  mostrarMovimientos();
}

function buscarMovimientos() {
  const texto = document.getElementById("buscadorMovimientos").value.toLowerCase();
  const filtrados = movimientos.filter(mov => 
    mov.descripcion.toLowerCase().includes(texto) || 
    mov.tipo.toLowerCase().includes(texto)
  );
  mostrarMovimientos(filtrados);
}

function mostrarResumenFinanciero() {
  const totalIngresos = movimientos
    .filter(m => m.tipo === "Ingreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalGastos = movimientos
    .filter(m => m.tipo === "Gasto")
    .reduce((acc, m) => acc + m.monto, 0);

  let mayor = null;
  movimientos.forEach(mov => {
    if (!mayor || mov.monto > mayor.monto) {
      mayor = mov;
    }
  });

  document.getElementById("totalIngresos").textContent = totalIngresos.toFixed(2);
  document.getElementById("totalGastos").textContent = totalGastos.toFixed(2);
  document.getElementById("movimientoMayor").textContent = mayor
    ? `${mayor.tipo} de $${mayor.monto.toFixed(2)} (${mayor.descripcion})`
    : "-";
}


document.addEventListener("DOMContentLoaded", () => {
  mostrarMovimientos();
  mostrarGrafico();
  mostrarResumenFinanciero();

});

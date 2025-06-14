// Variables y carga inicial
let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
let filtroFechaDesde = null;
let filtroFechaHasta = null;
let busquedaTexto = "";

const listaMovimientos = document.getElementById("listaMovimientos");
const totalIngresosElem = document.getElementById("totalIngresos");
const totalGastosElem = document.getElementById("totalGastos");
const gananciaTotalElem = document.getElementById("gananciaTotal");
const movimientoMayorElem = document.getElementById("movimientoMayor");
const balanceTotalElem = document.getElementById("balanceTotal");

let grafico = null;

function guardarMovimientos() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
}

function mostrarToast(mensaje) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensaje;
  toastContainer.appendChild(toast);

  // Forzar el reflow para que la animación con la clase show funcione
  // Añadimos la clase show para que se active la animación CSS
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Quitar el toast después de 3 segundos con animación
  setTimeout(() => {
    toast.classList.remove("show");
    // Después de la transición lo removemos del DOM
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function agregarMovimiento() {
  const tipo = document.getElementById("tipoMovimiento").value;
  const montoInput = document.getElementById("monto");
  const descripcionInput = document.getElementById("descripcion");

  const monto = parseFloat(montoInput.value);
  const descripcion = descripcionInput.value.trim();

  if (isNaN(monto) || monto <= 0) {
    mostrarToast("Ingresa un monto válido");
    return;
  }
  // if (!descripcion) {
  //  mostrarToast("Agrega una descripción");
  //  return;
  // }

  const nuevoMovimiento = {
    id: Date.now(),
    tipo,
    monto,
    descripcion,
    fecha: new Date().toISOString().slice(0, 10), // fecha YYYY-MM-DD hoy
  };

  movimientos.push(nuevoMovimiento);
  guardarMovimientos();
  mostrarMovimientos();
  mostrarResumenFinanciero();
  limpiarFormulario();
  mostrarToast("Movimiento guardado ✔️");
}

function limpiarFormulario() {
  document.getElementById("monto").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("tipoMovimiento").value = "Ingreso";
}

// Mostrar movimientos filtrados y buscados
function mostrarMovimientos() {
  listaMovimientos.innerHTML = "";

  let filtrados = movimientos.filter(mov => {
    // Filtrar por fecha
    let cumpleFecha = true;
    if (filtroFechaDesde) {
      cumpleFecha = cumpleFecha && (mov.fecha >= filtroFechaDesde);
    }
    if (filtroFechaHasta) {
      cumpleFecha = cumpleFecha && (mov.fecha <= filtroFechaHasta);
    }
    // Filtrar por texto
    const texto = busquedaTexto.toLowerCase();
    const descripcionLower = mov.descripcion.toLowerCase();
    const tipoLower = mov.tipo.toLowerCase();

    const cumpleTexto = descripcionLower.includes(texto) || tipoLower.includes(texto);

    return cumpleFecha && cumpleTexto;
  });

  if (filtrados.length === 0) {
    listaMovimientos.innerHTML = "<li>No hay movimientos que mostrar.</li>";
    return;
  }

  filtrados.forEach(mov => {
    const li = document.createElement("li");
    li.className = "movimiento-item";

    li.innerHTML = `
      <strong>${mov.tipo}</strong> - $${mov.monto.toFixed(2)} <br/>
      <em>${mov.descripcion}</em> <br/>
      <small>Fecha: ${mov.fecha}</small><br/>
      <button class="btn-editar" onclick="editarMovimiento(${mov.id})">✏️ Editar</button>
      <button class="btn-eliminar" onclick="eliminarMovimiento(${mov.id})">🗑️ Eliminar</button>
    `;
    listaMovimientos.appendChild(li);
  });
}

function mostrarResumenFinanciero() {
  const ingresos = movimientos.reduce((acc, mov) => mov.tipo === "Ingreso" ? acc + mov.monto : acc, 0);

  // Gastos manuales
  let gastosManuales = movimientos.reduce((acc, mov) => mov.tipo === "Gasto" ? acc + mov.monto : acc, 0);

  // Gastos del inventario
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const gastoInventario = productos.reduce((acc, prod) => acc + (parseFloat(prod.costo) || 0), 0);

  // Ganancia potencial: precio - costo de productos
  let gananciaPotencial = productos.reduce((acc, prod) => {
  const precio = parseFloat(prod.precio) || 0;
  const costo = parseFloat(prod.costo) || 0;
  return acc + (precio - costo);
  }, 0);


  // Suma total de gastos visibles + invisibles
  const gastosTotales = gastosManuales + gastoInventario;

  const ganancia = ingresos - gastosTotales;

  totalIngresosElem.textContent = ingresos.toFixed(2);
  totalGastosElem.textContent = gastosTotales.toFixed(2);
  gananciaTotalElem.textContent = ganancia.toFixed(2);
  balanceTotalElem.textContent = `Balance total: $${ganancia.toFixed(2)}`;
  
  // NUEVAS LÍNEA AÑADIDAS (13/05/2025) PARA PRECIOS
  const gananciaPotencialElem = document.getElementById("gananciaPotencial");
  gananciaPotencialElem.textContent = gananciaPotencial.toFixed(2);


  // Mostrar movimiento más alto
  if (movimientos.length === 0) {
    movimientoMayorElem.textContent = "-";
  } else {
    const mayor = movimientos.reduce((max, mov) => mov.monto > max.monto ? mov : max, movimientos[0]);
    movimientoMayorElem.textContent = `${mayor.tipo} - $${mayor.monto.toFixed(2)} (${mayor.descripcion})`;
  }

  // Mostrar explicación extra si hay costos desde inventario
  const gastoExtraExplicacion = document.getElementById("gastoExtraExplicacion");
  if (gastoInventario > 0) {
    gastoExtraExplicacion.textContent = `Incluye $${gastoInventario.toFixed(2)} de costos del inventario`;
  } else {
    gastoExtraExplicacion.textContent = "";
  }

  actualizarGrafico(ingresos, gastosTotales);
}

function actualizarGrafico(ingresos, gastos) {
  const ctx = document.getElementById("graficoFinanzas").getContext("2d");

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Ingresos", "Gastos"],
      datasets: [{
        data: [ingresos, gastos],
        backgroundColor: ["#6b46c1", "#e53e3e"],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// Filtrar por fecha
function filtrarPorFecha() {
  filtroFechaDesde = document.getElementById("fechaDesde").value || null;
  filtroFechaHasta = document.getElementById("fechaHasta").value || null;
  mostrarMovimientos();
  mostrarResumenFinanciero();
}

function limpiarFiltroFecha() {
  document.getElementById("fechaDesde").value = "";
  document.getElementById("fechaHasta").value = "";
  filtroFechaDesde = null;
  filtroFechaHasta = null;
  mostrarMovimientos();
  mostrarResumenFinanciero();
}

// Buscar movimientos
function buscarMovimientos() {
  busquedaTexto = document.getElementById("buscadorMovimientos").value.trim();
  mostrarMovimientos();
  mostrarResumenFinanciero();
}

// Eliminar movimiento
function eliminarMovimiento(id) {
  if (confirm("¿Eliminar este movimiento?")) {
    movimientos = movimientos.filter(mov => mov.id !== id);
    guardarMovimientos();
    mostrarMovimientos();
    mostrarResumenFinanciero();
    mostrarToast("Movimiento eliminado 🗑️");
  }
}

// Editar movimiento
function editarMovimiento(id) {
  const mov = movimientos.find(m => m.id === id);
  if (!mov) return;

  const nuevoTipo = prompt("Editar tipo (Ingreso/Gasto):", mov.tipo);
  if (nuevoTipo !== "Ingreso" && nuevoTipo !== "Gasto") {
    alert("Tipo inválido, edición cancelada");
    return;
  }

  const nuevoMontoStr = prompt("Editar monto:", mov.monto);
  const nuevoMonto = parseFloat(nuevoMontoStr);
  if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
    alert("Monto inválido, edición cancelada");
    return;
  }

  const nuevaDescripcion = prompt("Editar descripción:", mov.descripcion);
  if (!nuevaDescripcion) {
    alert("Descripción vacía, edición cancelada");
    return;
  }

  mov.tipo = nuevoTipo;
  mov.monto = nuevoMonto;
  mov.descripcion = nuevaDescripcion.trim();

  guardarMovimientos();
  mostrarMovimientos();
  mostrarResumenFinanciero();
  mostrarToast("Movimiento editado ✏️");
}

// Reiniciar todo
function reiniciarMovimientos() {
  if (confirm("¿Estás seguro de reiniciar todo el historial financiero? Esta acción no se puede deshacer.")) {
    movimientos = [];
    guardarMovimientos();
    mostrarMovimientos();
    mostrarResumenFinanciero();
    mostrarToast("Historial reiniciado 🔄");
  }
}

// Exportar a Excel simple
function exportarExcel() {
  if (movimientos.length === 0) {
    mostrarToast("No hay datos para exportar");
    return;
  }
  let csv = "Tipo,Monto,Descripción,Fecha\n";
  movimientos.forEach(mov => {
    // Escape comas en la descripción
    const descripcionEsc = mov.descripcion.replace(/,/g, " ");
    csv += `${mov.tipo},${mov.monto},${descripcionEsc},${mov.fecha}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "finanzas.csv";
  a.click();
  URL.revokeObjectURL(url);

  mostrarToast("Exportado a Excel (CSV) ✔️");
}

// Carga inicial al abrir la página
mostrarMovimientos();
mostrarResumenFinanciero();

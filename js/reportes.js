document.addEventListener("DOMContentLoaded", () => {
  generarGraficoTipoPago();
  generarGraficoPorProducto();
  generarGraficoPorCliente();
});

function obtenerVentas() {
  return JSON.parse(localStorage.getItem("ventas")) || [];
}

// 🎂 Tipo de pago
function generarGraficoTipoPago() {
  const ventas = obtenerVentas();
  const tipos = { contado: 0, credito: 0 };

  ventas.forEach(v => {
  if (v.tipoPago === "contado") tipos.contado++;
  else if (v.tipoPago === "credito") tipos.credito++;
});

  const ctx = document.getElementById("graficoTipoPago").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Contado", "Crédito"],
      datasets: [{
        data: [tipos.contado, tipos.credito],
        backgroundColor: ["#5b2d90", "#d1a7ff"]
      }]
    }
  });
}

// 🍹 Por producto
function generarGraficoPorProducto() {
  const ventas = obtenerVentas();
  const conteo = {};

  ventas.forEach(v => {
    conteo[v.producto] = (conteo[v.producto] || 0) + 1;
  });

  const ctx = document.getElementById("graficoProducto").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(conteo),
      datasets: [{
        data: Object.values(conteo),
        backgroundColor: generarColores(Object.keys(conteo).length)
      }]
    }
  });
}

// 👤 Por cliente
function generarGraficoPorCliente() {
  const ventas = obtenerVentas();
  const conteo = {};

  ventas.forEach(v => {
    conteo[v.cliente] = (conteo[v.cliente] || 0) + 1;
  });

  const ctx = document.getElementById("graficoCliente").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(conteo),
      datasets: [{
        data: Object.values(conteo),
        backgroundColor: generarColores(Object.keys(conteo).length)
      }]
    }
  });
}

// 🎨 Generar colores aleatorios suaves
function generarColores(cantidad) {
  const colores = [];
  for (let i = 0; i < cantidad; i++) {
    colores.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`);
  }
  return colores;
}

function exportarVentasExcel() {
  const ventas = obtenerVentas();
  if (ventas.length === 0) {
    alert("No hay ventas para exportar.");
    return;
  }

  // Formatear datos para Excel
  const datos = ventas.map(v => {
    const fila = {
      Cliente: v.cliente,
      Producto: v.producto,
      Monto: v.monto,
      TipoPago: v.tipoPago
    };

    if (v.tipoPago === "contado") {
      fila.Metodo = v.detallePago.metodo;
    } else if (v.tipoPago === "credito") {
      fila.Acreedor = v.detallePago.acreedor;
      fila.Vencimiento = v.detallePago.fechaVencimiento;
    }

    return fila;
  });

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");

  XLSX.writeFile(wb, "ventas.xlsx");
}
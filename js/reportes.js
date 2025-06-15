let graficos = {};

document.addEventListener("DOMContentLoaded", () => {
  generarGraficoTipoPago();
  generarGraficoPorProducto();
  generarGraficoPorCliente();
});

function obtenerVentas() {
  return JSON.parse(localStorage.getItem("ventas")) || [];
}

// NUEVA FUNCIÓN PARA CAMBIAR OBTENER LOS GRÁFICOS DE BARRAS (14/06/2025):
function obtenerTipoGraficoSeleccionado() {
  return document.getElementById("tipoGrafico")?.value || "pie";
}


// 🎂 Tipo de pago
function generarGraficoTipoPago(ventas = obtenerVentas()) {
  // ventas ya viene filtrada si se pasa, o usa todas si no
  const tipos = { contado: 0, credito: 0 };
  ventas.forEach(v => {
    if (v.tipoPago === "contado") tipos.contado++;
    else if (v.tipoPago === "credito") tipos.credito++;
  });

  const tipo = obtenerTipoGraficoSeleccionado();
  const ctx = document.getElementById("graficoTipoPago").getContext("2d"); // en función de tipoPago


  if (graficos["tipoPago"]) graficos["tipoPago"].destroy();
  graficos["tipoPago"] = new Chart(ctx, {
  type: tipo,

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
function generarGraficoPorProducto(ventas = obtenerVentas()) {
  const conteo = {};
  ventas.forEach(v => {
    conteo[v.producto] = (conteo[v.producto] || 0) + 1;
  });

  const tipo = obtenerTipoGraficoSeleccionado();
  const ctx = document.getElementById("graficoProducto").getContext("2d"); // en función de producto


  if (graficos["producto"]) graficos["producto"].destroy();
  graficos["producto"] = new Chart(ctx, {
  type: tipo,

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
function generarGraficoPorCliente(ventas = obtenerVentas()) {
  const conteo = {};
  ventas.forEach(v => {
    conteo[v.cliente] = (conteo[v.cliente] || 0) + 1;
  });

  const tipo = obtenerTipoGraficoSeleccionado();
  const ctx = document.getElementById("graficoCliente").getContext("2d"); // en función de cliente

  if (graficos["cliente"]) graficos["cliente"].destroy();
  graficos["cliente"] = new Chart(ctx, {
  type: tipo,

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

//NUEVA FUNCIÓN PARA FILTRAR POR RANGO DE FECHAS (14/06/2025):
function aplicarFiltroFechas() {
  const desde = document.getElementById("fechaInicio").value;
  const hasta = document.getElementById("fechaFin").value;

  if (!desde || !hasta) {
    alert("Selecciona ambas fechas.");
    return;
  }

  const ventasFiltradas = obtenerVentas().filter(v => {
    const fecha = v.fecha || v.fechaVenta; // por compatibilidad
    return fecha >= desde && fecha <= hasta;
  });

  // Limpiar y volver a dibujar todos los gráficos con ventas filtradas
  generarGraficoTipoPago(ventasFiltradas);
  generarGraficoPorProducto(ventasFiltradas);
  generarGraficoPorCliente(ventasFiltradas);
}

function actualizarTodosLosGraficos() {
  const desde = document.getElementById("fechaInicio").value;
  const hasta = document.getElementById("fechaFin").value;
  const tipoAgrupacion = document.getElementById("tipoAgrupacion").value;

  let ventas = obtenerVentas();

  if (desde && hasta) {
    ventas = ventas.filter(v => {
      const fecha = v.fecha || v.fechaVenta;
      return fecha >= desde && fecha <= hasta;
    });
  }

  if (tipoAgrupacion === "semana") {
    ventas = agruparVentasPor(ventas, "semana");
  } else if (tipoAgrupacion === "mes") {
    ventas = agruparVentasPor(ventas, "mes");
  }

  generarGraficoTipoPago(ventas);
  generarGraficoPorProducto(ventas);
  generarGraficoPorCliente(ventas);
}

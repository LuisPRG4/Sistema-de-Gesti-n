// Simulación de productos y ventas
const productos = JSON.parse(localStorage.getItem("productos")) || [
  { nombre: "Yogur Fresa", stock: 4, vendidos: 12 },
  { nombre: "Yogur Natural", stock: 10, vendidos: 8 },
  { nombre: "Yogur Mango", stock: 2, vendidos: 15 },
];

// Simulación de ventas del día y la semana
const ventas = JSON.parse(localStorage.getItem("ventas")) || [
  { monto: 10, fecha: "2025-06-05" },
  { monto: 5, fecha: "2025-06-05" },
  { monto: 8, fecha: "2025-06-03" },
  { monto: 6, fecha: "2025-06-01" },
];

function cargarDashboard() {
  // Traemos datos del localStorage o vacíos
  const productos = JSON.parse(localStorage.getItem("productos")) || [];
  const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  const hoy = new Date().toISOString().slice(0, 10);
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  const fecha7dias = hace7Dias.toISOString().slice(0, 10);

  let totalHoy = 0;
  let totalSemana = 0;

  ventas.forEach((venta) => {
    if (venta.fecha === hoy) totalHoy += venta.monto;
    if (venta.fecha >= fecha7dias) totalSemana += venta.monto;
  });

  document.getElementById("ventasHoy").textContent = totalHoy;
  document.getElementById("ventasSemana").textContent = totalSemana;

  if (productos.length > 0) {
    let top = productos.reduce((a, b) => (a.vendidos > b.vendidos ? a : b));
    document.getElementById("productoTop").textContent = top.nombre;
  } else {
    document.getElementById("productoTop").textContent = "-";
  }

  // Alertas de stock
  const alertaStock = document.getElementById("alertasStock");
  alertaStock.innerHTML = "";
  productos.forEach((p) => {
    if (p.stock <= 5) {
      let li = document.createElement("li");
      li.textContent = `${p.nombre} - Stock: ${p.stock}`;
      alertaStock.appendChild(li);
    }
  });
}

document.addEventListener("DOMContentLoaded", cargarDashboard);

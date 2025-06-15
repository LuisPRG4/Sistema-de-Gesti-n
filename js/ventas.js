// ventas.js corregido y mejorado por mami 💜
const clientes = JSON.parse(localStorage.getItem("clientes")) || []; 
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editVentaIndex = null;
let productosVenta = [];

function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));

  // 🟣 Actualiza los gráficos si estás en la página de reportes
  if (location.href.includes("reportesGraficos.html")) {
    actualizarTodosLosGraficos();
  }
}

function cargarClientes() {
  const select = document.getElementById("clienteVenta");
  select.innerHTML = '<option value="">Selecciona un cliente</option>';
  clientes.forEach(cliente => {
    const option = document.createElement("option");
    option.value = cliente.nombre;
    option.textContent = `${cliente.nombre} (${cliente.telefono || "sin número"})`;
    select.appendChild(option);
  });
}

function mostrarOpcionesPago() {
  const tipo = document.getElementById("tipoPago").value;
  document.getElementById("opcionesContado").style.display = tipo === "contado" ? "block" : "none";
  document.getElementById("opcionesCredito").style.display = tipo === "credito" ? "block" : "none";
}

function registrarVenta() {
   const cliente = document.getElementById("clienteVenta").value.trim();
   const tipoPago = document.getElementById("tipoPago").value;

   if (!cliente || productosVenta.length === 0 || !tipoPago) {
    alert("Completa todos los campos principales y agrega productos.");
    return;
   }

   let detallePago = {};

   if (tipoPago === "contado") {
    const metodo = document.getElementById("metodoContado").value;
    if (!metodo) {
      alert("Selecciona el método de pago.");
      return;
    }
    detallePago = { metodo };
   } else if (tipoPago === "credito") {
    const fechaVencimiento = document.getElementById("fechaVencimiento").value || "No especificada";
    detallePago = { acreedor: cliente, fechaVencimiento };
   }

   let ingreso = 0;
   let ganancia = 0;

   productosVenta.forEach(p => {
    ingreso += p.subtotal;
    ganancia += (p.precio - p.costo) * p.cantidad;
   });

  const nuevaVenta = {
    cliente,
    productos: [...productosVenta],
    tipoPago,
    detallePago,
    ingreso,
    ganancia,
    fecha: new Date().toISOString().split("T")[0]
   };

   let productosActualizados = [...productos];

   if (editVentaIndex !== null) {
    const ventaAnterior = ventas[editVentaIndex];
    ventaAnterior.productos.forEach(p => {
      const prod = productosActualizados.find(prod => prod.nombre === p.nombre);
      if (prod) {
        prod.stock += p.cantidad;
        prod.vendidos = Math.max(0, prod.vendidos - p.cantidad);
      }
    });

    productosVenta.forEach(p => {
      const prod = productosActualizados.find(prod => prod.nombre === p.nombre);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - p.cantidad);
        prod.vendidos = (prod.vendidos || 0) + p.cantidad;
      }
    });

    ventas[editVentaIndex] = nuevaVenta;
    mostrarToast("Venta actualizada ✅");
    editVentaIndex = null;
    document.getElementById("btnRegistrarVenta").textContent = "Registrar Venta";
   } else {
    ventas.push(nuevaVenta);

    productosVenta.forEach(p => {
      const prod = productosActualizados.find(prod => prod.nombre === p.nombre);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - p.cantidad);
        prod.vendidos = (prod.vendidos || 0) + p.cantidad;
      }
    });

    const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
    
    // Registrar ingreso total
    movimientos.push({
    tipo: "ingreso",
    monto: ingreso,
    fecha: nuevaVenta.fecha,
    descripcion: `Venta a ${cliente}`
    });

    // Registrar costo total como gasto
    const costoTotal = productosVenta.reduce((total, p) => total + (p.costo * p.cantidad), 0);
    movimientos.push({
    tipo: "gasto",
    monto: costoTotal,
    fecha: nuevaVenta.fecha,
    descripcion: `Costo de venta a ${cliente}`
    });

    localStorage.setItem("movimientos", JSON.stringify(movimientos));

    mostrarToast("Venta registrada con éxito ✅");
  }

  productos = productosActualizados;
  localStorage.setItem("productos", JSON.stringify(productos));
  guardarVentas();
  mostrarVentas();
  limpiarFormulario();
}

//Actualizada
function mostrarVentas(filtradas = ventas) {
  const lista = document.getElementById("listaVentas");
  lista.innerHTML = "";

  if (filtradas.length === 0) {
    lista.innerHTML = `<p class="text-center text-gray-400">No hay ventas registradas.</p>`;
    return;
  }

  const grupoContado = {};
  const grupoCredito = [];

  filtradas.forEach((venta, index) => {
    if (venta.tipoPago === "contado") {
      const metodo = venta.detallePago.metodo || "Otro";
      if (!grupoContado[metodo]) grupoContado[metodo] = [];
      grupoContado[metodo].push({ venta, index });
    } else {
      grupoCredito.push({ venta, index });
    }
  });

  // Categoría: Contado
  if (Object.keys(grupoContado).length > 0) {
    const titulo = document.createElement("h2");
    titulo.textContent = "🟣 Ventas al Contado";
    titulo.className = "text-lg font-bold text-purple-700 mt-4";
    lista.appendChild(titulo);

    for (const metodo in grupoContado) {
      const subtitulo = document.createElement("h3");
      subtitulo.textContent = `💠 Método: ${metodo}`;
      subtitulo.className = "text-md font-semibold text-purple-600 mt-3";
      lista.appendChild(subtitulo);

      grupoContado[metodo].forEach(({ venta, index }) => {
        const card = crearCardVenta(venta, index);
        lista.appendChild(card);
      });
    }
  }

  // Categoría: Crédito
  if (grupoCredito.length > 0) {
    const titulo = document.createElement("h2");
    titulo.textContent = "🔵 Ventas a Crédito";
    titulo.className = "text-lg font-bold text-blue-700 mt-6";
    lista.appendChild(titulo);

    grupoCredito.forEach(({ venta, index }) => {
      const card = crearCardVenta(venta, index);
      lista.appendChild(card);
    });
  }
}

function crearCardVenta(venta, index) {
  const productosTexto = venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join(", ");

  const detallePago =
    venta.tipoPago === "contado"
      ? `<span class="text-sm text-gray-600">Método: ${venta.detallePago.metodo}</span>`
      : `<span class="text-sm text-gray-600">Acreedor: ${venta.detallePago.acreedor || "N/A"}<br>Vence: ${venta.detallePago.fechaVencimiento || "Sin fecha"}</span>`;

  const card = document.createElement("div");
  card.className = "bg-white border border-purple-200 rounded-2xl p-4 shadow-md mt-2";

  card.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold text-purple-700">${venta.cliente}</h3>
      <span class="text-sm text-gray-500">${venta.fecha}</span>
    </div>
    <p class="text-sm text-gray-800"><strong>Productos:</strong> ${productosTexto}</p>
    <p class="text-sm text-gray-800"><strong>Total:</strong> $${venta.ingreso.toFixed(2)}</p>
    <p class="text-sm text-gray-800"><strong>Pago:</strong> ${venta.tipoPago}</p>
    ${detallePago}
    <div class="mt-3 flex gap-2">
      <button onclick="cargarVenta(${index})" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm transition">✏️ Editar</button>
      <button onclick="revertirVenta(${index})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition">↩️ Revertir</button>
      <button onclick="eliminarVenta(${index})" class="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition">🗑 Eliminar</button>
    </div>
  `;

  return card;
}

// Actualizada
function filtrarVentas() {
  const input = document.getElementById("buscadorVentas").value.toLowerCase().trim();

  const filtradas = ventas.filter(v => {
    const productos = v.productos.map(p => p.nombre.toLowerCase()).join(" ");
    const cliente = v.cliente.toLowerCase();
    const fecha = v.fecha.toLowerCase();
    const metodo = (v.detallePago.metodo || "").toLowerCase();
    const acreedor = (v.detallePago.acreedor || "").toLowerCase();

    return (
      cliente.includes(input) ||
      fecha.includes(input) ||
      productos.includes(input) ||
      metodo.includes(input) ||
      acreedor.includes(input) ||
      v.ingreso.toString().includes(input) ||
      v.tipoPago.toLowerCase().includes(input)
    );
  });

  mostrarVentas(filtradas);
}

function limpiarFormulario() {
  document.getElementById("clienteVenta").value = "";
  document.getElementById("productoVenta").value = "";
  // document.getElementById("montoVenta").value = "";
  document.getElementById("tipoPago").value = "";
  document.getElementById("metodoContado").value = "";
  document.getElementById("fechaVencimiento").value = "";
  productosVenta = [];
  actualizarTablaProductos();
  mostrarOpcionesPago();
  editVentaIndex = null;
  document.getElementById("btnRegistrarVenta").textContent = "Registrar Venta";
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

function revertirVenta(index) {
  const venta = ventas[index];
  if (!venta) return;

  const motivo = prompt("¿Por qué deseas revertir esta venta?");
  if (motivo === null || motivo.trim() === "") {
    alert("Debes ingresar un motivo para revertir la venta.");
    return;
  }

  if (confirm(`¿Seguro que quieres revertir la venta a ${venta.cliente}?\nMotivo: ${motivo}`)) {
    venta.productos.forEach(p => {
      const prod = productos.find(prod => prod.nombre === p.nombre);
      if (prod) {
        prod.stock += p.cantidad;
        prod.vendidos = Math.max(0, (prod.vendidos || 0) - p.cantidad);
      }
    });

    localStorage.setItem("productos", JSON.stringify(productos));
    ventas.splice(index, 1);
    guardarVentas();
    mostrarVentas();
    mostrarToast("Venta revertida y stock actualizado");
  }
}

//NUEVA FUNCIÓN
function eliminarVenta(index) {
  const venta = ventas[index];
  if (!venta) return;

  if (!confirm(`¿Estás seguro de eliminar la venta a ${venta.cliente} sin revertir stock?`)) return;

  // Añadir movimiento de ajuste en Finanzas
  const movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
  movimientos.push({
    tipo: "ajuste",
    monto: -venta.ingreso,
    ganancia: -venta.ganancia,
    fecha: new Date().toISOString().split("T")[0],
    descripcion: `Eliminación manual de venta a ${venta.cliente}`
  });
  localStorage.setItem("movimientos", JSON.stringify(movimientos));

  ventas.splice(index, 1);
  guardarVentas();
  mostrarVentas();
  mostrarToast("Venta eliminada permanentemente 🗑️");
}


function cargarVenta(index) {
  const venta = ventas[index];
  if (!venta) return;

  document.getElementById("clienteVenta").value = venta.cliente;
  document.getElementById("tipoPago").value = venta.tipoPago;
  mostrarOpcionesPago();

  if (venta.tipoPago === "contado") {
    document.getElementById("metodoContado").value = venta.detallePago.metodo;
  } else {
    document.getElementById("acreedor").value = venta.detallePago.acreedor;
    document.getElementById("fechaVencimiento").value = venta.detallePago.fechaVencimiento;
  }

  productosVenta = [...venta.productos];
  actualizarTablaProductos();
  editVentaIndex = index;
  document.getElementById("btnRegistrarVenta").textContent = "Actualizar Venta";
}

function cargarProductos() {
  const select = document.getElementById("productoVenta");
  select.innerHTML = '<option value="">Selecciona un producto</option>';
  productos.forEach(producto => {
    const option = document.createElement("option");
    option.value = producto.nombre;
    option.textContent = `${producto.nombre} (${producto.stock} en stock)`;
    select.appendChild(option);
  });
}

function agregarProductoAVenta() {
  const productoNombre = document.getElementById("productoVenta").value;
  const cantidad = parseInt(document.getElementById("cantidadVenta").value);

  if (!productoNombre || isNaN(cantidad) || cantidad < 1) {
    alert("Selecciona un producto válido y una cantidad.");
    return;
  }

  const producto = productos.find(p => p.nombre === productoNombre);
  if (!producto) {
    alert("Producto no encontrado en el inventario.");
    return;
  }

  const existente = productosVenta.find(p => p.nombre === productoNombre);
  const totalCantidad = (existente ? existente.cantidad : 0) + cantidad;

  if (producto.stock < totalCantidad) {
    alert("Stock insuficiente para esta cantidad total.");
    return;
  }

  if (existente) {
    existente.cantidad += cantidad;
    existente.subtotal = existente.cantidad * producto.precio;
  } else {
    productosVenta.push({
      nombre: producto.nombre,
      precio: producto.precio,
      costo: producto.costo,
      cantidad,
      subtotal: cantidad * producto.precio
    });
  }

  actualizarTablaProductos();

  // 👇 Limpia los campos al finalizar
  document.getElementById("productoVenta").value = "";
  document.getElementById("cantidadVenta").value = "";

}

function actualizarTablaProductos() {
  const tabla = document.getElementById("tablaProductosVenta");
  tabla.innerHTML = "";
  let total = 0;

  productosVenta.forEach((p, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${p.nombre}</td>
      <td>${p.cantidad}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td>$${p.subtotal.toFixed(2)}</td>
      <td><button onclick="eliminarProductoVenta(${index})">❌</button></td>
    `;
    tabla.appendChild(fila);
    total += p.subtotal;
  });

  document.getElementById("totalVenta").textContent = total.toFixed(2);
}

function eliminarProductoVenta(index) {
  productosVenta.splice(index, 1);
  actualizarTablaProductos();
}

function toggleExportOptions() {
  const opciones = document.getElementById("opcionesExportacion");
  opciones.style.display = opciones.style.display === "none" ? "block" : "none";
}

function exportarExcel() {
  const data = ventas.map(venta => ({
    Cliente: venta.cliente,
    Productos: venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join(", "),
    Ingreso: venta.ingreso.toFixed(2),
    Ganancia: venta.ganancia.toFixed(2),
    Fecha: venta.fecha,
    Pago: venta.tipoPago,
    Detalle: venta.tipoPago === "contado" ? venta.detallePago.metodo : `Vence: ${venta.detallePago.fechaVencimiento}`
  }));

  let csv = "Cliente,Productos,Ingreso,Ganancia,Fecha,Pago,Detalle\n";
  data.forEach(row => {
    csv += `${row.Cliente},"${row.Productos}",${row.Ingreso},${row.Ganancia},${row.Fecha},${row.Pago},"${row.Detalle}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ventas.csv";
  link.click();
  mostrarToast("📊 Excel exportado");
}

function exportarPDF() {
  const ventana = window.open('', '_blank');
  let contenido = `
    <html>
      <head><title>Reporte de Ventas</title></head>
      <body>
        <h2 style="color:#5b2d90;">📋 Historial de Ventas</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>Cliente</th>
            <th>Productos</th>
            <th>Ingreso</th>
            <th>Ganancia</th>
            <th>Fecha</th>
            <th>Pago</th>
            <th>Detalle</th>
          </tr>`;

  ventas.forEach(venta => {
    const productos = venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join(", ");
    const detalle = venta.tipoPago === "contado"
      ? venta.detallePago.metodo
      : `Vence: ${venta.detallePago.fechaVencimiento}`;
    contenido += `
          <tr>
            <td>${venta.cliente}</td>
            <td>${productos}</td>
            <td>$${venta.ingreso.toFixed(2)}</td>
            <td>$${venta.ganancia.toFixed(2)}</td>
            <td>${venta.fecha}</td>
            <td>${venta.tipoPago}</td>
            <td>${detalle}</td>
          </tr>`;
  });

  contenido += `
        </table>
      </body>
    </html>`;

  ventana.document.write(contenido);
  ventana.document.close();
  ventana.print();
  mostrarToast("📄 PDF preparado para impresión");
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarVentas();
  mostrarOpcionesPago();
  cargarClientes();
  cargarProductos();
});

// ventas.js corregido y mejorado por mami 💜

const clientes = JSON.parse(localStorage.getItem("clientes")) || []; 
let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
let productos = JSON.parse(localStorage.getItem("productos")) || [];
let editVentaIndex = null;
let productosVenta = [];

function guardarVentas() {
  localStorage.setItem("ventas", JSON.stringify(ventas));
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
    const acreedor = document.getElementById("acreedor").value.trim();
    const fechaVencimiento = document.getElementById("fechaVencimiento").value;
    if (!acreedor || !fechaVencimiento) {
      alert("Completa los datos de crédito.");
      return;
    }
    detallePago = { acreedor, fechaVencimiento };
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
    movimientos.push({
      tipo: "ingreso",
      monto: ingreso,
      ganancia,
      fecha: nuevaVenta.fecha,
      descripcion: `Venta a ${cliente}`
    });
    localStorage.setItem("movimientos", JSON.stringify(movimientos));

    mostrarToast("Venta registrada con éxito");
  }

  productos = productosActualizados;
  localStorage.setItem("productos", JSON.stringify(productos));
  guardarVentas();
  mostrarVentas();
  limpiarFormulario();
}

function mostrarVentas(filtradas = ventas) {
  const lista = document.getElementById("listaVentas");
  lista.innerHTML = "";

  filtradas.forEach((venta, index) => {
    let detalle = "";
    if (venta.tipoPago === "contado") {
      detalle = `Método: ${venta.detallePago.metodo}`;
    } else {
      detalle = `Acreedor: ${venta.detallePago.acreedor}<br>Vence: ${venta.detallePago.fechaVencimiento}`;
    }

    const productosTexto = venta.productos.map(p => `${p.nombre} x${p.cantidad}`).join(", ");

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${venta.cliente}</strong><br>
      Productos: ${productosTexto}<br>
      Total: $${venta.ingreso.toFixed(2)}<br>
      Pago: ${venta.tipoPago}<br>
      ${detalle}<br>
      <button onclick="cargarVenta(${index})">✏️ Editar</button>
      <button onclick="revertirVenta(${index})">↩️ Revertir</button>
    `;
    lista.appendChild(li);
  });
}

function filtrarVentas() {
  const filtro = document.getElementById("buscadorVentas").value.toLowerCase();
  const resultados = ventas.filter(venta =>
    venta.cliente.toLowerCase().includes(filtro) ||
    venta.productos.some(p => p.nombre.toLowerCase().includes(filtro)) ||
    venta.ingreso.toString().includes(filtro) ||
    venta.tipoPago.toLowerCase().includes(filtro)
  );
  mostrarVentas(resultados);
}

function limpiarFormulario() {
  document.getElementById("clienteVenta").value = "";
  document.getElementById("productoVenta").value = "";
  document.getElementById("montoVenta").value = "";
  document.getElementById("tipoPago").value = "";
  document.getElementById("metodoContado").value = "";
  document.getElementById("acreedor").value = "";
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

document.addEventListener("DOMContentLoaded", () => {
  mostrarVentas();
  mostrarOpcionesPago();
  cargarClientes();
  cargarProductos();
});
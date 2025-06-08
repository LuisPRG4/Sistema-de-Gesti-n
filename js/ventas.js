<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Gestión de Ventas</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <div id="toastContainer" class="toast-container"></div>
  
  <header>
    <div class="header-container">
        <img src="logo/Yogurt.png" alt="Logo" class="logo" />
        <h1>🧾 Gestión de Ventas</h1>
    </div>

  </header>
  <nav>
  <div class="menu-toggle" onclick="toggleMenu()">☰</div>
  <ul id="navMenu">
    <li><a href="index.html">🏠 Panel de Control</a></li>
    <li><a href="inventario.html">🧃 Inventario</a></li>
    <li><a href="pedidos.html">📦 Pedidos</a></li>
    <li><a href="clientes.html">👥 Clientes</a></li>
    <li><a href="finanzas.html">💰 Finanzas</a></li>
    <li><a href="proveedores.html">🚚 Proveedores</a></li>
    <li><a href="ventas.html">🧾 Ventas</a></li>
    <li><a href="reportesGraficos.html">📊 Reportes</a></li>
  </ul>
</nav>

  <main>
    <section>
      <h2>➕ Registrar Venta</h2>
      <select id="clienteVenta">
        <option value="">Selecciona un cliente</option>
      </select>

      <select id="productoVenta">
        <option value="">Selecciona un producto</option>
      </select>
      
      <input type="number" id="montoVenta" placeholder="Monto ($)" />

      <select id="tipoPago" onchange="mostrarOpcionesPago()">
        <option value="">Selecciona tipo de pago</option>
        <option value="contado">Contado</option>
        <option value="credito">Crédito</option>
      </select>

      <!-- Contado -->
      <div id="opcionesContado" style="display: none;">
        <select id="metodoContado">
          <option value="">Método de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <!-- Crédito -->
      <div id="opcionesCredito" style="display: none;">
        <input type="text" id="acreedor" placeholder="Nombre del acreedor" />
        <input type="date" id="fechaVencimiento" />
      </div>

      <button onclick="registrarVenta()">Guardar Venta</button>
    </section>

    <section>
      <h2>📋 Historial de Ventas</h2>
      <input type="text" id="buscadorVentas" placeholder="🔍 Buscar ventas..." oninput="filtrarVentas()" />
      <ul id="listaVentas"></ul>
    </section>
  </main>

  <script src="js/ventas.js"></script>

    <script>
      function toggleMenu() {
      document.getElementById("navMenu").classList.toggle("open");
    }
    </script>

</body>
</html>

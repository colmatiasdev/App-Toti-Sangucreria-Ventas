(function () {
  'use strict';

  var TABLA = window.APP_TABLES && window.APP_TABLES.PRODUCTOS;
  var CSV_URL = window.APP_CONFIG && window.APP_CONFIG.GOOGLE_SHEET_CSV_URL;
  var productos = [];
  var carrito = [];

  function parseCSV(texto) {
    var lineas = texto.trim().split(/\r?\n/);
    if (lineas.length < 2) return [];
    var cols = lineas[0].split(',').map(function (c) { return c.trim(); });
    var filas = [];
    for (var i = 1; i < lineas.length; i++) {
      var vals = lineas[i].split(',').map(function (v) { return v.trim(); });
      var obj = {};
      cols.forEach(function (col, j) {
        obj[col] = vals[j] !== undefined ? vals[j] : '';
      });
      filas.push(obj);
    }
    return filas;
  }

  function cargarProductos() {
    var mensaje = document.getElementById('nueva-venta-mensaje');
    var lista = document.getElementById('nueva-venta-productos');
    var selectCat = document.getElementById('nueva-venta-categoria');
    if (!CSV_URL || !TABLA) {
      mensaje.textContent = 'Falta configurar Config o Tables.';
      return;
    }
    fetch(CSV_URL)
      .then(function (res) { return res.text(); })
      .then(function (csv) {
        var filas = parseCSV(csv);
        var cols = TABLA.columns;
        productos = filas
          .filter(function (f) {
            var hab = (f[TABLA.columns[4]] || '').toUpperCase();
            return hab === 'SI';
          })
          .map(function (f) {
            var p = {};
            cols.forEach(function (c) {
              p[c] = c === 'PRECIO' ? Number(f[c]) || 0 : (f[c] || '');
            });
            return p;
          });
        mensaje.textContent = '';
        var categorias = [];
        productos.forEach(function (p) {
          if (p.CATEGORIA && categorias.indexOf(p.CATEGORIA) === -1) {
            categorias.push(p.CATEGORIA);
          }
        });
        categorias.sort();
        categorias.forEach(function (cat) {
          var opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          selectCat.appendChild(opt);
        });
        pintarListado();
      })
      .catch(function () {
        mensaje.textContent = 'No se pudieron cargar los productos. Revisa la URL del Sheet.';
      });
  }

  function pintarListado() {
    var lista = document.getElementById('nueva-venta-productos');
    var cat = (document.getElementById('nueva-venta-categoria') || {}).value || '';
    var filtrados = cat
      ? productos.filter(function (p) { return p.CATEGORIA === cat; })
      : productos;
    lista.innerHTML = '';
    filtrados.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'nueva-venta__item';
      li.innerHTML =
        '<span class="nueva-venta__item-nombre">' + escapeHtml(p['NOMBRE-PRODUCTO']) + '</span>' +
        '<span class="nueva-venta__item-precio">' + formatearPrecio(p.PRECIO) + '</span>' +
        '<button type="button" class="nueva-venta__btn-add" data-id="' + escapeHtml(p[TABLA.pk]) + '">Agregar</button>';
      li.querySelector('.nueva-venta__btn-add').addEventListener('click', function () {
        agregarAlCarrito(p);
      });
      lista.appendChild(li);
    });
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function formatearPrecio(n) {
    return '$ ' + Number(n).toLocaleString('es-AR');
  }

  function agregarAlCarrito(producto) {
    var pk = TABLA.pk;
    var id = producto[pk];
    var item = carrito.find(function (x) { return x.producto[pk] === id; });
    if (item) {
      item.cantidad += 1;
    } else {
      carrito.push({ producto: producto, cantidad: 1 });
    }
    pintarResumen();
  }

  function quitarDelCarrito(idProducto) {
    carrito = carrito.filter(function (x) { return x.producto[TABLA.pk] !== idProducto; });
    pintarResumen();
  }

  function actualizarCantidad(idProducto, cantidad) {
    var n = parseInt(cantidad, 10);
    if (isNaN(n) || n < 1) n = 1;
    var item = carrito.find(function (x) { return x.producto[TABLA.pk] === idProducto; });
    if (item) item.cantidad = n;
    pintarResumen();
  }

  function pintarResumen() {
    var vacio = document.getElementById('nueva-venta-resumen-vacio');
    var tabla = document.getElementById('nueva-venta-tabla');
    var tbody = document.getElementById('nueva-venta-tabla-body');
    var totalEl = document.getElementById('nueva-venta-total');
    if (carrito.length === 0) {
      vacio.hidden = false;
      tabla.hidden = true;
      totalEl.textContent = '0';
      return;
    }
    vacio.hidden = true;
    tabla.hidden = false;
    tbody.innerHTML = '';
    var total = 0;
    carrito.forEach(function (item) {
      var id = item.producto[TABLA.pk];
      var subtotal = item.producto.PRECIO * item.cantidad;
      total += subtotal;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(item.producto['NOMBRE-PRODUCTO']) + '</td>' +
        '<td class="nueva-venta__th-num">' + formatearPrecio(item.producto.PRECIO) + '</td>' +
        '<td class="nueva-venta__th-num">' +
        '<input type="number" min="1" value="' + item.cantidad + '" class="nueva-venta__input-qty" data-id="' + escapeHtml(id) + '">' +
        '</td>' +
        '<td class="nueva-venta__th-num nueva-venta__subtotal">' + formatearPrecio(subtotal) + '</td>' +
        '<td><button type="button" class="nueva-venta__btn-quitar" data-id="' + escapeHtml(id) + '">Quitar</button></td>';
      tr.querySelector('.nueva-venta__input-qty').addEventListener('input', function () {
        actualizarCantidad(id, this.value);
      });
      tr.querySelector('.nueva-venta__btn-quitar').addEventListener('click', function () {
        quitarDelCarrito(id);
      });
      tbody.appendChild(tr);
    });
    totalEl.textContent = formatearPrecio(total);
  }

  function init() {
    document.getElementById('nueva-venta-categoria').addEventListener('change', pintarListado);
    cargarProductos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

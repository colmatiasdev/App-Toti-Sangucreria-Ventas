(function () {
  'use strict';

  var APP_CONFIG = window.APP_CONFIG;
  var APP_TABLES = window.APP_TABLES;
  var APP_SCRIPT_URL = APP_CONFIG && APP_CONFIG.APP_SCRIPT_URL;
  var CORS_PROXY = APP_CONFIG && APP_CONFIG.CORS_PROXY;
  var NOMBRES_MESES = (APP_TABLES && APP_TABLES.NOMBRES_HOJAS_MES) || [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  function getMesActual() {
    if (!NOMBRES_MESES || !NOMBRES_MESES.length) return '';
    var idx = new Date().getMonth();
    return NOMBRES_MESES[idx] || NOMBRES_MESES[0];
  }

  function init() {
    var selectMes = document.getElementById('dashboard-mensual-mes');
    var btnCargar = document.getElementById('dashboard-mensual-btn-cargar');
    if (!selectMes || !btnCargar) return;

    if (NOMBRES_MESES && NOMBRES_MESES.length) {
      NOMBRES_MESES.forEach(function (nombre) {
        var opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        selectMes.appendChild(opt);
      });
      selectMes.value = getMesActual();
      cargarDashboard();
    }

    btnCargar.addEventListener('click', cargarDashboard);
  }

  function mostrarMensaje(texto, esError) {
    var msg = document.getElementById('dashboard-mensual-mensaje');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'dashboard-mensual__mensaje' + (esError ? ' dashboard-mensual__mensaje--error' : '');
    msg.hidden = false;
  }

  function llamarVentaLeer(mes) {
    var payload = { accion: 'ventaLeer', hoja: mes };
    var body = 'data=' + encodeURIComponent(JSON.stringify(payload));
    var url = (CORS_PROXY && CORS_PROXY.length > 0)
      ? CORS_PROXY + encodeURIComponent(APP_SCRIPT_URL)
      : APP_SCRIPT_URL;

    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var ct = (res.headers.get('Content-Type') || '').toLowerCase();
      if (ct.indexOf('json') !== -1) return res.json();
      return res.text().then(function (t) {
        try { return JSON.parse(t); } catch (e) { return { ok: false, error: t }; };
      });
    });
  }

  function cargarDashboard() {
    var selectMes = document.getElementById('dashboard-mensual-mes');
    var mes = selectMes ? selectMes.value : '';
    if (!mes) {
      mostrarMensaje('Seleccione un mes.', true);
      return;
    }
    if (!APP_SCRIPT_URL) {
      mostrarMensaje('No está configurada la URL del Apps Script (APP_SCRIPT_URL).', true);
      return;
    }

    mostrarMensaje('Cargando datos de ' + mes + '…');
    var resumen = document.getElementById('dashboard-mensual-resumen');
    if (resumen) resumen.hidden = true;

    llamarVentaLeer(mes)
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.datos)) {
          pintarResumen(mes, data.datos);
          document.getElementById('dashboard-mensual-mensaje').hidden = true;
        } else {
          mostrarMensaje(data && (data.error || data.mensaje) || 'No se recibieron datos.', true);
        }
      })
      .catch(function (err) {
        var txt = err && err.message ? err.message : String(err);
        if (/failed to fetch|cors|blocked|access-control/i.test(txt)) {
          mostrarMensaje('No se pudo conectar con el servidor (CORS).', true);
        } else {
          mostrarMensaje('Error: ' + txt, true);
        }
      });
  }

  function pintarResumen(mes, datos) {
    var resumen = document.getElementById('dashboard-mensual-resumen');
    var subtitulo = document.getElementById('dashboard-mensual-subtitulo');
    var totalEl = document.getElementById('dashboard-mensual-total');
    var cantidadVentasEl = document.getElementById('dashboard-mensual-cantidad-ventas');
    var itemsEl = document.getElementById('dashboard-mensual-items');
    var thead = document.getElementById('dashboard-mensual-thead');
    var tbody = document.getElementById('dashboard-mensual-tbody');

    if (!resumen || !subtitulo) return;

    subtitulo.textContent = 'Resumen de ' + mes;

    var totalMonto = 0;
    var idsVenta = {};
    var totalItems = 0;
    var porCategoria = {};

    datos.forEach(function (fila) {
      var monto = Number(fila.MONTO) || 0;
      totalMonto += monto;
      var idVenta = fila['ID-VENTA'];
      if (idVenta != null && idVenta !== '') idsVenta[idVenta] = true;
      totalItems += Number(fila.CANTIDAD) || 0;
      var cat = fila.CATEGORIA != null ? String(fila.CATEGORIA).trim() : 'Sin categoría';
      if (!porCategoria[cat]) porCategoria[cat] = { monto: 0, items: 0 };
      porCategoria[cat].monto += monto;
      porCategoria[cat].items += Number(fila.CANTIDAD) || 0;
    });

    var cantidadVentas = Object.keys(idsVenta).length;

    if (totalEl) totalEl.textContent = totalMonto.toLocaleString('es-AR');
    if (cantidadVentasEl) cantidadVentasEl.textContent = cantidadVentas.toLocaleString('es-AR');
    if (itemsEl) itemsEl.textContent = totalItems.toLocaleString('es-AR');

    if (thead && tbody) {
      thead.innerHTML = '';
      tbody.innerHTML = '';
      var trHead = document.createElement('tr');
      ['CATEGORÍA', 'MONTO', 'ÍTEMS'].forEach(function (col) {
        var th = document.createElement('th');
        th.textContent = col;
        if (col !== 'CATEGORÍA') th.className = 'dashboard-mensual__th-num';
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);

      var categorias = Object.keys(porCategoria).sort();
      categorias.forEach(function (cat) {
        var o = porCategoria[cat];
        var tr = document.createElement('tr');
        [cat, o.monto.toLocaleString('es-AR'), o.items.toLocaleString('es-AR')].forEach(function (val, i) {
          var td = document.createElement('td');
          td.textContent = val;
          if (i > 0) td.className = 'dashboard-mensual__th-num';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    resumen.hidden = false;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

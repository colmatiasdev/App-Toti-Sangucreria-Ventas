(function () {
  'use strict';

  var APP_CONFIG = window.APP_CONFIG;
  var APP_TABLES = window.APP_TABLES;
  var APP_SCRIPT_URL = APP_CONFIG && APP_CONFIG.APP_SCRIPT_URL;
  var CORS_PROXY = APP_CONFIG && APP_CONFIG.CORS_PROXY;
  var NOMBRES_MESES = APP_TABLES && APP_TABLES.NOMBRES_HOJAS_MES;

  /** Orden de columnas: nombre del mes + columnas de la tabla del mes. */
  var columnasTabla = [
    'MES',
    'FECHA_OPERATIVA',
    'HORA',
    'ID-VENTA',
    'ID-PRODUCTO',
    'CATEGORIA',
    'PRODUCTO',
    'CANTIDAD',
    'PRECIO',
    'MONTO'
  ];

  function init() {
    var selectMes = document.getElementById('ventas-meses-mes');
    var btnCargar = document.getElementById('ventas-meses-btn-cargar');
    if (!selectMes || !btnCargar) return;

    if (NOMBRES_MESES && NOMBRES_MESES.length) {
      NOMBRES_MESES.forEach(function (nombre) {
        var opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        selectMes.appendChild(opt);
      });
    }

    btnCargar.addEventListener('click', cargarVentasDelMes);
  }

  function mostrarMensaje(texto, esError) {
    var msg = document.getElementById('ventas-meses-mensaje');
    if (!msg) return;
    msg.textContent = texto;
    msg.className = 'ventas-meses__mensaje' + (esError ? ' ventas-meses__mensaje--error' : '');
  }

  function cargarVentasDelMes() {
    var selectMes = document.getElementById('ventas-meses-mes');
    var mes = selectMes ? selectMes.value : '';
    if (!mes) {
      mostrarMensaje('Seleccione un mes.', true);
      return;
    }
    if (!APP_SCRIPT_URL) {
      mostrarMensaje('No está configurada la URL del Apps Script (APP_SCRIPT_URL).', true);
      return;
    }

    mostrarMensaje('Cargando ventas de ' + mes + '…');
    var payload = { accion: 'ventaLeer', hoja: mes };
    var body = 'data=' + encodeURIComponent(JSON.stringify(payload));
    var url = (CORS_PROXY && CORS_PROXY.length > 0)
      ? CORS_PROXY + encodeURIComponent(APP_SCRIPT_URL)
      : APP_SCRIPT_URL;

    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        var ct = (res.headers.get('Content-Type') || '').toLowerCase();
        if (ct.indexOf('json') !== -1) return res.json();
        return res.text().then(function (t) {
          try { return JSON.parse(t); } catch (e) { return { ok: false, error: t }; };
        });
      })
      .then(function (data) {
        if (data && data.ok && Array.isArray(data.datos)) {
          pintarTabla(mes, data.datos);
          mostrarMensaje('Se cargaron ' + data.datos.length + ' registro(s) de ' + mes + '.');
        } else {
          mostrarMensaje(data && (data.error || data.mensaje) || 'No se recibieron datos.', true);
          ocultarTabla();
        }
      })
      .catch(function (err) {
        var txt = err && err.message ? err.message : String(err);
        if (/failed to fetch|cors|blocked|access-control/i.test(txt)) {
          mostrarMensaje('No se pudo conectar con el servidor (CORS). Compruebe APP_SCRIPT_URL y despliegue.', true);
        } else {
          mostrarMensaje('Error: ' + txt, true);
        }
        ocultarTabla();
      });
  }

  function pintarTabla(nombreMes, datos) {
    var wrapper = document.getElementById('ventas-meses-tabla-wrapper');
    var subtitulo = document.getElementById('ventas-meses-subtitulo');
    var thead = document.getElementById('ventas-meses-thead');
    var tbody = document.getElementById('ventas-meses-tbody');
    if (!wrapper || !thead || !tbody) return;

    subtitulo.textContent = 'Ventas de ' + nombreMes;

    var columnas = columnasTabla;
    if (datos.length > 0) {
      var clavesFila = Object.keys(datos[0]);
      columnas = ['MES'].concat(clavesFila.filter(function (k) { return k !== 'MES'; }));
    }

    thead.innerHTML = '';
    var trHead = document.createElement('tr');
    columnas.forEach(function (col) {
      var th = document.createElement('th');
      th.textContent = col;
      if (['CANTIDAD', 'PRECIO', 'MONTO'].indexOf(col) !== -1) th.className = 'ventas-meses__th-num';
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    tbody.innerHTML = '';
    datos.forEach(function (fila) {
      var tr = document.createElement('tr');
      columnas.forEach(function (col) {
        var td = document.createElement('td');
        var val = fila[col];
        if (val === undefined || val === null) val = '';
        if (['CANTIDAD', 'PRECIO', 'MONTO'].indexOf(col) !== -1 && typeof val === 'number') {
          td.textContent = val.toLocaleString('es-AR');
          td.className = 'ventas-meses__th-num';
        } else {
          td.textContent = val;
        }
        if (col === 'MES') td.textContent = nombreMes;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    wrapper.hidden = false;
  }

  function ocultarTabla() {
    var wrapper = document.getElementById('ventas-meses-tabla-wrapper');
    if (wrapper) wrapper.hidden = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

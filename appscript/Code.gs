/**
 * Web App - AMB (Alta, Modificación, Baja) sobre las tablas del Sheet.
 * Desplegar como "Aplicación web": ejecutar como yo, quién tiene acceso: cualquiera.
 * URL de despliegue → config.js APP_SCRIPT_URL.
 *
 * Tablas definidas:
 * - PRODUCTOS: PK ID-PRODUCTO. Columnas: ID-PRODUCTO, CATEGORIA, NOMBRE-PRODUCTO, PRECIO, HABILITADO
 * - ENERO: PK ID-VENTA. Columnas: ID-VENTA, FECHA_OPERATIVA, HORA, ID-PRODUCTO, CATEGORIA, PRODUCTO, MONTO
 * Agregar más tablas en TABLAS cuando se creen nuevas hojas.
 */

/** Solo el ID del Google Sheet (de la URL: .../d/ESTE_ID/edit). */
var SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/1R05n3t2cgmzX-z58b9Sgx4He9k9Y9NAm9myQXbEwv3Q/edit';

/** Definición de tablas (hoja, PK, columnas). Coincidir con src/Config/tables.js */
var TABLAS = {
  PRODUCTOS: {
    sheet: 'PRODUCTOS',
    pk: 'ID-PRODUCTO',
    columns: ['ID-PRODUCTO', 'CATEGORIA', 'NOMBRE-PRODUCTO', 'PRECIO', 'HABILITADO']
  },
  ENERO: {
    sheet: 'ENERO',
    pk: 'ID-VENTA',
    columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO']
  }
};

function doGet(e) {
  return respuestaJson({ ok: true, mensaje: 'Usar POST con accion y parametros.' });
}

function doPost(e) {
  try {
    var params = parseBody(e);
    var accion = params.accion || '';

    switch (accion) {
      case 'productoAlta':       return productoAlta(params);
      case 'productoBaja':       return productoBaja(params);
      case 'productoModificacion': return productoModificacion(params);
      case 'productoLeer':      return productoLeer(params);
      case 'ventaAlta':
      case 'guardarVenta':      return ventaAlta(params);
      case 'ventaBaja':         return ventaBaja(params);
      case 'ventaModificacion': return ventaModificacion(params);
      case 'ventaLeer':         return ventaLeer(params);
      default:
        return respuestaJson({ ok: false, error: 'Acción no reconocida: ' + accion });
    }
  } catch (err) {
    return respuestaJson({ ok: false, error: err.toString() });
  }
}

function parseBody(e) {
  var params = {};
  if (e.postData && e.postData.contents) {
    var raw = e.postData.contents;
    if (raw.indexOf('data=') !== -1) {
      params = JSON.parse(decodeURIComponent(raw.substring(raw.indexOf('data=') + 5).replace(/\+/g, ' ')));
    } else if (raw.trim().indexOf('{') === 0) {
      params = JSON.parse(raw);
    }
  }
  return params;
}

function getSS() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('REEMPLAZAR') !== -1 || SPREADSHEET_ID.length < 40) {
    throw new Error('Configura SPREADSHEET_ID en Code.gs (solo el ID del documento).');
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getHoja(ss, nombreHoja, columnas) {
  var sheet = ss.getSheetByName(nombreHoja);
  if (!sheet) {
    sheet = ss.insertSheet(nombreHoja);
    if (columnas && columnas.length) {
      sheet.getRange(1, 1, 1, columnas.length).setValues([columnas]);
      sheet.getRange(1, 1, 1, columnas.length).setFontWeight('bold');
    }
  }
  return sheet;
}

function buscarFilaPorPK(sheet, def, pkValor) {
  var datos = sheet.getDataRange().getValues();
  if (datos.length < 2) return -1;
  var headers = datos[0];
  var colIdx = headers.indexOf(def.pk);
  if (colIdx === -1) return -1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colIdx]) === String(pkValor)) return i + 1;
  }
  return -1;
}

function objetoAFila(def, obj) {
  var fila = [];
  for (var c = 0; c < def.columns.length; c++) {
    fila.push(obj[def.columns[c]] !== undefined ? obj[def.columns[c]] : '');
  }
  return fila;
}

// --- PRODUCTOS ---

function productoAlta(params) {
  var def = TABLAS.PRODUCTOS;
  var dato = params.dato || params;
  if (!dato[def.pk]) return respuestaJson({ ok: false, error: 'Falta ' + def.pk });
  var ss = getSS();
  var sheet = getHoja(ss, def.sheet, def.columns);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, def.columns.length).setValues([def.columns]);
    sheet.getRange(1, 1, 1, def.columns.length).setFontWeight('bold');
  }
  var fila = objetoAFila(def, dato);
  var rowNum = buscarFilaPorPK(sheet, def, dato[def.pk]);
  if (rowNum > 0) return respuestaJson({ ok: false, error: 'Ya existe un producto con ese ' + def.pk });
  sheet.appendRow(fila);
  return respuestaJson({ ok: true, mensaje: 'Producto dado de alta.' });
}

function productoBaja(params) {
  var def = TABLAS.PRODUCTOS;
  var pkValor = params[def.pk] || params.id;
  if (!pkValor) return respuestaJson({ ok: false, error: 'Falta ' + def.pk });
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: false, error: 'No existe la hoja ' + def.sheet });
  var rowNum = buscarFilaPorPK(sheet, def, pkValor);
  if (rowNum === -1) return respuestaJson({ ok: false, error: 'No encontrado.' });
  sheet.deleteRow(rowNum);
  return respuestaJson({ ok: true, mensaje: 'Producto dado de baja.' });
}

function productoModificacion(params) {
  var def = TABLAS.PRODUCTOS;
  var dato = params.dato || params;
  if (!dato[def.pk]) return respuestaJson({ ok: false, error: 'Falta ' + def.pk });
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: false, error: 'No existe la hoja ' + def.sheet });
  var rowNum = buscarFilaPorPK(sheet, def, dato[def.pk]);
  if (rowNum === -1) return respuestaJson({ ok: false, error: 'No encontrado.' });
  var fila = objetoAFila(def, dato);
  sheet.getRange(rowNum, 1, rowNum, def.columns.length).setValues([fila]);
  return respuestaJson({ ok: true, mensaje: 'Producto actualizado.' });
}

function productoLeer(params) {
  var def = TABLAS.PRODUCTOS;
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: true, datos: [] });
  var datos = sheet.getDataRange().getValues();
  if (datos.length < 2) return respuestaJson({ ok: true, datos: [] });
  var headers = datos[0];
  var filas = [];
  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = datos[i][c];
    filas.push(obj);
  }
  var id = params[def.pk] || params.id;
  if (id) {
    filas = filas.filter(function (f) { return String(f[def.pk]) === String(id); });
  }
  return respuestaJson({ ok: true, datos: filas });
}

// --- VENTAS (ENERO y futuras hojas por mes) ---

function ventaAlta(params) {
  var hojaNombre = params.hoja || 'ENERO';
  var def = TABLAS[hojaNombre] || { sheet: hojaNombre, pk: 'ID-VENTA', columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO'] };
  var idVenta = params.idVenta || '';
  var fechaOperativa = params.fechaOperativa || '';
  var hora = params.hora || '';
  var items = params.items || [];
  if (!idVenta || !items.length) return respuestaJson({ ok: false, error: 'Falta idVenta o items.' });
  var ss = getSS();
  var sheet = getHoja(ss, def.sheet, def.columns);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, def.columns.length).setValues([def.columns]);
    sheet.getRange(1, 1, 1, def.columns.length).setFontWeight('bold');
  }
  var filas = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    filas.push([idVenta, fechaOperativa, hora, it.idProducto || '', it.categoria || '', it.producto || '', it.monto || 0]);
  }
  sheet.getRange(sheet.getLastRow() + 1, 1, sheet.getLastRow() + filas.length, def.columns.length).setValues(filas);
  return respuestaJson({ ok: true, mensaje: 'Venta guardada.' });
}

function ventaBaja(params) {
  var hojaNombre = params.hoja || 'ENERO';
  var idVenta = params.idVenta || params['ID-VENTA'];
  if (!idVenta) return respuestaJson({ ok: false, error: 'Falta idVenta.' });
  var def = TABLAS[hojaNombre] || { sheet: hojaNombre, pk: 'ID-VENTA' };
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: false, error: 'No existe la hoja ' + def.sheet });
  var datos = sheet.getDataRange().getValues();
  if (datos.length < 2) return respuestaJson({ ok: true, mensaje: 'Nada que borrar.' });
  var colIdx = datos[0].indexOf('ID-VENTA');
  if (colIdx === -1) return respuestaJson({ ok: false, error: 'Columna ID-VENTA no encontrada.' });
  var filasABorrar = [];
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colIdx]) === String(idVenta)) filasABorrar.push(i + 1);
  }
  for (var j = filasABorrar.length - 1; j >= 0; j--) sheet.deleteRow(filasABorrar[j]);
  return respuestaJson({ ok: true, mensaje: 'Venta dada de baja.', filasBorradas: filasABorrar.length });
}

function ventaModificacion(params) {
  var hojaNombre = params.hoja || 'ENERO';
  var idVenta = params.idVenta || params['ID-VENTA'];
  var items = params.items || [];
  if (!idVenta) return respuestaJson({ ok: false, error: 'Falta idVenta.' });
  var def = TABLAS[hojaNombre] || { sheet: hojaNombre, pk: 'ID-VENTA', columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO'] };
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: false, error: 'No existe la hoja ' + def.sheet });
  var datos = sheet.getDataRange().getValues();
  var colIdx = datos[0].indexOf('ID-VENTA');
  if (colIdx === -1) return respuestaJson({ ok: false, error: 'Columna ID-VENTA no encontrada.' });
  var filasActualizadas = 0;
  var filaIdx = 1;
  for (var i = 1; i < datos.length; i++) {
    if (String(datos[i][colIdx]) === String(idVenta) && items[filasActualizadas]) {
      var it = items[filasActualizadas];
      sheet.getRange(i + 1, 1, i + 1, def.columns.length).setValues([[idVenta, it.fechaOperativa || datos[i][1], it.hora || datos[i][2], it.idProducto || datos[i][3], it.categoria || datos[i][4], it.producto || datos[i][5], it.monto !== undefined ? it.monto : datos[i][6]]]);
      filasActualizadas++;
    }
    filaIdx++;
  }
  return respuestaJson({ ok: true, mensaje: 'Venta actualizada.', filasActualizadas: filasActualizadas });
}

function ventaLeer(params) {
  var hojaNombre = params.hoja || 'ENERO';
  var idVenta = params.idVenta || params['ID-VENTA'];
  var def = TABLAS[hojaNombre] || { sheet: hojaNombre, columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO'] };
  var ss = getSS();
  var sheet = ss.getSheetByName(def.sheet);
  if (!sheet) return respuestaJson({ ok: true, datos: [] });
  var datos = sheet.getDataRange().getValues();
  if (datos.length < 2) return respuestaJson({ ok: true, datos: [] });
  var headers = datos[0];
  var filas = [];
  for (var i = 1; i < datos.length; i++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) obj[headers[c]] = datos[i][c];
    filas.push(obj);
  }
  if (idVenta) filas = filas.filter(function (f) { return String(f['ID-VENTA']) === String(idVenta); });
  return respuestaJson({ ok: true, datos: filas });
}

function respuestaJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

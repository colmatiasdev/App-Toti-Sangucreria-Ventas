/**
 * Definición de tablas del Sheet (columnas y PK).
 * Cada tabla = una hoja en el documento. Se pueden agregar más tablas luego.
 */
(function (global) {
  'use strict';

  var Tables = {
    /** Tabla PRODUCTOS: hoja "PRODUCTOS". PK = ID-PRODUCTO */
    PRODUCTOS: {
      sheet: 'PRODUCTOS',
      pk: 'ID-PRODUCTO',
      columns: ['ID-PRODUCTO', 'CATEGORIA', 'NOMBRE-PRODUCTO', 'PRECIO', 'HABILITADO']
    },

    /** Tablas de ventas por mes. PK = ID-VENTA (puede haber varias filas por venta). */
    ENERO: {
      sheet: 'ENERO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    FEBRERO: {
      sheet: 'FEBRERO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    MARZO: {
      sheet: 'MARZO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    ABRIL: {
      sheet: 'ABRIL',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    MAYO: {
      sheet: 'MAYO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    JUNIO: {
      sheet: 'JUNIO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    JULIO: {
      sheet: 'JULIO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    AGOSTO: {
      sheet: 'AGOSTO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    SEPTIEMBRE: {
      sheet: 'SEPTIEMBRE',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    OCTUBRE: {
      sheet: 'OCTUBRE',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    NOVIEMBRE: {
      sheet: 'NOVIEMBRE',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },
    DICIEMBRE: {
      sheet: 'DICIEMBRE',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'MONTO']
    },

    /** Tabla RESUMEN-VENTAS: resumen por mes, categoría y producto. */
    RESUMEN_VENTAS: {
      sheet: 'RESUMEN-VENTAS',
      pk: 'MES',
      columns: ['MES', 'CATEGORIA', 'NOMBRE-PRODUCTO', 'CANTIDAD', 'MONTO']
    }
  };

  /** Nombres de hojas por mes (1=ENERO … 12=DICIEMBRE). Ir agregando tablas ENERO, FEBRERO, etc. */
  Tables.NOMBRES_HOJAS_MES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  global.APP_TABLES = Tables;
})(typeof window !== 'undefined' ? window : this);

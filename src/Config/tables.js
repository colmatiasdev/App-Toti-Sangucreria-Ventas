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

    /** Tabla ENERO: hoja "ENERO". PK = ID-VENTA (puede haber varias filas por venta). */
    ENERO: {
      sheet: 'ENERO',
      pk: 'ID-VENTA',
      columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO']
    }

    /* Agregar más tablas aquí, ej.:
    FEBRERO: { sheet: 'FEBRERO', pk: 'ID-VENTA', columns: ['ID-VENTA', 'FECHA_OPERATIVA', 'HORA', 'ID-PRODUCTO', 'CATEGORIA', 'PRODUCTO', 'MONTO'] },
    */
  };

  /** Nombres de hojas por mes (1=ENERO … 12=DICIEMBRE). Ir agregando tablas ENERO, FEBRERO, etc. */
  Tables.NOMBRES_HOJAS_MES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  global.APP_TABLES = Tables;
})(typeof window !== 'undefined' ? window : this);

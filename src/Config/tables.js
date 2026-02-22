/**
 * Definición de tablas (columnas y claves primarias).
 * Debe cargarse después de config.js si se usa APP_CONFIG.
 */
(function (global) {
  'use strict';

  var Tables = {
    PRODUCTOS: {
      pk: 'ID-PRODUCTO',
      columns: ['ID-PRODUCTO', 'CATEGORIA', 'NOMBRE-PRODUCTO', 'PRECIO', 'HABILITADO']
    }
  };

  global.APP_TABLES = Tables;
})(typeof window !== 'undefined' ? window : this);

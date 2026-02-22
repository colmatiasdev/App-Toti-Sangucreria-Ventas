/**
 * Configuración centralizada de la aplicación.
 * Rutas para Google Sheet (lectura CSV) y Apps Script (operaciones).
 */
(function (global) {
  'use strict';

  var Config = {
    /** URL pública del Google Sheet en formato CSV (solo lectura). */
    GOOGLE_SHEET_CSV_URL:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRNYUmSj5Zpu85PtNg_8ZQPXbj1HsL8H8Or06RpoHpDW5EPj4TpXwVWvumDpujNQdlBnQhXDIujlt2A/pub?output=csv',

    /** URL del Web App de Google Apps Script para operaciones con la hoja (guardar, actualizar, etc.). */
    APP_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxpzOpWq_FUVOQbfcaJj9223Z7Y23loIKw5HMGui-2URkwyHbe_-pk9k4j7S2zp6BAE/exec',

    /**
     * Proxy CORS para leer la respuesta del Apps Script desde localhost o GitHub Pages.
     * Sin proxy el navegador bloquea la respuesta (CORS); la venta se guarda igual pero no se puede leer el JSON.
     * Con proxy la petición pasa por el servidor y se evita el error en consola.
     * Para desactivar: CORS_PROXY: ''
     */
    CORS_PROXY: 'https://corsproxy.io/?'
  };

  global.APP_CONFIG = Config;
})(typeof window !== 'undefined' ? window : this);

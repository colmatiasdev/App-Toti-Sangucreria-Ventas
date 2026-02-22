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
    APP_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxzWZrYA7F_pJ0qXrjUqNwmZbH6_S8FCGwhGj4JwQGSx5BdrZhw-m_8H2CFNpkzmTNt/exec',

    /**
     * Proxy CORS (dejar vacío para enviar directo al Apps Script).
     * Sin proxy: la venta se guarda; el navegador puede bloquear la respuesta por CORS y se muestra mensaje de confirmación igual.
     * Algunos proxies (corsproxy.io) dan 502; si pasa, deja CORS_PROXY: ''
     */
    CORS_PROXY: ''
  };

  global.APP_CONFIG = Config;
})(typeof window !== 'undefined' ? window : this);

'use strict';

/**
 * Módulo de funciones de manejo de texto
 * Contiene funciones para manipular y procesar cadenas de texto
 */

/**
 * Trunca un texto a una longitud máxima y añade puntos suspensivos si es necesario
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima del texto
 * @returns {string} Texto truncado con "..." si excede la longitud
 */
export const truncateText = (text, maxLength) => {
  if (!text) {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto con la primera letra en mayúscula
 */
export const capitalizeFirst = (text) => {
  if (!text) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convierte un texto a formato slug (URL-friendly)
 * @param {string} text - Texto a convertir
 * @returns {string} Texto en formato slug
 */
export const slugify = (text) => {
  if (!text) {
    return '';
  }
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Limpia un número de teléfono, dejando solo dígitos
 * @param {string} phone - Número de teléfono a limpiar
 * @returns {string} Número de teléfono solo con dígitos
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) {
    return '';
  }
  return phone.replace(/[^\d]/g, '');
};

/**
 * Limita la longitud de un texto
 * @param {string} text - Texto a limitar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto limitado a la longitud especificada
 */
export const limitTextLength = (text, maxLength) => {
  if (!text) {
    return '';
  }
  if (text.length > maxLength) {
    return text.slice(0, maxLength);
  }
  return text;
};


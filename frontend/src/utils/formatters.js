'use strict';

/**
 * Módulo de funciones de formato
 * Contiene funciones para formatear datos como precios, fechas, etc.
 */

/**
 * Formatea un valor numérico como precio en formato de moneda EUR
 * @param {number|string} value - Valor numérico a formatear
 * @returns {string} Precio formateado en formato EUR (ej: "29,95 €")
 */
export const formatPrice = (value) => {
  if (value === null || value === undefined) {
    return '—';
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue <= 0) {
    return 'Consultar';
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numericValue);
};

/**
 * Formatea una fecha en formato español completo
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} Fecha formateada en español (ej: "23 de diciembre de 2025, 17:08")
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea un número de teléfono
 * @param {string} phone - Número de teléfono a formatear
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) {
    return 'No especificado';
  }
  return phone;
};


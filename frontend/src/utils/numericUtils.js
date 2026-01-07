'use strict';

/**
 * Módulo de funciones numéricas
 * Contiene funciones para operaciones y validaciones numéricas
 */

/**
 * Verifica si un valor es un número válido
 * @param {*} value - Valor a verificar
 * @returns {boolean} true si es un número válido, false si no lo es
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined) {
    return false;
  }
  const numericValue = Number(value);
  return !Number.isNaN(numericValue) && isFinite(numericValue);
};

/**
 * Convierte un valor a número, retornando un valor por defecto si no es válido
 * @param {*} value - Valor a convertir
 * @param {number} defaultValue - Valor por defecto si la conversión falla
 * @returns {number} Número convertido o valor por defecto
 */
export const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || !isFinite(numericValue)) {
    return defaultValue;
  }
  return numericValue;
};

/**
 * Redondea un número a un número específico de decimales
 * @param {number} value - Número a redondear
 * @param {number} decimals - Número de decimales
 * @returns {number} Número redondeado
 */
export const roundToDecimals = (value, decimals = 2) => {
  const numericValue = toNumber(value, 0);
  const multiplier = Math.pow(10, decimals);
  return Math.round(numericValue * multiplier) / multiplier;
};

/**
 * Verifica si un número está dentro de un rango
 * @param {number} value - Número a verificar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} true si está en el rango, false si no
 */
export const isInRange = (value, min, max) => {
  const numericValue = toNumber(value);
  return numericValue >= min && numericValue <= max;
};

/**
 * Calcula un porcentaje de un valor
 * @param {number} value - Valor base
 * @param {number} percentage - Porcentaje a calcular
 * @returns {number} Resultado del porcentaje
 */
export const calculatePercentage = (value, percentage) => {
  const numericValue = toNumber(value, 0);
  const numericPercentage = toNumber(percentage, 0);
  return (numericValue * numericPercentage) / 100;
};


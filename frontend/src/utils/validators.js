'use strict';

/**
 * Módulo de funciones de validación
 * Contiene funciones para validar datos de formularios y entradas de usuario
 */

/**
 * Valida una contraseña según los requisitos del sistema
 * @param {string} password - Contraseña a validar
 * @returns {string} Mensaje de error vacío si es válida, mensaje de error si no lo es
 */
export const validatePassword = (password) => {
  if (password.length === 0) {
    return '';
  }
  if (password.length > 12) {
    return 'La contraseña debe tener máximo 12 caracteres';
  }
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  return '';
};

/**
 * Valida un email según el formato requerido
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido, false si no lo es
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un número de teléfono (solo números, máximo 9 dígitos)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} true si es válido, false si no lo es
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return true; // El teléfono es opcional
  }
  const phoneRegex = /^[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Primera contraseña
 * @param {string} passwordConfirmation - Confirmación de contraseña
 * @returns {boolean} true si coinciden, false si no
 */
export const validatePasswordMatch = (password, passwordConfirmation) => {
  return password === passwordConfirmation;
};

/**
 * Valida un nombre (no vacío, longitud razonable)
 * @param {string} name - Nombre a validar
 * @returns {boolean} true si es válido, false si no lo es
 */
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return false;
  }
  if (name.length > 255) {
    return false;
  }
  return true;
};


'use strict';

/**
 * @fileoverview Servicios de API para comunicación con el backend
 * Este módulo contiene todos los servicios para interactuar con la API REST del backend.
 * Utiliza Axios como cliente HTTP y maneja autenticación mediante tokens Bearer.
 */

import axios from 'axios';

/**
 * URL base de la API
 * Si REACT_APP_API_URL está definida, la usa. Si no, usa ruta relativa /api para producción
 * o localhost para desarrollo
 * @type {string}
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api');

/**
 * Instancia de Axios configurada para la API
 * @type {AxiosInstance}
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

/**
 * Interceptor de peticiones que añade el token de autenticación
 * @param {Object} config - Configuración de la petición
 * @returns {Object} Configuración de la petición con token añadido
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas para manejo de errores
 * @param {Object} response - Respuesta de la API
 * @returns {Object} Respuesta de la API
 * @param {Error} error - Error de la petición
 * @returns {Promise} Promise rechazada con el error
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Servicio de autenticación
 * Maneja registro, login, logout y obtención de perfil de usuario
 */
export const authService = {
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.name - Nombre del usuario
   * @param {string} userData.email - Email del usuario (debe ser @gmail.com)
   * @param {string} userData.password - Contraseña (8-12 caracteres, mayúscula y número)
   * @param {string} userData.password_confirmation - Confirmación de contraseña
   * @param {string} [userData.phone] - Teléfono del usuario (opcional, máximo 9 dígitos)
   * @returns {Promise<Object>} Respuesta con datos del usuario y token
   */
  register: async (userData) => {
    const response = await api.post('/register', userData);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Inicia sesión con credenciales de usuario
   * @param {Object} credentials - Credenciales de acceso
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Respuesta con datos del usuario y token
   */
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.success) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Cierra la sesión del usuario actual
   * Elimina el token del servidor y del localStorage
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Obtiene los datos del usuario actualmente autenticado
   * @returns {Promise<Object>} Datos del usuario
   */
  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  /**
   * Obtiene el perfil del usuario actualmente autenticado
   * @returns {Promise<Object>} Perfil del usuario
   */
  getProfile: async () => {
    const response = await api.get('/user');
    return response.data;
  },
};

/**
 * Servicio de citas (appointments)
 * Maneja todas las operaciones CRUD relacionadas con citas
 */
export const appointmentService = {
  /**
   * Obtiene todas las citas del usuario autenticado
   * @returns {Promise<Object>} Lista de citas
   */
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  /**
   * Crea una nueva cita
   * @param {Object} appointmentData - Datos de la cita
   * @param {string} appointmentData.date - Fecha de la cita (formato: YYYY-MM-DD)
   * @param {string} appointmentData.time - Hora de la cita (formato: HH:mm)
   * @param {number} appointmentData.barbero_id - ID del barbero
   * @param {string} appointmentData.service_type - Tipo de servicio
   * @param {string} [appointmentData.notes] - Notas adicionales (opcional)
   * @returns {Promise<Object>} Datos de la cita creada
   */
  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  /**
   * Obtiene una cita por su ID
   * @param {number|string} id - ID de la cita
   * @returns {Promise<Object>} Datos de la cita
   */
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Actualiza una cita existente
   * @param {number|string} id - ID de la cita a actualizar
   * @param {Object} appointmentData - Nuevos datos de la cita
   * @returns {Promise<Object>} Datos de la cita actualizada
   */
  update: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  /**
   * Elimina una cita
   * @param {number|string} id - ID de la cita a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};

/**
 * Servicio de usuarios
 * Maneja operaciones relacionadas con el perfil y datos del usuario
 */
export const userService = {
  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Perfil del usuario
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} profileData - Datos del perfil a actualizar
   * @param {string} [profileData.name] - Nuevo nombre
   * @param {string} [profileData.phone] - Nuevo teléfono
   * @returns {Promise<Object>} Perfil actualizado
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  /**
   * Obtiene los puntos del usuario autenticado
   * @returns {Promise<Object>} Puntos del usuario
   */
  getPoints: async () => {
    const response = await api.get('/points');
    return response.data;
  },

  /**
   * Actualiza el email del usuario autenticado
   * @param {Object} emailData - Datos del email
   * @param {string} emailData.email - Nuevo email
   * @returns {Promise<Object>} Confirmación de actualización
   */
  updateEmail: async (emailData) => {
    const response = await api.put('/profile/email', emailData);
    return response.data;
  },
};

/**
 * Servicio de barberos
 * Maneja todas las operaciones CRUD relacionadas con barberos
 */
export const barberoService = {
  /**
   * Obtiene todos los barberos con opciones de búsqueda y ordenamiento
   * @param {string} [search=''] - Término de búsqueda por nombre
   * @param {string} [sort='asc'] - Ordenamiento ('asc' o 'desc')
   * @returns {Promise<Object>} Lista de barberos
   */
  getAll: async (search = '', sort = 'asc') => {
    const response = await api.get('/barberos', {
      params: { search, sort }
    });
    return response.data;
  },

  /**
   * Crea un nuevo barbero (solo administradores)
   * @param {Object} barberoData - Datos del barbero
   * @param {string} barberoData.name - Nombre del barbero
   * @param {string} barberoData.email - Email del barbero (debe terminar en @barbero.com)
   * @param {string} barberoData.password - Contraseña
   * @param {string} [barberoData.phone] - Teléfono (opcional)
   * @returns {Promise<Object>} Datos del barbero creado
   */
  create: async (barberoData) => {
    const response = await api.post('/barberos', barberoData);
    return response.data;
  },

  /**
   * Obtiene un barbero por su ID
   * @param {number|string} id - ID del barbero
   * @returns {Promise<Object>} Datos del barbero
   */
  getById: async (id) => {
    const response = await api.get(`/barberos/${id}`);
    return response.data;
  },

  /**
   * Actualiza un barbero existente
   * @param {number|string} id - ID del barbero a actualizar
   * @param {Object} barberoData - Nuevos datos del barbero
   * @returns {Promise<Object>} Datos del barbero actualizado
   */
  update: async (id, barberoData) => {
    const response = await api.put(`/barberos/${id}`, barberoData);
    return response.data;
  },

  /**
   * Elimina un barbero
   * @param {number|string} id - ID del barbero a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    const response = await api.delete(`/barberos/${id}`);
    return response.data;
  },
};

/**
 * Servicio de productos
 * Maneja operaciones relacionadas con productos de la tienda
 */
export const productService = {
  /**
   * Obtiene una lista de productos con filtros y paginación
   * @param {Object} [params={}] - Parámetros de búsqueda y filtrado
   * @param {string} [params.search] - Término de búsqueda
   * @param {string} [params.category] - Filtrar por categoría
   * @param {string} [params.brand] - Filtrar por marca
   * @param {number} [params.page] - Número de página
   * @param {number} [params.per_page] - Productos por página
   * @param {string} [params.sort_by] - Campo para ordenar (name, price, created_at)
   * @param {string} [params.sort_direction] - Dirección de ordenamiento (asc, desc)
   * @returns {Promise<Object>} Lista paginada de productos
   */
  list: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Obtiene un producto por su ID o slug
   * @param {number|string} idOrSlug - ID numérico o slug del producto
   * @returns {Promise<Object>} Datos del producto
   */
  getByIdOrSlug: async (idOrSlug) => {
    const response = await api.get(`/products/${idOrSlug}`);
    return response.data;
  },
};

/**
 * Servicio público de barberos
 * Endpoints públicos para obtener información de barberos disponibles
 */
export const publicBarberoService = {
  /**
   * Obtiene la lista de barberos disponibles para citas
   * @returns {Promise<Object>} Lista de barberos disponibles
   */
  getAvailable: async () => {
    const response = await api.get('/barberos/available');
    return response.data;
  },
};

/**
 * Servicio de reseñas
 * Maneja operaciones relacionadas con reseñas de usuarios
 */
export const reviewService = {
  /**
   * Obtiene una lista de reseñas con paginación
   * @param {Object} [params={}] - Parámetros de paginación
   * @param {number} [params.page] - Número de página
   * @param {number} [params.per_page] - Reseñas por página
   * @returns {Promise<Object>} Lista paginada de reseñas
   */
  list: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },
  
  /**
   * Crea una nueva reseña
   * @param {Object} payload - Datos de la reseña
   * @param {string} payload.comment - Comentario de la reseña
   * @param {number} [payload.rating] - Calificación (opcional)
   * @returns {Promise<Object>} Datos de la reseña creada
   */
  create: async (payload) => {
    const response = await api.post('/reviews', payload);
    return response.data;
  },
  
  /**
   * Elimina una reseña
   * @param {number|string} id - ID de la reseña a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
};

/**
 * Servicio de estadísticas
 * Maneja operaciones relacionadas con estadísticas y análisis
 */
export const statsService = {
  /**
   * Obtiene datos del estudio de mercado
   * @returns {Promise<Object>} Datos del estudio de mercado
   */
  getMarketStudy: async () => {
    const response = await api.get('/stats/market-study');
    return response.data;
  },
};

export default api; 
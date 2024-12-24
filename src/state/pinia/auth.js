// src/stores/authStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userLogin: {
      id: '',
      name: '',
      email: '',
      profile: '',
    },
    csrfToken: '',
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('/v1/auth/login', { email, password });
        await this.saveToken(response.data.token);
        await this.saveUserLogin();
      } catch (error) {
        console.error('Login failed', error);
      }
    },
    async saveCsrf() {
      try {
        const response = await axios.get('/v1/auth/csrf');
        this.csrfToken = response.data.data;
        localStorage.setItem('csrf', this.csrfToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token', error);
      }
    },
    getCsrf() {
      return localStorage.getItem('csrf') || '';
    },
    async logout() {
      await this.removeToken();
      this.userLogin = {
        id: '',
        name: '',
        email: '',
        profile: '',
      };
    },
    async saveUserLogin() {
      try {
        const response = await axios.get('/v1/auth/profile');
        this.userLogin = response.data.data;
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      }
    },
    async saveToken(token) {
      localStorage.setItem('user', token);
    },
    async removeToken() {
      localStorage.removeItem('user');
    },
    getToken() {
      return localStorage.getItem('user') || '';
    }
  }
});

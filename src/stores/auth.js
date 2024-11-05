// src/stores/auth.js
import { defineStore } from 'pinia';
import api from '@/api/api';
import {jwtDecode} from 'jwt-decode';
import { useMasterDataStore } from './masterData';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'));
  const refreshToken = ref(localStorage.getItem('refreshToken'));
  const masterData = useMasterDataStore();

  const setTokens = (newToken, newRefreshToken) => {
    token.value = newToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  };

  const login = (username, password) => {
    return api.post('api/auth/login', { UserName: username, PassWord: password })
      .then(response => {
        masterData.setCategoryService(response.data.serviceCategory);
        masterData.setUserInfo(response.data.user);
        setTokens(response.data.token, response.data.refreshToken);
        return true;
      })
      .catch(error => {
        return false;
      });
  };

  const logout = () => {
    token.value = null;
    refreshToken.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const getRefreshToken = () => {
    return api.post('api/auth/refresh', { RefreshToken: refreshToken.value })
      .then(response => {
        setTokens(response.data.token, response.data.refreshToken);
        return true;
      })
      .catch(error => {
        return false;
      });
  };

  const isTokenValid = () => {
    if (token.value == "undefined" || token.value == null) {
      return false;
    }
    const { expried } = jwtDecode(token.value);
    const expriedTimestamp = Date.parse(expried);
    return expriedTimestamp > Date.now();
  };

  const isRefreshTokenValid = () => {
    if (refreshToken.value == "undefined" || token.value == null) return false;
    const { expried } = jwtDecode(refreshToken.value);
    const expriedTimestamp = Date.parse(expried);
    return expriedTimestamp > Date.now();
  };

  return {
    token,
    refreshToken,
    login,
    logout,
    setTokens,
    getRefreshToken,
    isTokenValid,
    isRefreshTokenValid,
  };
});
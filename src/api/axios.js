import axios from "axios";
import config from "../config/env.js";

const api = axios.create({
    baseURL: config.apiUrl,
});

// 👇 Interceptor: se ejecuta ANTES de cualquier request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        delete config.headers.Authorization;
    }

    return config;
});

export default api;

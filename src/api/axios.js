import axios from "axios";
import config from "../config/env.js";

const BUSINESS_ID_STORAGE_KEY = "appsfly_business_id";

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

    const businessId = sessionStorage.getItem(BUSINESS_ID_STORAGE_KEY);
    if (businessId) {
        config.headers["X-AppsFly-Business-Id"] = businessId;
    }

    return config;
});

export default api;

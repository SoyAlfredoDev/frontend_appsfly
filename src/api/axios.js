import axios from "axios";

const isDevelopment = import.meta.env.DEV;

const instance = axios.create({
    baseURL: isDevelopment
        ? import.meta.env.VITE_API_URL_DEV
        : import.meta.env.VITE_API_URL_PROD,

    withCredentials: true
});

export default instance;
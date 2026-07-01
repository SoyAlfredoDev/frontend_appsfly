import axios from "axios";
import config from "../config/env.js";

const publicApi = axios.create({
    baseURL: config.apiUrl,
});

export const fetchPublicSaleReceipt = (token) =>
    publicApi.get(`/public/sales/receipt/${token}`);

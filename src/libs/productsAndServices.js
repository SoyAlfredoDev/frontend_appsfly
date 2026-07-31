import { getProducts } from "../api/product";
import { getServices } from "../api/service";
import { unwrapListPayload } from "../utils/listPayload.js";

export const getProductsAndServices = async (config) => {
    try {
        const listConfig = {
            ...(config || {}),
            params: {
                page: 1,
                limit: 200,
                ...((config && config.params) || {}),
            },
        };
        const [productsResult, servicesResult] = await Promise.allSettled([
            getProducts(listConfig),
            getServices(listConfig),
        ]);

        const productsRaw =
            productsResult.status === "fulfilled" ? productsResult.value.data : [];
        const servicesRaw =
            servicesResult.status === "fulfilled" ? servicesResult.value.data : [];

        const products = unwrapListPayload(productsRaw).rows;
        const services = Array.isArray(servicesRaw)
            ? servicesRaw
            : unwrapListPayload(servicesRaw).rows;

        if (productsResult.status === "rejected") {
            console.error(">>>>>> getProductsAndServices.js (products):", productsResult.reason);
        }
        if (servicesResult.status === "rejected") {
            console.error(">>>>>> getProductsAndServices.js (services):", servicesResult.reason);
        }

        const productsWithType = products.map((product) => ({
            ...product,
            type: "PRODUCT",
        }));
        const servicesWithType = services.map((service) => ({
            ...service,
            type: "SERVICE",
        }));

        return [...productsWithType, ...servicesWithType];
    } catch (error) {
        console.error(">>>>>> getProductsAndServices.js:", error);
        return [];
    }
};

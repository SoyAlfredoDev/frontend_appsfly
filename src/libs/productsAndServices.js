import { getProducts } from "../api/product";
import { getServices } from "../api/service";

export const getProductsAndServices = async (config) => {
    try {
        const [productsResult, servicesResult] = await Promise.allSettled([
            getProducts(config),
            getServices(config),
        ]);

        const products =
            productsResult.status === "fulfilled" ? productsResult.value.data ?? [] : [];
        const services =
            servicesResult.status === "fulfilled" ? servicesResult.value.data ?? [] : [];

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

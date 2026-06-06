import { getProducts } from "../api/product";
import { getServices } from "../api/service";

export const getProductsAndServices = async (config) => {
    try {
        const [products_, services_] = await Promise.all([
            getProducts(config),
            getServices(config),
        ]);
        const products = products_.data;
        const services = services_.data;
        const productsWithType = products.map(product => ({
            ...product,
            type: "PRODUCT"
        }));
        const servicesWithType = services.map(service => ({
            ...service,
            type: "SERVICE"
        }));
        return [...productsWithType, ...servicesWithType];
    } catch (error) {
        console.error(">>>>>> getProductsAndServices.js:", error);
        return [];
    }
};

export const categoriesByType = (data) => {
    //Esto lo puedo hacer desde el backend 
    const categoriesProduct = [];
    const categoriesService = [];

    for (const d of data) {
        if (d.allowedFor === "PRODUCTS" || d.allowedFor === "BOTH") {

            categoriesProduct.push(d.categoryId);
        }

        if (d.allowedFor === "SERVICES" || d.allowedFor === "BOTH") {
            categoriesService.push(d.categoryId);
        }
    }
    return {
        products: categoriesProduct,
        services: categoriesService
    };
}

export const categoriesArray = (data) => {
    //console.log('data', data);
    return data.map(d => ({ [d.categoryId]: true }));
};

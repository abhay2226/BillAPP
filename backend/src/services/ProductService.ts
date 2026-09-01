import { AppDataSource } from "../datasource.js";
import { Product } from "../entity/TransactionsProduct.js";

const productRepository = AppDataSource.getRepository(Product);

export const createProductService = async (
    productData: Partial<Product>
) => {
    const product = productRepository.create(productData);
    return await productRepository.save(product);
};

export const getAllProductsService = async (storeId?: number) => {
    if (storeId) {
        return await productRepository.find({
            where: { store_id: storeId },
            relations: ["store", "type", "brand", "uom"]
        });
    }

    return await productRepository.find({
        relations: ["store", "type", "brand", "uom"]
    });
};

export const getProductByIdService = async (productId: number) => {
    return await productRepository.findOne({
        where: { product_id: productId },
        relations: ["store", "type", "brand", "uom"]
    });
};

export const updateProductService = async (
    productId: number,
    productData: Partial<Product>
) => {
    const product = await productRepository.findOne({
        where: { product_id: productId }
    });

    if (!product) {
        return null;
    }

    Object.assign(product, productData);

    return await productRepository.save(product);
};

export const deleteProductService = async (productId: number) => {
    const product = await productRepository.findOne({
        where: { product_id: productId }
    });

    if (!product) {
        return null;
    }

    await productRepository.remove(product);

    return product;
};
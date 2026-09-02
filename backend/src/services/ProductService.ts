import { AppDataSource } from "../datasource.js";
import { Product } from "../entity/TransactionsProduct.js";

const productRepository = AppDataSource.getRepository(Product);



// CREATE PRODUCT

export const createProductService = async (
    productData: Partial<Product>
) => {

    const product = productRepository.create(
        productData
    );

    return await productRepository.save(
        product
    );
};



// GET ALL PRODUCTS
// SEARCH PRODUCT BY NAME
// FILTER PRODUCT BY STORE

export const getAllProductsService = async (
    storeId?: number,
    productName?: string
) => {

    const query = productRepository
        .createQueryBuilder("product")

        .leftJoinAndSelect(
            "product.store",
            "store"
        )

        .leftJoinAndSelect(
            "product.type",
            "type"
        )

        .leftJoinAndSelect(
            "product.brand",
            "brand"
        )

        .leftJoinAndSelect(
            "product.uom",
            "uom"
        )

        .where(
            "product.is_active = :isActive",
            {
                isActive: true
            }
        );


    // FILTER BY STORE

    if (storeId !== undefined) {

        query.andWhere(
            "product.store_id = :storeId",
            {
                storeId: storeId
            }
        );
    }


    // SEARCH BY PRODUCT NAME

    if (
        productName !== undefined &&
        productName.trim() !== ""
    ) {

        query.andWhere(
            "LOWER(product.product_name) LIKE LOWER(:productName)",
            {
                productName: `%${productName.trim()}%`
            }
        );
    }


    return await query
        .orderBy(
            "product.product_id",
            "ASC"
        )
        .getMany();
};



// GET PRODUCT BY ID

export const getProductByIdService = async (
    productId: number
) => {

    return await productRepository.findOne({

        where: {
            product_id: productId,
            is_active: true
        },

        relations: [
            "store",
            "type",
            "brand",
            "uom"
        ]
    });
};



// UPDATE PRODUCT

export const updateProductService = async (
    productId: number,
    productData: Partial<Product>
) => {

    const product = await productRepository.findOne({

        where: {
            product_id: productId,
            is_active: true
        }
    });


    if (!product) {
        return null;
    }


    Object.assign(
        product,
        productData
    );


    return await productRepository.save(
        product
    );
};



// DELETE / DEACTIVATE PRODUCT

export const deleteProductService = async (
    productId: number
) => {

    const product = await productRepository.findOne({

        where: {
            product_id: productId,
            is_active: true
        }
    });


    if (!product) {
        return null;
    }


    // SOFT DELETE

    product.is_active = false;


    return await productRepository.save(
        product
    );
};
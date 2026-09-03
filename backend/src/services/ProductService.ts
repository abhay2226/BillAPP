import { AppDataSource } from "../datasource.js";
import { Product } from "../entity/TransactionsProduct.js";

const productRepository = AppDataSource.getRepository(Product);


// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProductService = async (
    productData: Partial<Product>
) => {

    const storeId = productData.store_id;
    const productName = productData.product_name;
    const typeId = productData.type_id;
    const brandId = productData.brand_id;
    const unitId = productData.unit_id;
    const unitQuantity = productData.unit_quantity;


    // VALIDATE STORE ID

    if (
        storeId === undefined ||
        !Number.isInteger(storeId) ||
        storeId <= 0
    ) {
        throw new Error(
            "Valid store ID is required"
        );
    }


    // VALIDATE PRODUCT NAME

    if (
        productName === undefined ||
        productName.trim() === ""
    ) {
        throw new Error(
            "Product name is required"
        );
    }


    // VALIDATE PRODUCT TYPE

    if (
        typeId === undefined ||
        !Number.isInteger(typeId) ||
        typeId <= 0
    ) {
        throw new Error(
            "Valid product type ID is required"
        );
    }


    // VALIDATE BRAND

    if (
        brandId === undefined ||
        !Number.isInteger(brandId) ||
        brandId <= 0
    ) {
        throw new Error(
            "Valid brand ID is required"
        );
    }


    // VALIDATE UNIT

    if (
        unitId === undefined ||
        !Number.isInteger(unitId) ||
        unitId <= 0
    ) {
        throw new Error(
            "Valid unit ID is required"
        );
    }


    // VALIDATE UNIT QUANTITY

    if (
        unitQuantity === undefined ||
        Number(unitQuantity) <= 0
    ) {
        throw new Error(
            "Unit quantity must be greater than 0"
        );
    }


    const trimmedProductName =
        productName.trim();


    const quantity =
        Number(unitQuantity);


    // ==================================================
    // CHECK DUPLICATE PRODUCT
    // Same product name is not allowed
    // inside the same store
    // ==================================================

    const existingProduct =
        await productRepository.findOne({

            where: {
                store_id: storeId,
                product_name: trimmedProductName
            }

        });


    if (existingProduct) {

        throw new Error(
            "A product with this name already exists in this store."
        );
    }


    // ==================================================
    // CREATE PRODUCT
    // ==================================================

    const product =
        productRepository.create({

            store_id: storeId,

            product_name:
                trimmedProductName,

            type_id: typeId,

            brand_id: brandId,

            unit_id: unitId,

            unit_quantity: quantity,

            is_active: true,

            created_at: new Date(),

            created_by: null,

            updated_at: null,

            updated_by: null

        });


    return await productRepository.save(
        product
    );
};


// ======================================================
// GET ALL PRODUCTS
// SEARCH PRODUCT BY NAME
// FILTER PRODUCT BY STORE
// ======================================================

export const getAllProductsService = async (
    storeId?: number,
    productName?: string
) => {

    const query =
        productRepository

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


    // ==================================================
    // FILTER BY STORE
    // ==================================================

    if (storeId !== undefined) {

        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {
            throw new Error(
                "Invalid store ID"
            );
        }


        query.andWhere(
            "product.store_id = :storeId",
            {
                storeId: storeId
            }
        );
    }


    // ==================================================
    // SEARCH BY PRODUCT NAME
    // ==================================================

    if (
        productName !== undefined &&
        productName.trim() !== ""
    ) {

        query.andWhere(

            "LOWER(product.product_name) LIKE LOWER(:productName)",

            {
                productName:
                    `%${productName.trim()}%`
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


// ======================================================
// GET PRODUCT BY ID
// ======================================================

export const getProductByIdService = async (
    productId: number
) => {

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error(
            "Invalid product ID"
        );
    }


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


// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProductService = async (
    productId: number,
    productData: Partial<Product>
) => {

    const product =
        await productRepository.findOne({

            where: {

                product_id: productId,

                is_active: true

            }

        });


    if (!product) {

        return null;

    }


    // ==================================================
    // UPDATE STORE
    // ==================================================

    if (
        productData.store_id !== undefined
    ) {

        if (
            !Number.isInteger(
                productData.store_id
            ) ||
            productData.store_id <= 0
        ) {

            throw new Error(
                "Invalid store ID"
            );

        }

        product.store_id =
            productData.store_id;
    }


    // ==================================================
    // UPDATE PRODUCT NAME
    // ==================================================

    if (
        productData.product_name !== undefined
    ) {

        const trimmedProductName =
            productData.product_name.trim();


        if (
            trimmedProductName === ""
        ) {

            throw new Error(
                "Product name cannot be empty"
            );

        }


        const existingProduct =
            await productRepository.findOne({

                where: {

                    store_id:
                        product.store_id,

                    product_name:
                        trimmedProductName

                }

            });


        if (
            existingProduct &&
            existingProduct.product_id !== productId
        ) {

            throw new Error(
                "A product with this name already exists in this store."
            );

        }


        product.product_name =
            trimmedProductName;
    }


    // ==================================================
    // UPDATE PRODUCT TYPE
    // ==================================================

    if (
        productData.type_id !== undefined
    ) {

        if (
            !Number.isInteger(
                productData.type_id
            ) ||
            productData.type_id <= 0
        ) {

            throw new Error(
                "Invalid product type ID"
            );

        }


        product.type_id =
            productData.type_id;
    }


    // ==================================================
    // UPDATE BRAND
    // ==================================================

    if (
        productData.brand_id !== undefined
    ) {

        if (
            !Number.isInteger(
                productData.brand_id
            ) ||
            productData.brand_id <= 0
        ) {

            throw new Error(
                "Invalid brand ID"
            );

        }


        product.brand_id =
            productData.brand_id;
    }


    // ==================================================
    // UPDATE UNIT
    // ==================================================

    if (
        productData.unit_id !== undefined
    ) {

        if (
            !Number.isInteger(
                productData.unit_id
            ) ||
            productData.unit_id <= 0
        ) {

            throw new Error(
                "Invalid unit ID"
            );

        }


        product.unit_id =
            productData.unit_id;
    }


    // ==================================================
    // UPDATE UNIT QUANTITY
    // ==================================================

    if (
        productData.unit_quantity !== undefined
    ) {

        const quantity =
            Number(
                productData.unit_quantity
            );


        if (
            quantity <= 0
        ) {

            throw new Error(
                "Unit quantity must be greater than 0"
            );

        }


        product.unit_quantity =
            quantity;
    }


    // ==================================================
    // UPDATE ACTIVE STATUS
    // ==================================================

    if (
        productData.is_active !== undefined
    ) {

        product.is_active =
            productData.is_active;
    }


    // ==================================================
    // UPDATE AUDIT FIELDS
    // ==================================================

    product.updated_at =
        new Date();


    product.updated_by =
        null;


    return await productRepository.save(
        product
    );
};


// ======================================================
// DELETE / DEACTIVATE PRODUCT
// ======================================================

export const deleteProductService = async (
    productId: number
) => {

    const product =
        await productRepository.findOne({

            where: {

                product_id: productId,

                is_active: true

            }

        });


    if (!product) {

        return null;

    }


    // ==================================================
    // SOFT DELETE
    // ==================================================

    product.is_active = false;


    // ==================================================
    // UPDATE AUDIT FIELDS
    // ==================================================

    product.updated_at =
        new Date();


    product.updated_by =
        null;


    return await productRepository.save(
        product
    );
};
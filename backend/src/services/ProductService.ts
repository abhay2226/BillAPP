import { AppDataSource } from "../datasource.js";
import { Product } from "../entity/TransactionsProduct.js";
import { Type } from "../entity/MasterProductType.js";
import { Brand } from "../entity/MasterProductBrand.js";

import { createAuditRecordService } from "./AuditServices.js";


// ======================================================
// REPOSITORY
// ======================================================

const productRepository =
    AppDataSource.getRepository(Product);


// ======================================================
// CREATE PRODUCT
// ======================================================

export const createProductService = async (
    productData: Partial<Product> & {
        typeName?: string;
        brandName?: string;
        userId?: number;
        sessionId?: number;
        ipAddress?: string | null;
    },

    userId?: number,
    sessionId?: number,
    ipAddress?: string | null,
    callerStoreId?: number

) => {

    const storeId =
        productData.store_id;

    if (
        callerStoreId !== undefined &&
        storeId !== callerStoreId
    ) {
        throw new Error("STORE_MISMATCH");
    }

    const productName =
        productData.product_name;

    const typeId =
        productData.type_id;
    
    const typeName =
        productData.typeName;

    const brandId =
        productData.brand_id;
    
    const brandName=productData.brandName;

    const unitId =
        productData.unit_id;

    const unitQuantity =
        productData.unit_quantity;


    // ==================================================
    // VALIDATE STORE ID
    // ==================================================

    if (
        storeId === undefined ||
        !Number.isInteger(storeId) ||
        storeId <= 0
    ) {

        throw new Error(
            "Valid store ID is required"
        );
    }


    // ==================================================
    // VALIDATE PRODUCT NAME
    // ==================================================

    if (
        productName === undefined ||
        productName.trim() === ""
    ) {

        throw new Error(
            "Product name is required"
        );
    }


    // ==================================================
    // VALIDATE PRODUCT TYPE
    // ==================================================

        if (
        typeId === undefined &&
        (
            typeName === undefined ||
            typeName.trim() === ""
        )
    ) {
    
        throw new Error(
            "Product type ID or type name is required"
        );
    }

    // ==================================================
    // VALIDATE BRAND
    // ==================================================

    if (
        brandId === undefined &&
        (
            brandName === undefined ||
            brandName.trim() === ""
        )
    ) {
    
        throw new Error(
            "Brand ID or brand name is required"
        );
    }

    // ==================================================
    // VALIDATE UNIT
    // ==================================================

    if (
        unitId === undefined ||
        !Number.isInteger(unitId) ||
        unitId <= 0
    ) {

        throw new Error(
            "Valid unit ID is required"
        );
    }


    // ==================================================
    // VALIDATE UNIT QUANTITY
    // ==================================================

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
    // GET ACTING USER
    // ==================================================

    const actingUserId =
        userId ??
        productData.userId ??
        productData.created_by ??
        1;


    // ==================================================
    // GET ACTING SESSION
    // ==================================================

    const actingSessionId =
        sessionId ??
        productData.sessionId ??
        1;


    // ==================================================
    // GET CLIENT IP
    // ==================================================

    const clientIpAddress =
        ipAddress ??
        productData.ipAddress ??
        null;


    // ==================================================
    // TRANSACTION
    // ==================================================

    return await AppDataSource.manager.transaction(
        async (manager) => {

            // ==============================================
            // GET OR CREATE PRODUCT TYPE
            // ==============================================
            
            let finalTypeId: number;
            
            if (typeId !== undefined) {
            
                if (
                    !Number.isInteger(typeId) ||
                    typeId <= 0
                ) {
                    throw new Error(
                        "Invalid product type ID"
                    );
                }
            
                const existingType =
                    await manager.findOne(
                        Type,
                        {
                            where: {
                                product_type_id: typeId,
                                is_active: true
                            }
                        }
                    );
            
                if (!existingType) {
                    throw new Error(
                        "Product type not found"
                    );
                }
            
                finalTypeId =
                    existingType.product_type_id;
            
            } else {
            
                const trimmedTypeName =
                    typeName!.trim();
            
                const existingType =
                    await manager.findOne(
                        Type,
                        {
                            where: {
                                type_name: trimmedTypeName
                            }
                        }
                    );
            
                if (existingType) {
            
                    if (!existingType.is_active) {
                        throw new Error(
                            "Product type exists but is inactive"
                        );
                    }
            
                    finalTypeId =
                        existingType.product_type_id;
            
                } else {
            
                    const newType =
                        manager.create(
                            Type,
                            {
                                type_name:
                                    trimmedTypeName,
            
                                is_active:
                                    true,
            
                                created_at:
                                    new Date(),
            
                                created_by:
                                    actingUserId,
            
                                updated_at:
                                    null,
            
                                updated_by:
                                    null
                            }
                        );
            
                    const savedType =
                        await manager.save(
                            Type,
                            newType
                        );
            
                    finalTypeId =
                        savedType.product_type_id;
                }
            }

            // ==============================================
            // GET OR CREATE BRAND
            // ==============================================
            
            let finalBrandId: number;
            
            if (brandId !== undefined) {
            
                if (
                    !Number.isInteger(brandId) ||
                    brandId <= 0
                ) {
                    throw new Error(
                        "Invalid brand ID"
                    );
                }
            
                const existingBrand =
                    await manager.findOne(
                        Brand,
                        {
                            where: {
                                product_brand_id: brandId,
                                is_active: true
                            }
                        }
                    );
            
                if (!existingBrand) {
                    throw new Error(
                        "Brand not found"
                    );
                }
            
                finalBrandId =
                    existingBrand.product_brand_id;
            
            } else {
            
                const trimmedBrandName =
                    brandName!.trim();
            
                const existingBrand =
                    await manager.findOne(
                        Brand,
                        {
                            where: {
                                brand_name:
                                    trimmedBrandName
                            }
                        }
                    );
            
                if (existingBrand) {
            
                    if (!existingBrand.is_active) {
                        throw new Error(
                            "Brand exists but is inactive"
                        );
                    }
            
                    finalBrandId =
                        existingBrand.product_brand_id;
            
                } else {
            
                    const newBrand =
                        manager.create(
                            Brand,
                            {
                                brand_name:
                                    trimmedBrandName,
            
                                is_active:
                                    true,
            
                                created_at:
                                    new Date(),
            
                                created_by:
                                    actingUserId,
            
                                updated_at:
                                    null,
            
                                updated_by:
                                    null
                            }
                        );
            
                    const savedBrand =
                        await manager.save(
                            Brand,
                            newBrand
                        );
            
                    finalBrandId =
                        savedBrand.product_brand_id;
                }
            }

            // ==============================================
            // CHECK DUPLICATE PRODUCT
            // ==============================================

            const existingProduct =
                await manager.findOne(
                    Product,
                    {
                        where: {
                            store_id:
                                storeId,

                            product_name:
                                trimmedProductName,

                            is_active:
                                true
                        }
                    }
                );


            if (existingProduct) {

                throw new Error(
                    "A product with this name already exists in this store."
                );
            }


            // ==============================================
            // CREATE PRODUCT
            // ==============================================

            const product =
                manager.create(
                    Product,
                    {
                        store_id:
                            storeId,

                        product_name:
                            trimmedProductName,

                        type_id:
                        finalTypeId,
                        
                        brand_id:
                        finalBrandId,

                        unit_id:
                            unitId,

                        unit_quantity:
                            quantity,

                        is_active:
                            true,

                        created_at:
                            new Date(),

                        created_by:
                            actingUserId,

                        updated_at:
                            null,

                        updated_by:
                            null
                    }
                );


            // ==============================================
            // SAVE PRODUCT
            // ==============================================

            const savedProduct =
                await manager.save(
                    Product,
                    product
                );


            // ==============================================
            // AUDIT PRODUCT INSERT
            // ==============================================

            await createAuditRecordService(
                manager,
                {
                    tableName:
                        "transactions_product",

                    recordId:
                        savedProduct.product_id,

                    actionTypeName:
                        "INSERT",

                    userId:
                        actingUserId,

                    storeId:
                        savedProduct.store_id,

                    sessionId:
                        actingSessionId,

                    ipAddress:
                        clientIpAddress
                }
            );


            return savedProduct;
        }
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
                    isActive:
                        true
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
                storeId:
                    storeId
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


    // ==================================================
    // RETURN PRODUCTS
    // ==================================================

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
    productId: number,
    callerStoreId?: number
) => {

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {

        throw new Error(
            "Invalid product ID"
        );
    }


    const product = await productRepository.findOne(
        {
            where: {
                product_id:
                    productId,

                is_active:
                    true
            },

            relations: [
                "store",
                "type",
                "brand",
                "uom"
            ]
        }
    );

    if (
        product &&
        callerStoreId !== undefined &&
        product.store_id !== callerStoreId
    ) {
        throw new Error("STORE_MISMATCH");
    }

    return product;
};


// ======================================================
// UPDATE PRODUCT
// ======================================================

export const updateProductService = async (
    productId: number,

    productData: Partial<Product> & {
        userId?: number;
        sessionId?: number;
        ipAddress?: string | null;
    },

    userId?: number,
    sessionId?: number,
    ipAddress?: string | null,
    callerStoreId?: number

) => {

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {

        throw new Error(
            "Invalid product ID"
        );
    }


    // ==================================================
    // TRANSACTION
    // ==================================================

    return await AppDataSource.manager.transaction(
        async (manager) => {


            // ==============================================
            // FIND PRODUCT
            // ==============================================

            const product =
                await manager.findOne(
                    Product,
                    {
                        where: {
                            product_id:
                                productId,

                            is_active:
                                true
                        }
                    }
                );


            if (!product) {
                return null;
            }

            if (
                callerStoreId !== undefined &&
                product.store_id !== callerStoreId
            ) {
                throw new Error("STORE_MISMATCH");
            }


            // ==============================================
            // UPDATE STORE
            // ==============================================

            if (
                productData.store_id !==
                undefined
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


            // ==============================================
            // UPDATE PRODUCT NAME
            // ==============================================

            if (
                productData.product_name !==
                undefined
            ) {

                const trimmedProductName =
                    productData.product_name
                        .trim();


                if (
                    trimmedProductName === ""
                ) {

                    throw new Error(
                        "Product name cannot be empty"
                    );
                }


                const existingProduct =
                    await manager.findOne(
                        Product,
                        {
                            where: {
                                store_id:
                                    product.store_id,

                                product_name:
                                    trimmedProductName,

                                is_active:
                                    true
                            }
                        }
                    );


                if (
                    existingProduct &&
                    existingProduct.product_id !==
                        productId
                ) {

                    throw new Error(
                        "A product with this name already exists in this store."
                    );
                }


                product.product_name =
                    trimmedProductName;
            }


            // ==============================================
            // UPDATE PRODUCT TYPE
            // ==============================================

            if (
                productData.type_id !==
                undefined
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


            // ==============================================
            // UPDATE BRAND
            // ==============================================

            if (
                productData.brand_id !==
                undefined
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


            // ==============================================
            // UPDATE UNIT
            // ==============================================

            if (
                productData.unit_id !==
                undefined
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


            // ==============================================
            // UPDATE UNIT QUANTITY
            // ==============================================

            if (
                productData.unit_quantity !==
                undefined
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


            // ==============================================
            // UPDATE ACTIVE STATUS
            // ==============================================

            if (
                productData.is_active !==
                undefined
            ) {

                product.is_active =
                    productData.is_active;
            }


            // ==============================================
            // GET ACTING USER
            // ==============================================

            const actingUserId =
                userId ??
                productData.userId ??
                productData.updated_by ??
                1;


            // ==============================================
            // GET ACTING SESSION
            // ==============================================

            const actingSessionId =
                sessionId ??
                productData.sessionId ??
                1;


            // ==============================================
            // GET CLIENT IP
            // ==============================================

            const clientIpAddress =
                ipAddress ??
                productData.ipAddress ??
                null;


            // ==============================================
            // UPDATE AUDIT FIELDS
            // ==============================================

            product.updated_at =
                new Date();

            product.updated_by =
                actingUserId;


            // ==============================================
            // SAVE PRODUCT
            // ==============================================

            const updatedProduct =
                await manager.save(
                    Product,
                    product
                );


            // ==============================================
            // AUDIT PRODUCT UPDATE
            // ==============================================

            await createAuditRecordService(
                manager,
                {
                    tableName:
                        "transactions_product",

                    recordId:
                        updatedProduct.product_id,

                    actionTypeName:
                        "UPDATE",

                    userId:
                        actingUserId,

                    storeId:
                        updatedProduct.store_id,

                    sessionId:
                        actingSessionId,

                    ipAddress:
                        clientIpAddress
                }
            );


            return updatedProduct;
        }
    );
};


// ======================================================
// DELETE / DEACTIVATE PRODUCT
// ======================================================

export const deleteProductService = async (
    productId: number,

    userId?: number,
    sessionId?: number,
    ipAddress?: string | null,
    callerStoreId?: number

) => {

    if (
        !Number.isInteger(productId) ||
        productId <= 0
    ) {

        throw new Error(
            "Invalid product ID"
        );
    }


    // ==================================================
    // TRANSACTION
    // ==================================================

    return await AppDataSource.manager.transaction(
        async (manager) => {


            // ==============================================
            // FIND PRODUCT
            // ==============================================

            const product =
                await manager.findOne(
                    Product,
                    {
                        where: {
                            product_id:
                                productId,

                            is_active:
                                true
                        }
                    }
                );


            if (!product) {
                return null;
            }

            if (
                callerStoreId !== undefined &&
                product.store_id !== callerStoreId
            ) {
                throw new Error("STORE_MISMATCH");
            }


            // ==============================================
            // GET ACTING USER
            // ==============================================

            const actingUserId =
                userId ?? 1;


            // ==============================================
            // GET ACTING SESSION
            // ==============================================

            const actingSessionId =
                sessionId ?? 1;


            // ==============================================
            // GET CLIENT IP
            // ==============================================

            const clientIpAddress =
                ipAddress ?? null;


            // ==============================================
            // SOFT DELETE
            // ==============================================

            product.is_active =
                false;


            // ==============================================
            // UPDATE AUDIT FIELDS
            // ==============================================

            product.updated_at =
                new Date();

            product.updated_by =
                actingUserId;


            // ==============================================
            // SAVE PRODUCT
            // ==============================================

            const deletedProduct =
                await manager.save(
                    Product,
                    product
                );


            // ==============================================
            // AUDIT PRODUCT DELETE
            // ==============================================

            await createAuditRecordService(
                manager,
                {
                    tableName:
                        "transactions_product",

                    recordId:
                        deletedProduct.product_id,

                    actionTypeName:
                        "DELETE",

                    userId:
                        actingUserId,

                    storeId:
                        deletedProduct.store_id,

                    sessionId:
                        actingSessionId,

                    ipAddress:
                        clientIpAddress
                }
            );


            return deletedProduct;
        }
    );
};


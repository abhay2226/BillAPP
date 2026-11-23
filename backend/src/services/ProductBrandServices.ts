import { AppDataSource } from "../datasource.js";
import { Brand } from "../entity/MasterProductBrand.js";

const brandRepository =
    AppDataSource.getRepository(Brand);


// ======================================================
// GET ALL ACTIVE BRANDS
// ======================================================

export const getAllProductBrandsService = async () => {

    return await brandRepository.find({
        where: {
            is_active: true
        },

        order: {
            product_brand_id: "ASC"
        }
    });
};

export const deactivateProductBrandService = async (
    productBrandId: number
) => {
    const brand = await brandRepository.findOne({
        where: {
            product_brand_id: productBrandId,
            is_active: true
        }
    });

    if (!brand) {
        throw new Error("Product brand not found.");
    }

    brand.is_active = false;
    brand.updated_at = new Date();

    return await brandRepository.save(brand);
};
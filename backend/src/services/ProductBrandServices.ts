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
import { AppDataSource } from "../datasource.js";
import { Type } from "../entity/MasterProductType.js";

const typeRepository =
    AppDataSource.getRepository(Type);


// ======================================================
// GET ALL ACTIVE PRODUCT TYPES
// ======================================================

export const getAllProductTypesService = async () => {

    return await typeRepository.find({
        where: {
            is_active: true
        },

        order: {
            product_type_id: "ASC"
        }
    });
};
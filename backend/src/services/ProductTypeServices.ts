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

export const deactivateProductTypeService = async (
    productTypeId: number
) => {
    const type = await typeRepository.findOne({
        where: {
            product_type_id: productTypeId,
            is_active: true
        }
    });

    if (!type) {
        throw new Error("Product type not found.");
    }

    type.is_active = false;
    type.updated_at = new Date();

    return await typeRepository.save(type);
};
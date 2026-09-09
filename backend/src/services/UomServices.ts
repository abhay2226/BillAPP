import { AppDataSource } from "../datasource.js";
import { UoM } from "../entity/MasterUoM.js";

const uomRepository =
    AppDataSource.getRepository(UoM);


// ======================================================
// GET ALL ACTIVE Unit TYPES
// ======================================================

export const getAllUnitsService = async () => {

    return await uomRepository.find({
        where: {
            is_active: true
        },

        order: {
            unit_id: "ASC"
        }
    });
};
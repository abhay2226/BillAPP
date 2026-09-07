import { AppDataSource } from "../datasource.js";
import { UoM } from "../entity/MasterUoM.js";
import { ReferenceType } from "../entity/MasterReference.js";
import { createAuditRecordService } from "./AuditServices.js";
import { Audit } from "../entity/TransactionsAudit.js";

// ======================================================
// REPOSITORY
// ======================================================
const uomRepository = AppDataSource.getRepository(UoM);

// ======================================================
// REFERENCE TYPE CODE
// ======================================================
const UOM_REFERENCE_CODE = "UOM";

// ======================================================
// CREATE UOM
// ======================================================
export const createUOMService = async (
    uomData: Partial<UoM> & {
        userId?: number;
        storeId?: number;
        sessionId?: number;
        ipAddress?: string;
    }
) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const userId = uomData.userId ?? uomData.created_by;
        if (!userId) throw new Error("User ID is required");

        const referenceType = await queryRunner.manager.findOneBy(ReferenceType, {
            code: UOM_REFERENCE_CODE,
            is_active: true
        });
        if (!referenceType) throw new Error(`Reference type '${UOM_REFERENCE_CODE}' not found`);

        if (!uomData.unit_name) throw new Error("Unit name is required");
        if (!uomData.unit_type) throw new Error("Unit type is required");

        const existingUOM = await queryRunner.manager.findOneBy(UoM, {
            unit_name: uomData.unit_name
        });
        if (existingUOM) throw new Error("UOM with this unit name already exists");

        const uom = queryRunner.manager.create(UoM, {
            unit_name: uomData.unit_name,
            unit_type: uomData.unit_type,
            is_active: uomData.is_active ?? true,
            created_at: uomData.created_at ?? new Date(),
            created_by: userId
        });

        const savedUOM = await queryRunner.manager.save(UoM, uom);

        await createAuditRecordService(
            queryRunner.manager,
            "master_uom",
            savedUOM.unit_id,
            "INSERT",
            userId,
            uomData.storeId,
            uomData.sessionId,
            uomData.ipAddress
        );

        await queryRunner.commitTransaction();
        return savedUOM;
    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        throw new Error(`Failed to create UOM: ${error.message}`);
    } finally {
        await queryRunner.release();
    }
};

// ======================================================
// GET ALL UOM
// ======================================================
export const getAllUOMService = async () => {
    return await uomRepository.find({
        where: { is_active: true },
        order: { unit_id: "ASC" }
    });
};

// ======================================================
// GET UOM BY ID
// ======================================================
export const getUOMByIdService = async (unit_id: number) => {
    const uom = await uomRepository.findOneBy({
        unit_id,
        is_active: true
    });
    if (!uom) throw new Error("UOM not found");
    return uom;
};

// ======================================================
// UPDATE UOM
// ======================================================
export const updateUOMService = async (
    unit_id: number,
    uomData: Partial<UoM> & {
        userId?: number;
        storeId?: number;
        sessionId?: number;
        ipAddress?: string;
    }
) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const userId = uomData.userId ?? uomData.updated_by;
        if (!userId) throw new Error("User ID is required");

        const referenceType = await queryRunner.manager.findOneBy(ReferenceType, {
            code: UOM_REFERENCE_CODE,
            is_active: true
        });
        if (!referenceType) throw new Error(`Reference type '${UOM_REFERENCE_CODE}' not found`);

        const uom = await queryRunner.manager.findOneBy(UoM, {
            unit_id,
            is_active: true
        });
        if (!uom) throw new Error("UOM not found");

        if (uomData.unit_name !== undefined && uomData.unit_name !== uom.unit_name) {
            const existingUOM = await queryRunner.manager.findOneBy(UoM, {
                unit_name: uomData.unit_name
            });
            if (existingUOM && existingUOM.unit_id !== unit_id) {
                throw new Error("UOM with this unit name already exists");
            }
        }

        if (uomData.unit_name !== undefined) uom.unit_name = uomData.unit_name;
        if (uomData.unit_type !== undefined) uom.unit_type = uomData.unit_type;
        else if (!uom.unit_type) throw new Error("Unit type is required");

        if (uomData.is_active !== undefined) uom.is_active = uomData.is_active;

        uom.updated_at = new Date();
        uom.updated_by = userId;

        const savedUOM = await queryRunner.manager.save(UoM, uom);

        await createAuditRecordService(
            queryRunner.manager,
            "master_uom",
            savedUOM.unit_id,
            "UPDATE",
            userId,
            uomData.storeId,
            uomData.sessionId,
            uomData.ipAddress
        );

        await queryRunner.commitTransaction();
        return savedUOM;
    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        throw new Error(`Failed to update UOM: ${error.message}`);
    } finally {
        await queryRunner.release();
    }
};

// ======================================================
// DELETE UOM (SOFT DELETE)
// ======================================================
export const deleteUOMService = async (
    unit_id: number,
    userData: {
        userId?: number;
        storeId?: number;
        sessionId?: number;
        ipAddress?: string;
    }
) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const userId = userData.userId;
        if (!userId) throw new Error("User ID is required");

        const referenceType = await queryRunner.manager.findOneBy(ReferenceType, {
            code: UOM_REFERENCE_CODE,
            is_active: true
        });
        if (!referenceType) throw new Error(`Reference type '${UOM_REFERENCE_CODE}' not found`);

        const uom = await queryRunner.manager.findOneBy(UoM, {
            unit_id,
            is_active: true
        });
        if (!uom) throw new Error("UOM not found");

        uom.is_active = false;
        uom.updated_at = new Date();
        uom.updated_by = userId;

        const savedUOM = await queryRunner.manager.save(UoM, uom);

        await createAuditRecordService(
            queryRunner.manager,
            "master_uom",
            savedUOM.unit_id,
            "UPDATE",
            userId,
            userData.storeId,
            userData.sessionId,
            userData.ipAddress
        );

        await queryRunner.commitTransaction();
        return { message: "UOM deleted successfully", deletedUOM: savedUOM };
    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        throw new Error(`Failed to delete UOM: ${error.message}`);
    } finally {
        await queryRunner.release();
    }
};

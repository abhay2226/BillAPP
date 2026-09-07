import { AppDataSource } from "../datasource.js";

import { UoM } from "../entity/MasterUoM.js";
import { ReferenceType } from "../entity/MasterReference.js";

import { createAuditRecordService } from "./AuditServices.js";

import { EntityManager } from "typeorm";


// ======================================================
// REPOSITORIES
// ======================================================

const uomRepository =
    AppDataSource.getRepository(UoM);

const referenceTypeRepository =
    AppDataSource.getRepository(ReferenceType);


// ======================================================
// CONSTANTS
// ======================================================

const UOM_REFERENCE_CODE = "UOM";


// ======================================================
// VALIDATE ID
// ======================================================

const validateId = (
    value: number,
    message: string
): void => {

    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(message);
    }
};


// ======================================================
// CHECK UOM REFERENCE TYPE
// ======================================================

const getUOMReferenceType = async (
    manager: EntityManager
): Promise<ReferenceType> => {

    const referenceType =
        await manager.findOneBy(
            ReferenceType,
            {
                code:
                    UOM_REFERENCE_CODE,

                is_active:
                    true
            }
        );


    if (!referenceType) {

        throw new Error(
            `Reference type '${UOM_REFERENCE_CODE}' not found or inactive`
        );
    }


    return referenceType;
};


// ======================================================
// CREATE UOM
// ======================================================

export const createUOMService = async (
    uomData: Partial<UoM> & {
        userId?: number;
        storeId?: number;
        sessionId?: number;
    }
) => {

    const queryRunner =
        AppDataSource.createQueryRunner();


    await queryRunner.connect();

    await queryRunner.startTransaction();


    try {

        // ==================================================
        // USER ID
        // ==================================================

        const userId =
            uomData.userId ??
            uomData.created_by;


        if (
            userId === undefined ||
            userId === null
        ) {

            throw new Error(
                "User ID is required"
            );
        }


        validateId(
            userId,
            "Valid user ID is required"
        );


        // ==================================================
        // STORE ID
        // ==================================================

        const storeId =
            uomData.storeId;


        if (
            storeId === undefined ||
            storeId === null
        ) {

            throw new Error(
                "Store ID is required"
            );
        }


        validateId(
            storeId,
            "Valid store ID is required"
        );


        // ==================================================
        // SESSION ID
        // ==================================================

        const sessionId =
            uomData.sessionId;


        if (
            sessionId === undefined ||
            sessionId === null
        ) {

            throw new Error(
                "Session ID is required"
            );
        }


        validateId(
            sessionId,
            "Valid session ID is required"
        );


        // ==================================================
        // CHECK UOM REFERENCE TYPE
        // ==================================================

        await getUOMReferenceType(
            queryRunner.manager
        );


        // ==================================================
        // VALIDATE UNIT NAME
        // ==================================================

        if (
            uomData.unit_name === undefined ||
            uomData.unit_name === null ||
            uomData.unit_name.trim() === ""
        ) {

            throw new Error(
                "Unit name is required"
            );
        }


        const unitName =
            uomData.unit_name.trim();


        // ==================================================
        // VALIDATE UNIT TYPE
        // ==================================================

        if (
            uomData.unit_type === undefined ||
            uomData.unit_type === null ||
            uomData.unit_type.trim() === ""
        ) {

            throw new Error(
                "Unit type is required"
            );
        }


        const unitType =
            uomData.unit_type.trim();


        // ==================================================
        // CHECK DUPLICATE UNIT NAME
        // Only active UOM is considered duplicate
        // ==================================================

        const existingUOM =
            await queryRunner.manager.findOne(
                UoM,
                {
                    where: {
                        unit_name:
                            unitName,

                        is_active:
                            true
                    }
                }
            );


        if (existingUOM) {

            throw new Error(
                "UOM with this unit name already exists"
            );
        }


        // ==================================================
        // CREATE UOM
        // ==================================================

        const uom =
            queryRunner.manager.create(
                UoM,
                {
                    unit_name:
                        unitName,

                    unit_type:
                        unitType,

                    is_active:
                        uomData.is_active ??
                        true,

                    created_at:
                        uomData.created_at ??
                        new Date(),

                    created_by:
                        userId,

                    updated_at:
                        null,

                    updated_by:
                        null
                }
            );


        // ==================================================
        // SAVE UOM
        // ==================================================

        const savedUOM =
            await queryRunner.manager.save(
                UoM,
                uom
            );


        // ==================================================
        // AUDIT INSERT
        // ==================================================

        await createAuditRecordService(
            queryRunner.manager,
            {
                tableName:
                    "master_uom",

                recordId:
                    savedUOM.unit_id,

                actionTypeName:
                    "INSERT",

                userId:
                    userId,

                storeId:
                    storeId,

                sessionId:
                    sessionId
            }
        );


        // ==================================================
        // COMMIT
        // ==================================================

        await queryRunner.commitTransaction();


        return savedUOM;

    } catch (error: any) {

        await queryRunner.rollbackTransaction();


        throw new Error(
            `Failed to create UOM: ${error.message}`
        );

    } finally {

        await queryRunner.release();
    }
};


// ======================================================
// GET ALL ACTIVE UOM
// ======================================================

export const getAllUOMService = async () => {

    return await uomRepository.find({

        where: {
            is_active:
                true
        },

        order: {
            unit_id:
                "ASC"
        }
    });
};


// ======================================================
// GET UOM BY ID
// ======================================================

export const getUOMByIdService = async (
    unit_id: number
) => {

    validateId(
        unit_id,
        "Valid UOM ID is required"
    );


    const uom =
        await uomRepository.findOne({

            where: {
                unit_id:
                    unit_id,

                is_active:
                    true
            }
        });


    if (!uom) {

        throw new Error(
            "UOM not found"
        );
    }


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
    }
) => {

    validateId(
        unit_id,
        "Valid UOM ID is required"
    );


    const queryRunner =
        AppDataSource.createQueryRunner();


    await queryRunner.connect();

    await queryRunner.startTransaction();


    try {

        // ==================================================
        // USER ID
        // ==================================================

        const userId =
            uomData.userId ??
            uomData.updated_by;


        if (
            userId === undefined ||
            userId === null
        ) {

            throw new Error(
                "User ID is required"
            );
        }


        validateId(
            userId,
            "Valid user ID is required"
        );


        // ==================================================
        // STORE ID
        // ==================================================

        const storeId =
            uomData.storeId;


        if (
            storeId === undefined ||
            storeId === null
        ) {

            throw new Error(
                "Store ID is required"
            );
        }


        validateId(
            storeId,
            "Valid store ID is required"
        );


        // ==================================================
        // SESSION ID
        // ==================================================

        const sessionId =
            uomData.sessionId;


        if (
            sessionId === undefined ||
            sessionId === null
        ) {

            throw new Error(
                "Session ID is required"
            );
        }


        validateId(
            sessionId,
            "Valid session ID is required"
        );


        // ==================================================
        // CHECK UOM REFERENCE TYPE
        // ==================================================

        await getUOMReferenceType(
            queryRunner.manager
        );


        // ==================================================
        // FIND ACTIVE UOM
        // ==================================================

        const uom =
            await queryRunner.manager.findOne(
                UoM,
                {
                    where: {
                        unit_id:
                            unit_id,

                        is_active:
                            true
                    }
                }
            );


        if (!uom) {

            throw new Error(
                "UOM not found"
            );
        }


        // ==================================================
        // UPDATE UNIT NAME
        // ==================================================

        if (
            uomData.unit_name !==
            undefined
        ) {

            const unitName =
                uomData.unit_name.trim();


            if (
                unitName === ""
            ) {

                throw new Error(
                    "Unit name cannot be empty"
                );
            }


            if (
                unitName !==
                uom.unit_name
            ) {

                const existingUOM =
                    await queryRunner.manager.findOne(
                        UoM,
                        {
                            where: {
                                unit_name:
                                    unitName,

                                is_active:
                                    true
                            }
                        }
                    );


                if (
                    existingUOM &&
                    existingUOM.unit_id !==
                        unit_id
                ) {

                    throw new Error(
                        "UOM with this unit name already exists"
                    );
                }
            }


            uom.unit_name =
                unitName;
        }


        // ==================================================
        // UPDATE UNIT TYPE
        // ==================================================

        if (
            uomData.unit_type !==
            undefined
        ) {

            const unitType =
                uomData.unit_type.trim();


            if (
                unitType === ""
            ) {

                throw new Error(
                    "Unit type cannot be empty"
                );
            }


            uom.unit_type =
                unitType;
        }


        // ==================================================
        // UPDATE ACTIVE STATUS
        // ==================================================

        if (
            uomData.is_active !==
            undefined
        ) {

            uom.is_active =
                uomData.is_active;
        }


        // ==================================================
        // UPDATE AUDIT FIELDS
        // ==================================================

        uom.updated_at =
            new Date();

        uom.updated_by =
            userId;


        // ==================================================
        // SAVE UOM
        // ==================================================

        const savedUOM =
            await queryRunner.manager.save(
                UoM,
                uom
            );


        // ==================================================
        // AUDIT UPDATE
        // ==================================================

        await createAuditRecordService(
            queryRunner.manager,
            {
                tableName:
                    "master_uom",

                recordId:
                    savedUOM.unit_id,

                actionTypeName:
                    "UPDATE",

                userId:
                    userId,

                storeId:
                    storeId,

                sessionId:
                    sessionId
            }
        );


        // ==================================================
        // COMMIT
        // ==================================================

        await queryRunner.commitTransaction();


        return savedUOM;

    } catch (error: any) {

        await queryRunner.rollbackTransaction();


        throw new Error(
            `Failed to update UOM: ${error.message}`
        );

    } finally {

        await queryRunner.release();
    }
};


// ======================================================
// DELETE UOM - SOFT DELETE
// ======================================================

export const deleteUOMService = async (
    unit_id: number,

    userData: {
        userId?: number;
        storeId?: number;
        sessionId?: number;
    }
) => {

    validateId(
        unit_id,
        "Valid UOM ID is required"
    );


    const queryRunner =
        AppDataSource.createQueryRunner();


    await queryRunner.connect();

    await queryRunner.startTransaction();


    try {

        // ==================================================
        // USER ID
        // ==================================================

        const userId =
            userData.userId;


        if (
            userId === undefined ||
            userId === null
        ) {

            throw new Error(
                "User ID is required"
            );
        }


        validateId(
            userId,
            "Valid user ID is required"
        );


        // ==================================================
        // STORE ID
        // ==================================================

        const storeId =
            userData.storeId;


        if (
            storeId === undefined ||
            storeId === null
        ) {

            throw new Error(
                "Store ID is required"
            );
        }


        validateId(
            storeId,
            "Valid store ID is required"
        );


        // ==================================================
        // SESSION ID
        // ==================================================

        const sessionId =
            userData.sessionId;


        if (
            sessionId === undefined ||
            sessionId === null
        ) {

            throw new Error(
                "Session ID is required"
            );
        }


        validateId(
            sessionId,
            "Valid session ID is required"
        );


        // ==================================================
        // CHECK UOM REFERENCE TYPE
        // ==================================================

        await getUOMReferenceType(
            queryRunner.manager
        );


        // ==================================================
        // FIND ACTIVE UOM
        // ==================================================

        const uom =
            await queryRunner.manager.findOne(
                UoM,
                {
                    where: {
                        unit_id:
                            unit_id,

                        is_active:
                            true
                    }
                }
            );


        if (!uom) {

            throw new Error(
                "UOM not found"
            );
        }


        // ==================================================
        // SOFT DELETE
        // ==================================================

        uom.is_active =
            false;

        uom.updated_at =
            new Date();

        uom.updated_by =
            userId;


        // ==================================================
        // SAVE UOM
        // ==================================================

        const savedUOM =
            await queryRunner.manager.save(
                UoM,
                uom
            );


        // ==================================================
        // AUDIT DELETE
        // ==================================================

        await createAuditRecordService(
            queryRunner.manager,
            {
                tableName:
                    "master_uom",

                recordId:
                    savedUOM.unit_id,

                actionTypeName:
                    "DELETE",

                userId:
                    userId,

                storeId:
                    storeId,

                sessionId:
                    sessionId
            }
        );


        // ==================================================
        // COMMIT
        // ==================================================

        await queryRunner.commitTransaction();


        return {

            message:
                "UOM deleted successfully",

            deletedUOM:
                savedUOM
        };

    } catch (error: any) {

        await queryRunner.rollbackTransaction();


        throw new Error(
            `Failed to delete UOM: ${error.message}`
        );

    } finally {

        await queryRunner.release();
    }
};
import { AppDataSource } from "../datasource.js"; 
 
import { UoM } from "../entity/TransactionsUOM.js"; 
import { ReferenceType } from "../entity/MasterReference.js"; 
 
import { createAuditRecordService } from "./AuditServices.js"; 
 
 
// ====================================================== 
// REPOSITORIES 
// ====================================================== 
 
const uomRepository = 
    AppDataSource.getRepository(UoM); 
 
const referenceTypeRepository = 
    AppDataSource.getRepository(ReferenceType); 
 
 
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
 
    const queryRunner = 
        AppDataSource.createQueryRunner(); 
 
    await queryRunner.connect(); 
    await queryRunner.startTransaction(); 
 
    try { 
 
        // ================================================== 
        // CHECK REFERENCE TYPE 
        // ================================================== 
 
        const referenceType = 
            await queryRunner.manager.findOne( 
                ReferenceType, 
                { 
                    where: { 
                        code: UOM_REFERENCE_CODE, 
                        is_active: true 
                    } 
                } 
            ); 
 
        if (!referenceType) { 
            throw new Error( 
                `Reference type '${UOM_REFERENCE_CODE}' not found` 
            ); 
        } 
 
 
        // ================================================== 
        // CHECK DUPLICATE UNIT NAME 
        // ================================================== 
 
        const existingUOM = 
            await queryRunner.manager.findOne( 
                UoM, 
                { 
                    where: { 
                        unit_name: uomData.unit_name 
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
                    unit_name: uomData.unit_name, 
                    unit_type: uomData.unit_type, 
                    is_active: 
                        uomData.is_active ?? true, 
 
                    created_at: 
                        uomData.created_at ?? new Date(), 
 
                    created_by: 
                        uomData.userId ?? 
                        uomData.created_by! 
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
        // AUDIT 
        // ================================================== 
 
        await createAuditRecordService( 
            queryRunner.manager, 
            "master_uom", 
            savedUOM.unit_id, 
            "INSERT", 
            uomData.userId ?? 
                uomData.created_by!, 
            uomData.storeId, 
            uomData.sessionId, 
            uomData.ipAddress 
        ); 
 
 
        // ================================================== 
        // COMMIT 
        // ================================================== 
 
        await queryRunner.commitTransaction(); 
 
        return savedUOM; 
 
    } catch (error) { 
 
        await queryRunner.rollbackTransaction(); 
 
        throw error; 
 
    } finally { 
 
        await queryRunner.release(); 
    } 
}; 
 
 
// ====================================================== 
// GET ALL UOM 
// ====================================================== 
 
export const getAllUOMService = async () => { 
 
    return await uomRepository.find({ 
        where: { 
            is_active: true 
        }, 
        order: { 
            unit_id: "ASC" 
        } 
    }); 
}; 
 
 
// ====================================================== 
// GET UOM BY ID 
// ====================================================== 
 
export const getUOMByIdService = async ( 
    unit_id: number 
) => { 
 
    const uom = 
        await uomRepository.findOne({ 
            where: { 
                unit_id, 
                is_active: true 
            } 
        }); 
 
    if (!uom) { 
        throw new Error("UOM not found"); 
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
        ipAddress?: string; 
    } 
) => { 
 
    const queryRunner = 
        AppDataSource.createQueryRunner(); 
 
    await queryRunner.connect(); 
    await queryRunner.startTransaction(); 
 
    try { 
 
        // ================================================== 
        // CHECK REFERENCE TYPE 
        // ================================================== 
 
        const referenceType = 
            await queryRunner.manager.findOne( 
                ReferenceType, 
                { 
                    where: { 
                        code: UOM_REFERENCE_CODE, 
                        is_active: true 
                    } 
                } 
            ); 
 
        if (!referenceType) { 
            throw new Error( 
                `Reference type '${UOM_REFERENCE_CODE}' not found` 
            ); 
        } 
 
 
        // ================================================== 
        // FIND UOM 
        // ================================================== 
 
        const uom = 
            await queryRunner.manager.findOne( 
                UoM, 
                { 
                    where: { 
                        unit_id, 
                        is_active: true 
                    } 
                } 
            ); 
 
        if (!uom) { 
            throw new Error("UOM not found"); 
        } 
 
 
        // ================================================== 
        // CHECK DUPLICATE UNIT NAME 
        // ================================================== 
 
        if ( 
            uomData.unit_name && 
            uomData.unit_name !== uom.unit_name 
        ) { 
 
            const existingUOM = 
                await queryRunner.manager.findOne( 
                    UoM, 
                    { 
                        where: { 
                            unit_name: 
                                uomData.unit_name 
                        } 
                    } 
                ); 
 
            if ( 
                existingUOM && 
                existingUOM.unit_id !== unit_id 
            ) { 
                throw new Error( 
                    "UOM with this unit name already exists" 
                ); 
            } 
        } 
 
 
        // ================================================== 
        // UPDATE FIELDS 
        // ================================================== 
 
        if (uomData.unit_name !== undefined) { 
            uom.unit_name = 
                uomData.unit_name; 
        } 
 
        if (uomData.unit_type !== undefined) { 
            uom.unit_type = 
                uomData.unit_type; 
        } 
 
        if (uomData.is_active !== undefined) { 
            uom.is_active = 
                uomData.is_active; 
        } 
 
 
        uom.updated_at = new Date(); 
 
        uom.updated_by = 
            uomData.userId ?? 
            uomData.updated_by ?? 
            null; 
 
 
        // ================================================== 
        // SAVE UOM 
        // ================================================== 
 
        const savedUOM = 
            await queryRunner.manager.save( 
                UoM, 
                uom 
            ); 
 
 
        // ================================================== 
        // AUDIT 
        // ================================================== 
 
        await createAuditRecordService( 
            queryRunner.manager, 
            "master_uom", 
            savedUOM.unit_id, 
            "UPDATE", 
            uomData.userId ?? 
                uomData.updated_by!, 
            uomData.storeId, 
            uomData.sessionId, 
            uomData.ipAddress 
        ); 
 
 
        // ================================================== 
        // COMMIT 
        // ================================================== 
 
        await queryRunner.commitTransaction(); 
 
        return savedUOM; 
 
    } catch (error) { 
 
        await queryRunner.rollbackTransaction(); 
 
        throw error; 
 
    } finally { 
 
        await queryRunner.release(); 
    } 
}; 
 
 
// ====================================================== 
// DELETE UOM 
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
 
    const queryRunner = 
        AppDataSource.createQueryRunner(); 
 
    await queryRunner.connect(); 
    await queryRunner.startTransaction(); 
 
    try { 
 
        // ================================================== 
        // CHECK REFERENCE TYPE 
        // ================================================== 
 
        const referenceType = 
            await queryRunner.manager.findOne( 
                ReferenceType, 
                { 
                    where: { 
                        code: UOM_REFERENCE_CODE, 
                        is_active: true 
                    } 
                } 
            ); 
 
        if (!referenceType) { 
            throw new Error( 
                `Reference type '${UOM_REFERENCE_CODE}' not found` 
            ); 
        } 
 
 
        // ================================================== 
        // FIND UOM 
        // ================================================== 
 
        const uom = 
            await queryRunner.manager.findOne( 
                UoM, 
                { 
                    where: { 
                        unit_id, 
                        is_active: true 
                    } 
                } 
            ); 
 
        if (!uom) { 
            throw new Error("UOM not found"); 
        } 
 
 
        // ================================================== 
        // SOFT DELETE 
        // ================================================== 
 
        uom.is_active = false; 
 
        uom.updated_at = new Date(); 
 
        uom.updated_by = 
            userData.userId ?? 
            null; 
 
 
        // ================================================== 
        // SAVE 
        // ================================================== 
 
        const savedUOM = 
            await queryRunner.manager.save( 
                UoM, 
                uom 
            ); 
 
 
        // ================================================== 
        // AUDIT 
        // ================================================== 
 
        await createAuditRecordService( 
            queryRunner.manager, 
            "master_uom", 
            savedUOM.unit_id, 
            "UPDATE", 
            userData.userId!, 
            userData.storeId, 
            userData.sessionId, 
            userData.ipAddress 
        ); 
 
 
        // ================================================== 
        // COMMIT 
        // ================================================== 
 
        await queryRunner.commitTransaction(); 
 
        return { 
            message: "UOM deleted successfully" 
        }; 
 
    } catch (error) { 
 
        await queryRunner.rollbackTransaction(); 
 
        throw error; 
 
    } finally { 
 
        await queryRunner.release(); 
    } 
};
// import { EntityManager } from "typeorm";
// import { AppDataSource } from "../datasource.js";
// import { UoM } from "../entity/MasterUoM.js";
// import { ReferenceType } from "../entity/MasterReference.js";
// import { createAuditRecordService } from "./AuditServices.js";

// const uomRepository = AppDataSource.getRepository(UoM);
// const UOM_REFERENCE_CODE = "UOM";

// interface AuditContext {
//     userId?: number;
//     storeId?: number;
//     sessionId?: number;
//     ipAddress?: string;
// }

// /**
//  * Validates mandatory audit context and checks if the ReferenceType exists.
//  */
// async function validateContextAndReference(
//     manager: EntityManager,
//     context: AuditContext,
//     fallbackUserId?: number
// ): Promise<{ userId: number; storeId: number; sessionId: number; referenceType: ReferenceType }> {
//     const userId = context.userId ?? fallbackUserId;
//     if (!userId) throw new Error("User ID is required");
//     if (!context.storeId) throw new Error("Store ID is required");
//     if (!context.sessionId) throw new Error("Session ID is required");

//     const referenceType = await manager.findOneBy(ReferenceType, {
//         code: UOM_REFERENCE_CODE,
//         is_active: true
//     });

//     if (!referenceType) {
//         throw new Error(`Reference type '${UOM_REFERENCE_CODE}' not found`);
//     }

//     return {
//         userId,
//         storeId: context.storeId,
//         sessionId: context.sessionId,
//         referenceType
//     };
// }

// // ======================================================
// // CREATE UOM
// // ======================================================

// export const createUOMService = async (
//     uomData: Partial<UoM> & AuditContext
// ) => {
//     const queryRunner = AppDataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//         const { userId, storeId, sessionId } = await validateContextAndReference(
//             queryRunner.manager,
//             uomData,
//             uomData.created_by
//         );

//         if (!uomData.unit_name || !uomData.unit_name.trim()) {
//             throw new Error("Unit name is required");
//         }

//         if (!uomData.unit_type || !uomData.unit_type.trim()) {
//             throw new Error("Unit type is required");
//         }

//         // Check duplicates ONLY among active units
//         const existingUOM = await queryRunner.manager.findOneBy(UoM, {
//             unit_name: uomData.unit_name.trim(),
//             is_active: true
//         });

//         if (existingUOM) {
//             throw new Error("UOM with this unit name already exists");
//         }

//         const uom = queryRunner.manager.create(UoM, {
//             unit_name: uomData.unit_name.trim(),
//             unit_type: uomData.unit_type.trim(),
//             is_active: uomData.is_active ?? true,
//             created_at: uomData.created_at ?? new Date(),
//             created_by: userId
//         });

//         const savedUOM = await queryRunner.manager.save(UoM, uom);

//         // Audit Record Insertion
//         await createAuditRecordService(queryRunner.manager, {
//             tableName: "master_uom",
//             recordId: savedUOM.unit_id,
//             actionTypeCode: "INSERT",
//             userId,
//             storeId,
//             sessionId,
//             ipAddress: uomData.ipAddress
//         });

//         await queryRunner.commitTransaction();
//         return savedUOM;
//     } catch (error: any) {
//         await queryRunner.rollbackTransaction();
//         throw new Error(`Failed to create UOM: ${error.message}`);
//     } finally {
//         await queryRunner.release();
//     }
// };

// // ======================================================
// // GET ALL UOM
// // ======================================================

// export const getAllUOMService = async () => {
//     return await uomRepository.find({
//         where: { is_active: true },
//         order: { unit_id: "ASC" }
//     });
// };

// // ======================================================
// // GET UOM BY ID
// // ======================================================

// export const getUOMByIdService = async (unit_id: number) => {
//     const uom = await uomRepository.findOneBy({
//         unit_id,
//         is_active: true
//     });

//     if (!uom) {
//         throw new Error("UOM not found");
//     }

//     return uom;
// };

// // ======================================================
// // UPDATE UOM
// // ======================================================

// export const updateUOMService = async (
//     unit_id: number,
//     uomData: Partial<UoM> & AuditContext
// ) => {
//     const queryRunner = AppDataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//         const { userId, storeId, sessionId } = await validateContextAndReference(
//             queryRunner.manager,
//             uomData,
//             uomData.updated_by
//         );

//         const uom = await queryRunner.manager.findOneBy(UoM, {
//             unit_id,
//             is_active: true
//         });

//         if (!uom) {
//             throw new Error("UOM not found");
//         }

//         // Validate unit name updates
//         if (uomData.unit_name !== undefined) {
//             const trimmedName = uomData.unit_name.trim();
//             if (!trimmedName) {
//                 throw new Error("Unit name cannot be empty");
//             }

//             if (trimmedName !== uom.unit_name) {
//                 const existingUOM = await queryRunner.manager.findOneBy(UoM, {
//                     unit_name: trimmedName,
//                     is_active: true
//                 });

//                 if (existingUOM && existingUOM.unit_id !== unit_id) {
//                     throw new Error("UOM with this unit name already exists");
//                 }
//             }
//             uom.unit_name = trimmedName;
//         }

//         // Validate unit type updates
//         if (uomData.unit_type !== undefined) {
//             const trimmedType = uomData.unit_type.trim();
//             if (!trimmedType) {
//                 throw new Error("Unit type cannot be empty");
//             }
//             uom.unit_type = trimmedType;
//         }

//         if (uomData.is_active !== undefined) {
//             uom.is_active = uomData.is_active;
//         }

//         uom.updated_at = new Date();
//         uom.updated_by = userId;

//         const savedUOM = await queryRunner.manager.save(UoM, uom);

//         // Audit Record Update
//         await createAuditRecordService(queryRunner.manager, {
//             tableName: "master_uom",
//             recordId: savedUOM.unit_id,
//             actionTypeCode: "UPDATE",
//             userId,
//             storeId,
//             sessionId,
//             ipAddress: uomData.ipAddress
//         });

//         await queryRunner.commitTransaction();
//         return savedUOM;
//     } catch (error: any) {
//         await queryRunner.rollbackTransaction();
//         throw new Error(`Failed to update UOM: ${error.message}`);
//     } finally {
//         await queryRunner.release();
//     }
// };

// // ======================================================
// // DELETE UOM - SOFT DELETE
// // ======================================================

// export const deleteUOMService = async (
//     unit_id: number,
//     userData: AuditContext
// ) => {
//     const queryRunner = AppDataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//         const { userId, storeId, sessionId } = await validateContextAndReference(
//             queryRunner.manager,
//             userData
//         );

//         const uom = await queryRunner.manager.findOneBy(UoM, {
//             unit_id,
//             is_active: true
//         });

//         if (!uom) {
//             throw new Error("UOM not found");
//         }

//         uom.is_active = false;
//         uom.updated_at = new Date();
//         uom.updated_by = userId;

//         const savedUOM = await queryRunner.manager.save(UoM, uom);

//         // Audit Record Soft Delete (Action: DELETE)
//         await createAuditRecordService(queryRunner.manager, {
//             tableName: "master_uom",
//             recordId: savedUOM.unit_id,
//             actionTypeCode: "DELETE",
//             userId,
//             storeId,
//             sessionId,
//             ipAddress: userData.ipAddress
//         });

//         await queryRunner.commitTransaction();

//         return {
//             message: "UOM deleted successfully",
//             deletedUOM: savedUOM
//         };
//     } catch (error: any) {
//         await queryRunner.rollbackTransaction();
//         throw new Error(`Failed to delete UOM: ${error.message}`);
//     } finally {
//         await queryRunner.release();
//     }
// };
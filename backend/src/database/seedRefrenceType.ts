import { AppDataSource } from "../datasource.js";
import { ReferenceType } from "../entity/MasterReference.js";

async function seedReferenceTypes() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const referenceTypeRepository =
            AppDataSource.getRepository(ReferenceType);

        const referenceTypes = [
            {
                // when a new product is added to inventory
                code: "INVADD",
                description: "Product is added to the Inventory"
            },
            {
                // when an inventory is edited -- any other than qty
                code: "INVED",
                description: "Inventory is edited"
            },
            {
                // when a product is deleted or an inventory is deleted
                code: "INVDEL",
                description: "Product is deleted or an inventory is deleted"
            },
            {
                //when bill is created each product change is given when deleted inventory action
                code: "BILCRE",
                description: "Inventory item is a new bill"
            },
            {
                //when bill is deleted each item is given this before adding back the eact qty back to inventory
                code: "BILDEL",
                description: "Stock reduced because of a sale"
            },
            {
                // when new damaged product is added
                code: "DAMADD",
                description: "Stock reduced because of damaged goods"
            },
            {
                // when damaged product qty increase etc 
                code: "DAMED",
                description: "Damaged has been editted "
            },
            {
                // when damaged product is removed and put back in inventory
                code: "DAMD",
                description: "Stock reduced because of damaged goods"
            },
            {
                // update inventory - name ,etc NOT QTY
                code: "ADJ",
                description: "Manual inventory adjustment"
            },
        ];

        for (const referenceTypeData of referenceTypes) {
            const existingReferenceType =
                await referenceTypeRepository.findOne({
                    where: {
                        code: referenceTypeData.code
                    }
                });

            if (existingReferenceType) {
                existingReferenceType.description =
                    referenceTypeData.description;
            
                existingReferenceType.is_active = true;
                existingReferenceType.updated_at = new Date();
            
                await referenceTypeRepository.save(
                    existingReferenceType
                );

                console.log(
                    `${referenceTypeData.code} updated.`
                );
            
                continue;
        }

            const referenceType =
                referenceTypeRepository.create({
                    code: referenceTypeData.code,
                    description: referenceTypeData.description,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: null
                });

            await referenceTypeRepository.save(referenceType);

            console.log(
                `${referenceTypeData.code} created.`
            );
        }

        console.log("Reference type seeding completed.");
    } catch (error) {
        console.error(
            "Reference type seeding failed:",
            error
        );
        process.exitCode = 1;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedReferenceTypes();
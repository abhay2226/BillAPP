import { AppDataSource } from "./datasource.js";
import { MovementType } from "./entity/MasterMovementType.js";

async function seedMovementTypes() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const movementTypeRepository =
            AppDataSource.getRepository(MovementType);

        const movementTypes = [
            {
                // when a new product is added to inventory
                code: "STOCK",
                description: "New Product is added to the Inventory"
            },
            {
                // when a product or inventory is deleted
                code: "DELETE",
                description: "New Product is added to the Inventory"
            },
            {
                //when bill is deleted each item will be market this or 
                // damaged table as deletion or 
                // exiting product is updated 
                code: "RESTOCK",
                description: "Stock added to inventory"
            },
            {
                //when bill is generated each item is given
                code: "SALE",
                description: "Stock reduced because of a sale"
            },
            {
                // when new damaged product is added
                code: "DAMAGE",
                description: "Stock reduced because of damaged goods"
            },
            {
                // update inventory - name ,etc not qty
                code: "ADJUSTMENT",
                description: "Manual inventory adjustment"
            },
        ];

        for (const movementTypeData of movementTypes) {
            const existingMovementType =
                await movementTypeRepository.findOne({
                    where: {
                        code: movementTypeData.code
                    }
                });

            if (existingMovementType) {
                existingMovementType.description =
                    movementTypeData.description;
            
                existingMovementType.is_active = true;
                existingMovementType.updated_at = new Date();
            
                await movementTypeRepository.save(
                    existingMovementType
                );

                console.log(
                    `${movementTypeData.code} updated.`
                );
            
                continue;
        }

            const movementType =
                movementTypeRepository.create({
                    code: movementTypeData.code,
                    description: movementTypeData.description,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: null
                });

            await movementTypeRepository.save(movementType);

            console.log(
                `${movementTypeData.code} created.`
            );
        }

        console.log("Movement type seeding completed.");
    } catch (error) {
        console.error(
            "Movement type seeding failed:",
            error
        );
        process.exitCode = 1;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedMovementTypes();
import { AppDataSource } from "../datasource.js";
import { ActionType } from "../entity/MasterActionType.js";

async function seedActionTypes() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const ActionTypeRepository =
            AppDataSource.getRepository(ActionType);

        const ActionTypes = [
            {
                // create functions
                code: "INSERT",
                description: "Logs when a new record is created, capturing the initial field values."
            },
            {
                // update functions
                code: "UPDATE",
                description: "Logs when existing data is modified, often storing both the old (before) and new (after) values."
            },
            {
                // DEACTIVATE
                code: "DELETE",
                description: "Logs when a record is removed or soft-deleted, preserving the final state of the data before it was erased."
            }
        ];

        for (const ActionTypeData of ActionTypes) {
            const existingActionType =
                await ActionTypeRepository.findOne({
                    where: {
                        code: ActionTypeData.code
                    }
                });

            if (existingActionType) {
                existingActionType.description =
                    ActionTypeData.description;
            
                existingActionType.is_active = true;
                existingActionType.updated_at = new Date();
            
                await ActionTypeRepository.save(
                    existingActionType
                );

                console.log(
                    `${ActionTypeData.code} updated.`
                );
            
                continue;
        }

            const ActionType =
                ActionTypeRepository.create({
                    code: ActionTypeData.code,
                    description: ActionTypeData.description,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: null
                });

            await ActionTypeRepository.save(ActionType);

            console.log(
                `${ActionTypeData.code} created.`
            );
        }

        console.log("Action type seeding completed.");
    } catch (error) {
        console.error(
            "Action type seeding failed:",
            error
        );
        process.exitCode = 1;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedActionTypes();
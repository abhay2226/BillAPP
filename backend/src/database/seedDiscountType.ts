import { AppDataSource } from "../datasource.js";
import { DiscountType } from "../entity/MasterDiscountType.js";

async function seedDiscountTypes() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected.");

        const discountTypeRepository =
            AppDataSource.getRepository(DiscountType);

        const discountTypes = [
            {
                code: "FLAT",
                description: "apply fixed deduction."
            },
            {
                code: "FLAT",
                description: "apply percantage formula."
            },
            
        ];

        for (const discountTypeData of discountTypes) {
            const existingDiscountType =
                await discountTypeRepository.findOne({
                    where: {
                        code: discountTypeData.code
                    }
                });

            if (existingDiscountType) {
                existingDiscountType.description =
                    discountTypeData.description;
            
                existingDiscountType.is_active = true;
                existingDiscountType.updated_at = new Date();
            
                await discountTypeRepository.save(
                    existingDiscountType
                );

                console.log(
                    `${discountTypeData.code} updated.`
                );
            
                continue;
        }

            const discountType =
                discountTypeRepository.create({
                    code: discountTypeData.code,
                    description: discountTypeData.description,
                    is_active: true,
                    created_at: new Date(),
                    updated_at: null
                });

            await discountTypeRepository.save(discountType);

            console.log(
                `${discountTypeData.code} created.`
            );
        }

        console.log("Discount type seeding completed.");
    } catch (error) {
        console.error(
            "Discount type seeding failed:",
            error
        );
        process.exitCode = 1;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedDiscountTypes();
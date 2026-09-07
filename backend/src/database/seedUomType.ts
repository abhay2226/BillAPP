
import { AppDataSource } from "../datasource.js";

import { UoM } from "../entity/MasterUoM.js";


// ======================================================
// SEED UOM
// ======================================================

async function seedUOM() {

    try {

        await AppDataSource.initialize();

        console.log(
            "Database connected."
        );


        const uomRepository =
            AppDataSource.getRepository(UoM);


        // ==================================================
        // UOM MASTER DATA
        // ==================================================

        const uoms = [

            // ----------------------------------------------
            // COUNT
            // ----------------------------------------------

            {
                unit_name: "PCS",
                unit_type: "COUNT"
            },

            {
                unit_name: "DOZEN",
                unit_type: "COUNT"
            },


            // ----------------------------------------------
            // WEIGHT
            // ----------------------------------------------

            {
                unit_name: "MG",
                unit_type: "WEIGHT"
            },

            {
                unit_name: "G",
                unit_type: "WEIGHT"
            },

            {
                unit_name: "KG",
                unit_type: "WEIGHT"
            },

            {
                unit_name: "TON",
                unit_type: "WEIGHT"
            },


            // ----------------------------------------------
            // VOLUME
            // ----------------------------------------------

            {
                unit_name: "ML",
                unit_type: "VOLUME"
            },

            {
                unit_name: "L",
                unit_type: "VOLUME"
            },


            // ----------------------------------------------
            // LENGTH
            // ----------------------------------------------

            {
                unit_name: "MM",
                unit_type: "LENGTH"
            },

            {
                unit_name: "CM",
                unit_type: "LENGTH"
            },

            {
                unit_name: "M",
                unit_type: "LENGTH"
            },


            // ----------------------------------------------
            // PACKAGING
            // ----------------------------------------------

            {
                unit_name: "PACK",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "BOX",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "BOTTLE",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "CAN",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "BAG",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "TIN",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "JAR",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "BUNDLE",
                unit_type: "PACKAGING"
            },

            {
                unit_name: "PAIR",
                unit_type: "PACKAGING"
            }

        ];


        // ==================================================
        // INSERT / UPDATE UOM
        // ==================================================

        for (
            const uomData of uoms
        ) {

            const existingUOM =
                await uomRepository.findOne({
                    where: {
                        unit_name:
                            uomData.unit_name
                    }
                });


            // ==============================================
            // UPDATE EXISTING UOM
            // ==============================================

            if (existingUOM) {

                existingUOM.unit_type =
                    uomData.unit_type;

                existingUOM.is_active =
                    true;

                existingUOM.updated_at =
                    new Date();


                await uomRepository.save(
                    existingUOM
                );


                console.log(
                    `${uomData.unit_name} updated.`
                );


                continue;
            }


            // ==============================================
            // CREATE NEW UOM
            // ==============================================

            const uom =
                uomRepository.create({

                    unit_name:
                        uomData.unit_name,

                    unit_type:
                        uomData.unit_type,

                    is_active:
                        true,

                    created_at:
                        new Date(),

                    created_by:
                        null,

                    updated_at:
                        null,

                    updated_by:
                        null
                });


            await uomRepository.save(
                uom
            );


            console.log(
                `${uomData.unit_name} created.`
            );
        }


        // ==================================================
        // COMPLETED
        // ==================================================

        console.log(
            "UOM seeding completed."
        );

    }

    catch (error) {

        console.error(
            "UOM seeding failed:",
            error
        );

        process.exitCode = 1;
    }

    finally {

        if (
            AppDataSource.isInitialized
        ) {

            await AppDataSource.destroy();
        }
    }
}


seedUOM();


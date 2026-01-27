import cron from "node-cron";
import connectToDB from "@/lib/mongodb";
import ClothesModel from "@/models/Clothes";

export function startResetOrderedCron() {
    cron.schedule(
        "0 23 * * 5", // Friday at 23:00
        async () => {
            try {
                await connectToDB();
                await ClothesModel.updateMany({}, { $set: { ordered: 0 } });
                console.log("✅ ordered reset to 0 (Friday night)");
            } catch (err) {
                console.error("❌ reset failed", err);
            }
        },
        {
            timezone: "Africa/Cairo", // IMPORTANT
        },
    );
}

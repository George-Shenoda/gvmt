import { startResetOrderedCron } from "@/lib/resetOrderedCron";

let started = false;

export async function GET() {
    if (!started) {
        startResetOrderedCron();
        started = true;
    }

    return new Response("OK");
}

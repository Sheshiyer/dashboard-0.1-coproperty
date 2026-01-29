import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET() {
    logger.info("Health check requested", { endpoint: "/api/health" });

    return NextResponse.json(
        { status: "ok", timestamp: new Date().toISOString() },
        { status: 200 }
    );
}

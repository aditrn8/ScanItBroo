import { NextResponse } from "next/server";
import { getScanCache, triggerFullScan, stopScan } from "@/lib/scanner";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Max execution time for Vercel Serverless Functions

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  const cache = getScanCache();

  // ONLY trigger scan if force=true is explicitly requested
  if (force && !cache.isScanning) {
    triggerFullScan().catch((err) => console.error("Background scan error:", err));
  }

  return NextResponse.json({
    status: cache.isScanning ? "scanning" : cache.data.length > 0 ? "success" : "idle",
    data: cache.data,
    summary: {
      totalPairs: cache.totalPairs,
      scannedCount: cache.scannedCount,
      confluenceCount: cache.confluenceCount,
      longCount: cache.longCount || 0,
      shortCount: cache.shortCount || 0,
      lastUpdated: cache.lastUpdated,
      isScanning: cache.isScanning,
      scanDurationMs: cache.scanDurationMs,
      error: cache.error,
    },
  });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "stop") {
    stopScan();
    return NextResponse.json({
      status: "stopped",
      isScanning: false,
    });
  }

  const cache = getScanCache();
  if (!cache.isScanning) {
    triggerFullScan().catch((err) => console.error("Forced scan error:", err));
  }

  return NextResponse.json({
    status: "started",
    isScanning: true,
  });
}

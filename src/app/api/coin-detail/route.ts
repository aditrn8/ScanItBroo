import { NextResponse } from "next/server";
import { getFundingRate } from "@/lib/bitunix";
import { FundingRateData } from "@/types/crypto";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    const raw = await getFundingRate(symbol);
    if (!raw) {
      return NextResponse.json({ error: "Funding rate not found" }, { status: 404 });
    }

    const fundingRateNum = parseFloat(raw.fundingRate || "0");
    const fundingRatePercent = Number((fundingRateNum * 100).toFixed(4));

    const data: FundingRateData = {
      symbol: raw.symbol,
      fundingRatePercent,
      fundingRateRaw: raw.fundingRate,
      nextFundingTime: parseInt(raw.nextFundingTime || "0", 10),
      markPrice: parseFloat(raw.markPrice || "0"),
      indexPrice: parseFloat(raw.indexPrice || "0"),
      lastPrice: parseFloat(raw.lastPrice || "0"),
      intervalHours: raw.fundingInterval || 8,
    };

    return NextResponse.json({ status: "success", data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch funding rate" },
      { status: 500 }
    );
  }
}

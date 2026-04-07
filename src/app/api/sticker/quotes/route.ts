import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ipId = searchParams.get("ipId");

  if (!ipId) return NextResponse.json({ quotes: [] });

  try {
    const dataPath = path.join(process.cwd(), `public/sticker-data/quotes/${ipId}.json`);
    const raw = fs.readFileSync(dataPath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ quotes: [] });
  }
}

import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";
const GAS_SHARED_SECRET = process.env.GAS_SHARED_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(
        Object.fromEntries(
          Object.entries({ ...body, token: GAS_SHARED_SECRET }).map(([k, v]) => [k, String(v ?? "")])
        )
      ).toString(),
      redirect: "follow",
    });

    const text = await res.text();
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ success: false, error: "GAS error: " + text.slice(0, 200) });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) });
  }
}
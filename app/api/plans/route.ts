import { NextResponse } from "next/server";
import { createPlanItem, deletePlanItem, listPlanItems, updatePlanItem } from "@/lib/plans";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const plans = await listPlanItems({
      date: searchParams.get("date") || undefined,
      start: searchParams.get("start") || undefined,
      end: searchParams.get("end") || undefined
    });
    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const plan = await createPlanItem(await request.json());
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, content } = await request.json();
    const plan = await updatePlanItem(id, content);
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    await deletePlanItem(searchParams.get("id") || "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

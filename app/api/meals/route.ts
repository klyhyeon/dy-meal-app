import { NextResponse } from "next/server";
import { createMeal, deleteMeal, listMeals, updateMeal } from "@/lib/meals";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const meals = await listMeals({
      date: searchParams.get("date") || undefined,
      start: searchParams.get("start") || undefined,
      end: searchParams.get("end") || undefined
    });
    return NextResponse.json({ meals });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const meal = await createMeal(await request.json());
    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, content } = await request.json();
    const meal = await updateMeal(id, content);
    return NextResponse.json({ meal });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    await deleteMeal(searchParams.get("id") || "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getMessage(error) }, { status: 400 });
  }
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

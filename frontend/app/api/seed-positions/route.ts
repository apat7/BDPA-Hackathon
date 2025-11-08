import { NextResponse } from "next/server";
import { seedPositions } from "@/lib/seedPositions";

export async function POST() {
  try {
    await seedPositions();
    return NextResponse.json(
      { success: true, message: "Positions seeded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error seeding positions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed positions" },
      { status: 500 }
    );
  }
}


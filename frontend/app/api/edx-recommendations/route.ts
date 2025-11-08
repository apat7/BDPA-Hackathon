import { NextResponse } from "next/server";
import { getResourcesForSkills } from "@/lib/learningResources";

export async function POST(request: Request) {
  try {
    const { skills } = await request.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid skills in request body" },
        { status: 400 }
      );
    }

    // Get matching resources from hardcoded data
    const resources = getResourcesForSkills(skills);

    // Convert to the expected response format
    const recommendations = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      platform: resource.platform,
      url: resource.url,
      description: resource.description,
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error processing learning resources request:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning resources" },
      { status: 500 }
    );
  }
}


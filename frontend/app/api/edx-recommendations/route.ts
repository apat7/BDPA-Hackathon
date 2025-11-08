import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { skills } = await request.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid skills in request body" },
        { status: 400 }
      );
    }

    const COURSERA_API_KEY = process.env.COURSERA_API;

    if (!COURSERA_API_KEY) {
      return NextResponse.json(
        { error: "Coursera API key not configured" },
        { status: 500 }
      );
    }

    // Placeholder for actual Coursera API call
    // The provided API endpoint GET /api/rest/v1/enterprise/programs/{programId}/skillsets/{skillsetId}/skills/{skillId}/content-recommendations
    // requires specific IDs (programId, skillsetId, skillId) which are not directly available from skill names.
    // A more general search endpoint would be needed, or a way to map skill names to these IDs.
    // For now, we'll return mock data with more specific URLs.
    // In a real-world scenario, you would integrate with a Coursera API that allows searching by skill name
    // and provides direct course links.

    const mockRecommendations = skills.map((skill: string, index: number) => ({
      id: `mock-course-${index}`,
      title: `Introduction to ${skill} - Course ${index + 1}`,
      platform: "Coursera",
      url: `https://www.coursera.org/learn/introduction-to-${skill.toLowerCase().replace(/\s/g, '-')}-${index + 1}`,
      description: `Learn the fundamentals of ${skill} with this comprehensive course.`,
    }));

    return NextResponse.json({ recommendations: mockRecommendations });
  } catch (error) {
    console.error("Error fetching Coursera recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch Coursera recommendations" },
      { status: 500 }
    );
  }
}

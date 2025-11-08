import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

interface Position {
  title: string;
  industry: string;
  company?: string;
  description?: string;
  requiredSkills: string[];
}

const samplePositions: Position[] = [
  // Software Engineering - Frontend
  {
    title: "Senior Frontend Developer",
    industry: "Software Engineering",
    company: "TechCorp",
    description: "Build modern, responsive web applications using React and TypeScript. Lead frontend architecture decisions and mentor junior developers.",
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "HTML",
      "CSS",
      "Git",
      "REST APIs",
      "Responsive Design"
    ]
  },
  {
    title: "Frontend Developer",
    industry: "Software Engineering",
    company: "StartupXYZ",
    description: "Develop user-facing features for web applications. Collaborate with designers and backend developers to create seamless user experiences.",
    requiredSkills: [
      "JavaScript",
      "React",
      "HTML",
      "CSS",
      "Git",
      "Tailwind CSS"
    ]
  },
  {
    title: "React Developer",
    industry: "Software Engineering",
    company: "Digital Solutions Inc",
    description: "Specialize in building React-based applications. Work on component libraries and state management solutions.",
    requiredSkills: [
      "React",
      "JavaScript",
      "TypeScript",
      "Redux",
      "Git",
      "Webpack"
    ]
  },

  // Software Engineering - Backend
  {
    title: "Backend Developer",
    industry: "Software Engineering",
    company: "CloudTech",
    description: "Design and implement scalable backend systems. Build RESTful APIs and work with databases to support application functionality.",
    requiredSkills: [
      "Node.js",
      "Python",
      "SQL",
      "REST APIs",
      "Git",
      "MongoDB",
      "Express"
    ]
  },
  {
    title: "Senior Backend Engineer",
    industry: "Software Engineering",
    company: "Enterprise Systems",
    description: "Architect and develop high-performance backend services. Lead technical decisions and optimize system performance.",
    requiredSkills: [
      "Python",
      "Java",
      "Microservices",
      "Docker",
      "PostgreSQL",
      "Kubernetes",
      "CI/CD"
    ]
  },
  {
    title: "Full Stack Developer",
    industry: "Software Engineering",
    company: "Innovation Labs",
    description: "Work across the entire stack to build end-to-end features. Handle both frontend and backend development tasks.",
    requiredSkills: [
      "JavaScript",
      "Node.js",
      "React",
      "MongoDB",
      "Express",
      "REST APIs",
      "Git"
    ]
  },

  // Data Science
  {
    title: "Data Scientist",
    industry: "Data Science",
    company: "Analytics Corp",
    description: "Analyze large datasets to extract insights and build predictive models. Communicate findings to stakeholders and drive data-driven decisions.",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "SQL",
      "Statistics",
      "Data Visualization",
      "Pandas",
      "NumPy"
    ]
  },
  {
    title: "Machine Learning Engineer",
    industry: "Data Science",
    company: "AI Innovations",
    description: "Design and deploy machine learning models at scale. Optimize model performance and integrate ML solutions into production systems.",
    requiredSkills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "Docker",
      "AWS"
    ]
  },
  {
    title: "Data Analyst",
    industry: "Data Science",
    company: "Business Intelligence Co",
    description: "Transform raw data into actionable insights. Create reports and dashboards to support business decision-making.",
    requiredSkills: [
      "SQL",
      "Python",
      "Excel",
      "Data Visualization",
      "Statistics",
      "Tableau"
    ]
  },

  // DevOps
  {
    title: "DevOps Engineer",
    industry: "DevOps",
    company: "Cloud Infrastructure Inc",
    description: "Manage cloud infrastructure and CI/CD pipelines. Ensure system reliability and automate deployment processes.",
    requiredSkills: [
      "AWS",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Linux",
      "Terraform",
      "Git"
    ]
  },
  {
    title: "Site Reliability Engineer",
    industry: "DevOps",
    company: "Scale Systems",
    description: "Ensure high availability and performance of production systems. Monitor infrastructure and respond to incidents.",
    requiredSkills: [
      "Kubernetes",
      "Docker",
      "Monitoring",
      "Linux",
      "Python",
      "AWS",
      "CI/CD"
    ]
  },
  {
    title: "Cloud Engineer",
    industry: "DevOps",
    company: "MultiCloud Solutions",
    description: "Design and implement cloud infrastructure solutions. Optimize costs and ensure security best practices.",
    requiredSkills: [
      "AWS",
      "Azure",
      "Terraform",
      "Docker",
      "Linux",
      "Networking",
      "Security"
    ]
  },

  // Product Management
  {
    title: "Product Manager",
    industry: "Product Management",
    company: "Product Co",
    description: "Lead product development from conception to launch. Work with engineering and design teams to deliver user-focused products.",
    requiredSkills: [
      "Product Strategy",
      "Agile",
      "User Research",
      "Analytics",
      "Project Management",
      "Communication"
    ]
  },
  {
    title: "Technical Product Manager",
    industry: "Product Management",
    company: "Tech Products Inc",
    description: "Bridge the gap between technical teams and business stakeholders. Define technical requirements and product roadmaps.",
    requiredSkills: [
      "Product Strategy",
      "Technical Writing",
      "Agile",
      "System Design",
      "Analytics",
      "Communication"
    ]
  },

  // UI/UX Design
  {
    title: "UI/UX Designer",
    industry: "UI/UX Design",
    company: "Design Studio",
    description: "Create intuitive and beautiful user interfaces. Conduct user research and design user experiences that delight users.",
    requiredSkills: [
      "Figma",
      "User Research",
      "Prototyping",
      "Design Systems",
      "Wireframing",
      "Usability Testing"
    ]
  },
  {
    title: "Product Designer",
    industry: "UI/UX Design",
    company: "Creative Labs",
    description: "Design end-to-end product experiences. Collaborate with product managers and engineers to bring designs to life.",
    requiredSkills: [
      "Figma",
      "User Research",
      "Prototyping",
      "Design Systems",
      "Interaction Design",
      "HTML",
      "CSS"
    ]
  },

  // Mobile Development
  {
    title: "iOS Developer",
    industry: "Software Engineering",
    company: "Mobile Apps Co",
    description: "Develop native iOS applications using Swift. Build features and ensure optimal performance on Apple devices.",
    requiredSkills: [
      "Swift",
      "iOS",
      "Xcode",
      "UIKit",
      "SwiftUI",
      "Git",
      "REST APIs"
    ]
  },
  {
    title: "Android Developer",
    industry: "Software Engineering",
    company: "Mobile Solutions",
    description: "Build Android applications using Kotlin or Java. Create user-friendly mobile experiences for millions of users.",
    requiredSkills: [
      "Kotlin",
      "Java",
      "Android",
      "Android Studio",
      "Git",
      "REST APIs",
      "Material Design"
    ]
  },

  // Additional Tech Roles
  {
    title: "Software Engineer",
    industry: "Software Engineering",
    company: "General Tech",
    description: "Develop software solutions across various domains. Write clean, maintainable code and collaborate with cross-functional teams.",
    requiredSkills: [
      "Programming",
      "Algorithms",
      "Data Structures",
      "Git",
      "Problem Solving",
      "Communication"
    ]
  },
  {
    title: "QA Engineer",
    industry: "Software Engineering",
    company: "Quality Assurance Inc",
    description: "Ensure software quality through testing and automation. Write test cases and identify bugs before production releases.",
    requiredSkills: [
      "Testing",
      "Automation",
      "Selenium",
      "Python",
      "Git",
      "Bug Tracking",
      "Test Planning"
    ]
  }
];

export async function seedPositions() {
  try {
    console.log("Starting to seed positions...");

    // Check if positions already exist
    const positionsRef = collection(db, "positions");
    const existingPositions = await getDocs(positionsRef);
    
    if (!existingPositions.empty) {
      const message = `Found ${existingPositions.size} existing positions. Skipping seed to avoid duplicates.`;
      console.log(message);
      console.log("To re-seed, please delete existing positions from Firestore first.");
      throw new Error(message);
    }

    // Add all positions
    const promises = samplePositions.map(async (position) => {
      try {
        const docRef = await addDoc(collection(db, "positions"), position);
        console.log(`Added position: ${position.title} (ID: ${docRef.id})`);
        return docRef.id;
      } catch (error: any) {
        console.error(`Error adding position ${position.title}:`, error);
        // Check if it's a permissions error
        if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
          throw new Error(
            'Permission denied. Please update your Firestore security rules. ' +
            'See FIRESTORE_RULES_SETUP.md for instructions.'
          );
        }
        throw error;
      }
    });

    await Promise.all(promises);
    console.log(`Successfully seeded ${samplePositions.length} positions!`);
  } catch (error: any) {
    console.error("Error seeding positions:", error);
    // Re-throw with a more helpful message for permissions errors
    if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
      throw new Error(
        'Permission denied. Please update your Firestore security rules. ' +
        'See FIRESTORE_RULES_SETUP.md for instructions.'
      );
    }
    throw error;
  }
}

// Export sample positions for reference
export { samplePositions };


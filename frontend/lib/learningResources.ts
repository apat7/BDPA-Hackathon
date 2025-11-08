// Hardcoded learning resources (EdX and Coursera courses)
// Matched to skills using tags

export interface LearningResource {
  id: string;
  title: string;
  platform: "EdX" | "Coursera";
  url: string;
  description: string;
  tags: string[]; // Skills/keywords this course covers
}

export const LEARNING_RESOURCES: LearningResource[] = [
  // Programming Languages - JavaScript
  {
    id: "js-intro-edx",
    title: "Introduction to JavaScript",
    platform: "EdX",
    url: "https://www.edx.org/learn/javascript",
    description: "Learn the fundamentals of JavaScript programming, including variables, functions, and DOM manipulation.",
    tags: ["JavaScript", "Programming", "Web Development", "HTML", "CSS"]
  },
  {
    id: "js-coursera",
    title: "JavaScript for Beginners Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/javascript-beginner",
    description: "Master JavaScript from scratch. Learn modern JavaScript features and build real-world projects.",
    tags: ["JavaScript", "Programming", "Web Development", "Frontend"]
  },

  // Programming Languages - Python
  {
    id: "python-intro-edx",
    title: "Introduction to Python Programming",
    platform: "EdX",
    url: "https://www.edx.org/learn/python",
    description: "Learn Python programming fundamentals, data structures, and object-oriented programming concepts.",
    tags: ["Python", "Programming", "Data Structures", "Algorithms"]
  },
  {
    id: "python-coursera",
    title: "Python for Everybody Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/python",
    description: "Learn to program and analyze data with Python. Develop programs to gather, clean, analyze, and visualize data.",
    tags: ["Python", "Programming", "Data Analysis", "Data Science"]
  },

  // Web Frameworks - React
  {
    id: "react-coursera",
    title: "React - The Complete Guide",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/react-basics",
    description: "Master React.js for building modern, interactive user interfaces. Learn hooks, state management, and routing.",
    tags: ["React", "JavaScript", "Frontend", "Web Development", "UI"]
  },
  {
    id: "react-edx",
    title: "Building Modern Web Applications with React",
    platform: "EdX",
    url: "https://www.edx.org/learn/react",
    description: "Learn to build scalable web applications using React, including component architecture and state management.",
    tags: ["React", "JavaScript", "Frontend", "Web Development"]
  },

  // React Ecosystem - Redux
  {
    id: "redux-coursera",
    title: "Redux for React Applications",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/redux",
    description: "Master Redux state management for React applications. Learn actions, reducers, and middleware.",
    tags: ["Redux", "React", "State Management", "JavaScript", "Frontend"]
  },
  {
    id: "redux-edx",
    title: "State Management with Redux",
    platform: "EdX",
    url: "https://www.edx.org/learn/redux",
    description: "Learn Redux for managing complex application state in React applications.",
    tags: ["Redux", "React", "State Management", "JavaScript"]
  },

  // Build Tools - Webpack
  {
    id: "webpack-coursera",
    title: "Webpack and Modern JavaScript Build Tools",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/webpack",
    description: "Master Webpack for bundling JavaScript applications. Learn code splitting, optimization, and plugins.",
    tags: ["Webpack", "Build Tools", "JavaScript", "React", "Frontend"]
  },
  {
    id: "webpack-edx",
    title: "Introduction to Webpack",
    platform: "EdX",
    url: "https://www.edx.org/learn/webpack",
    description: "Learn Webpack module bundler for modern JavaScript applications.",
    tags: ["Webpack", "Build Tools", "JavaScript", "React"]
  },

  // HTML & CSS
  {
    id: "html-css-coursera",
    title: "HTML, CSS, and Javascript for Web Developers",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/html-css-javascript-for-web-developers",
    description: "Learn HTML and CSS fundamentals for building responsive web pages.",
    tags: ["HTML", "CSS", "Web Development", "Frontend"]
  },
  {
    id: "html-css-edx",
    title: "Introduction to HTML and CSS",
    platform: "EdX",
    url: "https://www.edx.org/learn/html-css",
    description: "Master HTML and CSS for creating beautiful and responsive web pages.",
    tags: ["HTML", "CSS", "Web Development", "Frontend"]
  },

  // Web Frameworks - Node.js
  {
    id: "nodejs-coursera",
    title: "Server-Side Development with NodeJS",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/server-side-nodejs",
    description: "Build scalable backend applications with Node.js, Express, and MongoDB. Learn REST APIs and authentication.",
    tags: ["Node.js", "JavaScript", "Backend", "Express", "REST APIs", "MongoDB"]
  },
  {
    id: "nodejs-edx",
    title: "Introduction to Node.js",
    platform: "EdX",
    url: "https://www.edx.org/learn/nodejs",
    description: "Learn server-side JavaScript development with Node.js, including async programming and API development.",
    tags: ["Node.js", "JavaScript", "Backend", "REST APIs"]
  },

  // Web Frameworks - Django
  {
    id: "django-edx",
    title: "Django for Everybody",
    platform: "EdX",
    url: "https://www.edx.org/learn/django",
    description: "Learn Django web framework for Python. Build database-driven web applications with Django's ORM.",
    tags: ["Django", "Python", "Web Development", "Backend", "SQL", "PostgreSQL"]
  },

  // Databases - SQL
  {
    id: "sql-coursera",
    title: "SQL for Data Science",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/sql-for-data-science",
    description: "Learn SQL fundamentals for data analysis. Query databases, join tables, and analyze data efficiently.",
    tags: ["SQL", "Databases", "Data Analysis", "MySQL", "PostgreSQL", "Data Science"]
  },
  {
    id: "sql-edx",
    title: "Introduction to Databases and SQL",
    platform: "EdX",
    url: "https://www.edx.org/learn/sql",
    description: "Master SQL for database management. Learn to design databases, write queries, and optimize performance.",
    tags: ["SQL", "Databases", "MySQL", "PostgreSQL", "Database Design"]
  },

  // Databases - MongoDB
  {
    id: "mongodb-coursera",
    title: "MongoDB Basics",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/introduction-mongodb",
    description: "Learn MongoDB NoSQL database fundamentals, including document modeling, queries, and aggregation.",
    tags: ["MongoDB", "Databases", "NoSQL", "Backend", "Node.js"]
  },

  // Cloud & DevOps - AWS
  {
    id: "aws-coursera",
    title: "AWS Cloud Practitioner Essentials",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials",
    description: "Learn AWS cloud fundamentals, including EC2, S3, Lambda, and cloud architecture best practices.",
    tags: ["AWS", "Cloud", "DevOps", "Cloud Architecture", "Infrastructure"]
  },
  {
    id: "aws-edx",
    title: "Introduction to Cloud Computing with AWS",
    platform: "EdX",
    url: "https://www.edx.org/learn/aws",
    description: "Master Amazon Web Services. Learn to deploy and manage applications on AWS cloud infrastructure.",
    tags: ["AWS", "Cloud", "DevOps", "Cloud Architecture"]
  },

  // Cloud & DevOps - Docker
  {
    id: "docker-coursera",
    title: "Docker for Developers",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/docker",
    description: "Learn containerization with Docker. Build, deploy, and manage containerized applications.",
    tags: ["Docker", "DevOps", "Containers", "CI/CD", "Deployment"]
  },
  {
    id: "docker-edx",
    title: "Introduction to Docker and Containers",
    platform: "EdX",
    url: "https://www.edx.org/learn/docker",
    description: "Master Docker containerization. Learn to create, manage, and orchestrate containers for modern applications.",
    tags: ["Docker", "DevOps", "Containers", "Kubernetes"]
  },

  // Cloud & DevOps - Kubernetes
  {
    id: "kubernetes-coursera",
    title: "Kubernetes: Deploy, Scale, and Manage",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/kubernetes",
    description: "Learn Kubernetes orchestration. Deploy, scale, and manage containerized applications in production.",
    tags: ["Kubernetes", "DevOps", "Containers", "Docker", "Cloud", "Deployment"]
  },

  // QA & Testing - Testing Fundamentals
  {
    id: "testing-coursera",
    title: "Software Testing and Automation Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/software-testing-automation",
    description: "Learn software testing fundamentals, test planning, and test case design.",
    tags: ["Testing", "Test Planning", "Automation", "Software Testing"]
  },
  {
    id: "testing-edx",
    title: "Introduction to Software Testing",
    platform: "EdX",
    url: "https://www.edx.org/learn/software-testing",
    description: "Master the fundamentals of software testing and quality assurance.",
    tags: ["Testing", "Test Planning", "Software Testing", "Quality Assurance"]
  },

  // QA & Testing - Automation
  {
    id: "automation-coursera",
    title: "Test Automation with Selenium",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/test-automation",
    description: "Learn test automation frameworks and tools for automated testing.",
    tags: ["Automation", "Selenium", "Testing", "Test Automation"]
  },
  {
    id: "automation-edx",
    title: "Test Automation Fundamentals",
    platform: "EdX",
    url: "https://www.edx.org/learn/test-automation",
    description: "Master test automation principles and practices.",
    tags: ["Automation", "Testing", "Test Automation"]
  },

  // QA & Testing - Selenium
  {
    id: "selenium-coursera",
    title: "Selenium WebDriver with Python",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/selenium",
    description: "Master Selenium WebDriver for automated web testing with Python.",
    tags: ["Selenium", "Python", "Automation", "Testing", "Web Testing"]
  },
  {
    id: "selenium-edx",
    title: "Introduction to Selenium",
    platform: "EdX",
    url: "https://www.edx.org/learn/selenium",
    description: "Learn Selenium for automated browser testing and web application testing.",
    tags: ["Selenium", "Automation", "Testing", "Web Testing"]
  },

  // QA & Testing - Bug Tracking
  {
    id: "bug-tracking-coursera",
    title: "Bug Tracking and Defect Management",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/bug-tracking",
    description: "Learn bug tracking systems, defect lifecycle, and issue management.",
    tags: ["Bug Tracking", "Test Planning", "Testing", "Quality Assurance"]
  },
  {
    id: "bug-tracking-edx",
    title: "Defect Management and Bug Tracking",
    platform: "EdX",
    url: "https://www.edx.org/learn/bug-tracking",
    description: "Master bug tracking tools and defect management processes.",
    tags: ["Bug Tracking", "Testing", "Quality Assurance"]
  },

  // QA & Testing - Test Planning
  {
    id: "test-planning-coursera",
    title: "Test Planning and Strategy",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/test-planning",
    description: "Learn comprehensive test planning, test strategy, and test case design.",
    tags: ["Test Planning", "Testing", "Test Strategy", "Quality Assurance"]
  },
  {
    id: "test-planning-edx",
    title: "Test Planning and Design",
    platform: "EdX",
    url: "https://www.edx.org/learn/test-planning",
    description: "Master test planning methodologies and test design techniques.",
    tags: ["Test Planning", "Testing", "Test Design"]
  },

  // Data Science - Statistics
  {
    id: "statistics-coursera",
    title: "Statistics with Python Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/statistics-with-python",
    description: "Learn statistical analysis with Python. Master hypothesis testing, regression, and data analysis.",
    tags: ["Statistics", "Python", "Data Analysis", "Data Science"]
  },
  {
    id: "statistics-edx",
    title: "Introduction to Statistics",
    platform: "EdX",
    url: "https://www.edx.org/learn/statistics",
    description: "Master statistical concepts and methods for data analysis.",
    tags: ["Statistics", "Data Analysis", "Data Science"]
  },

  // Data Science - Pandas
  {
    id: "pandas-coursera",
    title: "Data Manipulation with Pandas",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/pandas",
    description: "Master Pandas for data manipulation, cleaning, and analysis in Python.",
    tags: ["Pandas", "Python", "Data Analysis", "Data Science", "NumPy"]
  },
  {
    id: "pandas-edx",
    title: "Data Analysis with Pandas",
    platform: "EdX",
    url: "https://www.edx.org/learn/pandas",
    description: "Learn Pandas library for efficient data manipulation and analysis.",
    tags: ["Pandas", "Python", "Data Analysis", "NumPy"]
  },

  // Data Science - NumPy
  {
    id: "numpy-coursera",
    title: "NumPy for Data Science",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/numpy",
    description: "Master NumPy for numerical computing and array operations in Python.",
    tags: ["NumPy", "Python", "Data Science", "Data Analysis"]
  },
  {
    id: "numpy-edx",
    title: "Introduction to NumPy",
    platform: "EdX",
    url: "https://www.edx.org/learn/numpy",
    description: "Learn NumPy fundamentals for scientific computing and data analysis.",
    tags: ["NumPy", "Python", "Data Science"]
  },

  // Data Science - Data Visualization
  {
    id: "data-visualization-coursera",
    title: "Data Visualization Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/data-visualization",
    description: "Master data visualization techniques using Python, Matplotlib, and Seaborn.",
    tags: ["Data Visualization", "Python", "Pandas", "Matplotlib", "Data Science"]
  },
  {
    id: "data-visualization-edx",
    title: "Data Visualization with Python",
    platform: "EdX",
    url: "https://www.edx.org/learn/data-visualization",
    description: "Learn to create compelling data visualizations using Python libraries.",
    tags: ["Data Visualization", "Python", "Pandas", "Data Science"]
  },

  // TypeScript
  {
    id: "typescript-coursera",
    title: "TypeScript for JavaScript Developers",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/typescript",
    description: "Learn TypeScript to build type-safe JavaScript applications. Master advanced TypeScript features.",
    tags: ["TypeScript", "JavaScript", "Programming", "Web Development", "Frontend"]
  },

  // Java
  {
    id: "java-coursera",
    title: "Java Programming Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/java-programming",
    description: "Master Java programming, object-oriented design, and data structures. Build enterprise applications.",
    tags: ["Java", "Programming", "Object-Oriented Programming", "Spring Boot", "Backend"]
  },
  {
    id: "java-edx",
    title: "Introduction to Java Programming",
    platform: "EdX",
    url: "https://www.edx.org/learn/java",
    description: "Learn Java fundamentals, including classes, objects, inheritance, and exception handling.",
    tags: ["Java", "Programming", "Object-Oriented Programming"]
  },

  // Git & Version Control
  {
    id: "git-coursera",
    title: "Version Control with Git",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/version-control-with-git",
    description: "Master Git version control. Learn branching, merging, and collaboration workflows with GitHub.",
    tags: ["Git", "Version Control", "GitHub", "CI/CD", "Software Engineering"]
  },

  // Soft Skills - Leadership
  {
    id: "leadership-coursera",
    title: "Leading People and Teams Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/leading-teams",
    description: "Develop leadership skills, including team management, communication, and strategic thinking.",
    tags: ["Leadership", "Communication", "Teamwork", "Management", "Soft Skills"]
  },
  {
    id: "leadership-edx",
    title: "Leadership and Team Management",
    platform: "EdX",
    url: "https://www.edx.org/learn/leadership",
    description: "Learn effective leadership strategies, team building, and organizational management principles.",
    tags: ["Leadership", "Teamwork", "Management", "Communication", "Soft Skills"]
  },

  // Soft Skills - Project Management
  {
    id: "pm-coursera",
    title: "Google Project Management Certificate",
    platform: "Coursera",
    url: "https://www.coursera.org/professional-certificates/google-project-management",
    description: "Master project management fundamentals, including Agile, Scrum, and project planning methodologies.",
    tags: ["Project Management", "Agile", "Scrum", "Kanban", "Communication", "Leadership"]
  },
  {
    id: "pm-edx",
    title: "Project Management Fundamentals",
    platform: "EdX",
    url: "https://www.edx.org/learn/project-management",
    description: "Learn project management principles, including planning, execution, and risk management.",
    tags: ["Project Management", "Agile", "Scrum", "Communication"]
  },

  // Cybersecurity
  {
    id: "cybersecurity-coursera",
    title: "Cybersecurity Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/cybersecurity",
    description: "Learn cybersecurity fundamentals, including network security, cryptography, and ethical hacking.",
    tags: ["Cybersecurity", "Network Security", "Cryptography", "Ethical Hacking", "Security"]
  },

  // UI/UX Design
  {
    id: "ux-coursera",
    title: "Google UX Design Certificate",
    platform: "Coursera",
    url: "https://www.coursera.org/professional-certificates/google-ux-design",
    description: "Master UX design principles, user research, wireframing, and prototyping. Build a professional portfolio.",
    tags: ["UX Design", "UI Design", "User Research", "Wireframing", "Prototyping", "Figma", "Design"]
  },

  // REST APIs
  {
    id: "api-coursera",
    title: "APIs for Beginners",
    platform: "Coursera",
    url: "https://www.coursera.org/learn/apis",
    description: "Learn REST API design and development. Build and consume RESTful APIs with best practices.",
    tags: ["REST APIs", "API Design", "Backend", "Node.js", "Python", "Express"]
  },

  // Data Structures & Algorithms
  {
    id: "dsa-coursera",
    title: "Data Structures and Algorithms Specialization",
    platform: "Coursera",
    url: "https://www.coursera.org/specializations/data-structures-algorithms",
    description: "Master data structures and algorithms. Learn to solve complex programming problems efficiently.",
    tags: ["Data Structures", "Algorithms", "Programming", "Problem Solving", "Computer Science"]
  },
  {
    id: "dsa-edx",
    title: "Introduction to Algorithms",
    platform: "EdX",
    url: "https://www.edx.org/learn/algorithms",
    description: "Learn fundamental algorithms and data structures. Analyze algorithm complexity and efficiency.",
    tags: ["Algorithms", "Data Structures", "Programming", "Computer Science"]
  }
];

/**
 * Get learning resources that match the provided skills
 * @param skills Array of skill names to match against
 * @returns Array of matching learning resources (max 9, prioritized by best matches)
 */
export function getResourcesForSkills(skills: string[]): LearningResource[] {
  if (!skills || skills.length === 0) {
    return [];
  }

  // Normalize skills to lowercase for matching
  const normalizedSkills = skills.map(skill => skill.toLowerCase().trim());
  
  // Score each resource based on how many skills match
  const scoredResources = LEARNING_RESOURCES.map(resource => {
    let matchCount = 0;
    const matchedSkills: string[] = [];
    
    // Check each skill against resource tags
    normalizedSkills.forEach(skill => {
      const skillWords = skill.split(/\s+/);
      
      resource.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        
        // Check if skill matches tag (exact match or contains skill words)
        const exactMatch = tagLower === skill;
        const containsSkill = skillWords.some(word => 
          word.length > 2 && tagLower.includes(word)
        ) || tagLower.includes(skill);
        
        if (exactMatch || containsSkill) {
          if (!matchedSkills.includes(tag)) {
            matchedSkills.push(tag);
            matchCount++;
          }
        }
      });
    });
    
    return {
      resource,
      score: matchCount,
      matchedSkills
    };
  })
  .filter(item => item.score > 0) // Only include resources with at least one match
  .sort((a, b) => {
    // Sort by score (descending), then by platform (EdX first for variety)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.resource.platform !== b.resource.platform) {
      return a.resource.platform === "EdX" ? -1 : 1;
    }
    return 0;
  });

  // Remove duplicates and limit to 9 results
  const seen = new Set<string>();
  const results: LearningResource[] = [];
  
  for (const item of scoredResources) {
    if (results.length >= 9) break;
    
    // Check for duplicates by title (case-insensitive)
    const titleLower = item.resource.title.toLowerCase();
    if (!seen.has(titleLower)) {
      seen.add(titleLower);
      results.push(item.resource);
    }
  }

  // If we have fewer than 3 results, add some general courses
  if (results.length < 3) {
    const generalCourses = LEARNING_RESOURCES.filter(
      resource => !results.some(r => r.id === resource.id)
    ).slice(0, 3 - results.length);
    
    results.push(...generalCourses);
  }

  return results;
}


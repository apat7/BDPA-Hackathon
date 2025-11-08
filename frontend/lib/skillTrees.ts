// Hard-coded skill trees for specific positions
// Each tree shows skill progression with prerequisites and branching paths

export interface SkillTreeNode {
  id: string;
  skill: string;
  children?: SkillTreeNode[];
  level: number; // Depth in tree (0 = root)
  prerequisites?: string[]; // Skill IDs that must be learned first
  isLearned?: boolean; // Will be set based on user skills
}

export interface SkillTree {
  positionTitle: string;
  root: SkillTreeNode;
}

// React Developer Skill Tree
// Required skills: React, JavaScript, TypeScript, Redux, Git, Webpack
// Each skill appears only once
const reactDeveloperTree: SkillTree = {
  positionTitle: "React Developer",
  root: {
    id: "html",
    skill: "HTML",
    level: 0,
    children: [
      {
        id: "css",
        skill: "CSS",
        level: 1,
        prerequisites: ["html"],
        children: [
          {
            id: "javascript",
            skill: "JavaScript",
            level: 2,
            prerequisites: ["html", "css"],
            children: [
              {
                id: "react",
                skill: "React",
                level: 3,
                prerequisites: ["javascript"],
                children: [
                  {
                    id: "redux",
                    skill: "Redux",
                    level: 4,
                    prerequisites: ["react"],
                  },
                  {
                    id: "webpack",
                    skill: "Webpack",
                    level: 4,
                    prerequisites: ["react"],
                  },
                ],
              },
              {
                id: "typescript",
                skill: "TypeScript",
                level: 3,
                prerequisites: ["javascript"],
              },
            ],
          },
        ],
      },
      {
        id: "git",
        skill: "Git",
        level: 1,
        prerequisites: [], // Can be learned anytime
      },
    ],
  },
};

// QA Engineer Skill Tree
// Required skills: Testing, Automation, Selenium, Python, Git, Bug Tracking, Test Planning
// Each skill appears only once
const qaEngineerTree: SkillTree = {
  positionTitle: "QA Engineer",
  root: {
    id: "testing",
    skill: "Testing",
    level: 0,
    children: [
      {
        id: "test-planning",
        skill: "Test Planning",
        level: 1,
        prerequisites: ["testing"],
        children: [
          {
            id: "bug-tracking",
            skill: "Bug Tracking",
            level: 2,
            prerequisites: ["test-planning"],
          },
        ],
      },
      {
        id: "automation",
        skill: "Automation",
        level: 1,
        prerequisites: ["testing"],
        children: [
          {
            id: "selenium",
            skill: "Selenium",
            level: 2,
            prerequisites: ["automation", "python"],
          },
        ],
      },
      {
        id: "python",
        skill: "Python",
        level: 1,
        prerequisites: [], // Programming foundation, can learn in parallel
      },
      {
        id: "git",
        skill: "Git",
        level: 1,
        prerequisites: [], // Version control, can learn anytime
      },
    ],
  },
};

// Data Scientist Skill Tree
// Required skills: Python, Machine Learning, SQL, Statistics, Data Visualization, Pandas, NumPy
// Each skill appears only once
const dataScientistTree: SkillTree = {
  positionTitle: "Data Scientist",
  root: {
    id: "python-basics",
    skill: "Python",
    level: 0,
    children: [
      {
        id: "numpy",
        skill: "NumPy",
        level: 1,
        prerequisites: ["python-basics"],
        children: [
          {
            id: "pandas",
            skill: "Pandas",
            level: 2,
            prerequisites: ["numpy"],
            children: [
              {
                id: "data-visualization",
                skill: "Data Visualization",
                level: 3,
                prerequisites: ["pandas"],
              },
            ],
          },
        ],
      },
      {
        id: "statistics",
        skill: "Statistics",
        level: 1,
        prerequisites: ["python-basics"],
        children: [
          {
            id: "machine-learning",
            skill: "Machine Learning",
            level: 2,
            prerequisites: ["statistics", "pandas"],
          },
        ],
      },
      {
        id: "sql",
        skill: "SQL",
        level: 1,
        prerequisites: [], // Database skills, can learn in parallel
      },
    ],
  },
};

// Map position titles to their skill trees
const skillTreeMap: Record<string, SkillTree> = {
  "React Developer": reactDeveloperTree,
  "QA Engineer": qaEngineerTree,
  "Data Scientist": dataScientistTree,
};

/**
 * Get skill tree for a specific position
 * @param positionTitle Title of the position
 * @param userSkills Array of skills the user has learned
 * @returns SkillTree with learned status marked on nodes, or null if no tree exists
 */
export function getSkillTreeForPosition(
  positionTitle: string,
  userSkills: string[]
): SkillTree | null {
  const tree = skillTreeMap[positionTitle];
  if (!tree) {
    return null;
  }

  // Normalize user skills to lowercase for comparison
  const normalizedUserSkills = userSkills.map((skill) => skill.toLowerCase().trim());

  // Track seen skills to ensure no duplicates
  const seenSkills = new Set<string>();

  // Recursively mark nodes as learned and check for duplicates
  function markLearnedStatus(node: SkillTreeNode): SkillTreeNode {
    const nodeSkillLower = node.skill.toLowerCase().trim();
    
    // Check for duplicates
    if (seenSkills.has(nodeSkillLower)) {
      console.warn(`Duplicate skill detected: ${node.skill}. This should not happen.`);
    }
    seenSkills.add(nodeSkillLower);
    
    const isLearned = normalizedUserSkills.some(
      (userSkill) => userSkill === nodeSkillLower || nodeSkillLower.includes(userSkill)
    );

    return {
      ...node,
      isLearned,
      children: node.children?.map((child) => markLearnedStatus(child)),
    };
  }

  return {
    ...tree,
    root: markLearnedStatus(tree.root),
  };
}

/**
 * Check if a position has a skill tree defined
 */
export function hasSkillTree(positionTitle: string): boolean {
  return positionTitle in skillTreeMap;
}

/**
 * Get all skills from a tree (flattened)
 */
export function getAllSkillsFromTree(tree: SkillTree): string[] {
  const skills: string[] = [];

  function traverse(node: SkillTreeNode) {
    skills.push(node.skill);
    node.children?.forEach((child) => traverse(child));
  }

  traverse(tree.root);
  return skills;
}


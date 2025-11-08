// Comprehensive predefined list of skills for autocomplete
export const SKILLS_LIST = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "Perl", "Scala", "R", "Objective-C", "Dart", "Lua", "Haskell", "Elixir", "Clojure", "MATLAB", "Shell", "Bash", "PowerShell",

  // Web Frameworks & Libraries
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "Ember.js", "jQuery", "Backbone.js", "Alpine.js",
  "Node.js", "Express", "NestJS", "Fastify", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core", "Laravel", "Ruby on Rails", "Phoenix", "Meteor", "Gatsby", "Remix","HTML", "CSS", "Selenium", "SQLite",

  // Mobile Development
  "React Native", "Flutter", "Ionic", "SwiftUI", "Kotlin Multiplatform", "Xamarin", "Android SDK", "iOS SDK",

  // Databases
  "MySQL", "PostgreSQL", "SQLite", "MariaDB", "Oracle Database", "Microsoft SQL Server", "MongoDB", "Cassandra", "DynamoDB", "Redis", "Firebase Realtime Database", "Firestore", "Neo4j", "CouchDB", "Supabase", "PlanetScale",

  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud Platform", "DigitalOcean", "Vercel", "Netlify", "Heroku", "Cloudflare",
  "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitLab CI/CD", "GitHub Actions", "CircleCI", "Bamboo", "Helm", "OpenShift", "Prometheus", "Grafana", "NGINX",

  // Data Science & Machine Learning
  "NumPy", "Pandas", "Matplotlib", "Seaborn", "SciPy", "Scikit-learn", "TensorFlow", "Keras", "PyTorch", "XGBoost", "LightGBM", "Hugging Face Transformers", "OpenCV", "spaCy", "NLTK", "Data Visualization", "Data Cleaning", "Model Deployment", "Feature Engineering", "Deep Learning", "Computer Vision", "Natural Language Processing",

  // AI & Emerging Technologies
  "Generative AI", "Prompt Engineering", "LangChain", "OpenAI API", "Hugging Face", "Vector Databases", "Pinecone", "Weaviate", "FAISS", "RAG Systems", "Blockchain", "Smart Contracts", "Solidity", "Web3.js", "Ethereum", "IPFS", "DeFi", "AI Ethics", "Quantum Computing",

  // Cybersecurity
  "Penetration Testing", "Network Security", "Cloud Security", "Vulnerability Assessment", "Cryptography", "Ethical Hacking", "OWASP", "SIEM", "Firewalls", "Zero Trust", "Identity and Access Management", "Incident Response",

  // Software Engineering Concepts
  "Object-Oriented Programming", "Functional Programming", "REST APIs", "GraphQL", "gRPC", "Microservices", "Monorepos", "Clean Architecture", "Design Patterns", "Test-Driven Development", "Continuous Integration", "Continuous Deployment", "Version Control", "Agile", "Scrum", "Kanban", "Testing",

  // Tools & Technologies
  "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Insomnia", "Visual Studio Code", "IntelliJ IDEA", "PyCharm", "JIRA", "Confluence", "Slack", "Miro", "Notion",

  // UI/UX & Design
  "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "Canva", "User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility", "Responsive Design",

  // Soft Skills
  "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Time Management", "Creativity", "Adaptability", "Collaboration", "Empathy", "Conflict Resolution", "Decision Making", "Mentorship", "Project Management",

  // Other Skills
  "APIs", "Data Structures", "Algorithms", "Cloud Architecture", "Data Engineering", "ETL Pipelines", "DevSecOps", "Performance Optimization", "Software Testing", "Unit Testing", "Integration Testing", "End-to-End Testing", "Monitoring", "Debugging", "Documentation"
].filter((skill, index, self) => self.indexOf(skill) === index);

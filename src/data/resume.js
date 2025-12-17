// Source of truth for the portfolio site
export const resumeData = {
  basics: {
    name: "Rishabh Agrawal",
    title: "Data Storyteller & Analytics Strategist",
    email: "rishabh.agrawal25b@gim.ac.in",
    phone: "+91-9137095017",
    website: "https://saint2706.github.io",
    summary: "Big Data Analytics postgraduate at Goa Institute of Management with a Computer Science background. I thrive at the intersection of data, technology, and creativity—using analytics, AI, and software development to turn complex challenges into actionable insights. Skilled in Python, SQL, R, AWS, Tableau, Power BI, TensorFlow, and PyTorch. I'm passionate about using data and AI not just to solve problems, but to tell stories, create value, and enable smarter decisions.",
    location: {
      city: "Goa",
      country: "India",
    },
    socials: [
      {
        network: "LinkedIn",
        url: "https://www.linkedin.com/in/rishabh-agrawal-1807321b9",
        icon: "Linkedin"
      },
      {
        network: "GitHub",
        url: "https://github.com/saint2706",
        icon: "Github"
      }
    ],
    languages: [
      { name: "English", proficiency: "Native/Bilingual" },
      { name: "Hindi", proficiency: "Native/Bilingual" },
      { name: "Marathi", proficiency: "Native/Bilingual" },
      { name: "Marwari", proficiency: "Native/Bilingual" },
      { name: "French", proficiency: "Professional Working" },
      { name: "South American Indian", proficiency: "Limited Working" }
    ]
  },
  education: [
    {
      institution: "Goa Institute of Management (GIM)",
      area: "PGDM - Big Data Analytics",
      startDate: "Jun 2025",
      endDate: "Jul 2027",
      description: "Focusing on data-driven decision making and advanced analytics.",
    },
    {
      institution: "Vellore Institute of Technology",
      area: "Bachelor of Technology (B.Tech) - Computer Science",
      startDate: "2020",
      endDate: "2024",
      description: "Core foundation in algorithms, software development, and data science.",
    },
    {
      institution: "Delhi Public School - India",
      area: "12th, Schooling",
      startDate: "2018",
      endDate: "2020",
    },
    {
      institution: "Ryan International School",
      area: "Schooling",
      startDate: "2004",
      endDate: "2018",
    },
  ],
  experience: [
    {
      company: "TheSmartBridge",
      position: "Data Intern",
      startDate: "May 2023",
      endDate: "July 2023",
      summary: "Evaluated SaaS market opportunities and aligned stakeholders on a roadmap for a new analytics product.",
      highlights: [
        "Researched product gaps and competitive benchmarks to shape the go-to-market plan.",
        "Developed personas, positioning, and phased delivery milestones with a five-member intern cohort.",
        "Presented recommendations to senior management."
      ]
    },
    {
      company: "Mood Indigo, IIT Bombay",
      position: "Indigo Squad Member",
      startDate: "July 2022",
      endDate: "Dec 2022",
      summary: "Drove experiential marketing, partnerships, and community engagement for Asia's largest college cultural festival.",
      highlights: [
        "Amplified outreach to 1,700+ colleges through storytelling-led campaigns.",
        "Boosted social engagement by 25% via multi-platform content strategies.",
        "Secured three new sponsorships."
      ]
    }
  ],
  skills: [
    {
      category: "Programming",
      items: [
        { name: "Python", proficiency: 95, verified: true },
        { name: "Java", proficiency: 85, verified: true },
        { name: "C++", proficiency: 80, verified: true },
        { name: "JavaScript", proficiency: 85, verified: true },
        { name: "SQL", proficiency: 90 },
        { name: "HTML/CSS", proficiency: 85, verified: true },
        { name: "R", proficiency: 80 }
      ]
    },
    {
      category: "Data Science & AI",
      items: [
        { name: "Data Analytics", proficiency: 95 },
        { name: "Machine Learning", proficiency: 85 },
        { name: "Pandas", proficiency: 90 },
        { name: "NumPy", proficiency: 90 },
        { name: "Scikit-learn", proficiency: 85 },
        { name: "Matplotlib/Seaborn", proficiency: 85 },
        { name: "Tableau", proficiency: 90 },
        { name: "Power BI", proficiency: 80 }
      ]
    },
    {
      category: "Frameworks & Cloud",
      items: [
        { name: "AWS", proficiency: 85 },
        { name: "Azure", proficiency: 70 },
        { name: "Google Cloud", proficiency: 70 },
        { name: "TensorFlow", proficiency: 75 },
        { name: "PyTorch", proficiency: 85 },
        { name: "React", proficiency: 75 },
        { name: "Node.js", proficiency: 70 },
        { name: "Hugging Face", proficiency: 70 }
      ]
    },
    {
      category: "Soft Skills",
      items: [
        { name: "Business Strategy", proficiency: 85 },
        { name: "Leadership", proficiency: 85 },
        { name: "Project Management", proficiency: 80 },
        { name: "Communication", proficiency: 90 },
        { name: "Problem Solving", proficiency: 90 }
      ]
    }
  ],
  projects: [
    {
      title: "Coding-For-MBA",
      description: "A comprehensive coding curriculum designed specifically for MBA students to bridge the gap between business strategy and technical implementation.",
      tags: ["Education", "Curriculum", "GitHub Pages"],
      link: "https://saint2706.github.io/Coding-For-MBA/",
      github: "https://github.com/saint2706/Coding-For-MBA",
      image: "/images/projects/coding-for-mba.png",
      featured: true
    },
    {
      title: "AI-Based Attendance Management",
      description: "Facial-recognition attendance platform automating check-ins using human activity detection.",
      tags: ["Computer Vision", "Facial Recognition", "Automation"],
      github: "https://github.com/saint2706/Attendance-Management-System-Using-Face-Recognition",
      image: "/images/projects/attendance-ai.png",
      featured: true
    },
    {
      title: "Football Score Prediction",
      description: "Modeled historical match data to forecast outcomes and built dashboards for team insights.",
      tags: ["Predictive Analytics", "Data Viz", "Sports"],
      image: "/images/projects/football-prediction.png",
      featured: false
    },
    {
      title: "TV Script Generation AI",
      description: "Trained a recurrent neural network to author episode scripts, demonstrating creative AI potential.",
      tags: ["RNN", "NLP", "Creative AI"],
      image: "/images/projects/tv-script-ai.png",
      featured: true
    },
    {
      title: "The Simpsons Data Analytics",
      description: "Mined long-running sitcom data to highlight trends in storytelling, ratings, and retention.",
      tags: ["Business Intelligence", "Storytelling", "Media"],
      image: "/images/projects/simpsons-analytics.png",
      featured: false
    }
  ],
  certifications: [
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services (AWS)", date: "Jul 2023", expires: "Jul 2026" },
    { name: "Data Analytics powered by IBM", issuer: "SmartInternz", date: "Jul 2023" },
    { name: "AWS Academy Graduate - Cloud Foundations", issuer: "Amazon Web Services (AWS)", date: "Jun 2023" },
    { name: "JavaScript Algorithms and Data Structures", issuer: "freeCodeCamp", date: "Jan 2023" },
    { name: "Java Programming: Solving Problems with Software (with Honors)", issuer: "Coursera", date: "Nov 2021" },
    { name: "Programming Foundations with JavaScript, HTML and CSS", issuer: "Coursera", date: "Nov 2020" },
    { name: "Programming for Everybody (Getting Started with Python)", issuer: "Coursera", date: "Sep 2020" },
    { name: "Beginner's Guide to Cyber Security", issuer: "Udemy", date: "2022" },
    { name: "Blockchain Mastery 2022", issuer: "Udemy", date: "2022" },
    { name: "Data Analytics, Storage, Mining & Visual Big Data Technologies", issuer: "Udemy" },
    { name: "Learn Big Data Basics", issuer: "Udemy" }
  ]
};

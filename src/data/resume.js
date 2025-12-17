// Source of truth for the portfolio site
export const resumeData = {
  basics: {
    name: "Rishabh Agrawal",
    title: "Data Storyteller & Analytics Strategist",
    email: "rishabh.agrawal25b@gim.ac.in",
    phone: "+91-9137095017",
    website: "https://saint2706.github.io",
    summary: "PGDM Big Data Analytics candidate pairing a VIT computer science foundation with hands-on SaaS research and large-scale campaign experience. I translate data storytelling into measurable marketing and product impact.",
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
      },
      {
        network: "Dev.to",
        url: "https://dev.to/saint2706",
        icon: "Code2"
      },
      {
        network: "Medium",
        url: "https://medium.com/@saint2706",
        icon: "BookOpen"
      },
      {
        network: "Twitter",
        url: "https://twitter.com/saint2706",
        icon: "Twitter"
      }
    ]
  },
  education: [
    {
      institution: "Goa Institute of Management",
      area: "Big Data Analytics (PGDM)",
      startDate: "2025",
      endDate: "2027",
      description: "Focusing on data-driven decision making and advanced analytics.",
    },
    {
      institution: "Vellore Institute of Technology",
      area: "Computer Science and Engineering (B.Tech)",
      startDate: "2020",
      endDate: "2024",
      score: "8.2/10",
      description: "Core foundation in algorithms, software development, and data science.",
    },
    {
      institution: "Delhi Public School",
      area: "Science",
      startDate: "2018",
      endDate: "2020",
      score: "90%",
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
        { name: "Python", proficiency: 95 },
        { name: "R", proficiency: 85 },
        { name: "SQL", proficiency: 85 },
        { name: "Java", proficiency: 80 },
        { name: "C++", proficiency: 80 },
        { name: "JavaScript", proficiency: 80 },
        { name: "HTML/CSS", proficiency: 85 }
      ]
    },
    {
      category: "Analytics & AI",
      items: [
        { name: "Tableau", proficiency: 90 },
        { name: "Power BI", proficiency: 80 },
        { name: "TensorFlow", proficiency: 70 },
        { name: "PyTorch", proficiency: 90 },
        { name: "Hugging Face", proficiency: 70 },
        { name: "IBM Watson", proficiency: 55 }
      ]
    },
    {
      category: "Data Engineering",
      items: [
        { name: "AWS", proficiency: 80 },
        { name: "Oracle Cloud", proficiency: 80 },
        { name: "MongoDB", proficiency: 70 },
        { name: "PostgreSQL", proficiency: 80 },
        { name: "NoSQL", proficiency: 85 }
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
    "AWS Certified Cloud Practitioner",
    "Data Analytics (IBM Skills Network)",
    "Visual Big Data Technologies (Udemy)",
  ]
};

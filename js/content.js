/* =====================================================================
   EVERYTHING ABOUT KANWAR LIVES HERE.
   Edit this file to update the site — no other file needs to change.
   ===================================================================== */
window.KANWAR = {
  name: "Kanwar Lubana",
  fullName: "Kanwar N.S. Lubana",
  tagline: "Computer Engineering · University of Manitoba",
  status: "Open to co-op & research roles",
  location: "Winnipeg, MB",
  gradDate: "May 2028",
  gpa: "3.57 / 4.5",

  links: {
    email: "lubanak@myumanitoba.ca",
    linkedin: "https://www.linkedin.com/in/kanwar-n-s-lubana-024815247",
    github: "https://github.com/Lubanak",
    // Put a resume PDF in the site folder and set this to "resume.pdf" to show Resume buttons everywhere.
    resume: "",
  },

  summary:
    "Computer Engineering student working where AI meets hardware: computer vision, machine learning, embedded systems, and parallel computing.",

  stats: [
    { big: "1,000+", small: "images captured & labelled for AgBot's vision model" },
    { big: "45→10", small: "minutes — SQL job he sped up at Manitoba Hydro" },
    { big: "~30", small: "people using the scripts he automated" },
  ],

  skills: {
    "Programming": ["Python", "C / C++", "Java", "MATLAB", "Verilog", "SQL"],
    "AI & Vision": ["OpenCV", "Object detection", "Image annotation", "Model training"],
    "Embedded": ["STM32", "FreeRTOS", "NVIDIA Jetson", "FPGA", "CAN bus", "PCB assembly"],
    "Parallel & Tools": ["MPI", "OpenMP", "Git", "Azure DevOps", "SQL Server", "FME", "Esri"],
  },

  experience: [
    {
      id: "hydro",
      org: "Manitoba Hydro",
      role: "Engineering Intern — Application Solutions Design",
      when: "May 2025 – Apr 2026",
      points: [
        "Built a geospatial data-capture app for streetlight inspections (Esri Field Maps, FME, SQL Server, EGIS) — took it to MVP and presented it to engineering stakeholders.",
        "Automated data processing with SQL scripts used by ~30 people, cutting runtime from 45 to 10 minutes.",
        "Investigated modernization of the end-of-life FieldSmart app; supported legacy Java/JSP, REST and SQL work in Azure DevOps.",
      ],
    },
    {
      id: "tutor",
      org: "Academic Learning Centre, U of Manitoba",
      role: "Supplemental Instruction Leader / Tutor",
      when: "Sep 2024 – Aug 2025",
      points: ["Led collaborative study sessions and technical tutoring with practice problems."],
    },
  ],

  projects: [
    {
      id: "agbot",
      title: "AgBot — egg detection",
      org: "UM AgBot Team · Software",
      when: "Jan 2025 – present",
      tags: ["Object detection", "Basler camera", "NVIDIA Jetson", "Python"],
      blurb:
        "Collected 1,000+ egg images, annotated every one with bounding boxes, and trained a two-class detector (white vs black eggs). Helped integrate it with the team's Jetson-based sorting robot.",
      photos: ["img/agbot.jpg", "img/breadboard.jpg"],
      tracks: ["ml", "embedded"],
    },
    {
      id: "hydro",
      title: "Streetlight inspection app",
      org: "Manitoba Hydro · Intern",
      when: "2025 – 2026",
      tags: ["Esri Field Maps", "FME", "SQL Server", "EGIS"],
      blurb:
        "A field app crews use to log streetlight salvages. It won't let you submit until GPS is within 10 m, and scans barcodes instead of making you type them.",
      photos: [], // add "img/hydro-app.jpg" here once Hydro OKs sharing the screenshot
      tracks: ["software"],
    },
    {
      id: "counter",
      title: "IR object counter on an FPGA",
      org: "Team project · DE10-Standard",
      when: "",
      tags: ["FPGA", "IR sensors", "Seven-segment"],
      blurb:
        "Two IR sensors on cardboard posts form a gate. Break the beam and the FPGA counts it on the seven-segment display.",
      photos: ["img/ir-gate.webp", "img/fpga-closeup.webp"],
      tracks: ["embedded"],
    },
    {
      id: "fe",
      title: "Formula Electric — CAN bus",
      org: "UMSAE Formula Electric · Embedded",
      when: "Sep 2024 – present",
      tags: ["CAN bus", "PCB assembly", "Soldering"],
      blurb:
        "Defined CAN message structures for data exchange between the car's subsystems, and assembled and soldered custom PCBs for integration testing.",
      photos: [],
      tracks: ["embedded"],
    },
    {
      id: "mpi",
      title: "Parallel image processing",
      org: "ECE 4530 · U of Manitoba",
      when: "Fall 2026",
      tags: ["C++", "MPI", "OpenCV"],
      blurb:
        "Split images across processes with pixel- and row-based partitioning, using halo regions and MPI Scatterv/Gatherv to handle the boundaries.",
      photos: [],
      tracks: ["parallel"],
    },
    {
      id: "stm32",
      title: "STM32 Ethernet client–server",
      org: "ECE 3740 · U of Manitoba",
      when: "Fall 2026",
      tags: ["C", "Java", "FreeRTOS", "Ethernet"],
      blurb:
        "An Ethernet server on an STM32 in C talking to a multithreaded Java client — two-way data exchange and command handling with FreeRTOS tasks.",
      photos: [],
      tracks: ["embedded"],
    },
  ],

  education: {
    school: "University of Manitoba",
    degree: "B.Sc. Computer Engineering (Co-op/IIP)",
    when: "2022 – May 2028",
    coursework: ["Data Structures & Algorithms", "Parallel Processing", "Embedded Systems", "Signal Processing", "Digital Logic Design", "Microprocessors"],
  },

  leadership: [
    "UMES Price Faculty Student Ambassador",
    "Student Advocate Team Executive",
    "Junior Outreach STEM Executive",
    "Corporate Relations Executive",
  ],
  awards: ["Community Engagement Scholarship", "Early Bird Excellence Award — International College of Manitoba"],

  // Add real quotes here later: { text: "...", by: "Name", role: "Title, Company" }
  // While this list is empty, quote sections are hidden everywhere.
  quotes: [],

  // Drawings for the friend path: add image paths like "img/drawing-1.jpg"
  drawings: [],
};

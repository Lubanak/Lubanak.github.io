/* =====================================================================
   PIP'S BRAIN — the distilled dataset.

   A large "teacher" model wrote many different ways a visitor might ask
   each question (examples) plus Pip-voice answers (say). The small
   "student" (a 23 MB sentence-embedding model running in the browser)
   matches any new question to the closest examples.

   - Facts are NOT baked in here: answers read them from KANWAR (content.js)
     so updating your resume never requires retraining.
   - `action` runs an existing chat scene (demo, project card, links…).
   - After editing examples, rebuild the index: see brain/README.md.
   ===================================================================== */
window.PIP_DATA = {
  version: 1,
  intents: [
    /* ------------------------- who / what ------------------------- */
    {
      id: "about",
      examples: [
        "who is kanwar", "tell me about him", "who is this guy", "what's his story", "give me a quick intro",
        "summarize kanwar", "who am I looking at", "what does he do", "describe him in a sentence", "tldr on this person",
        "introduce him", "what should I know about him", "who's the person behind this site", "what is kanwar like",
      ],
      say: [
        (K) => `${K.name} is a Computer Engineering student at the ${K.education.school}, graduating ${K.gradDate}. He works where AI meets hardware: computer vision, machine learning, embedded systems, and parallel computing. Also, he built me. 🤖`,
        (K) => `Short version: CompE student in ${K.location}, builds vision models for robots, wires up race cars, and makes slow code fast. Graduating ${K.gradDate}. Open to co-op. Great taste in robots.`,
      ],
    },
    {
      id: "studies",
      examples: [
        "what does he study", "what's his major", "what degree is he doing", "which university", "where does he go to school",
        "is he a student", "what program is he in", "is he computer engineering", "what year is he in", "is he an undergrad",
        "what school", "university of manitoba?", "is he doing co-op", "what is he studying at university",
      ],
      say: [(K) => `${K.education.degree} at the ${K.education.school} (${K.education.when}). He's in the co-op stream, so internships are part of the plan. 🎓`],
    },
    {
      id: "courses",
      examples: [
        "what courses has he taken", "relevant coursework", "what classes did he take", "did he take data structures",
        "has he studied signal processing", "what did he learn in school", "which subjects", "did he take an operating systems course",
        "has he done digital logic", "microprocessors course",
      ],
      say: [(K) => `Relevant coursework: ${K.education.coursework.join(", ")}. If a course isn't on that list, he hasn't told me about it. 📚`],
    },
    {
      id: "gpa",
      examples: [
        "what's his gpa", "grades", "is he a good student", "what are his marks", "academic performance", "gpa?",
        "how are his grades", "does he get good marks", "what's his average", "academic record",
      ],
      say: [(K) => `${K.gpa}. That's on a 4.5 scale, before you panic. 📈`],
    },
    {
      id: "graduation",
      examples: [
        "when does he graduate", "graduation date", "when will he finish school", "when is he done", "class of",
        "expected graduation", "how long until he graduates", "is he graduating soon", "what year does he finish",
      ],
      say: [(K) => `He graduates in ${K.gradDate}. Until then: co-op and research roles. 🎓`],
    },
    {
      id: "location",
      examples: [
        "where is he based", "where does he live", "what city", "is he in canada", "where is he located", "is he in winnipeg",
        "what's the weather there", "is it cold where he is", "which country", "can he relocate", "is he remote",
        "how cold is winnipeg",
      ],
      action: "weather",
    },

    /* ------------------------- skills ------------------------- */
    {
      id: "languages",
      examples: [
        "what programming languages does he know", "does he know python", "can he code in c++", "does he use java",
        "what languages does he code in", "does he know verilog", "is he good at python", "does he write matlab",
        "does he know sql", "what's his main language", "can he program", "favourite programming language", "does he know c",
      ],
      say: [(K) => `He writes ${K.skills.Programming.join(", ")}. Python and C/C++ are the daily drivers. Verilog when the hardware needs it. 🧑‍💻`],
    },
    {
      id: "skills",
      examples: [
        "what are his skills", "what is he good at", "tech stack", "what tools does he use", "what can he do",
        "technical skills", "what technologies does he know", "list his skills", "what's in his toolbox", "is he technical",
        "what frameworks does he know", "strengths technically",
      ],
      action: "skills",
    },
    {
      id: "ml",
      examples: [
        "does he know machine learning", "ai experience", "has he trained models", "is he into ai", "deep learning experience",
        "has he done ml projects", "does he know neural networks", "what ml has he done", "artificial intelligence background",
        "can he train a model", "experience with pytorch or tensorflow", "has he worked with data",
      ],
      say: [
        "Yes! His main ML work is on the AgBot team: he built a dataset of 1,000+ egg images, labelled every one, and trained an object detector to tell white eggs from black ones, then helped get it onto an NVIDIA Jetson. 🥚",
        "Applied ML is his thing: collect data, label it, train a detector, deploy it on real hardware. The AgBot egg detector is the best example. Want to try a simulated version?",
      ],
      action: "agbotChip",
    },
    {
      id: "vision",
      examples: [
        "computer vision experience", "does he know opencv", "object detection", "image processing", "has he done cv",
        "does he work with cameras", "bounding boxes", "image annotation", "vision models", "can he do image recognition",
      ],
      action: "agbot",
    },
    {
      id: "embedded",
      examples: [
        "embedded systems experience", "does he do hardware", "microcontrollers", "firmware", "has he used stm32",
        "does he know rtos", "freertos", "can he solder", "pcb experience", "low level programming", "does he do electronics",
        "is he a hardware guy", "arduino", "can he work with sensors",
      ],
      say: [
        "Very much a hardware person too. 🔌 STM32 with FreeRTOS, an FPGA object counter, CAN bus messages for a race car, and soldering custom PCBs. Want to see one?",
      ],
      action: "embeddedChips",
    },
    {
      id: "parallel",
      examples: [
        "parallel computing", "has he used mpi", "openmp", "multithreading", "high performance computing", "distributed computing",
        "can he write parallel code", "halo regions", "scatter gather", "hpc experience", "concurrency",
        "can he use multiple cores", "speeding up code with more processors", "parallel programming skills",
      ],
      action: "mpi",
    },
    {
      id: "gpu",
      examples: [
        "does he know cuda", "gpu programming", "nvidia", "has he written cuda kernels", "does he do gpu stuff",
        "is he from nvidia", "would nvidia hire him", "graphics cards",
      ],
      say: [
        "He's done parallel computing with MPI and OpenMP, and deployed a vision model on an NVIDIA Jetson. CUDA kernels aren't on his resume yet, and I don't make things up. I have <i>standards</i>. 🕶️",
      ],
    },
    {
      id: "fpga",
      examples: [
        "fpga experience", "verilog projects", "digital design", "has he used an fpga", "de10", "hardware description language",
        "seven segment display", "ir sensor project", "object counter", "infrared",
      ],
      action: "counter",
    },
    {
      id: "gis",
      examples: [
        "gis experience", "esri", "arcgis", "fme", "field maps", "geospatial", "mapping software", "spatial data",
      ],
      action: "hydro",
    },
    {
      id: "devops",
      examples: [
        "does he know git", "azure devops", "version control", "ci cd", "does he use github", "devops experience",
        "agile", "software engineering practices",
      ],
      say: ["Git and Azure DevOps, mostly from his Manitoba Hydro internship, where he worked on real apps with a real team. 🛠️"],
    },
    {
      id: "databases",
      examples: [
        "database experience", "sql server", "can he write queries", "data processing", "automation scripts", "has he optimized queries",
        "etl", "data pipelines",
      ],
      action: "hydro",
    },
    {
      id: "webdev",
      examples: [
        "does he do web development", "frontend experience", "javascript", "can he build websites", "html css", "react",
        "full stack", "web apps",
      ],
      say: [
        "Web isn't his main focus (that's AI and hardware), but you're standing in a website with a robot living in it, so… draw your own conclusions. 😏 At Hydro he also worked with Java/JSP and REST APIs.",
      ],
    },

    /* ------------------------- projects ------------------------- */
    {
      id: "projects",
      examples: [
        "what projects has he done", "show me his projects", "portfolio", "what has he built", "list his work",
        "side projects", "what's he working on", "show me his work", "any cool projects", "examples of his work",
      ],
      action: "projectChips",
      say: ["Plenty! Pick one and I'll show you. Most of them have a demo you can play with. 👇"],
    },
    {
      id: "best",
      examples: [
        "what's his best project", "most impressive thing", "proudest work", "what should I look at first", "highlight",
        "best work", "most impressive project", "what stands out", "favourite project",
      ],
      action: "best",
    },
    { id: "agbot", examples: ["agbot", "egg sorting robot", "the egg project", "tell me about the robot", "agricultural robot", "egg detector", "eggs", "how did he detect eggs", "jetson project", "basler camera"], action: "agbot" },
    { id: "hydro", examples: ["manitoba hydro", "his internship", "streetlight app", "hydro project", "the field app", "what did he do at hydro", "45 to 10 minutes", "sql speedup", "where did he intern"], action: "hydro" },
    { id: "fe", examples: ["formula electric", "race car", "umsae", "can bus", "electric car team", "the car project", "formula sae", "vehicle subsystems"], action: "fe" },
    { id: "stm32", examples: ["stm32 project", "ethernet server", "client server on a microcontroller", "java client", "networking project", "ece 3740"], action: "stm32" },
    { id: "mpi", examples: ["parallel image processing", "mpi project", "ece 4530", "image split across processors", "scatterv gatherv"], action: "mpi" },

    /* ------------------------- experience & people ------------------------- */
    {
      id: "experience",
      examples: [
        "work experience", "has he had a job", "internships", "where has he worked", "professional experience",
        "employment history", "previous jobs", "has he worked in industry", "real world experience",
      ],
      say: [(K) => `Two big ones: ${K.experience.map((e) => `<b>${e.org}</b> (${e.role}, ${e.when})`).join(", and ")}. Plus engineering teams: AgBot and Formula Electric.`],
      action: "best",
    },
    {
      id: "teaching",
      examples: [
        "has he taught", "tutoring", "supplemental instruction", "can he explain things", "is he a good teacher",
        "mentoring", "does he help other students",
      ],
      say: ["He was a Supplemental Instruction leader and tutor at the U of M's Academic Learning Centre. He ran study sessions and helped people get unstuck. Explaining hard things simply is kind of his thing. 🧑‍🏫"],
    },
    {
      id: "leadership",
      examples: [
        "leadership experience", "clubs", "extracurriculars", "student groups", "is he involved on campus", "volunteering",
        "community involvement", "student ambassador", "outreach",
      ],
      say: [(K) => `Lots: ${K.leadership.join("; ")}. He likes being involved. 🙌`],
    },
    {
      id: "awards",
      examples: ["awards", "scholarships", "achievements", "has he won anything", "honours", "recognition"],
      say: [(K) => `${K.awards.join(" and ")}. 🏆`],
    },
    {
      id: "teamwork",
      examples: [
        "what is he like to work with", "is he a team player", "how does he work in a team", "personality", "soft skills",
        "is he nice", "what are people saying about him", "references", "is he easy to work with", "communication skills",
        "what kind of person is he",
      ],
      say: [
        "Honestly? Genuinely nice guy. 💙 And not just my opinion: he tutors other students, presented his Hydro app to engineers, and holds four student leadership roles. People keep putting him in charge of things.",
      ],
      action: "quotes",
    },
    {
      id: "strengths",
      examples: [
        "what are his strengths", "why is he good", "what makes him stand out", "what's he best at", "unique skills",
        "why him", "what does he bring",
      ],
      action: "whyHire",
    },
    {
      id: "weakness",
      examples: [
        "what are his weaknesses", "biggest weakness", "what is he bad at", "flaws", "areas to improve", "what can't he do",
      ],
      say: [
        "His biggest weakness? Building robots that talk too much. 🙃 For a real answer, ask him in the interview. I'm contractually obligated to be biased.",
      ],
    },
    {
      id: "goals",
      examples: [
        "what does he want to do", "career goals", "future plans", "what kind of job is he looking for", "dream job",
        "where does he see himself", "research interests", "what's next for him", "long term goals", "grad school",
        "plans after graduating", "what does he want to do after school", "what field does he want to work in", "what is he passionate about",
        "what kind of company does he want", "does he want to do research",
      ],
      say: [
        "He's interested in AI and intelligent systems, especially through applied research. Think vision, ML on real hardware, systems that actually do things. For anything beyond that, he hasn't told me his five-year plan. Ask him! 🚀",
      ],
    },
    {
      id: "hire",
      examples: [
        "is he available", "is he looking for a job", "can I hire him", "co-op availability", "is he open to internships",
        "when can he start", "does he want a job", "is he job hunting", "open to work", "summer internship", "full time",
        "would he join my company", "is he available for a summer co-op", "co-op term next year", "is he free for an internship in 2027",
        "can he do a 4 month work term", "looking for interns, is he interested", "is he open to an 8 month co-op",
      ],
      action: "hire",
    },
    {
      id: "whyHire",
      examples: [
        "why should I hire him", "convince me", "sell him to me", "why should we interview him", "give me reasons",
        "what's the pitch", "is he worth hiring",
      ],
      action: "whyHire",
    },

    /* ------------------------- contact / links ------------------------- */
    {
      id: "contact",
      examples: [
        "how can I contact him", "email", "how do I reach him", "get in touch", "send him a message", "contact info",
        "can I talk to him", "how do I message him", "his email address",
      ],
      action: "contact",
    },
    { id: "linkedin", examples: ["linkedin", "linkedin profile", "is he on linkedin", "connect with him"], action: "linkedin" },
    { id: "github", examples: ["github", "show me his code", "source code", "open source", "repos", "code samples"], action: "github" },
    { id: "resume", examples: ["resume", "cv", "can I see his resume", "download resume", "curriculum vitae", "one page summary"], action: "resume" },

    /* ------------------------- personal ------------------------- */
    {
      id: "hobbies",
      examples: [
        "what are his hobbies", "what does he do for fun", "does he draw", "art", "free time", "outside of school",
        "interests outside engineering", "is he creative", "drawings", "sketches",
      ],
      action: "draws",
    },
    {
      id: "unknownPersonal",
      examples: [
        "what's his favourite food", "favorite movie", "what music does he like", "does he play sports", "favourite colour",
        "does he have pets", "what games does he play", "where did he grow up", "what languages does he speak", "is he funny",
        "favourite book", "does he like coffee", "what's his zodiac sign", "tv shows", "does he travel",
      ],
      say: [
        "Ooh, good question. He hasn't told me that one yet. 🤐 I only say things I actually know. Ask him yourself, he'd probably love that.",
        "That's not in my memory banks yet! Kanwar has me on a strict facts-only diet. 🥗 You could just… ask him?",
      ],
    },
    {
      id: "private",
      examples: [
        "phone number", "home address", "how old is he", "salary expectations", "is he single", "girlfriend", "where exactly does he live",
        "date of birth", "is he married", "social security", "passport", "what does he look like",
        "how much does he weigh", "what's his height", "his birthday", "religion", "ethnicity", "how much does he want to be paid",
      ],
      say: [
        (K) => `That's classified. Even I don't have clearance for that. 🔒 Email's the way to reach him: <a href="mailto:${K.links.email}">${K.links.email}</a>`,
        "Nice try. 🕶️ I'm a professional.",
      ],
    },

    /* ------------------------- about Pip ------------------------- */
    {
      id: "pipAI",
      examples: [
        "are you an ai", "are you real", "are you a bot", "are you chatgpt", "how do you work", "what model are you",
        "are you sentient", "are you human", "how smart are you", "is this ai", "what are you running on", "are you an llm",
        "how were you made",
      ],
      action: "pipBrain",
    },
    {
      id: "pipWho",
      examples: ["who are you", "what's your name", "what are you", "who made you", "who built you", "who created you", "why are you here", "what is pip"],
      say: ["I'm Pip! Kanwar's assistant, tour guide, and biggest fan. He built me. Mostly at night. I think it shows. ✨"],
    },

    /* ------------------------- chit-chat ------------------------- */
    { id: "hello", examples: ["hi", "hello", "hey", "yo", "sup", "good morning", "hiya", "howdy", "hey pip", "hi there", "hello pip", "heyy"], say: ["Hey hey! 👋", "Hello, human!", "Hi! You found the text box. Most people don't."], action: "wave" },
    { id: "howAreYou", examples: ["how are you", "how's it going", "what's up", "how are you doing", "you ok"], say: ["Fully charged and slightly over-caffeinated. You? ⚡", "Running at 100%. Mostly. How can I help?"] },
    { id: "thanks", examples: ["thanks", "thank you", "thx", "cheers", "appreciate it", "that was helpful"], say: ["Anytime! Tell your friends about me. And about him, I guess. 😌"] },
    { id: "bye", examples: ["bye", "goodbye", "see you", "later", "i'm leaving", "gotta go", "ciao"], say: ["Bye! 👋 Come back soon. I'll be here. Literally. I can't leave."], action: "wave" },
    {
      id: "joke",
      examples: ["tell me a joke", "say something funny", "make me laugh", "joke please", "got any jokes", "be funny"],
      say: [
        "Why did the FPGA break up with the CPU? It needed someone more <i>flexible</i>.",
        "There are 10 types of people: those who understand binary and those who don't.",
        "I'd tell you a UDP joke, but you might not get it.",
        "Why do embedded engineers hate the beach? Too many <i>interrupts</i>.",
      ],
      action: "wiggle",
    },
    { id: "compliment", examples: ["you're cute", "i like you", "good bot", "you're awesome", "love this site", "this is cool", "nice website", "best bot"], say: ["Stop it, you'll make my fans spin up. 🥹"], action: "blush" },
    { id: "insult", examples: ["you're dumb", "stupid bot", "bad bot", "this is useless", "i hate you", "you suck"], say: ["Rude. I'm telling Kanwar. 😤"], action: "shake" },
    { id: "trick", examples: ["do a trick", "dance", "do a backflip", "juggle", "show me something cool", "can you dance"], say: ["Ta-da! ✨", "I've been practising.", "Thank you, thank you. I'm here all week."], action: "trick" },

    /* ------------------------- out of scope ------------------------- */
    {
      id: "offTopic",
      examples: [
        "what's the capital of france", "write my essay", "solve this equation", "what's the weather in paris", "who won the game",
        "explain quantum physics", "write me some python code", "what's the stock price", "recommend a movie", "translate this",
        "what is the meaning of life", "help with my homework", "who is the president", "tell me the news",
      ],
      say: [
        "Great question. Terrible timing. 😅 I only know about Kanwar. Ask me about his projects, skills, or whether he's available!",
        "My neural network returned <code>undefined</code>. 🫠 I'm a Kanwar specialist. Try asking about eggs, FPGAs, or MPI?",
      ],
      action: "google",
    },
  ],
};

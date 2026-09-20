const resume = `
ARJUN SHARMA
MERN Stack Developer

Email: arjun.sharma.dev@gmail.com
Phone: +91 98765 43210
Location: New Delhi, India
GitHub: github.com/arjunsharma
LinkedIn: linkedin.com/in/arjunsharma

SUMMARY

Junior Full Stack Developer with hands-on experience building web applications using MongoDB, Express.js, React.js, and Node.js. Strong understanding of REST APIs, JWT authentication, responsive UI development, and database integration. Experienced in developing and deploying full-stack applications and working with Git and GitHub. Interested in building scalable, user-focused web applications and growing as a software engineer.

TECHNICAL SKILLS

Frontend:
- HTML5
- CSS3
- JavaScript ES6+
- React.js
- React Router
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt
- Middleware

Database:
- MongoDB
- Mongoose
- MySQL

Tools:
- Git
- GitHub
- VS Code
- Postman
- MongoDB Compass
- Render

PROJECTS

1. AI Job Preparation Platform
Tech Stack: React.js, Node.js, Express.js, MongoDB, JWT, Gemini API

- Developed a full-stack job preparation platform that helps users analyze resumes and job descriptions using generative AI.
- Implemented user registration and login using JWT-based authentication.
- Created protected routes to restrict access to authenticated users.
- Built REST APIs for authentication, user management, resume analysis, and interview preparation.
- Integrated Gemini API to generate interview questions, resume feedback, and skill-gap analysis.
- Designed MongoDB schemas for users and interview reports.
- Implemented Axios-based API communication between the React frontend and Express backend.

2. E-Commerce Web Application
Tech Stack: React.js, Vite, Node.js, Express.js, Sequelize, MySQL

- Built a responsive e-commerce application with product browsing, cart management, checkout, and order functionality.
- Developed REST APIs using Node.js and Express.js.
- Implemented product and order data management using Sequelize ORM.
- Created responsive React components for product listings, cart, checkout, and order tracking.
- Deployed the application using Render.

3. Task Management Application
Tech Stack: React.js, Node.js, Express.js, MongoDB

- Developed a task management application allowing users to create, update, delete, and organize tasks.
- Implemented JWT authentication and protected API routes.
- Created RESTful APIs using Express.js.
- Stored user and task information in MongoDB using Mongoose.
- Added filtering and task status management functionality.

EDUCATION

Bachelor of Technology in Computer Science and Engineering
ABC Institute of Technology, New Delhi
2022 – 2026

CGPA: 8.1/10

CERTIFICATIONS

- Full Stack Web Development – Online Certification
- JavaScript and React Development – Online Certification
- Node.js and Express.js – Online Certification

ACHIEVEMENTS

- Solved 150+ coding problems on LeetCode and GeeksforGeeks.
- Built and deployed multiple full-stack web applications.
- Participated in college-level hackathons and coding competitions.
`

const selfDescription = `
I am a junior full-stack developer with a strong interest in building modern web applications using the MERN stack. I have hands-on experience with React, JavaScript, Node.js, Express.js, MongoDB, REST APIs, JWT authentication, and Git.

During my projects, I have worked on authentication systems, protected routes, database integration, API development, responsive frontend interfaces, and AI-powered features using the Gemini API. I recently developed an AI-powered job preparation platform that analyzes resumes and job descriptions, identifies skill gaps, and generates interview questions and feedback.

I enjoy learning new technologies and solving programming problems. I have also practiced data structures and algorithms and regularly work on improving my problem-solving skills.

I am looking for an opportunity where I can work on real-world software applications, contribute to a development team, improve my backend and system design skills, and grow into a strong full-stack software engineer.
`

const jobDescription = `
JOB TITLE: Junior Full Stack Developer

COMPANY: TechNova Solutions

LOCATION: Bangalore / Hybrid

EXPERIENCE: 0–2 Years

JOB DESCRIPTION

We are looking for a motivated Junior Full Stack Developer to join our engineering team and help build scalable, reliable, and user-friendly web applications.

The ideal candidate should have a strong foundation in JavaScript and hands-on experience with React.js, Node.js, Express.js, and MongoDB.

RESPONSIBILITIES

- Develop responsive and user-friendly web applications using React.js.
- Build scalable backend services and RESTful APIs using Node.js and Express.js.
- Design and manage MongoDB databases using Mongoose.
- Integrate frontend applications with backend APIs.
- Implement authentication and authorization using JWT and OAuth.
- Write clean, reusable, maintainable, and well-documented code.
- Debug and troubleshoot application issues.
- Work with Git and GitHub for version control and collaborative development.
- Write unit and integration tests for frontend and backend functionality.
- Participate in code reviews and follow software development best practices.
- Optimize applications for performance, scalability, and security.
- Collaborate with UI/UX designers, backend engineers, and product managers.
- Deploy applications using cloud platforms such as AWS, Vercel, or Render.
- Participate in Agile/Scrum development processes.

REQUIRED SKILLS

- Strong knowledge of JavaScript ES6+.
- Good understanding of React.js and React Hooks.
- Experience with Node.js and Express.js.
- Experience building RESTful APIs.
- Good knowledge of MongoDB and Mongoose.
- Understanding of JWT authentication and authorization.
- Familiarity with Git and GitHub.
- Understanding of HTML5, CSS3, and responsive web design.
- Good problem-solving and debugging skills.
- Understanding of asynchronous JavaScript, promises, and async/await.

PREFERRED SKILLS

- TypeScript
- Next.js
- Tailwind CSS
- Redis
- PostgreSQL
- Docker
- AWS
- CI/CD pipelines
- Jest or React Testing Library
- Basic understanding of system design
- Experience integrating AI APIs or LLM-based applications

EDUCATION

Bachelor's degree in Computer Science, Information Technology, Electronics, or a related technical field.

WHAT WE OFFER

- Opportunity to work on production-level applications.
- Mentorship from experienced software engineers.
- Exposure to modern full-stack technologies.
- Learning and professional development opportunities.
- Collaborative engineering environment.
`

module.exports = {
    resume, selfDescription, jobDescription
}
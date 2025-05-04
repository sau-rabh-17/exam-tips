# Exam Tips

Exam Tips is a platform designed to help students by providing a variety of tools for exam preparation. The website includes four main sections:

- **Open Forum**: A space where users can share their ideas and experiences.
- **My Wall**: A personal profile section for each user.
- **Repository**: Users can upload and share their work related to exams.
- **Exam Portal**: This feature is still under development need to add some logic to display result!!!

## Technologies Used
- **EJS**: Templating engine for rendering dynamic views.
- **Node.js**: Backend server-side logic.
- **PostgreSQL**: Offline database to store user data and work.
- **Backend Implementation**: Full backend setup to support the features above.

## Dependencies
The following dependencies are used in the project:

- **bcrypt**: ^5.1.1 - For hashing passwords.
- **body-parser**: ^1.20.3 - To parse incoming request bodies.
- **dotenv**: ^16.4.7 - For managing environment variables.
- **ejs**: ^3.1.10 - Templating engine for rendering views.
- **express**: ^4.21.2 - Web framework for Node.js.
- **express-session**: ^1.18.1 - To manage user sessions.
- **node**: ^23.4.0 - Node.js runtime.
- **nodemon**: ^3.1.9 - For automatically restarting the server during development.
- **pg**: ^8.13.1 - PostgreSQL client for Node.js.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/sau-rabh-17/exam-tips.git
2. Install dependencies:
   ```bash
   npm install
3. Set up PostgreSQL database and configure the connection in your project.

4. Run the application:
   ```bash
   npx nodemon app.js

## Contributing
Contributions are welcome! Feel free to fork the repository, make your changes, and submit a pull request. Together, we can make Exam Tips even better!

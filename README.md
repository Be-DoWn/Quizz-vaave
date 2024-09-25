# Quiz using React js

## Project Structure

├── frontend/ # React.js frontend code

├── backend/ # Node.js/Express backend code

├── database/ # Database scripts and Design

## Prerequisites

Before you can run the project locally, make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or above)
- [Git](https://git-scm.com/)

## 1. Clone the Repository

Open your terminal and run the following command to clone the project repository from GitHub:

```bash
git clone https://github.com//Be-DoWn/Quizz-vaave.git
cd quizz-vaave
cd frontend
npm install
npm run dev
# open new terminal
cd quizz-vaave/backend
npm install
npm start
```

## 2. Create the Database

1. using the comands inside in db/test.session.sql
2. insert some sample data inside topics , levels, questions, options

## 3. Getting google client id
1. please update the dummy google client id - frontend/src/app.jsx
   ```bash
   const clientId = "your-googleClientId"
   ```

## 4. Configure DataBase setup in backend/server.js

```bash
const db = mysql.createConnection({
  host: "localhost",
  user: "username",
  password: "password",
  database: "database-name",
});
```

const express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
const axios = require("axios"); // Make sure to import axios
const cors = require("cors");

const app = express();

// Enable CORS with credentials
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(express.json());

// Setup session middleware
app.use(
  session({
    secret: "vaave_assignment",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// dp setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "vaave",
});

// normal db check
db.connect((err) => {
  if (err) {
    console.error(err + "DB connection failed");
    return;
  }
  console.log("DB connectioned.");
});

//check once
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.json({ valid: true });
  }
  return res.json({ valid: false });
});

// Route to log in and create session
app.post("/login", async (req, res) => {
  const { accessToken } = req.body;

  try {
    // Fetch user info from Google API using the access token
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const useremail = response.data.email;

    // Check if the user already exists
    const checkUserQuery = "SELECT * FROM usersdata WHERE useremail = ?";
    db.query(checkUserQuery, [useremail], (err, result) => {
      if (err) {
        console.error("Error checking user in DB:", err);
        return res.json({ message: "Database error" });
      }

      if (result.length > 0) {
        // User already exists, don't insert
        console.log("User already exists:", useremail);
      } else {
        const insertUserQuery = "insert into usersdata (useremail) values (?)";
        db.query(insertUserQuery, [useremail], (err, result) => {
          if (err) {
            console.error("Error inserting user in DB:", err);
            return res.json({ message: "Database error" });
          }
          console.log("User inserted:", useremail);
        });
      }

      // Create session and store user info
      req.session.user = {
        email: useremail,
      };
      console.log("Session created:", req.session.user);

      // Send success response back to the client
      res.json({ login: true, email: useremail });
    });
  } catch (error) {
    console.error(error);
    res.json({ message: "Failed to log in" });
  }
});

// Route to check if the session is valid
app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("connect.sid"); 
  req.session.destroy((err) => {
    if (err) {
      return res.json({ message: "session not destroyed" });
    }
    return res.json({ message: "session destroyed" }); // Send response to client
  });
});

// Route to fetch topics
app.get("/topics", (req, res) => {
  const q = "select * from topics";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/questions", (req, res) => {
  const topic_name = req.query.topic;

  // SQL query to fetch questions and options for the given topic
  const sql = `
    select questions.id AS question_id, 
           questions.question_text, 
           options.id AS option_id, 
           options.option_text, 
           options.is_correct,
           questions.level_id AS level_id
    from questions
    join topics on questions.topic_id = topics.id
    join options on questions.id = options.question_id
    where topics.topic_name = ?;
  `;

  // Database query
  db.query(sql, [topic_name], (err, results) => {
    if (err) {
      return res.json({ error: err.message });
    }
    res.json(results);
  });
});

const getUserIdByEmail = (email, callback) => {
  const query = "select id from usersdata where useremail = ?";

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching user ID: ", err);
      callback(err, null);
    } else if (result.length > 0) {
      callback(null, result[0].id);
    } else {
      callback(new Error("User not found"), null);
    }
  });
};

app.post("/userdata", async (req, res) => {
  const { user, score, responses, topic_id } = req.body;

  console.log("Received userdata:", { user, score, responses, topic_id });

  try {
    // Fetch the user ID asynchronously
    const userId = await new Promise((resolve, reject) => {
      getUserIdByEmail(user, (err, id) => {
        if (err) {
          console.error("Error fetching user ID:", err);
          reject(err);
        } else {
          resolve(id);
        }
      });
    });

    console.log("User ID fetched:", userId);
    const uqerry =
      "insert into userResult (user_id, topic_id, user_score) values(?,?,?)";
    await new Promise((resolve, reject) => {
      db.query(uqerry, [userId, topic_id, score], (err, result) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    // Insert responses one by one

    // console.log(responses);
    for (const response of responses) {
      const { level_id, question_id, selected_option_id, is_correct } =
        response;

      const query = `insert into UserResponses (user_id, topic_id, level_id, question_id, selected_option_id, is_correct) 
                     values (?, ?,?, ?, ?, ?)`;

      await new Promise((resolve, reject) => {
        db.query(
          query,
          [
            userId,
            topic_id,
            level_id,
            question_id,
            selected_option_id,
            is_correct,
          ],
          (err, result) => {
            if (err) {
              console.error("Error inserting user response: ", err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });

      // console.log(`Inserted response for question ID ${question_id}`);
    }

    res.json({ message: "User data stored successfully" });
  } catch (error) {
    console.error("Error handling userdata request: ", error);
    res.json({ message: "Error saving user responses", error: error.message });
  }
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});

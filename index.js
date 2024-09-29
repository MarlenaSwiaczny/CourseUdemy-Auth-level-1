import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";


const app = express();
const port = 3000;
env.config();

let users = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

async function addUser(email, password) {
  let authentication = false;
  try {
    await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, password]
    );
    authentication = true;
  } catch (err) {
    console.log(err);
  }
  return authentication
}

async function searchUser(email) {
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1", [email]);
      return result.rows;
  } catch (err) {
    console.log("mój błąd:", err);
    return "błąd";
  }
}

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body["username"];
  const password = req.body["password"];
  let response = await searchUser(email)
  console.log("sprawdzanie", response)
  console.log("długość:", response.length)
  if (response.length == 0) {
    if (await addUser(email, password)) {
      res.render("secrets.ejs");
    } else {
      res.redirect("/");
    }
  } else {
    res.send(`<p>That e-mail already exist. Try to log in.</p><a class="btn btn-dark btn-lg" href="/" role="button">Back</a>`)
  }
});

app.post("/login", async (req, res) => {
const email = req.body["username"];
  const password = req.body["password"];
  let response = await searchUser(email)
  console.log(response, response.length, response[0].password, password)
  
  if (response.length > 0 && response[0].password == password) {
    res.render("secrets.ejs");
    } else {
    res.send(`<p>Email or Password incorrect. Try again or register.</p><a class="btn btn-dark btn-lg" href="/" role="button">Back</a>`)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

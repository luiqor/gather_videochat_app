import express from "express";
import http from "http";
import dotenv from "dotenv";
import ejs from "ejs";

dotenv.config();
const app = express();
const server = http.createServer(app);

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("space");
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});
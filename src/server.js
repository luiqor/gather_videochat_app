import express from "express";
import dotenv from "dotenv";
import route from "./routes/route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const server = createServer(app);

const io = new Server(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.use(express.static(path.join(__dirname, "../public")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));
app.use("/img", express.static(path.join(__dirname, "../public/img")));

app.use("/peerjs", peerServer);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", route);

let spaces = [
  //{ name: "global", creator: "User1" },..
];
let users = {};

io.on("connection", (socket) => {
  console.log(`User connected to server.`);

  socket.on("initialize-user", (username) => {
    socket.username = username;
    console.log(`User ${username} initialized with socket id ${socket.id}.`);
  });

  socket.on("message", (message, spaceId) => {
    console.log("Received message with SPACE_ID:", spaceId);
    io.to(spaceId).emit("create-message", message, socket.username, spaceId);
  });

  socket.on("update-spaces", (username, spaceId) => {
    if (!spaces.some((space) => space.name === spaceId)) {
      spaces.push({ name: spaceId, creator: username });
    }
    users[socket.id] = { username, space: spaceId };

    if (socket.currentRoom) socket.leave(socket.currentRoom);

    socket.join(spaceId);
    socket.currentSpace = spaceId;

    io.to(spaceId).emit("user-connected", username);

    socket.on("disconnect", () => {
      io.to(socket.currentSpace).emit("user-disconnected", username);
      delete users[socket.id];
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

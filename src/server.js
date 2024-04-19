import express from "express";
import http from "http";
import dotenv from "dotenv";
import route from "./routes/route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});
const peerServer = ExpressPeerServer(server, { debug: true });

app.use(express.static(path.join(__dirname, "../public")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));
app.use("/img", express.static(path.join(__dirname, "../public/img")));

app.use("/peerjs", peerServer);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", route);

io.on("connection", (socket) => {
  socket.on("join-space", (spaceId, userId) => {
    socket.join(spaceId);
    socket.to(spaceId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(spaceId).emit("createMessage", message, userId);
    });
    socket.on("disconnect", () => {
      socket.to(spaceId).broadcast.emit("user-disconnected", userId);
    });
  });
});


server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

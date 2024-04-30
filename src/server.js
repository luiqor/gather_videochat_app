import express from "express";
import dotenv from "dotenv";
import route from "./routes/route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import SocketService from "./services/socket_service.js";
import AppDataSource from "./services/datasource_service.js";

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
const socketServiceInstance = new SocketService();

AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    throw error;
  });

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

import express from "express";
import dotenv from "dotenv";
import route from "./routes/route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import * as typeorm from "typeorm";
import Socket from "./model/socket.js";
import Space from "./model/space.js";
import SocketSpace from "./model/socket_space.js";
import SocketService from "./services/socket_service.js";

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

typeorm
  .createConnection({
    type: process.env.DB_TYPE,
    database: process.env.DATABASE,
    synchronize: true,
    logging: true,
    foreignKeys: true,
    entities: [__dirname + "/entity/*.js"],
  })
  .then(async (connection) => {
    console.log("Database connected successfully.");
    const socketRepository = connection.getRepository(Socket);
    const spaceRepository = connection.getRepository(Space);
    const socketSpaceRepository = connection.getRepository(SocketSpace);

    io.on("connection", async (socket) => {
      await socketServiceInstance.handleConnection(
        connection,
        socket,
        socketRepository,
        spaceRepository,
        socketSpaceRepository,
        io
      );
    });
  })
  .catch((error) => {
    throw error;
  });

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

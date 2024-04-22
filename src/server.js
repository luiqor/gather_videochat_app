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
    const spaceRepository = connection.getRepository(Space);
    const socketSpaceRepository = connection.getRepository(SocketSpace);

    io.on("connection", async (socket) => {
      console.log(`User connected to server.`);

      let new_socket = new Socket();
      new_socket.socketId = socket.id;
      await connection.manager.save(new_socket);

      socket.on("initialize-user", (username) => {
        socket.username = username;
        console.log(
          `User ${username} initialized with socket id ${socket.id}.`
        );
      });

      socket.on("message", (message, spaceId) => {
        console.log("Received message with SPACE_ID:", spaceId);
        io.to(spaceId).emit(
          "create-message",
          message,
          socket.username,
          spaceId
        );
      });

      socket.on("update-spaces", async (spaceId) => {
        let space = await spaceRepository.findOne({ where: { slug: spaceId } });
        console.log("Space:", space);
        if (!space) {
          space = new Space();
          space.slug = spaceId;
          console.log("username:", socket.username);
          space.creator_username = socket.username;
          await spaceRepository
            .save(space)
            .then(() => {
              console.log("Space saved.");
              return space;
            })
            .catch((error) => {
              throw error;
            });
        }

        let socketSpace = new SocketSpace();
        socketSpace.username = socket.username;
        socketSpace.socket = new_socket;
        socketSpace.space = space;
        await socketSpaceRepository
          .save(socketSpace)
          .then(() => {
            console.log("sockets_spaces saved.");
          })
          .catch((error) => {
            throw error;
          });
        //⭕ leave the current room and join the new one
        if (socket.currentRoom) socket.leave(socket.currentRoom);

        socket.join(spaceId);
        socket.currentSpace = spaceId;

        io.to(spaceId).emit("user-connected", socket.username);

        socket.on("disconnect", () => {
          io.to(socket.currentSpace).emit("user-disconnected", socket.username);
          console.log("User disconnected.", socket.username);
          socketSpaceRepository
            .find({
              where: {
                username: socket.username,
              },
            })
            .then((SocketSpace) => {
              socketSpaceRepository
                .remove(SocketSpace)
                .then(() => {
                  console.log("Socket_space removed.");
                })
                .catch((error) => {
                  throw error;
                });
            });
        });
      });
    });
  })
  .catch((error) => {
    throw error;
  });

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

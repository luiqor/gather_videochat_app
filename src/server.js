import express from "express";
import dotenv from "dotenv";
import route from "./routes/route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import Socket from "./model/socket.js";
import Space from "./model/space.js";
import SocketSpace from "./model/socket_space.js";
import SocketService from "./services/socket_service.js";
import AppDataSource from "./services/datasource_service.js";
import createError from "http-errors";
import bodyParser from "body-parser";
import session from "express-session";
import cron from "node-cron";
import { LessThan, IsNull } from "typeorm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const server = createServer(app);

const io = new Server(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(express.static(path.join(__dirname, "../public")));
app.use("/css", express.static(path.join(__dirname, "../public/css")));
app.use("/js", express.static(path.join(__dirname, "../public/js")));
app.use("/img", express.static(path.join(__dirname, "../public/img")));

app.use("/peerjs", peerServer);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", route);
const socketServiceInstance = new SocketService();

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error-page");
});

AppDataSource.initialize()
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

cron.schedule(
  // 45 18
  "0 0 * * *",
  async () => {
    console.log("running a task of deleting spaces");
    try {
      const spaceRepository = AppDataSource.getRepository(Space);
      const now = new Date();
      const notNeededSpaces = await spaceRepository.find({
        where: [{ lastDate: LessThan(now) }, { lastDate: IsNull() }],
      });
      console.log("notNeededSpaces", notNeededSpaces);
      await spaceRepository.remove(notNeededSpaces);
    } catch (err) {
      console.error("Error deleting spaces:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Europe/Kiev",
  }
);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}/`);
});

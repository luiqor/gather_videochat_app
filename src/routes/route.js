import express from "express";
import {
  space,
  createSpace,
  userLobby,
} from "../controller/gatherspaceController.js";
import { index } from "../controller/mainController.js";
import createError from "http-errors";

const route = express.Router();
route.get("/", index);

route.get("/join-space", (req, res) => {
  res.render("join-space");
});

route.get("/user-lobby/:space/", userLobby);

route.get("/create/:space/", createSpace);

route.get("/:space", space);

route.all("/*", (req, res, next) => {
  next(createError(404));
});

export default route;

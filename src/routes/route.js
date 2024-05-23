import express from "express";
import {
  space,
  getCreateSpace,
  getUserLobby,
  postUserLobby,
  postCreateSpace,
} from "../controller/gatherspace_controller.js";
import { index } from "../controller/main_controller.js";
import createError from "http-errors";

const route = express.Router();
route.get("/", index);

route.get("/join-space", (req, res) => {
  res.render("join-space");
});

route.get("/user-lobby/:space/", getUserLobby);
route.post("/user-lobby/:space/", postUserLobby);

route.get("/create/:space/", getCreateSpace);
route.post("/create/:space/", postCreateSpace);

route.get("/:space", space);

route.all("/*", (req, res, next) => {
  next(createError(404));
});

export default route;

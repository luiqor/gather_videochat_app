import express from "express";
import { space, createSpace } from "../controller/gatherspaceController.js";
import { index } from "../controller/mainController.js";
import { renderErrorPage } from "../controller/errorController.js";

const route = express.Router();
route.get("/", index);

route.get("/join-space", (req, res) => {
  res.render("join-space");
});

route.get("/create/:space/", createSpace);

route.get("/:space", space);

route.all("/*", (req, res) => {
  renderErrorPage(res, 404, "The page you request is not found");
});

export default route;

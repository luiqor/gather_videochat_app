import express from "express";
import { space, createSpace } from "../controller/gatherspaceController.js";
import { index } from "../controller/mainController.js";

const route = express.Router();

route.get("/", index);

route.get("/:space", space);

route.get("/create/:space/", createSpace);

route.all("/*", (req, res) => {
  res
    .status(400)
    .send({ status: false, message: "The page you request is not available" });
});

export default route;

// route.get("/", space);

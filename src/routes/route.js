import express from "express";
import { space } from "../controller/gatherspaceController.js";

const route = express.Router();

route.get("/", space);

route.all("/*", function (req, res) {
  res
    .status(400)
    .send({ status: false, message: "The page you request is not available" });
});

export default route;

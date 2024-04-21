import { EntitySchema } from "typeorm";
import Socket from "../model/socket.js";
import Space from "../model/space.js";

export default new EntitySchema({
  name: "Space",
  tableName: "spaces",
  target: Space,
  columns: {
    slug: {
      primary: true,
      type: "text",
    },
    username: {
      type: "text",
    },
  },
  relations: {
    sockets: {
      target: "Socket",
      type: "one-to-many",
      joinTable: true,
      cascade: true,
    },
  },
});

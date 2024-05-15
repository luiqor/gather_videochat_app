import { EntitySchema } from "typeorm";
import Space from "../model/space.js";
import SocketSpace from "../model/socket_space.js";

export default new EntitySchema({
  name: "Space",
  tableName: "spaces",
  target: Space,
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
    creator: {
      type: "varchar",
    },
    lastDate: {
      type: "date",
    },
  },
  relations: {
    sockets_spaces: {
      type: "one-to-many",
      target: "SocketSpace",
      cascade: true,
      inverseSide: "space",
      joinColumn: true,
    },
  },
});

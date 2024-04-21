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
      type: "varchar",
    },
    username: {
      type: "varchar",
    },
  },
  relations: {
    sockets: {
      type: "many-to-one",
      target: "Socket",
      joinColumn: {
        name: "socket_id",
      },
      inverseSide: "spaces",
    },
    spaces_creators: {
      type: "one-to-many",
      target: "SpaceCreator",
      cascade: true,
      inverseSide: "spaces",
    },
  },
});

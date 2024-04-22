import { EntitySchema } from "typeorm";
import Space from "../model/space.js";
import Socket from "../model/socket.js";
import SocketSpace from "../model/socket_space.js";

export default new EntitySchema({
  name: "SocketSpaces",
  tableName: "sockets_spaces",
  target: SocketSpace,
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    username: {
      type: "varchar",
    },
  },
  relations: {
    socket: {
      type: "many-to-one",
      target: "Socket",
      inverseSide: "sockets_spaces",
    },
    space: {
      type: "many-to-one",
      target: "Space",
      inverseSide: "sockets_spaces",
      eager: true,
    },
  },
});

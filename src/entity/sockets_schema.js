import { EntitySchema } from "typeorm";
import Socket from "../model/socket.js";
import SocketSpace from "../model/socket_space.js";

export default new EntitySchema({
  name: "Socket",
  tableName: "sockets",
  target: Socket,
  columns: {
    id: {
      primary: true,
      type: "varchar",
    },
  },
  relations: {
    sockets_spaces: {
      type: "one-to-many",
      target: "SocketSpace",
      cascade: true,
      inverseSide: "socket",
      joinColumn: true,
    },
  },
});

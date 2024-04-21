import { EntitySchema } from "typeorm";
import Socket from "../model/socket.js";

export default new EntitySchema({
  name: "Socket",
  tableName: "sockets",
  target: Socket,
  columns: {
    socketId: {
      primary: true,
      type: "varchar",
    },
  },
  relations: {
    spaces: {
      type: "one-to-many",
      target: "Space",
      cascade: true,
      inverseSide: "sockets",
    },
  },
});

import { EntitySchema } from "typeorm";
import Space from "../model/space.js";
import SpaceCreator from "../model/space_creator.js";

export default new EntitySchema({
  name: "SpaceCreator",
  tableName: "spaces_creators",
  target: SpaceCreator,
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    username: {
      type: "text",
    },
  },
  relations: {
    spaces: {
      target: "Space",
      type: "one-to-many",
      joinTable: true,
      cascade: true,
    },
  },
});

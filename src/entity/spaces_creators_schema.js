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
      type: "varchar",
    },
  },
  relations: {
    spaces: {
      type: "many-to-one",
      target: "Space",
      joinColumn: {
        name: "space_slug",
      },
      inverseSide: "spaces_creators",
    },
  },
});

import { generateSlug } from "random-word-slugs";

const index = async (req, res) => {
  res.render("index", {
    spaceId: generateSlug(),
    spaceAlreadyExists: false,
  });
};

export { index };

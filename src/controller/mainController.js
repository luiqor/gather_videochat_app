import { generateSlug } from "random-word-slugs";

const index = async (req, res) => {
  res.redirect(`/${generateSlug()}`);
};

export { index };
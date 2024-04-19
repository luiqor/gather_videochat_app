const space = async (req, res) => {
  res.render("space", { spaceId: req.params.space });
};

export { space };

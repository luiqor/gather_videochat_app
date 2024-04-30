import AppDataSource from "../services/datasource_service.js";
import SocketSpace from "../model/socket_space.js";
import Space from "../model/space.js";

const space = async (req, res) => {
  try {
    const socketSpaceRepository =
      await AppDataSource.getRepository(SocketSpace);
    const socketSpace = await socketSpaceRepository.find({
      where: { space: { id: req.params.space } },
      order: { id: "ASC" },
    });

    const usernamesArray = socketSpace.map(
      (socketSpaceItem) => socketSpaceItem.username
    );

    console.log(usernamesArray);
    res.render("space", {
      spaceId: req.params.space,
      usernamesArray: usernamesArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createSpace = async (req, res) => {
  console.log("Creating new space...", req.params.space);
  const spaceRepository = await AppDataSource.getRepository(Space);
  const sameSpaceAsRandom = await spaceRepository.findOne({
    where: { id: req.params.space },
  });
  if (sameSpaceAsRandom) {
    res.render("index", {
      spaceId: req.params.space,
      spaceAlreadyExists: true,
    });
    return;
  }
  res.redirect(`/${req.params.space}`);
};
//// res.redirect(`/${generateSlug()}`);
export { space, createSpace };

import AppDataSource from "../services/datasource_service.js";
import SocketSpace from "../model/socket_space.js";
import Space from "../model/space.js";
import { renderErrorPage } from "./errorController.js";

const space = async (req, res) => {
  const spaceId = req.params.space;
  if (!testSpaceId(spaceId, res)) {
    return;
  }
  try {
    const socketSpaceRepository =
      await AppDataSource.getRepository(SocketSpace);
    const socketSpace = await socketSpaceRepository.find({
      where: { space: { id: spaceId } },
      order: { id: "ASC" },
    });

    const usernamesArray = socketSpace.map(
      (socketSpaceItem) => socketSpaceItem.username
    );

    console.log(usernamesArray);
    res.render("space", {
      spaceId: spaceId,
      usernamesArray: usernamesArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const testSpaceId = (spaceId, res) => {
  if (!/^(\w+-\w+-\w+)$/.test(spaceId) || spaceId.length < 5) {
    renderErrorPage(
      res,
      403,
      "Invalid spaceId format. It should consist of three words separated by hyphens."
    );
    return false;
  }
  return true;
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

import AppDataSource from "../services/datasource_service.js";
import SocketSpace from "../model/socket_space.js";
import Space from "../model/space.js";

const space = async (req, res, next) => {
  const spaceId = req.params.space;
  if (!testSpaceId(spaceId, res, next)) {
    return;
  }
  if (!req.query.username) {
    return res.redirect("/" + "user-lobby/" + spaceId);
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
    return next(error);
  }
};

const testSpaceId = (spaceId, res, next) => {
  if (!/^[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/.test(spaceId) || spaceId.length < 5) {
    const err = new Error(
      "SpaceId must be at least 5 characters long and " +
        "contain only lowercase letters and numbers separated by hyphens"
    );
    return next(err);
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
  res.render("creator-lobby", { spaceId: req.params.space });
  // post --> res.redirect(`/${req.params.space}`);
};

const userLobby = async (req, res, next) => {
  const spaceId = req.params.space;
  if (!testSpaceId(spaceId, res, next)) {
    return;
  }
  const spaceRepository = await AppDataSource.getRepository(Space);
  const sameSpaceAsRequested = await spaceRepository.findOne({
    where: { id: req.params.space },
  });
  if (!sameSpaceAsRequested) {
    const err = new Error(
      "This space does not exist. Create a new space or join an existing one."
    );
    return next(err);
  }
  res.render("user-lobby", { spaceId: spaceId });
  // post --> res.redirect(`/${req.params.space}`);
};

export { space, createSpace, userLobby };

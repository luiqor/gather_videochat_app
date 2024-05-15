import AppDataSource from "../services/datasource_service.js";
import SocketSpace from "../model/socket_space.js";
import Space from "../model/space.js";

const space = async (req, res, next) => {
  const username = req.session.username;
  const spaceId = req.params.space;
  if (!testSpaceId(spaceId, res, next)) {
    return;
  }
  if (!username) {
    return res.redirect(`/user-lobby/${spaceId}`);
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
      username: username,
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

const getCreateSpace = async (req, res) => {
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

const postCreateSpace = async (req, res) => {
  const spaceId = req.body.spaceId;
  console.log("Post create new space...", spaceId);

  const spaceRepository = await AppDataSource.getRepository(Space);
  let space = spaceRepository.create();
  space.id = spaceId;
  space.creator = req.body.username;
  space.lastDate = req.body.date;
  space = await spaceRepository.save(space);

  req.session.username = req.body.username;
  res.redirect(`/${spaceId}`);
};

const getUserLobby = async (req, res, next) => {
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

const postUserLobby = async (req, res) => {
  req.session.username = req.body.username;
  res.redirect(`/${req.body.spaceId}`);
};

export { space, getCreateSpace, getUserLobby, postUserLobby, postCreateSpace };

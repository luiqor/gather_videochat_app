import AppDataSource from "../services/datasource_service.js";
import SocketSpace from "../model/socket_space.js";

const space = async (req, res) => {
  const socketSpaceRepository = AppDataSource.getRepository(SocketSpace);

  try {
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

export { space };

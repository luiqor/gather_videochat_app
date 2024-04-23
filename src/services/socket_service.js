import Socket from "../model/socket.js";
import SocketSpace from "../model/socket_space.js";

export default class SocketService {
  async handleConnection(
    connection,
    socket,
    socketRepository,
    spaceRepository,
    socketSpaceRepository,
    io
  ) {
    console.log(`User connected to server.`);
    let newSocket = new Socket();
    newSocket.id = socket.id;
    await connection.manager.save(newSocket);

    socket.on("initialize-user", (username) => {
      socket.username = username;
      console.log(`User ${username} initialized with socket id ${socket.id}.`);
    });

    socket.on("message", (message, spaceId) => {
      console.log("Received message with SPACE_ID:", spaceId);
      io.to(spaceId).emit("create-message", message, socket.username, spaceId);
    });

    socket.on("update-spaces", async (peerId, spaceId) => {
      let space = await spaceRepository.findOne({ where: { id: spaceId } });
      if (!space) {
        space = spaceRepository.create();
        space.id = spaceId;
        space.creator_username = socket.username;
        space = await spaceRepository.save(space);
      }

      let socketSpace = new SocketSpace();
      socketSpace.username = socket.username;
      socketSpace.socket = newSocket;
      socketSpace.space = space;
      await socketSpaceRepository.save(socketSpace);

      //⭕ leave the current room and join the new one
      if (socket.currentRoom) socket.leave(socket.currentRoom);

      socket.join(spaceId);
      socket.currentSpace = spaceId;

      io.to(spaceId).emit("user-connected", peerId);

      socket.on("disconnect", async () => {
        io.to(socket.currentSpace).emit("user-disconnected", peerId);
        await this.removeSocketSpace(
          socketSpaceRepository,
          socket.username,
          socket.currentSpace
        );
        await this.removeSocket(socketRepository, socket.id);
        console.log("User disconnected.", socket.username, "peerId:", peerId);
      });
    });
  }
  async removeSocketSpace(socketSpaceRepository, username, spaceid) {
    const socketSpaces = await socketSpaceRepository.find({
      where: {
        username,
        space: { id: spaceid },
      },
      relations: ["space"],
    });

    await socketSpaceRepository.remove(socketSpaces);
    console.log("Socket_space removed.");
  }

  async removeSocket(socketRepository, id) {
    const socket = await socketRepository.findOne({ where: { id } });
    if (socket) {
      await socketRepository.remove(socket);
      console.log("Socket removed.");
    }
  }
}

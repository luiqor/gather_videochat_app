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
    console.log(`User connected to socket server.`);
    let newSocket = new Socket();
    newSocket.id = socket.id;
    await connection.manager.save(newSocket);

    socket.on("initialize-user", (username, spaceId) => {
      socket.username = username;
      console.log(`User ${username} initialized with socket id ${socket.id}.`);
      io.to(spaceId).emit("new-username", username);
    });

    socket.on("message", async (message, spaceId, receiver) => {
      const getSocketByUsername = async (username, spaceId) => {
        const socketSpace = await socketSpaceRepository.findOne({
          where: { username: username, space: { id: spaceId } },
          relations: ["socket"],
        });
        return socketSpace && socketSpace.socket ? socketSpace.socket.id : null;
      };

      let recieversAddresses = [];
      receiver
        ? recieversAddresses.push(
            await getSocketByUsername(receiver),
            socket.id
          )
        : recieversAddresses.push(spaceId);
      recieversAddresses.forEach((address) => {
        io.to(address).emit(
          "create-message",
          message,
          socket.username,
          receiver ? true : false
        );
      });
    });

    socket.on("removal-element", (domElementId) => {
      io.to(socket.currentSpace).emit("remove-screen", domElementId);
    });

    socket.on("update-spaces", async (peerId, spaceId) => {
      let space = await spaceRepository.findOne({ where: { id: spaceId } });
      if (!space) {
        space = spaceRepository.create();
        space.id = spaceId;
        space.creator = socket.username;
        space = await spaceRepository.save(space);
      }

      let socketSpace = new SocketSpace();
      socketSpace.username = socket.username;
      socketSpace.socket = newSocket;
      socketSpace.space = space;
      console.log("Saving socketSpace: ", socketSpace);
      await socketSpaceRepository.save(socketSpace);

      //⭕ leave the current room and join the new one
      if (socket.currentRoom) socket.leave(socket.currentRoom);

      socket.join(spaceId);
      socket.currentSpace = spaceId;

      io.to(spaceId).emit("user-connected", peerId, socket.username);

      socket.on("disconnect", async () => {
        io.to(socket.currentSpace).emit(
          "user-disconnected",
          peerId,
          socket.username
        );
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

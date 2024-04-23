import { addVideoStream } from "./mediaStream.js";

export const connectToNewUser = (userId, stream, peers, peer, username) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, username);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
};

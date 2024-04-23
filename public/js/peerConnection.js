import { addVideoStream } from "./mediaStream.js";

export const connectToNewUser = (userId, stream, peers, peer, username) => {
  const call = peer.call(userId, stream);
  const videoPlaceholder = document.createElement("div");
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, username, videoPlaceholder);
  });
  call.on("close", () => {
    videoPlaceholder.remove();
  });
  peers[userId] = call;
};

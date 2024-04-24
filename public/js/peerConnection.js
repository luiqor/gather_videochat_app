import { addVideoStream } from "./mediaStream.js";

export const connectToNewUser = (
  userId,
  stream,
  currentPeers,
  peer,
  username
) => {
  const call = peer.call(userId, stream);
  const videoPlaceholder = document.createElement("div");
  videoPlaceholder.id = `peer-${userId}`;
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, username, videoPlaceholder);
  });
  call.on("close", () => {
    videoPlaceholder.remove();
  });
  if (!currentPeers.some((peer) => peer.peer === call.peer)) {
    currentPeers.push(call);
  }
};

import { addVideoStream } from "./mediaStream.js";

export const connectToNewUser = (
  userId,
  stream,
  currentPeers,
  peer,
  username
) => {
  const call = peer.call(userId, stream, {
    videoTitle: `${username}`,
  });
  const videoPlaceholder = document.createElement("div");
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, username, false, videoPlaceholder);
  });
  call.on("close", () => {
    videoPlaceholder.remove();
  });
  if (!currentPeers.some((peer) => peer.peer === call.peer)) {
    currentPeers.push(call);
  }
};

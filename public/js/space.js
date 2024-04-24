import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom } from "./spaceHelpers.js";
import { muteMic, stopVideo } from "./spaceButtons.js";
const socket = io();
const myVideo = document.createElement("video");
let username;
let peerId;

myVideo.muted = true;
let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8000",
});

let userCounter = 1;
let myVideoStream;
let currentPeers = [];
let getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

//VIDEO AND AUDIO TOGGLING OPTIONS
getUserMediaStream().then((stream) => {
  myVideoStream = stream;
  addVideoStream(
    myVideo,
    stream,
    `👑 ${usernamesArray[0] == false ? `Me ${username}` : usernamesArray[0]}`
  );

  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    let isNotPresentation = true;

    if (call.metadata) {
      isNotPresentation = call.metadata.type !== "presentation";
    }

    call.on("stream", (userVideoStream) => {
      addVideoStream(
        video,
        userVideoStream,
        isNotPresentation
          ? usernamesArray[userCounter] == undefined
            ? `Me ${username}`
            : usernamesArray[userCounter]
          : call.metadata.videoTitle,
        !isNotPresentation ? call.metadata.placeholderId : false
      );
      if (isNotPresentation) userCounter++;
    });
    if (!currentPeers.some((peer) => peer.peer === call.peer)) {
      currentPeers.push(call);
    }

    console.log(currentPeers);
  });

  socket.on("user-connected", (peerId, username) => {
    //when a new user/participant connects
    connectToNewUser(peerId, stream, currentPeers, peer, username);
    peerId = peerId;
  });

  let inputMssg = $("input");
  $("html").keydown((e) => {
    if (e.which == 13 && inputMssg.val().length !== 0) {
      socket.emit("message", inputMssg.val(), SPACE_ID); // Send SPACE_ID along with the message
      inputMssg.val("");
    }
  });

  socket.on("create-message", (message, username, messageSpaceId) => {
    if (messageSpaceId === SPACE_ID) {
      // Check if messageSpaceId matches SPACE_ID
      $("ul").append(
        `<li class="message">${username}:<br/><br/>${message}</li>`
      );
      scrollToBottom();
    }
  });
});

socket.on("connect", () => {
  username = prompt("Enter name: ");
  socket.emit("initialize-user", username, SPACE_ID);
});

socket.on("user-disconnected", (peerId) => {
  currentPeers = currentPeers.filter((peer) => peer.peer !== peerId);
});

socket.on("remove-screen", (domElementId) => {
  if (document.getElementById(domElementId)) {
    document.getElementById(domElementId).remove();
  }
});

peer.on("open", (peerId) => {
  //RENDERING CONCRETE SPACE ID
  socket.emit("update-spaces", peerId, SPACE_ID);
});

peer.on("call", (call) => {
  //VIDEO RENDERING FOR MULTIPLE PARTICIPANTS
  getUserMedia({ video: true, audio: true }, (stream) => {
    call.answer(stream); // Answer the call with an A/V stream.
  });
  if (!currentPeers.some((peer) => peer.peer === call.peer)) {
    currentPeers.push(call);
  }
  console.log(currentPeers);
});

document
  .getElementById("mute-button")
  .addEventListener("click", () => muteMic(myVideoStream));
document
  .getElementById("video-button")
  .addEventListener("click", () => stopVideo(myVideoStream));

document
  .getElementById("share-screen")
  .addEventListener("click", () => shareScreen(currentPeers, peerId));

const shareScreen = (currentPeers, userId) => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    .then((stream, userId) => {
      let videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = function () {
        let videoPlaceholder = document.getElementById(
          `peer-${userId}-presentation`
        );
        videoPlaceholder.remove();
        socket.emit("removal-element", `peer-${userId}-presentation`);
      };
      const videoPlaceholder = document.createElement("div");
      videoPlaceholder.id = `peer-${userId}-presentation`;
      const video = document.createElement("video");

      currentPeers.forEach((currentPeer) => {
        const call = peer.call(currentPeer.peer, stream, {
          metadata: {
            videoTitle: `${username} stream`,
            placeholderId: `peer-${userId}-presentation`,
            type: "presentation",
          },
        });
      });
      addVideoStream(
        video,
        stream,
        "📹 My stream",
        `peer-${userId}-presentation`,
        videoPlaceholder
      );
    });
};

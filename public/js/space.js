import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom } from "./spaceHelpers.js";
import {
  createSendButton,
  muteMic,
  stopVideo,
  shareScreen,
  recordSpace,
} from "./spaceButtons.js";
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

socket.on("remove-screen", (domElementId) => {
  if (document.getElementById(domElementId)) {
    document.getElementById(domElementId).remove();
  }
});

peer.on("open", (peerId) => {
  //RENDERING CONCRETE SPACE ID
  socket.emit("update-spaces", peerId, SPACE_ID);
  peerId = peerId;
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

socket.on("user-disconnected", (peerId) => {
  let callsToDisconnect = currentPeers.filter(
    (currentCall) => currentCall.peer === peerId
  );

  callsToDisconnect.forEach((call) => {
    console.log(call);
    call.close();
  });

  currentPeers = currentPeers.filter((call) => call.peer !== peerId);
});

const inputMssg = document.getElementById("message-input");
const sendMessage = () => {
  socket.emit("message", inputMssg.value, SPACE_ID); // Send SPACE_ID along with the message
  inputMssg.value = "";
};

inputMssg.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

inputMssg.addEventListener("input", () => createSendButton(inputMssg));

document
  .getElementById("mute-button")
  .addEventListener("click", () => muteMic(myVideoStream));
document
  .getElementById("video-button")
  .addEventListener("click", () => stopVideo(myVideoStream));

document
  .getElementById("share-screen-button")
  .addEventListener("click", () =>
    shareScreen(currentPeers, username, peer, socket)
  );

document
  .getElementById("record-button")
  .addEventListener("click", () => recordSpace());

document.getElementById("leave-space-button").addEventListener("click", () => {
  if (confirm(`Are you sure you want to leave space ${SPACE_ID}?`))
    window.close();
});

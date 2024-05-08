import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom, updateDropdown } from "./spaceHelpers.js";
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

updateDropdown(usernamesArray);
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
    `${usernamesArray[0] == false ? `${username}` : usernamesArray[0]}`
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
            ? `${username}`
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
});

socket.on("create-message", (message, username, isPrivate) => {
  $("ul").append(
    `<li class="message">${username} ${isPrivate ? "(privately)" : ""}:<br/><br/>${message}</li>`
  );
  scrollToBottom();
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

socket.on("new-username", (someonesUserame) => {
  usernamesArray.push(someonesUserame);
  console.log(usernamesArray);

  updateDropdown(usernamesArray);
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

socket.on("user-disconnected", (peerId, usernameOfDisconnected) => {
  let callsToDisconnect = currentPeers.filter(
    (currentCall) => currentCall.peer === peerId
  );

  callsToDisconnect.forEach((call) => {
    call.close();
    let videoElementOfDisconnected = document.getElementById(
      `video-placeholder-${usernameOfDisconnected}`
    );
    if (videoElementOfDisconnected) {
      videoElementOfDisconnected.remove();
    }
  });

  currentPeers = currentPeers.filter((call) => call.peer !== peerId);

  usernamesArray = usernamesArray.filter(
    (name) => name !== usernameOfDisconnected
  );
  updateDropdown(usernamesArray);

  // After removing the video element of the disconnected user, force a refresh of the video elements of the remaining users
  currentPeers.forEach((call) => {
    let videoElement = document.getElementById(`video-placeholder-${username}`);
    if (videoElement) {
      let video = videoElement.querySelector("video");
      video.srcObject = myVideoStream;
    }
  });
});

const inputMssg = document.getElementById("message-input");
const usersDropdown = document.getElementById("usernames-select");
const sendMessage = () => {
  const receiver = usersDropdown ? usersDropdown.value : undefined;
  socket.emit(
    "message",
    inputMssg.value,
    SPACE_ID,
    receiver !== "" ? receiver : undefined
  );
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

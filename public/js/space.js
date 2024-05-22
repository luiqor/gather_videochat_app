import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom, updateDropdown, sendMessage } from "./spaceHelpers.js";
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

updateDropdown(usernamesArray);
myVideo.muted = true;
let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8000",
});

let myVideoStream;
let currentPeers = [];
let addedStreamIds = [];
let userCounter = 0;
let getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

//VIDEO AND AUDIO TOGGLING OPTIONS
getUserMediaStream().then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream, `🌌 Me ${username}`);
  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    let isNotPresentation = true;

    if (call.metadata) {
      isNotPresentation = call.metadata.type !== "presentation";
    }

    call.on("stream", (userVideoStream) => {
      console.log(userVideoStream);
      addVideoStream(
        video,
        userVideoStream,
        isNotPresentation
          ? `${usernamesArray[userCounter]}`
          : call.metadata.videoTitle,
        !isNotPresentation ? call.metadata.placeholderId : false
      );
      console.log(usernamesArray[userCounter], "   ", userCounter);
      console.log("Before increment:", userCounter);
      if (!addedStreamIds.includes(userVideoStream.id)) {
        addedStreamIds.push(userVideoStream.id);
        userCounter++;
      }
      console.log("After increment:", userCounter);
      console.log(currentPeers);
    });
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
  username = USERNAME;
  setTimeout(() => {
    socket.emit("initialize-user", USERNAME, SPACE_ID);
  }, 2000);

  peer.on("open", (peerId) => {
    setTimeout(() => {
      //RENDERING CONCRETE SPACE ID
      socket.emit("update-spaces", peerId, SPACE_ID);
      peerId = peerId;
    }, 2000);
  });
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
      video.muted = true;
    }
  });
});

const inputMssg = document.getElementById("message-input");

inputMssg.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage(inputMssg, socket);
  }
});

inputMssg.addEventListener("input", () => createSendButton(inputMssg, socket));

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
  window.location.href = "/";
});

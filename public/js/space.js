import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom } from "./spaceHelpers.js";
import { muteMic, stopVideo } from "./spaceButtons.js";
const socket = io();
const myVideo = document.createElement("video");
let username;

myVideo.muted = true;
let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8000",
});
const peers = {};
let userCounter = 1;
let myVideoStream; //to stream video of the participant
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
    `👑 ${usernamesArray[0] == false ? "Me" : usernamesArray[0]}`
  );

  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      addVideoStream(
        video,
        userVideoStream,
        usernamesArray[userCounter] == undefined
          ? "Me"
          : usernamesArray[userCounter]
      );
      userCounter++;
    });
  });

  socket.on("user-connected", (peerId, username) => {
    //when a new user/participant connects
    connectToNewUser(peerId, stream, peers, peer, username);
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

socket.on("user-disconnected", (username) => {
  if (peers[username]) peers[username].close();
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
});

document
  .getElementById("mute-button")
  .addEventListener("click", () => muteMic(myVideoStream));
document
  .getElementById("video-button")
  .addEventListener("click", () => stopVideo(myVideoStream));

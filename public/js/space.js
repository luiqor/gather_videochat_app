import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom } from "./spaceHelpers.js";
import { muteMic, stopVideo } from "./spaceButtons.js";
const socket = io();
const myVideo = document.createElement("video");

myVideo.muted = true;
let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "8000",
});
const peers = {};
let myVideoStream; //to stream video of the participant
let getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

//VIDEO AND AUDIO TOGGLING OPTIONS
getUserMediaStream().then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  peer.on("call", (call) => {
    call.answer(stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on("user-connected", (peerId) => {
    //when a new user/participant connects
    connectToNewUser(peerId, stream, peers, peer);
  });

  let inputMssg = $("input");
  $("html").keydown((e) => {
    if (e.which == 13 && inputMssg.val().length !== 0) {
      console.log("Sending message with SPACE_ID:", SPACE_ID); // Log SPACE_ID
      socket.emit("message", inputMssg.val(), SPACE_ID); // Send SPACE_ID along with the message
      inputMssg.val("");
    }
  });

  socket.on("create-message", (message, username, messageSpaceId) => {
    if (messageSpaceId === SPACE_ID) {
      // Check if messageSpaceId matches SPACE_ID
      $("ul").append(
        `<li class="message">${username}<br/><br/>${message}</li>`
      );
      scrollToBottom();
    }
  });
});

socket.on("connect", () => {
  let username = prompt("Enter name: ");
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
    call.answer(stream); // Answers the call with an A/V stream.
    const video = document.createElement("video");
    call.on("stream", function (remoteStream) {
      addVideoStream(video, remoteStream);
    });
  });
});

document
  .getElementById("mute-button")
  .addEventListener("click", () => muteMic(myVideoStream));
document
  .getElementById("video-button")
  .addEventListener("click", () => stopVideo(myVideoStream));

import { addVideoStream, getUserMediaStream } from "./mediaStream.js";
import { connectToNewUser } from "./peerConnection.js";
import { scrollToBottom } from "./spaceHelpers.js";
import { muteMic, stopVideo } from "./spaceButtons.js";
const socket = io();
const myVideo = document.createElement("video");
const SPACE_ID = "<%= spaceId %>";

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

  socket.on("user-connected", (userId) => {
    //when a new user/participant connects
    connectToNewUser(userId, stream, peers, peer);
  });

  let inputMssg = $("input");
  $("html").keydown((e) => {
    if (e.which == 13 && inputMssg.val().length !== 0) {
      socket.emit("message", inputMssg.val());
      inputMssg.val("");
    }
  });

  socket.on("createMessage", (message, userId) => {
    console.log("this is coming from server:  " + message);
    $("ul").append(`<li class="message">${userId}<br/><br/>${message}</li>`);
    scrollToBottom();
  });
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  //RENDERING CONCRETE SPACE ID
  socket.emit("join-space", SPACE_ID, id);
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

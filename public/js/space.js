const socket = io();
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const configuration = {
  iceServers: [
    {
      urls: ["stun:bn-turn1.xirsys.com"],
    },
    {
      username:
        "cGWtB0oCXpelZRG2qHeb7kjCMDzBh_0ou-vJnlodd4DiQ9Bz297BXKt8iBJ9x5H9AAAAAGDsU5htYW5pa2FqYWluMTE=",
      credential: "a52324b0-e31e-11eb-86f2-0242ac140004",
      urls: ["turn:bn-turn1.xirsys.com:80?transport=udp"],
    },
  ],
};

let peer = new Peer();

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "5000",
});

const peers = {};

let myVideoStream; //to stream video of the participant

let getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

//VIDEO AND AUDIO TOGGLING OPTIONS
navigator.mediaDevices
  .getUserMedia({
    video: true, 
    audio: true, 
  })
  .then((stream) => {
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
            connectToNewUser(userId, stream);
        });
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

//RENDERING UNIQUE ROOM-ID
peer.on("open", (id) => {
    socket.emit("join-space", SPACE_ID, id);
});


//VIDEO RENDERING FOR MULTIPLE PARTICIPANTS
peer.on("call", function (call) {
getUserMedia(
    { video: true, audio: true },
    function (stream) {
    call.answer(stream); // Answers the call with an A/V stream.
    const video = document.createElement("video");
    call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
    });
    },
    function (err) {
    console.log("Failed to get local stream", err); //condition if the video fails to load
    }
);
});
/*         CONNECTING TO A NEW USER                    */
const connectToNewUser = (userId, stream) => {
	const call = peer.call(userId, stream);
	const video = document.createElement('video');
	call.on('stream', (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	})
	call.on('close', () => {
		video.remove();
	})

	peers[userId] = call;
};

//streaming video
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};
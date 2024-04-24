import { addVideoStream } from "./mediaStream.js";
let screenSharing = false;

export const muteMic = (stream) => {
  let enabled = stream.getAudioTracks()[0].enabled;
  if (enabled) {
    stream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    stream.getAudioTracks()[0].enabled = true;
  }
};

const setUnmuteButton = () => {
  const html = `<i class="material-icons disabled-button-element">mic_off</i><span>Unmute</span>`;
  $("#mute-button").html(html);
};

const setMuteButton = () => {
  const html = `<i class="material-icons">mic</i><span>Mute</span>`;
  $("#mute-button").html(html);
};

export const stopVideo = (stream) => {
  let enabled = stream.getVideoTracks()[0].enabled;
  if (enabled) {
    stream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    stream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `<i class="material-icons">videocam</i><span>Stop Video</span>`;
  $("#video-button").html(html);
};

const setPlayVideo = () => {
  const html = `<i class="material-icons disabled-button-element">videocam_off</i><span>Play Video</span>`;
  $("#video-button").html(html);
};
// у мен евідсутній currentPeer
export const shareScreen = (currentPeers, username, peer, socket) => {
  if (screenSharing) {
    stopScreenSharing(username, socket);
    screenSharing = false;
    setShare();
    return;
  }
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
    .then((stream) => {
      let videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = function () {
        stopScreenSharing(username, socket);
        screenSharing = false;
        setShare();
      };

      const videoPlaceholder = document.createElement("div");
      videoPlaceholder.id = `peer-${username}-presentation`;
      const video = document.createElement("video");

      currentPeers.forEach((currentPeer) => {
        const call = peer.call(currentPeer.peer, stream, {
          metadata: {
            videoTitle: `${username} stream`,
            placeholderId: `peer-${username}-presentation`,
            type: "presentation",
          },
        });
      });
      addVideoStream(
        video,
        stream,
        "📹 My stream",
        `peer-${username}-presentation`,
        videoPlaceholder
      );
      setStopShare();
      screenSharing = true;
    });
};

const stopScreenSharing = (username, socket) => {
  let videoPlaceholder = document.getElementById(
    `peer-${username}-presentation`
  );
  videoPlaceholder.remove();
  socket.emit("removal-element", `peer-${username}-presentation`);
};

const setShare = () => {
  const html = `<i class="material-icons">present_to_all</i>
              <span>Present</span>`;
  $("#share-screen").html(html);
};

const setStopShare = () => {
  const html = `<i class="material-icons disabled-button-element">stop_screen_share</i>
              <span>Stop Presenting</span>`;
  $("#share-screen").html(html);
};

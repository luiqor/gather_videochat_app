import { addVideoStream } from "./mediaStream.js";
let screenStream;
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
export function shareScreen(stream, peer, currentPeer) {
  if (screenSharing) {
    stopScreenSharing(stream); // Pass the local stream as an argument
  }

  navigator.mediaDevices
    .getDisplayMedia({ video: true })
    .then((screenStream) => {
      let videoTrack = screenStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        stopScreenSharing(stream); // Pass the local stream as an argument
      };

      if (peer) {
        let sender = currentPeer.peerConnection.getSenders().find(function (s) {
          return s.track.kind == videoTrack.kind;
        });
        sender.replaceTrack(videoTrack);
        screenSharing = true;
      }

      console.log(screenStream);
    });
}

function stopScreenSharing(localStream) {
  if (!screenSharing) return;
  let videoTrack = localStream.getVideoTracks()[0];

  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find(function (s) {
      return s.track.kind == videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }

  screenStream.getTracks().forEach(function (track) {
    track.stop();
  });

  screenSharing = false;
}

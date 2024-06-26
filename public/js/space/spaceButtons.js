import { addVideoStream } from "./mediaStream.js";
import { sendMessage } from "./spaceHelpers.js";
let isSharingScreen = false;
let isRecording = false;
let videoSharing;
let mediaRecorder;

export const createSendButton = (inputMssg, socket) => {
  let container = document.querySelector(".space-chat__input-container");
  if (inputMssg.value !== "") {
    if (!container.querySelector(".accent-button")) {
      let button = document.createElement("button");
      button.className = "accent-button";
      button.id = "send-button";

      let icon = document.createElement("i");
      icon.className = "material-icons";
      icon.textContent = "send";

      button.appendChild(icon);
      container.appendChild(button);

      button.addEventListener("click", () => {
        sendMessage(inputMssg, socket);
        container.removeChild(button);
      });
    }
  } else {
    let button = container.querySelector(".accent-button");
    if (button) {
      container.removeChild(button);
    }
  }
};

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

export const shareScreen = async (currentPeers, username, peer, socket) => {
  if (isSharingScreen) {
    videoSharing.onended();
    return;
  }

  let stream = await setStream();
  videoSharing = stream.getVideoTracks()[0];
  videoSharing.onended = async function () {
    videoSharing.stop();
    await stopScreenSharing(username, socket);
    isSharingScreen = false;
    setShare();
  };

  const videoPlaceholder = document.createElement("div");
  videoPlaceholder.id = `peer-${username}-presentation`;
  const video = document.createElement("video");

  currentPeers.forEach((currentPeer) => {
    callPeerPresentation(peer, currentPeer, stream, username);
  });

  addVideoStream(
    video,
    stream,
    "📹 My stream",
    `peer-${username}-presentation`,
    videoPlaceholder
  );

  setStopShare();
  isSharingScreen = true;
};

const callPeerPresentation = (peer, currentPeer, stream, username) => {
  const call = peer.call(currentPeer.peer, stream, {
    metadata: {
      videoTitle: `${username}'s stream`,
      placeholderId: `peer-${username}-presentation`,
      type: "presentation",
    },
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
  $("#share-screen-button").html(html);
};

const setStopShare = () => {
  const html = `<i class="material-icons disabled-button-element">stop_screen_share</i>
              <span>Stop Presenting</span>`;
  $("#share-screen-button").html(html);
};

const setStream = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "always",
    },
    audio: true,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
    },
  });
  return stream;
};

export const recordSpace = async () => {
  if (isRecording) {
    mediaRecorder.stop();
    return;
  }
  const stream = await setStream();
  const mimeType = "video/webm";
  mediaRecorder = await createRecorder(stream, mimeType);
  setStopRecordSpace();
  isRecording = true;
};

const combineStreamMic = (stream, micStream) => {
  let combinedStream = new MediaStream();

  stream.getVideoTracks().forEach((track) => {
    combinedStream.addTrack(track);
  });

  micStream.getAudioTracks().forEach((track) => {
    combinedStream.addTrack(track);
  });

  let mediaRecorder = new MediaRecorder(combinedStream);

  return mediaRecorder;
};

const createRecorder = async (stream, mimeType) => {
  let recordedChunks = [];

  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  let mediaRecorder = combineStreamMic(stream, micStream);

  mediaRecorder.onstop = function () {
    setRecordSpace();
    isRecording = false;
    saveFile(recordedChunks);
    recordedChunks = [];
  };
  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  stream.getTracks().forEach((track) => {
    track.onended = function () {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  });
  mediaRecorder.start(200);
  return mediaRecorder;
};

function saveFile(recordedChunks) {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  let date = new Date();
  let filename = date.toISOString().replace(/:/g, "-");
  let downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${filename}.webm`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(blob); // clear from memory
  document.body.removeChild(downloadLink);
}

const setRecordSpace = () => {
  const html = `<i class="material-icons">radio_button_unchecked</i>
              <span>Record</span>`;
  $("#record-button").html(html);
};

const setStopRecordSpace = () => {
  const html = `<i class="material-icons disabled-button-element">radio_button_checked</i>
              <span>Recording...</span>`;
  $("#record-button").html(html);
};

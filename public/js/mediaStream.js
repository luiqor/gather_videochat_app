const videoGrid = $("#video-grid");

// Keep track of processed streams
const processedStreams = new Set();

export const addVideoStream = (video, stream, username) => {
  if (!stream || processedStreams.has(stream.id)) {
    return;
  }
  processedStreams.add(stream.id);

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  createVideoPlaceholder(video, username);
};

export const getUserMediaStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
};

const createVideoPlaceholder = (video, username) => {
  const userTitle = document.createElement("p");
  userTitle.className = "video-user-title";
  if (username) userTitle.textContent = `${username}`;

  const videoLabel = document.createElement("div");
  videoLabel.className = "video-label";
  videoLabel.appendChild(userTitle);

  const videoPlaceholder = document.createElement("div");
  videoPlaceholder.className = "video-holder";
  videoPlaceholder.appendChild(video);
  videoPlaceholder.appendChild(videoLabel);

  videoGrid.append(videoPlaceholder);
};

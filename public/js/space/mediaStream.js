const processedStreams = new Set();

export const addVideoStream = (
  video,
  stream,
  username,
  videoPlaceholderId,
  videoPlaceholder
) => {
  if (!stream || processedStreams.has(stream.id)) {
    return;
  }
  processedStreams.add(stream.id);

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  createVideoPlaceholder(video, username, videoPlaceholder, videoPlaceholderId);
};

export const getUserMediaStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
};

const createVideoPlaceholder = (
  video,
  username,
  videoPlaceholder,
  videoPlaceholderId
) => {
  const videoGrid = document.getElementById("video-grid");
  const userTitle = document.createElement("p");
  userTitle.className = "video-user-title";
  if (username) userTitle.textContent = `${username}`;

  const videoLabel = document.createElement("div");
  videoLabel.className = "video-label";
  videoLabel.appendChild(userTitle);
  if (!videoPlaceholder) videoPlaceholder = document.createElement("div");
  if (videoPlaceholderId) videoPlaceholder.id = videoPlaceholderId;
  else videoPlaceholder.id = `video-placeholder-${username}`;
  videoPlaceholder.className = "video-holder";
  videoPlaceholder.appendChild(video);
  videoPlaceholder.appendChild(videoLabel);

  videoGrid.append(videoPlaceholder);
};

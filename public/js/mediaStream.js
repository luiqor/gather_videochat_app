const videoGrid = $("#video-grid");

export const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  const div = document.createElement("div");
  div.className = "video-holder";
  div.appendChild(video);

  videoGrid.append(div);
};

export const getUserMediaStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
};

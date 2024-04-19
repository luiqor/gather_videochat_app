const videoGrid = document.getElementById("video-grid");


export const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};


export const getUserMediaStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
};
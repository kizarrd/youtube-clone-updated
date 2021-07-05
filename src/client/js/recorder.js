const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
    });
    video.srcObject = stream;
    video.play();
};

const handleStartBtnClick = () => {
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStartBtnClick);
    startBtn.addEventListener("click", handleStopBtnClick);
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
    };
    recorder.start();
};

const handleStopBtnClick = () => {
    startBtn.innerText = "Download Recording";
    startBtn.removeEventListener("click", handleStopBtnClick);
    startBtn.addEventListener("click", handleDownload);
    recorder.stop();
};

const handleDownload = () => {
    const anchor = document.createElement("a");
    anchor.href = videoFile;
    anchor.download = "MyRecording.webm";
    document.body.appendChild(anchor);
    anchor.click();
};

init();

startBtn.addEventListener("click", handleStartBtnClick);
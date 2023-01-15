const $ = document.querySelector.bind(document);
const getID = document.getElementById.bind(document);

const APP_ID = "d0330bcb47304935aa9705e5ba000ed8";
const TOKEN =
  "007eJxTYMhWOi3/fmdbxwy99bdbZyw9vSnrz9Ek618J/V+4LplbucxXYEgxMDY2SEpOMjE3NjCxNDZNTLQ0NzBNNU1KNDAwSE2xCJx5KLkhkJHBrVGGkZEBAkF8bgbnxIKSxMy8MMe8DAYGAMp9Ix4=";
const CHANNEL = "CaptainVAnh";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);

  client.on("user-left", handleUserLeft);

  let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  getID("join-btn").style.display = "none";
  getID("stream-controls").style.display = "flex";
  await localTracks[1].setMuted(true);
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = getID(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  getID(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  getID("join-btn").style.display = "flex";
  getID("stream-controls").style.display = "none";
  getID("video-streams").innerHTML = "";
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    $(".mic-btn").classList.remove("off");
  } else {
    await localTracks[0].setMuted(true);
    $(".mic-btn").classList.add("off");
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    $(".camera-btn").classList.remove("off");
  } else {
    await localTracks[1].setMuted(true);
    $(".camera-btn").classList.add("off");
  }
};

getID("join-btn").addEventListener("click", joinStream);
$(".leave-btn").addEventListener("click", leaveAndRemoveLocalStream);
$(".mic-btn").addEventListener("click", toggleMic);
$(".camera-btn").addEventListener("click", toggleCamera);

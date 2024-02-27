var video = document.querySelector("#video");
var canvas = document.querySelector("#canvas");
var file = document.querySelector("#videofile");
var videoControls = document.querySelector("#videoControls");
var videow = document.querySelector("#videow");
var snap = document.querySelector("#snap");
var save = document.querySelector("#save");
var videoInfo = document.querySelector("#videoInfo");
var snapSize = document.querySelector("#snapsize");
var context = canvas.getContext("2d");
var slider = document.querySelector("#slider");
var w, h, ratio;
//add loadedmetadata which will helps to identify video attributes
const ALL_NAMES = [];

function timeUpdate() {
  slider.setAttribute("max", Math.ceil(video.duration));
  slider.value = video.currentTime;
  videoInfo.style.display = "block";
  videoInfo.innerHTML = [
    "Video size: " + video.videoWidth + "x" + video.videoHeight,
    "Video length: " + Math.round(video.duration * 10) / 10 + "sec",
    "Playback position: " + Math.round(video.currentTime * 10) / 10 + "sec",
  ].join("<br>");
}

function goToTime(video, time) {
  video.currentTime = Math.min(video.duration, Math.max(0, time));
  timeUpdate();
}

video.addEventListener("timeupdate", timeUpdate);

video.addEventListener(
  "loadedmetadata",
  function () {
    console.log("Metadata loaded");
    videow.value = video.videoWidth;
    videoInfo.innerHTML = [
      "Video size: " + video.videoWidth + "x" + video.videoHeight,
      "Video length: " + Math.round(video.duration * 10) / 10 + "sec",
    ].join("<br>");
    video.objectURL = false;
    video.play();
    video.pause();
    resize();
  },
  false
);

function resize() {
  ratio = video.videoWidth / video.videoHeight;
  w = videow.value;
  h = parseInt(w / ratio, 10);
  canvas.width = w;
  canvas.height = h;
}

function snapPicture() {
  context.fillRect(0, 0, w, h);
  context.drawImage(video, 0, 0, w, h);
  snapSize.innerHTML = w + "x" + h;
}

function selectVideo() {
  file.click();
}

function loadVideoFile(fileInput) {
  if (!fileInput) {
    fileInput = file.files[0];
  }
  if (fileInput) {
    console.log("Loading...");
    console.log(fileInput);
    /*
    var reader  = new FileReader();
    reader.addEventListener("error", function () {
      console.log("Error loading video data");
    });
    reader.addEventListener('progress',function(ev){
      console.log("progress", ev.loaded, ev.total, Math.round(ev.loaded*100.0/ev.total));
    });
    reader.addEventListener("load", function () {
        console.log("Video data loaded");
        video.preload="metadata";
        video.src = reader.result;
      }, false);
    reader.readAsDataURL(fileInput);
    */
    if (video.objectURL && video.src) {
      URL.revokeObjectURL(video.src);
    }
    video.pleload = "metadata";
    video.objectURL = true;
    video.src = URL.createObjectURL(fileInput);
    videow.removeAttribute("readonly");
    snap.disabled = false;
    save.disabled = false;
    videoControls.style.display = "";
  }
}

function loadVideoURL(url) {
  video.preload = "metadata";
  video.src = url;
  videow.removeAttribute("readonly");
  snap.disabled = false;
  save.disabled = false;
}

function savePicture(fileName) {
  return new Promise((resolve, reject) => {
    // btn.disabled = true;
    var dataURL = canvas.toDataURL();
    var link = document.getElementById("imagelink");
    link.style.display = "";
    link.style.opacity = 0;
    link.href = dataURL;
    var rnd = Math.round(Math.random() * 10000);
    link.setAttribute("download", fileName + ".jpg");
    link.click();
    setTimeout(function () {
      // btn.disabled = false;
      link.style.display = "none";
      resolve();
    }, 100);
  });
}

window.addEventListener("load", function () {
  var buttons = document.querySelectorAll("button");
  for (let index = 0; index < buttons.length; index++) {
    var element = buttons[index];
    element.addEventListener("click", function () {
      var name = this.innerText.trim();
      var category = "button";
      if (this.getAttribute("category") == "controls") {
        name = "Video Controls";
        category = "controls";
      }
      var id = name.toLowerCase().replace(" ", "_");
      gtag("event", category + "-" + id, {});
    });
  }
});

async function start() {
  // ALL_NAMES.forEach(async (name) => {
  for (let i = 0; i < ALL_NAMES.length; i++) {
    const name = ALL_NAMES[i];
    const res = await fetch(`assets/${name}.mp4`)
      .then((response) => {
        console.log(response);
        return response.blob();
      })
      .then((blob) => {
        return loadVideoFile(blob);
      })
      .then(async () => {
        await sleep();
        return snapPicture();
      })
      .then(async () => {
        await sleep();
        return savePicture(name);
      });
  }
  // });

  //  for (var i = 0; i < jsons.length; i++) {
  //    zip.file(languages[i] + ".json", jsons[i]);
  //  }

  // zip.generateAsync({ type: "blob" }).then(function (content) {
  // fileSaver.saveAs(content, "thumbs.zip");
  // });
}

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

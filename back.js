console.log("script.js file is loaded");

const videoElement = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const canvasElement = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const shirtImageContainer = document.getElementById('shirtImageContainer');
const wearShirtButton = document.getElementById('wearShirtButton');
const wearShirtContainer = document.getElementById('wearShirtContainer');

const shirtDatabase = {
  'ABC123': "image/Shirt_1.png",
  'DEF456': "image/Shirt_2.png",
  'GHI789': "image/Shirt_3.png",
  'JKL123': "image/Shirt_4.png",
  'MNO456': "image/Shirt_5.png",
  'PMC123': "image/Shirt_6.png",
  'DFG456': "image/Shirt_7.png"
};

let selectedShirtUrl = '';
let poseLandmarks = null;

// Access webcam
async function startCamera() {
  try {
    console.log("Starting camera...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  } catch (err) {
    console.error("Error accessing webcam: ", err);
  }
}

// Pose Detection
async function initPoseDetection() {
  const pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.4/${file}`
  });

  pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  pose.onResults((results) => {
    if (results.poseLandmarks) {
      poseLandmarks = results.poseLandmarks;
      console.log("Pose detected", poseLandmarks);
    } else {
      poseLandmarks = null;
    }
  });

 
}

// Capture photo
captureButton.addEventListener('click', () => {
  if (videoElement && canvasElement) {
    const width = 640;
    const height = 480;
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, width, height);
    const photoDataURL = canvasElement.toDataURL('image/jpeg', 0.6);
    capturedImage.src = photoDataURL;
    capturedImage.style.display = 'block';
    videoElement.style.display = 'none';
    captureButton.style.display = 'none';
  } else {
    console.error("Video or canvas not found");
  }
});

// Handle shirt selection
document.getElementById('shirtForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const shirtCode = document.getElementById('shirtCode').value.trim();
  shirtImageContainer.innerHTML = '';

  if (shirtDatabase[shirtCode]) {
    const img = document.createElement('img');
    img.src = shirtDatabase[shirtCode];
    img.alt = 'Shirt Image';
    shirtImageContainer.appendChild(img);
    selectedShirtUrl = shirtDatabase[shirtCode];
    wearShirtButton.style.display = 'block';
  } else {
    shirtImageContainer.innerHTML = '<p>Shirt not found. Please enter a valid code.</p>';
    wearShirtButton.style.display = 'none';
  }
});

// Wear shirt on body using shoulder detection
wearShirtButton.addEventListener('click', () => {
  if (selectedShirtUrl && capturedImage.src) {
    const personImage = capturedImage;
    const shirtImg = new Image();
    shirtImg.src = selectedShirtUrl;

    shirtImg.onload = function () {
      const personCanvas = document.createElement('canvas');
      const ctx = personCanvas.getContext('2d');
      personCanvas.width = personImage.width;
      personCanvas.height = personImage.height;

      // Draw captured image first
      ctx.drawImage(personImage, 0, 0, personCanvas.width, personCanvas.height);

      let shirtWidth = personCanvas.width * 0.6;
      let shirtHeight = shirtImg.height * (shirtWidth / shirtImg.width);
      let shirtX = (personCanvas.width - shirtWidth) / 2;
      let shirtY = personCanvas.height * 0.3;

      // Default message
      let errorMessage = "";

      // Use pose if available and reliable
      if (poseLandmarks && poseLandmarks.length >= 13) {
        const leftShoulder = poseLandmarks[11];
        const rightShoulder = poseLandmarks[12];

        // Confidence check (visibility between 0 and 1)
        if (leftShoulder.visibility > 0.5 && rightShoulder.visibility > 0.5) {
          const x1 = leftShoulder.x * personCanvas.width;
          const y1 = leftShoulder.y * personCanvas.height;
          const x2 = rightShoulder.x * personCanvas.width;
          const y2 = rightShoulder.y * personCanvas.height;

          const shoulderDistance = Math.abs(x2 - x1);
          shirtWidth = shoulderDistance * 2;
          shirtHeight = shirtImg.height * (shirtWidth / shirtImg.width);
          shirtX = Math.min(x1, x2) - (shirtWidth - shoulderDistance) / 2;
          shirtY = (y1 + y2) / 2 - shirtHeight * 0.25;
        } else {
          errorMessage = "Take proper image: shoulders not clearly visible.";
        }
      } 
      

      // Draw the shirt
      ctx.drawImage(shirtImg, shirtX, shirtY, shirtWidth, shirtHeight);
      const finalImageDataURL = personCanvas.toDataURL('image/jpeg', 0.8);
      const resultImg = new Image();
      resultImg.src = finalImageDataURL;

      resultImg.onload = function () {
        wearShirtContainer.innerHTML = '';
        wearShirtContainer.appendChild(resultImg);
      };
    };
  }
});

// Init
window.onload = () => {
  startCamera();
  initPoseDetection();
};

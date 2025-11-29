console.log("script.js file is loaded");

const videoElement = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const canvasElement = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const shirtImageContainer = document.getElementById('shirtImageContainer');
const wearShirtButton = document.getElementById('wearShirtButton');
const wearShirtContainer = document.getElementById('wearShirtContainer');

// Shirt selection logic (URLs of shirt images stored locally)
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

// Access user's webcam and start video feed
async function startCamera() {
  try {
    console.log("Starting camera...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
  } catch (err) {
    console.error("Error accessing webcam: ", err);
  }
}

// Capture the photo when the button is clicked
if (captureButton) {
  captureButton.addEventListener('click', () => {
    console.log("Capture button clicked");
    if (videoElement && canvasElement) {
      // Resize the canvas for smaller resolution to reduce image size
      const desiredWidth = 640; // Set a desired smaller width
      const desiredHeight = 480; // Set a desired smaller height
      canvasElement.width = desiredWidth;
      canvasElement.height = desiredHeight;
      const ctx = canvasElement.getContext('2d');

      // Draw the captured video frame to the smaller canvas
      ctx.drawImage(videoElement, 0, 0, desiredWidth, desiredHeight);

      // Compress the image by converting the canvas to a data URL with lower quality
      const photoDataURL = canvasElement.toDataURL('image/jpeg', 0.6); // 0.6 is the quality (0 to 1)
      
      capturedImage.src = photoDataURL;
      capturedImage.style.display = 'block';
      videoElement.style.display = 'none';
      captureButton.style.display = 'none';
      console.log("Captured Image Data URL:", photoDataURL);
    } else {
      console.error("Video or canvas element not found");
    }
  });
}

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
    console.log("Selected Shirt URL:", selectedShirtUrl);
  } else {
    shirtImageContainer.innerHTML = '<p>Shirt not found. Please enter a valid code.</p>';
    wearShirtButton.style.display = 'none';
  }
});

// Wear shirt on the captured person
if (wearShirtButton) {
  wearShirtButton.addEventListener('click', function () {
    if (selectedShirtUrl && capturedImage.src) {
      const personImage = capturedImage;
      const shirtImg = new Image();
      shirtImg.src = selectedShirtUrl;

      console.log("Wear Shirt Button clicked - selectedShirtUrl:", selectedShirtUrl, "capturedImage:", capturedImage.src);

      shirtImg.onload = function () {
        const personCanvas = document.createElement('canvas');
        const personCtx = personCanvas.getContext('2d');
        personCanvas.width = personImage.width;
        personCanvas.height = personImage.height;

        console.log("Person Canvas size:", personCanvas.width, personCanvas.height);

        // Draw the person's captured image on the canvas
        personCtx.drawImage(personImage, 0, 0, personCanvas.width, personCanvas.height);

        // Dynamically resize the shirt based on the captured photo dimensions
        const shirtWidth = personCanvas.width * 0.7; // Shirt takes 70% of the person's width
        const shirtHeight = shirtImg.height * (shirtWidth / shirtImg.width); // Maintain the aspect ratio
        const shirtX = (personCanvas.width - shirtWidth) / 2; // Center the shirt horizontally
        const shirtY = personCanvas.height * 0.3; // Position the shirt on the chest area (you may need to tweak this)

        // Draw the shirt onto the canvas
        personCtx.drawImage(shirtImg, shirtX, shirtY, shirtWidth, shirtHeight);

        // Compress the final image by resizing and lowering quality
        const finalImageDataURL = personCanvas.toDataURL('image/jpeg', 0.6); // Compress with lower quality
        const overlayImage = new Image();
        overlayImage.src = finalImageDataURL;

        console.log("Final Image Data URL:", finalImageDataURL);

        overlayImage.onload = function () {
          wearShirtContainer.innerHTML = '';
          wearShirtContainer.appendChild(overlayImage);
          console.log("Overlay image added to container");
        };
      };
    }
  });
}

// Start the webcam when the page loads
window.onload = startCamera;

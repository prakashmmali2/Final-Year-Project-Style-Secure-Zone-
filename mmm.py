import os
import cv2
import cvzone
import numpy as np


def list_cameras(max_tested=5):
    print("Scanning for cameras...")
    available_cameras = []
    for i in range(max_tested):
        cap = cv2.VideoCapture(i)
        if cap.read()[0]:
            print(f"[OK] Camera found at index {i}")
            available_cameras.append(i)
            cap.release()
        else:
            print(f"[NO] No camera at index {i}")
    return available_cameras

# List available cameras
cameras = list_cameras()
if not cameras:
    print("❌ No cameras detected!")
    exit()

# Choose the first detected camera or modify here to select another index
camera_index = cameras[0]
print(f"Using camera index: {camera_index}")

# Initialize webcam
cap = cv2.VideoCapture(camera_index)
if not cap.isOpened():
    print(f"❌ Cannot open camera at index {camera_index}")
    exit()

# Load shirts
shirt_folder = "image"  # Path to your shirt images
shirts = [f for f in os.listdir(shirt_folder) if f.endswith(".png")]

# Preload shirts with alpha channels
preloaded_shirts = []
for shirt_file in shirts:
    path = os.path.join(shirt_folder, shirt_file)
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is not None:
        if img.shape[2] == 3:  # No alpha channel
            img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
            img[:, :, 3] = 255  # Add full opacity
        preloaded_shirts.append(img)

if not preloaded_shirts:
    print("❌ No shirts found in the folder!")
    cap.release()
    exit()

shirt_index = 0
shirt_ratio = 581 / 440  # Height/width ratio of shirts

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
if face_cascade.empty():
    print("❌ Failed to load Haar Cascade for face detection.")
    cap.release()
    exit()

# ----------------------------- Main Loop -----------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame from webcam")
        break

    h, w, _ = frame.shape

    # Convert frame to grayscale for face detection
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    # If face is detected
    if len(faces) > 0:
        x, y, fw, fh = faces[0]
        neck_y = y + fh

        # Estimate shoulder width and shirt size
        shoulder_width = int(fw * 2.2)
        shirt_w = shoulder_width
        shirt_h = int(shirt_w * shirt_ratio)

        # Calculate shirt position
        shirt_x = x + fw // 2 - shirt_w // 2
        shirt_y = neck_y - int(shirt_h * 0.15)

        # Keep shirt within frame bounds
        shirt_x = max(0, min(shirt_x, w - shirt_w))
        shirt_y = max(0, min(shirt_y, h - shirt_h))

        # Resize and overlay the shirt
        shirt_img = preloaded_shirts[shirt_index]
        shirt_resized = cv2.resize(shirt_img, (shirt_w, shirt_h))
        frame = cvzone.overlayPNG(frame, shirt_resized, (shirt_x, shirt_y))

    # Show instructions
    cv2.putText(frame, "Press 'n' (next), 'p' (previous), 'q' (quit)", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Display the result
    cv2.imshow("👕 Virtual Try-On", frame)

    # Key handling
    key = cv2.waitKey(1)
    if key == ord('q'):
        print("🛑 Quitting...")
        break
    elif key == ord('n'):
        shirt_index = (shirt_index + 1) % len(preloaded_shirts)
    elif key == ord('p'):
        shirt_index = (shirt_index - 1) % len(preloaded_shirts)

# ----------------------------- Cleanup -----------------------------
cap.release()
cv2.destroyAllWindows()

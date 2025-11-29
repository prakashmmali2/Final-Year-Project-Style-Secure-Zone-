import os
import cv2
import cvzone
import numpy as np

# Initialize webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Cannot open camera")
    exit()



# Load shirts
shirt_folder = r"image"  # Path to your shirt images
shirts = [f for f in os.listdir(shirt_folder) if f.endswith(".png")]
preloaded_shirts = []
for s in shirts:
    img = cv2.imread(os.path.join(shirt_folder, s), cv2.IMREAD_UNCHANGED)
    if img is not None:
        if img.shape[2] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
            img[:, :, 3] = 255
        preloaded_shirts.append(img)

if not preloaded_shirts:
    print("No shirts found!")
    exit()

shirt_index = 0
shirt_ratio = 581 / 440

# Load face cascade
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    h, w, _ = frame.shape
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) > 0:
        x, y, fw, fh = faces[0]
        neck_y = y + fh
        shoulder_width = int(fw * 2.2)

        shirt_w = shoulder_width
        shirt_h = int(shirt_w * shirt_ratio)

        shirt_x = x + fw // 2 - shirt_w // 2
        shirt_y = neck_y - int(shirt_h * 0.15)

        shirt_x = max(0, min(shirt_x, w - shirt_w))
        shirt_y = max(0, min(shirt_y, h - shirt_h))

        shirt_img = preloaded_shirts[shirt_index]
        shirt_img = cv2.resize(shirt_img, (shirt_w, shirt_h))
        frame = cvzone.overlayPNG(frame, shirt_img, (shirt_x, shirt_y))

    cv2.imshow("Virtual Try-On", frame)

    key = cv2.waitKey(1)
    if key == ord("q"):
        break
    elif key == ord("n"):
        shirt_index = (shirt_index + 1) % len(preloaded_shirts)
    elif key == ord("p"):
        shirt_index = (shirt_index - 1) % len(preloaded_shirts)

cap.release()
cv2.destroyAllWindows()

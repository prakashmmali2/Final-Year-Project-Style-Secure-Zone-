import os
import cv2
import cvzone
from cvzone.PoseModule import PoseDetector


ip_camera_url = "http://192.168.0.101:8080/video"  # Replace with your phone stream
cap = cv2.VideoCapture(ip_camera_url)

if not cap.isOpened():
    print("Cannot open camera")
    exit()


shirt_folder = r"C:\Acadmic Achievement's as an Engineer\Final Year Project\Project_Code\image"
shirts = [f for f in os.listdir(shirt_folder) if f.endswith(".png")]

preloaded_shirts = []
for file in shirts:
    img = cv2.imread(os.path.join(shirt_folder, file), cv2.IMREAD_UNCHANGED)
    if img is not None and img.shape[2] == 4:
        preloaded_shirts.append(img)

if not preloaded_shirts:
    print("No transparent PNG shirts found!")
    exit()

shirt_index = 0


detector = PoseDetector()

while True:
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.resize(frame, (640, 480))
    frame = detector.findPose(frame)
    lmList = detector.findPosition(frame, draw=False)

    if lmList:
        # Shoulder landmarks (LEFT = 11, RIGHT = 12)
        left_shoulder = lmList[11]
        right_shoulder = lmList[12]

        shoulder_width = right_shoulder[0] - left_shoulder[0]
        shirt_width = abs(shoulder_width) * 2
        shirt_img = preloaded_shirts[shirt_index]

        # Maintain shirt aspect ratio
        ratio = shirt_img.shape[0] / shirt_img.shape[1]
        shirt_height = int(shirt_width * ratio)

        # Shirt position (align to shoulder midpoint)
        mid_x = (left_shoulder[0] + right_shoulder[0]) // 2
        top_y = left_shoulder[1] + 10

        x = mid_x - shirt_width // 2
        y = top_y

        shirt_resized = cv2.resize(shirt_img, (shirt_width, shirt_height))
        frame = cvzone.overlayPNG(frame, shirt_resized, [x, y])

    # UI instructions
    cv2.putText(frame, "Press N: Next  | P: Prev  | Q: Quit", (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.imshow("AI Virtual Try-On", frame)
    key = cv2.waitKey(1)

    if key == ord('q'):
        break
    if key == ord('n'):
        shirt_index = (shirt_index + 1) % len(preloaded_shirts)
    if key == ord('p'):
        shirt_index = (shirt_index - 1) % len(preloaded_shirts)

cap.release()
cv2.destroyAllWindows()

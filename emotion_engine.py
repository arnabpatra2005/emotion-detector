import os
import cv2
import numpy as np

from tensorflow.keras.models import load_model


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "emotion_model.hdf5"
)

CASCADE_PATH = os.path.join(
    BASE_DIR,
    "haarcascade_frontalface_default.xml"
)


# =========================================================
# EMOTION LABELS
# =========================================================

EMOTION_LABELS = [
    "Angry",
    "Disgust",
    "Fear",
    "Happy",
    "Sad",
    "Surprise",
    "Neutral"
]


# =========================================================
# LOAD MODEL
# =========================================================

print("Loading emotion model...")

emotion_model = load_model(
    MODEL_PATH,
    compile=False
)

print("Emotion model loaded successfully.")


# =========================================================
# LOAD FACE DETECTOR
# =========================================================

face_cascade = cv2.CascadeClassifier(
    CASCADE_PATH
)

if face_cascade.empty():
    raise FileNotFoundError(
        "Could not load Haar cascade:\n"
        + CASCADE_PATH
    )

print("Face detector loaded successfully.")


# =========================================================
# DETECT + PREDICT
# =========================================================

def analyze_image(image):

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        minSize=(30, 30)
    )

    results = []

    for (x, y, w, h) in faces:

        face = gray[
            y:y + h,
            x:x + w
        ]

        try:

            face = cv2.resize(
                face,
                (64, 64)
            )

        except Exception:

            continue

        face = face.astype(
            "float32"
        ) / 255.0

        face = np.expand_dims(
            face,
            axis=-1
        )

        face = np.expand_dims(
            face,
            axis=0
        )

        prediction = emotion_model.predict(
            face,
            verbose=0
        )[0]

        probabilities = {
            EMOTION_LABELS[i]:
            float(prediction[i] * 100)
            for i in range(len(EMOTION_LABELS))
        }

        max_index = int(
            np.argmax(prediction)
        )

        emotion = EMOTION_LABELS[
            max_index
        ]

        confidence = float(
            prediction[max_index] * 100
        )

        results.append({

            "emotion": emotion,

            "confidence": confidence,

            "probabilities": probabilities,

            "box": {
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)
            }

        })

    return results
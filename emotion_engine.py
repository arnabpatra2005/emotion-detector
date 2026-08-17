import os
import time

# =========================================================
# LIMIT TENSORFLOW CPU USAGE
# =========================================================

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"

import cv2
import numpy as np

from tensorflow.keras.models import load_model


# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

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
# LOAD MODEL ONCE
# =========================================================

print("Loading emotion model...")

emotion_model = load_model(
    MODEL_PATH,
    compile=False
)

print("Emotion model loaded successfully.")


# =========================================================
# WARM UP MODEL
# =========================================================

print("Warming up emotion model...")

dummy_face = np.zeros(
    (1, 64, 64, 1),
    dtype=np.float32
)

try:

    emotion_model(
        dummy_face,
        training=False
    )

    print(
        "Emotion model warm-up completed."
    )

except Exception as e:

    print(
        "Model warm-up warning:",
        e
    )


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

print(
    "Face detector loaded successfully."
)


# =========================================================
# RESIZE IMAGE FOR FASTER PROCESSING
# =========================================================

def prepare_image(image):

    height, width = image.shape[:2]

    max_width = 640

    if width > max_width:

        scale = max_width / width

        new_width = max_width

        new_height = int(
            height * scale
        )

        image = cv2.resize(
            image,
            (
                new_width,
                new_height
            ),
            interpolation=cv2.INTER_AREA
        )

    return image


# =========================================================
# DETECT + PREDICT
# =========================================================

def analyze_image(image):

    if image is None:
        return []

    # =====================================================
    # IMAGE PREPARATION
    # =====================================================

    start_time = time.time()

    image = prepare_image(image)

    print(
        f"Image preparation: "
        f"{time.time() - start_time:.3f}s"
    )


    # =====================================================
    # GRAYSCALE
    # =====================================================

    gray_start = time.time()

    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY
    )

    print(
        f"Grayscale conversion: "
        f"{time.time() - gray_start:.3f}s"
    )


    # =====================================================
    # FACE DETECTION
    # =====================================================

    detect_start = time.time()

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=5,
        minSize=(40, 40)
    )

    print(
        f"Face detection: "
        f"{time.time() - detect_start:.3f}s"
    )

    print(
        f"Faces detected: {len(faces)}"
    )


    # =====================================================
    # RESULTS
    # =====================================================

    results = []


    # =====================================================
    # PROCESS EACH FACE
    # =====================================================

    for (x, y, w, h) in faces:

        try:

            # =============================================
            # CROP FACE
            # =============================================

            face = gray[
                y:y + h,
                x:x + w
            ]

            if face.size == 0:
                continue


            # =============================================
            # RESIZE TO MODEL INPUT
            # =============================================

            face = cv2.resize(
                face,
                (64, 64),
                interpolation=cv2.INTER_AREA
            )


            # =============================================
            # NORMALIZE
            # =============================================

            face = face.astype(
                np.float32
            ) / 255.0


            # =============================================
            # ADD CHANNEL DIMENSION
            # =============================================

            face = np.expand_dims(
                face,
                axis=-1
            )


            # =============================================
            # ADD BATCH DIMENSION
            # =============================================

            face = np.expand_dims(
                face,
                axis=0
            )


            # =============================================
            # TENSORFLOW INFERENCE
            # =============================================

            prediction_start = time.time()

            prediction = emotion_model(
                face,
                training=False
            ).numpy()[0]

            print(
                f"TensorFlow prediction: "
                f"{time.time() - prediction_start:.3f}s"
            )


            # =============================================
            # PROBABILITIES
            # =============================================

            probabilities = {

                EMOTION_LABELS[i]:
                float(
                    prediction[i] * 100
                )

                for i in range(
                    len(EMOTION_LABELS)
                )

            }


            # =============================================
            # BEST EMOTION
            # =============================================

            max_index = int(
                np.argmax(prediction)
            )

            emotion = EMOTION_LABELS[
                max_index
            ]

            confidence = float(
                prediction[max_index] * 100
            )


            # =============================================
            # RESULT
            # =============================================

            results.append({

                "emotion":
                    emotion,

                "confidence":
                    confidence,

                "probabilities":
                    probabilities,

                "box": {

                    "x":
                        int(x),

                    "y":
                        int(y),

                    "width":
                        int(w),

                    "height":
                        int(h)

                }

            })


        except Exception as e:

            print(
                "Face analysis error:",
                e
            )

            continue


    # =====================================================
    # TOTAL ANALYSIS TIME
    # =====================================================

    print(
        f"Total analysis time: "
        f"{time.time() - start_time:.3f}s"
    )

    return results
from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np

from emotion_engine import analyze_image


app = Flask(__name__)


# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def index():

    return render_template(
        "index.html"
    )


# =========================================================
# IMAGE ANALYSIS API
# =========================================================

@app.route("/analyze", methods=["POST"])
def analyze():

    if "image" not in request.files:

        return jsonify({
            "success": False,
            "error": "No image uploaded."
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "No image selected."
        }), 400

    try:

        file_bytes = np.frombuffer(
            file.read(),
            np.uint8
        )

        image = cv2.imdecode(
            file_bytes,
            cv2.IMREAD_COLOR
        )

        if image is None:

            return jsonify({
                "success": False,
                "error": "Could not read image."
            }), 400

        results = analyze_image(image)

        if not results:

            return jsonify({
                "success": False,
                "error": "No face detected."
            }), 200

        return jsonify({

            "success": True,

            "face_count": len(results),

            "faces": results,

            # Keep first face for compatibility
            "emotion": results[0]["emotion"],

            "confidence": results[0]["confidence"],

            "probabilities":
                results[0]["probabilities"],

            "face":
                results[0]["box"]

        })

    except Exception as e:

        print("ERROR:", e)

        return jsonify({

            "success": False,

            "error": str(e)

        }), 500

# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
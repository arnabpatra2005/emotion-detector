/* =========================================================
   AI EMOTION DETECTOR
   COMPLETE FRONTEND CONTROLLER
   UPLOAD + CAMERA + REAL-TIME ANALYSIS
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const imageInput =
    document.getElementById("imageInput");

const selectImageButton =
    document.getElementById("selectImageButton");

const uploadArea =
    document.getElementById("uploadArea");

const uploadContent =
    document.getElementById("uploadContent");

const previewContainer =
    document.getElementById("previewContainer");

const previewImage =
    document.getElementById("previewImage");

const removeButton =
    document.getElementById("removeButton");

const analyzeButton =
    document.getElementById("analyzeButton");

const errorMessage =
    document.getElementById("errorMessage");

const emptyResult =
    document.getElementById("emptyResult");

const resultsContent =
    document.getElementById("resultsContent");

const emotionName =
    document.getElementById("emotionName");

const emotionEmoji =
    document.getElementById("emotionEmoji");

const confidenceValue =
    document.getElementById("confidenceValue");

const confidenceText =
    document.getElementById("confidenceText");

const confidenceBar =
    document.getElementById("confidenceBar");

const probabilitiesContainer =
    document.getElementById("probabilitiesContainer");


/* =========================================================
   MODE BUTTONS
========================================================= */

const uploadModeButton =
    document.getElementById("uploadModeButton");

const cameraModeButton =
    document.getElementById("cameraModeButton");


/* =========================================================
   CAMERA ELEMENTS
========================================================= */

const cameraArea =
    document.getElementById("cameraArea");

const cameraVideo =
    document.getElementById("cameraVideo");

const cameraCanvas =
    document.getElementById("cameraCanvas");

const overlayCanvas =
    document.getElementById("overlayCanvas");

const cameraStatus =
    document.getElementById("cameraStatus");

const faceCountBadge =
    document.getElementById("faceCountBadge");

const cameraControls =
    document.getElementById("cameraControls");

const startCameraButton =
    document.getElementById("startCameraButton");

const stopCameraButton =
    document.getElementById("stopCameraButton");


/* =========================================================
   THEME ELEMENTS
========================================================= */

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const themeText =
    document.getElementById("themeText");


/* =========================================================
   VARIABLES
========================================================= */

let selectedFile = null;

let cameraStream = null;

let cameraAnalysisInterval = null;

let cameraAnalyzing = false;


/* =========================================================
   SMOOTHING
========================================================= */

let smoothedConfidence = null;

let smoothedProbabilities = {};

const SMOOTHING_FACTOR = 0.25;


/* =========================================================
   EMOTION EMOJIS
========================================================= */

const emotionEmojis = {

    Angry: "😡",

    Disgust: "🤢",

    Fear: "😨",

    Happy: "😊",

    Sad: "😢",

    Surprise: "😲",

    Neutral: "😐"

};


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "AI Emotion Detector initialized."
        );

        initializeTheme();

        initializeUpload();

        initializeModes();

        initializeCameraControls();

        initializeAnalyzeButton();

    }
);


/* =========================================================
   UPLOAD INITIALIZATION
========================================================= */

function initializeUpload() {

    /* -----------------------------------------
       SELECT IMAGE BUTTON
    ----------------------------------------- */

    if (selectImageButton && imageInput) {

        selectImageButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                imageInput.click();

            }
        );

    }


    /* -----------------------------------------
       IMAGE INPUT
    ----------------------------------------- */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            (event) => {

                const file =
                    event.target.files &&
                    event.target.files[0];

                if (!file) {

                    return;

                }

                handleSelectedFile(file);

            }
        );

    }


    /* -----------------------------------------
       REMOVE IMAGE
    ----------------------------------------- */

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                removeSelectedImage();

            }
        );

    }


    /* -----------------------------------------
       DRAG & DROP
    ----------------------------------------- */

    if (uploadArea) {

        uploadArea.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();

                uploadArea.classList.add(
                    "drag-over"
                );

            }
        );


        uploadArea.addEventListener(
            "dragleave",
            () => {

                uploadArea.classList.remove(
                    "drag-over"
                );

            }
        );


        uploadArea.addEventListener(
            "drop",
            (event) => {

                event.preventDefault();

                uploadArea.classList.remove(
                    "drag-over"
                );


                const file =
                    event.dataTransfer.files &&
                    event.dataTransfer.files[0];


                if (file) {

                    handleSelectedFile(file);

                }

            }
        );

    }

}


/* =========================================================
   HANDLE SELECTED FILE
========================================================= */

function handleSelectedFile(file) {

    hideError();


    /* -----------------------------------------
       Validate file
    ----------------------------------------- */

    if (!file.type.startsWith("image/")) {

        showError(
            "Please select a valid image."
        );

        return;

    }


    selectedFile = file;


    /* -----------------------------------------
       Preview
    ----------------------------------------- */

    const reader =
        new FileReader();


    reader.onload = function (event) {

        if (previewImage) {

            previewImage.src =
                event.target.result;

        }


        if (uploadContent) {

            uploadContent.style.display =
                "none";

        }


        if (previewContainer) {

            previewContainer.classList.add(
                "active"
            );

        }


        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }


        console.log(
            "Image selected:",
            file.name
        );

    };


    reader.onerror = function () {

        showError(
            "Could not read the selected image."
        );

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   REMOVE SELECTED IMAGE
========================================================= */

function removeSelectedImage() {

    selectedFile = null;


    if (imageInput) {

        imageInput.value = "";

    }


    if (previewImage) {

        previewImage.src = "";

    }


    if (previewContainer) {

        previewContainer.classList.remove(
            "active"
        );

    }


    if (uploadContent) {

        uploadContent.style.display =
            "block";

    }


    if (analyzeButton) {

        analyzeButton.disabled =
            true;

    }


    resetResults();

    hideError();


    console.log(
        "Image removed."
    );

}


/* =========================================================
   ANALYZE BUTTON
========================================================= */

function initializeAnalyzeButton() {

    if (!analyzeButton) {

        console.warn(
            "Analyze button not found."
        );

        return;

    }


    analyzeButton.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            hideError();


            /* -----------------------------------------
               CAMERA MODE
            ----------------------------------------- */

            if (cameraStream) {

                await analyzeCameraFrame();

                return;

            }


            /* -----------------------------------------
               UPLOAD MODE
            ----------------------------------------- */

            if (!selectedFile) {

                showError(
                    "Please select an image first."
                );

                return;

            }


            await analyzeFile(
                selectedFile
            );

        }
    );

}


/* =========================================================
   ANALYZE UPLOADED IMAGE
========================================================= */

async function analyzeFile(file) {

    hideError();


    if (!file) {

        showError(
            "Please select an image first."
        );

        return;

    }


    console.log(
        "Starting image analysis..."
    );


    if (analyzeButton) {

        analyzeButton.classList.add(
            "loading"
        );

        analyzeButton.disabled =
            true;

    }


    const formData =
        new FormData();


    formData.append(
        "image",
        file
    );


    try {

        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Server status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "API DATA:",
            data
        );


        if (!response.ok) {

            showError(
                data.error ||
                "Server error occurred."
            );

            return;

        }


        if (!data.success) {

            showError(
                data.error ||
                "No face detected."
            );

            return;

        }


        displayResults(data);

    }

    catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        showError(
            "Could not connect to the AI server."
        );

    }

    finally {

        if (analyzeButton) {

            analyzeButton.classList.remove(
                "loading"
            );


            analyzeButton.disabled =
                cameraStream
                    ? false
                    : !selectedFile;

        }

    }

}


/* =========================================================
   MODE INITIALIZATION
========================================================= */

function initializeModes() {

    /* -----------------------------------------
       UPLOAD MODE
    ----------------------------------------- */

    if (uploadModeButton) {

        uploadModeButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                switchToUploadMode();

            }
        );

    }


    /* -----------------------------------------
       CAMERA MODE
    ----------------------------------------- */

    if (cameraModeButton) {

        cameraModeButton.addEventListener(
            "click",
            async (event) => {

                event.preventDefault();

                await switchToCameraMode();

            }
        );

    }

}


/* =========================================================
   SWITCH TO UPLOAD MODE
========================================================= */

function switchToUploadMode() {

    hideError();

    stopCamera();


    if (uploadModeButton) {

        uploadModeButton.classList.add(
            "active"
        );

    }


    if (cameraModeButton) {

        cameraModeButton.classList.remove(
            "active"
        );

    }


    if (uploadArea) {

        uploadArea.style.display =
            "flex";

    }


    if (cameraArea) {

        cameraArea.classList.remove(
            "active"
        );

    }


    if (cameraControls) {

        cameraControls.classList.remove(
            "active"
        );

    }


    if (analyzeButton) {

        analyzeButton.style.display =
            "flex";

        analyzeButton.disabled =
            !selectedFile;

    }


    console.log(
        "Upload mode activated."
    );

}


/* =========================================================
   SWITCH TO CAMERA MODE
========================================================= */

async function switchToCameraMode() {

    hideError();


    if (uploadModeButton) {

        uploadModeButton.classList.remove(
            "active"
        );

    }


    if (cameraModeButton) {

        cameraModeButton.classList.add(
            "active"
        );

    }


    if (uploadArea) {

        uploadArea.style.display =
            "none";

    }


    if (cameraArea) {

        cameraArea.classList.add(
            "active"
        );

    }


    if (cameraControls) {

        cameraControls.classList.add(
            "active"
        );

    }


    if (analyzeButton) {

        analyzeButton.style.display =
            "flex";

        analyzeButton.disabled =
            true;

    }


    await startCamera();

}


/* =========================================================
   CAMERA CONTROLS INITIALIZATION
========================================================= */

function initializeCameraControls() {

    /* -----------------------------------------
       START CAMERA
    ----------------------------------------- */

    if (startCameraButton) {

        startCameraButton.addEventListener(
            "click",
            async (event) => {

                event.preventDefault();

                await startCamera();

            }
        );

    }


    /* -----------------------------------------
       STOP CAMERA
    ----------------------------------------- */

    if (stopCameraButton) {

        stopCameraButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                stopCamera();

            }
        );

    }

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

    hideError();


    /* -----------------------------------------
       Already running
    ----------------------------------------- */

    if (cameraStream) {

        console.log(
            "Camera already running."
        );

        return;

    }


    /* -----------------------------------------
       Browser support
    ----------------------------------------- */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showError(
            "Camera is not supported by this browser."
        );

        return;

    }


    try {

        console.log(
            "Requesting camera permission..."
        );


        cameraStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    video: {
                        facingMode: "user",

                        width: {
                            ideal: 640
                        },

                        height: {
                            ideal: 480
                        }
                    },

                    audio: false
                }
            );


        /* -----------------------------------------
           Attach stream
        ----------------------------------------- */

        if (cameraVideo) {

            cameraVideo.srcObject =
                cameraStream;


            await cameraVideo.play();

        }


        console.log(
            "Camera started successfully."
        );


        if (cameraStatus) {

            cameraStatus.innerHTML =
                `
                <span class="status-live-dot"></span>
                <span>Camera active</span>
                `;

        }


        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }


        resetRealtimeSmoothing();


        startRealtimeAnalysis();

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );


        cameraStream =
            null;


        if (cameraVideo) {

            cameraVideo.srcObject =
                null;

        }


        showError(
            "Camera access was denied or is unavailable."
        );

    }

}


/* =========================================================
   STOP CAMERA
========================================================= */

function stopCamera() {

    stopRealtimeAnalysis();


    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

    }


    cameraStream =
        null;


    if (cameraVideo) {

        cameraVideo.pause();

        cameraVideo.srcObject =
            null;

    }


    cameraAnalyzing =
        false;


    smoothedConfidence =
        null;


    smoothedProbabilities =
        {};


    resetRealtimeSmoothing();


    if (analyzeButton) {

        analyzeButton.disabled =
            true;

    }


    /* -----------------------------------------
       Clear overlay
    ----------------------------------------- */

    if (overlayCanvas) {

        const ctx =
            overlayCanvas.getContext(
                "2d"
            );


        if (ctx) {

            ctx.clearRect(
                0,
                0,
                overlayCanvas.width,
                overlayCanvas.height
            );

        }

    }


    /* -----------------------------------------
       Face badge
    ----------------------------------------- */

    if (faceCountBadge) {

        faceCountBadge.textContent =
            "👤 0 Faces";

    }


    /* -----------------------------------------
       Camera status
    ----------------------------------------- */

    if (cameraStatus) {

        cameraStatus.innerHTML =
            `
            <span class="status-live-dot"></span>
            <span>Camera stopped</span>
            `;

    }


    if (cameraArea) {

        cameraArea.classList.remove(
            "ai-detected"
        );

    }


    console.log(
        "Camera stopped."
    );

}


/* =========================================================
   CAPTURE CAMERA FRAME
========================================================= */

function captureCameraFrame() {

    if (
        !cameraStream ||
        !cameraVideo ||
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight ||
        !cameraCanvas
    ) {

        return null;

    }


    const maxWidth =
        480;


    const scale =
        Math.min(
            1,
            maxWidth /
            cameraVideo.videoWidth
        );


    cameraCanvas.width =
        Math.round(
            cameraVideo.videoWidth *
            scale
        );


    cameraCanvas.height =
        Math.round(
            cameraVideo.videoHeight *
            scale
        );


    const context =
        cameraCanvas.getContext(
            "2d"
        );


    if (!context) {

        return null;

    }


    context.drawImage(
        cameraVideo,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
    );


    return cameraCanvas;

}


/* =========================================================
   ANALYZE CAMERA FRAME
========================================================= */

async function analyzeCameraFrame() {

    if (
        !cameraStream ||
        cameraAnalyzing
    ) {

        return;

    }


    const canvas =
        captureCameraFrame();


    if (!canvas) {

        return;

    }


    cameraAnalyzing =
        true;


    try {

        const blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/jpeg",
                        0.85
                    );

                }
            );


        if (!blob) {

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "image",
            blob,
            "camera_frame.jpg"
        );


        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        console.log(
            "Camera result:",
            data
        );


        if (
            response.ok &&
            data.success
        ) {

            displayResults(data);

            drawFaceOverlay(data);


            if (cameraStatus) {

                cameraStatus.innerHTML =
                    `
                    <span class="status-live-dot"></span>
                    <span>AI Detecting</span>
                    `;

            }

        }

        else {

            drawFaceOverlay({
                faces: []
            });


            if (cameraStatus) {

                cameraStatus.innerHTML =
                    `
                    <span class="status-live-dot"></span>
                    <span>Searching for face...</span>
                    `;

            }

        }

    }

    catch (error) {

        console.error(
            "Camera analysis error:",
            error
        );

    }

    finally {

        cameraAnalyzing =
            false;

    }

}


/* =========================================================
   REAL-TIME CAMERA ANALYSIS
========================================================= */

function startRealtimeAnalysis() {

    stopRealtimeAnalysis();


    /* -----------------------------------------
       Analyze immediately
    ----------------------------------------- */

    analyzeCameraFrame();


    /* -----------------------------------------
       Analyze every 2 seconds
    ----------------------------------------- */

    cameraAnalysisInterval =
        setInterval(
            () => {

                if (
                    cameraStream &&
                    !cameraAnalyzing
                ) {

                    analyzeCameraFrame();

                }

            },
            2000
        );

}


/* =========================================================
   STOP REAL-TIME ANALYSIS
========================================================= */

function stopRealtimeAnalysis() {

    if (cameraAnalysisInterval) {

        clearInterval(
            cameraAnalysisInterval
        );


        cameraAnalysisInterval =
            null;

    }

}


/* =========================================================
   RESET REAL-TIME SMOOTHING
========================================================= */

function resetRealtimeSmoothing() {

    smoothedConfidence =
        null;


    smoothedProbabilities =
        {};

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(data) {

    console.log(
        "Displaying results:",
        data
    );


    /* -----------------------------------------
       Show result container
    ----------------------------------------- */

    if (emptyResult) {

        emptyResult.style.display =
            "none";

    }


    if (resultsContent) {

        resultsContent.style.display =
            "block";

        resultsContent.classList.add(
            "show"
        );

    }


    /* -----------------------------------------
       Emotion
    ----------------------------------------- */

    const emotion =
        data.emotion ||
        "Unknown";


    /* -----------------------------------------
       Confidence
    ----------------------------------------- */

    const rawConfidence =
        Number(
            data.confidence
        ) || 0;


    if (
        smoothedConfidence === null
    ) {

        smoothedConfidence =
            rawConfidence;

    }

    else {

        smoothedConfidence =
            smoothedConfidence +
            (
                rawConfidence -
                smoothedConfidence
            ) *
            SMOOTHING_FACTOR;

    }


    const confidence =
        smoothedConfidence;


    /* -----------------------------------------
       Emotion name
    ----------------------------------------- */

    if (emotionName) {

        emotionName.textContent =
            emotion;

    }


    /* -----------------------------------------
       Emotion emoji
    ----------------------------------------- */

    if (emotionEmoji) {

        emotionEmoji.textContent =
            emotionEmojis[emotion] ||
            "🙂";

    }


    /* -----------------------------------------
       Confidence value
    ----------------------------------------- */

    if (confidenceValue) {

        confidenceValue.textContent =
            confidence.toFixed(2) +
            "%";

    }


    if (confidenceText) {

        confidenceText.textContent =
            confidence.toFixed(2) +
            "%";

    }


    /* -----------------------------------------
       Confidence bar
    ----------------------------------------- */

    if (confidenceBar) {

        confidenceBar.style.width =
            Math.min(
                Math.max(
                    confidence,
                    0
                ),
                100
            ) +
            "%";

    }


    /* -----------------------------------------
       Probabilities
    ----------------------------------------- */

    if (
        data.probabilities &&
        typeof data.probabilities === "object"
    ) {

        const smoothed =
            {};


        Object.entries(
            data.probabilities
        ).forEach(
            ([name, rawValue]) => {

                const value =
                    Number(rawValue) || 0;


                if (
                    smoothedProbabilities[name] ===
                    undefined
                ) {

                    smoothedProbabilities[name] =
                        value;

                }

                else {

                    smoothedProbabilities[name] =
                        smoothedProbabilities[name] +
                        (
                            value -
                            smoothedProbabilities[name]
                        ) *
                        SMOOTHING_FACTOR;

                }


                smoothed[name] =
                    smoothedProbabilities[name];

            }
        );


        displayProbabilities(
            smoothed
        );

    }

}


/* =========================================================
   DISPLAY PROBABILITIES
========================================================= */

function displayProbabilities(
    probabilities
) {

    if (!probabilitiesContainer) {

        return;

    }


    probabilitiesContainer.innerHTML =
        "";


    const entries =
        Object.entries(
            probabilities
        );


    /* -----------------------------------------
       Highest first
    ----------------------------------------- */

    entries.sort(
        (a, b) =>
            Number(b[1]) -
            Number(a[1])
    );


    entries.forEach(
        ([emotion, value]) => {

            const numericValue =
                Number(value) || 0;


            /* -----------------------------------------
               Item
            ----------------------------------------- */

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "probability-item";


            /* -----------------------------------------
               Heading
            ----------------------------------------- */

            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "probability-heading";


            /* -----------------------------------------
               Emotion name
            ----------------------------------------- */

            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                emotion;


            /* -----------------------------------------
               Percentage
            ----------------------------------------- */

            const percentage =
                document.createElement(
                    "span"
                );


            percentage.className =
                "probability-value";


            percentage.textContent =
                numericValue.toFixed(2) +
                "%";


            heading.appendChild(
                name
            );


            heading.appendChild(
                percentage
            );


            /* -----------------------------------------
               Track
            ----------------------------------------- */

            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "probability-track";


            /* -----------------------------------------
               Fill
            ----------------------------------------- */

            const fill =
                document.createElement(
                    "div"
                );


            fill.className =
                "probability-fill";


            track.appendChild(
                fill
            );


            item.appendChild(
                heading
            );


            item.appendChild(
                track
            );


            probabilitiesContainer.appendChild(
                item
            );


            /* -----------------------------------------
               Animate
            ----------------------------------------- */

            requestAnimationFrame(
                () => {

                    fill.style.width =
                        Math.min(
                            Math.max(
                                numericValue,
                                0
                            ),
                            100
                        ) +
                        "%";

                }
            );

        }
    );

}


/* =========================================================
   RESET RESULTS
========================================================= */

function resetResults() {

    if (emptyResult) {

        emptyResult.style.display =
            "flex";

    }


    if (resultsContent) {

        resultsContent.classList.remove(
            "show"
        );


        resultsContent.style.display =
            "none";

    }


    if (emotionName) {

        emotionName.textContent =
            "—";

    }


    if (emotionEmoji) {

        emotionEmoji.textContent =
            "🙂";

    }


    if (confidenceBar) {

        confidenceBar.style.width =
            "0%";

    }


    if (confidenceValue) {

        confidenceValue.textContent =
            "0.00%";

    }


    if (confidenceText) {

        confidenceText.textContent =
            "0.00%";

    }


    if (probabilitiesContainer) {

        probabilitiesContainer.innerHTML =
            "";

    }


    smoothedConfidence =
        null;


    smoothedProbabilities =
        {};

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showError(message) {

    console.error(
        message
    );


    if (!errorMessage) {

        return;

    }


    errorMessage.textContent =
        message;


    errorMessage.classList.add(
        "show"
    );

}


function hideError() {

    if (!errorMessage) {

        return;

    }


    errorMessage.textContent =
        "";


    errorMessage.classList.remove(
        "show"
    );

}


/* =========================================================
   DRAW FACE DETECTION OVERLAY
========================================================= */

function drawFaceOverlay(data) {

    if (
        !overlayCanvas ||
        !cameraVideo
    ) {

        return;

    }


    const width =
        cameraVideo.videoWidth;


    const height =
        cameraVideo.videoHeight;


    if (!width || !height) {

        return;

    }


    overlayCanvas.width =
        width;


    overlayCanvas.height =
        height;


    const ctx =
        overlayCanvas.getContext(
            "2d"
        );


    if (!ctx) {

        return;

    }


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* -----------------------------------------
       Get faces
    ----------------------------------------- */

    let faces = [];


    if (
        data &&
        Array.isArray(data.faces)
    ) {

        faces =
            data.faces;

    }

    else if (
        data &&
        data.face
    ) {

        faces = [
            {
                emotion:
                    data.emotion,

                confidence:
                    data.confidence,

                box:
                    data.face
            }
        ];

    }


    /* -----------------------------------------
       Face count
    ----------------------------------------- */

    if (faceCountBadge) {

        faceCountBadge.textContent =
            `👤 ${faces.length} Face${
                faces.length === 1
                    ? ""
                    : "s"
            }`;

    }


    /* -----------------------------------------
       Detection state
    ----------------------------------------- */

    if (cameraArea) {

        if (faces.length > 0) {

            cameraArea.classList.add(
                "ai-detected"
            );

        }

        else {

            cameraArea.classList.remove(
                "ai-detected"
            );

        }

    }


    /* -----------------------------------------
       Draw faces
    ----------------------------------------- */

    faces.forEach(
        (face) => {

            if (!face.box) {

                return;

            }


            const box =
                face.box;


            const x =
                Number(box.x) || 0;


            const y =
                Number(box.y) || 0;


            const boxWidth =
                Number(box.width) || 0;


            const boxHeight =
                Number(box.height) || 0;


            const emotion =
                face.emotion ||
                data.emotion ||
                "Unknown";


            const rawConfidence =
                Number(
                    face.confidence ??
                    data.confidence
                ) || 0;


            const confidence =
                rawConfidence;


            /* -----------------------------------------
               Face box
            ----------------------------------------- */

            ctx.strokeStyle =
                "#8b5cf6";


            ctx.lineWidth =
                4;


            ctx.shadowColor =
                "rgba(139, 92, 246, 0.5)";


            ctx.shadowBlur =
                12;


            ctx.strokeRect(
                x,
                y,
                boxWidth,
                boxHeight
            );


            ctx.shadowBlur =
                0;


            /* -----------------------------------------
               Label
            ----------------------------------------- */

            const label =
                `${emotion} ${confidence.toFixed(1)}%`;


            ctx.font =
                "bold 16px Arial";


            const textWidth =
                ctx.measureText(
                    label
                ).width;


            const labelWidth =
                textWidth + 24;


            const labelHeight =
                34;


            let labelX =
                x;


            let labelY =
                y -
                labelHeight -
                8;


            if (labelY < 0) {

                labelY =
                    y + 8;

            }


            /* -----------------------------------------
               Label background
            ----------------------------------------- */

            ctx.fillStyle =
                "rgba(79, 70, 229, 0.92)";


            ctx.beginPath();


            if (
                typeof ctx.roundRect ===
                "function"
            ) {

                ctx.roundRect(
                    labelX,
                    labelY,
                    labelWidth,
                    labelHeight,
                    8
                );

            }

            else {

                ctx.rect(
                    labelX,
                    labelY,
                    labelWidth,
                    labelHeight
                );

            }


            ctx.fill();


            /* -----------------------------------------
               Label text
            ----------------------------------------- */

            ctx.fillStyle =
                "#ffffff";


            ctx.fillText(
                label,
                labelX + 12,
                labelY + 22
            );


            /* -----------------------------------------
               Corner markers
            ----------------------------------------- */

            drawCornerMarkers(
                ctx,
                x,
                y,
                boxWidth,
                boxHeight
            );

        }
    );

}


/* =========================================================
   FACE BOX CORNER MARKERS
========================================================= */

function drawCornerMarkers(
    ctx,
    x,
    y,
    width,
    height
) {

    const size =
        18;


    ctx.strokeStyle =
        "#22c55e";


    ctx.lineWidth =
        4;


    ctx.lineCap =
        "round";


    /* -----------------------------------------
       Top left
    ----------------------------------------- */

    ctx.beginPath();

    ctx.moveTo(
        x,
        y + size
    );

    ctx.lineTo(
        x,
        y
    );

    ctx.lineTo(
        x + size,
        y
    );

    ctx.stroke();


    /* -----------------------------------------
       Top right
    ----------------------------------------- */

    ctx.beginPath();

    ctx.moveTo(
        x + width - size,
        y
    );

    ctx.lineTo(
        x + width,
        y
    );

    ctx.lineTo(
        x + width,
        y + size
    );

    ctx.stroke();


    /* -----------------------------------------
       Bottom left
    ----------------------------------------- */

    ctx.beginPath();

    ctx.moveTo(
        x,
        y + height - size
    );

    ctx.lineTo(
        x,
        y + height
    );

    ctx.lineTo(
        x + size,
        y + height
    );

    ctx.stroke();


    /* -----------------------------------------
       Bottom right
    ----------------------------------------- */

    ctx.beginPath();

    ctx.moveTo(
        x + width - size,
        y + height
    );

    ctx.lineTo(
        x + width,
        y + height
    );

    ctx.lineTo(
        x + width,
        y + height - size
    );

    ctx.stroke();

}


/* =========================================================
   THEME INITIALIZATION
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            "emotionDetectorTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );


        updateThemeButton(
            true
        );

    }

    else {

        document.body.classList.remove(
            "dark-mode"
        );


        updateThemeButton(
            false
        );

    }


    /* -----------------------------------------
       Theme toggle
    ----------------------------------------- */

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                const isDark =
                    document.body.classList.toggle(
                        "dark-mode"
                    );


                localStorage.setItem(
                    "emotionDetectorTheme",
                    isDark
                        ? "dark"
                        : "light"
                );


                updateThemeButton(
                    isDark
                );

            }
        );

    }

}


/* =========================================================
   UPDATE THEME BUTTON
========================================================= */

function updateThemeButton(
    isDark
) {

    if (
        !themeIcon ||
        !themeText ||
        !themeToggle
    ) {

        return;

    }


    if (isDark) {

        themeIcon.textContent =
            "☀️";


        themeText.textContent =
            "Light";


        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

    }

    else {

        themeIcon.textContent =
            "🌙";


        themeText.textContent =
            "Dark";


        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );

    }

}
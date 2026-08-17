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
    document.getElementById(
        "probabilitiesContainer"
    );


/* =========================================================
   MODE BUTTONS
========================================================= */

const uploadModeButton =
    document.getElementById(
        "uploadModeButton"
    );

const cameraModeButton =
    document.getElementById(
        "cameraModeButton"
    );


/* =========================================================
   CAMERA ELEMENTS
========================================================= */

const cameraArea =
    document.getElementById(
        "cameraArea"
    );

const cameraVideo =
    document.getElementById(
        "cameraVideo"
    );

const cameraCanvas =
    document.getElementById(
        "cameraCanvas"
    );

const overlayCanvas =
    document.getElementById(
        "overlayCanvas"
    );

const cameraStatus =
    document.getElementById(
        "cameraStatus"
    );

const faceCountBadge =
    document.getElementById(
        "faceCountBadge"
    );    

const cameraControls =
    document.getElementById(
        "cameraControls"
    );

const startCameraButton =
    document.getElementById(
        "startCameraButton"
    );

const stopCameraButton =
    document.getElementById(
        "stopCameraButton"
    );


/* =========================================================
   VARIABLES
========================================================= */

let selectedFile = null;

let cameraStream = null;

let cameraAnalysisInterval = null;

let cameraAnalyzing = false;


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
   SELECT IMAGE
========================================================= */

if (selectImageButton) {

    selectImageButton.addEventListener(
        "click",
        () => {

            imageInput.click();

        }
    );

}


/* =========================================================
   IMAGE SELECTED
========================================================= */

if (imageInput) {

    imageInput.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];

            if (!file) {
                return;
            }

            handleSelectedFile(file);

        }
    );

}


/* =========================================================
   HANDLE SELECTED FILE
========================================================= */

function handleSelectedFile(file) {

    hideError();

    if (!file.type.startsWith("image/")) {

        showError(
            "Please select a valid image."
        );

        return;
    }

    selectedFile = file;

    const reader =
        new FileReader();

    reader.onload = function(event) {

        previewImage.src =
            event.target.result;

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

    };

    reader.readAsDataURL(file);

}


/* =========================================================
   REMOVE IMAGE
========================================================= */

if (removeButton) {

    removeButton.addEventListener(
        "click",
        () => {

            selectedFile = null;

            imageInput.value = "";

            previewImage.src = "";

            previewContainer.classList.remove(
                "active"
            );

            uploadContent.style.display =
                "block";

            analyzeButton.disabled =
                true;

            resetResults();

        }
    );

}


/* =========================================================
   ANALYZE BUTTON
========================================================= */

if (analyzeButton) {

    analyzeButton.addEventListener(
        "click",
        async () => {

            hideError();


            /* =========================================
               CAMERA MODE
            ========================================= */

            if (cameraStream) {

                await analyzeCameraFrame();

                return;

            }


            /* =========================================
               UPLOAD MODE
            ========================================= */

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

    console.log(
        "Starting image analysis..."
    );

    analyzeButton.classList.add(
        "loading"
    );

    analyzeButton.disabled =
        true;


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

    catch(error) {

        console.error(
            "Analysis error:",
            error
        );

        showError(
            "Could not connect to the AI server."
        );

    }

    finally {

        analyzeButton.classList.remove(
            "loading"
        );

        analyzeButton.disabled =
            false;

    }

}


/* =========================================================
   UPLOAD MODE
========================================================= */

if (uploadModeButton) {

    uploadModeButton.addEventListener(
        "click",
        () => {

            stopCamera();

            uploadModeButton.classList.add(
                "active"
            );

            cameraModeButton.classList.remove(
                "active"
            );

            uploadArea.style.display =
                "flex";

            cameraArea.classList.remove(
                "active"
            );

            cameraControls.classList.remove(
                "active"
            );

            analyzeButton.style.display =
                "flex";

            analyzeButton.disabled =
                !selectedFile;

        }
    );

}

/* =========================================================
   CAMERA MODE BUTTON
========================================================= */

if (cameraModeButton) {

    cameraModeButton.addEventListener(
        "click",
        async () => {

            uploadModeButton.classList.remove(
                "active"
            );

            cameraModeButton.classList.add(
                "active"
            );


            uploadArea.style.display =
                "none";


            cameraArea.classList.add(
                "active"
            );


            cameraControls.classList.add(
                "active"
            );


            analyzeButton.style.display =
                "flex";


            analyzeButton.disabled =
                true;


            await startCamera();

        }
    );

}


/* =========================================================
   START CAMERA
========================================================= */

async function startCamera() {

    hideError();

    try {

        if (cameraStream) {

            return;

        }


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


        cameraVideo.srcObject =
            cameraStream;


        await cameraVideo.play();


        console.log(
            "Camera started."
        );


        analyzeButton.disabled =
            false;


        /*
         * Start automatic real-time analysis
         */

        startRealtimeAnalysis();


    }

    catch(error) {

        console.error(
            "Camera error:",
            error
        );

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


    if (!cameraStream) {

        return;

    }


    cameraStream
        .getTracks()
        .forEach(
            track => track.stop()
        );


    cameraStream =
        null;


    cameraVideo.srcObject =
        null;


    analyzeButton.disabled =
        true;


    console.log(
        "Camera stopped."
    );

}

if (overlayCanvas) {

    const ctx =
        overlayCanvas.getContext(
            "2d"
        );

    ctx.clearRect(
        0,
        0,
        overlayCanvas.width,
        overlayCanvas.height
    );

}


/* =========================================================
   START CAMERA BUTTON
========================================================= */

if (startCameraButton) {

    startCameraButton.addEventListener(
        "click",
        async () => {

            await startCamera();

        }
    );

}


/* =========================================================
   STOP CAMERA BUTTON
========================================================= */

if (stopCameraButton) {

    stopCameraButton.addEventListener(
        "click",
        () => {

            stopCamera();

        }
    );

}


/* =========================================================
   CAPTURE CAMERA FRAME
========================================================= */

function captureCameraFrame() {

    if (
        !cameraStream ||
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight
    ) {

        return null;

    }


    cameraCanvas.width =
        cameraVideo.videoWidth;

    cameraCanvas.height =
        cameraVideo.videoHeight;


    const context =
        cameraCanvas.getContext(
            "2d"
        );


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


        console.log(
            "Sending camera frame..."
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

    /* Show result on right side */
    displayResults(data);


    /* Draw face on camera */
    drawFaceOverlay(data);


    /* Update camera status */

    if (cameraStatus) {

        cameraStatus.innerHTML =
            `
            <span class="status-live-dot"></span>
            <span>AI Detecting</span>
            `;

    }

}
else {

    /*
     * No face detected
     */

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

    catch(error) {

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


    /*
     * Analyze immediately
     */

    analyzeCameraFrame();


    /*
     * Then analyze every 1.5 seconds
     */

    cameraAnalysisInterval =
        setInterval(
            () => {

                analyzeCameraFrame();

            },
            1500
        );

}


/* =========================================================
   STOP REAL-TIME ANALYSIS
========================================================= */

function stopRealtimeAnalysis() {

    if (
        cameraAnalysisInterval
    ) {

        clearInterval(
            cameraAnalysisInterval
        );

        cameraAnalysisInterval =
            null;

    }

}


/* =========================================================
   DISPLAY RESULTS
========================================================= */

function displayResults(data) {

    console.log(
        "Displaying results:",
        data
    );


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


    const emotion =
        data.emotion ||
        "Unknown";


    const confidence =
        Number(
            data.confidence
        ) || 0;


    emotionName.textContent =
        emotion;


    emotionEmoji.textContent =
        emotionEmojis[emotion] ||
        "🙂";


    confidenceValue.textContent =
        confidence.toFixed(2) +
        "%";


    confidenceText.textContent =
        confidence.toFixed(2) +
        "%";


    confidenceBar.style.width =
        "0%";


    setTimeout(
        () => {

            confidenceBar.style.width =
                Math.min(
                    confidence,
                    100
                ) +
                "%";

        },
        100
    );


    if (
        data.probabilities &&
        typeof data.probabilities === "object"
    ) {

        displayProbabilities(
            data.probabilities
        );

    }

}


/* =========================================================
   DISPLAY PROBABILITIES
========================================================= */

function displayProbabilities(
    probabilities
) {

    probabilitiesContainer.innerHTML =
        "";


    const entries =
        Object.entries(
            probabilities
        );


    entries.sort(
        (a, b) =>
            Number(b[1]) -
            Number(a[1])
    );


    entries.forEach(
        ([emotion, value]) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "probability-item";


            const heading =
                document.createElement(
                    "div"
                );


            heading.className =
                "probability-heading";


            const name =
                document.createElement(
                    "span"
                );


            name.textContent =
                emotion;


            const percentage =
                document.createElement(
                    "span"
                );


            percentage.className =
                "probability-value";


            percentage.textContent =
                Number(value)
                    .toFixed(2) +
                "%";


            heading.appendChild(
                name
            );


            heading.appendChild(
                percentage
            );


            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "probability-track";


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


            setTimeout(
                () => {

                    fill.style.width =
                        Math.min(
                            Number(value),
                            100
                        ) +
                        "%";

                },
                100
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


    if (confidenceBar) {

        confidenceBar.style.width =
            "0%";

    }


    if (probabilitiesContainer) {

        probabilitiesContainer.innerHTML =
            "";

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

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


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* =========================================
       GET FACES
    ========================================= */

    let faces = [];


    if (
        data &&
        Array.isArray(data.faces)
    ) {

        faces = data.faces;

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


    /* =========================================
       FACE COUNT
    ========================================= */

    if (faceCountBadge) {

        faceCountBadge.textContent =
            `👤 ${faces.length} Face${faces.length === 1 ? "" : "s"}`;

    }


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


    /* =========================================
       DRAW EACH FACE
    ========================================= */

    faces.forEach(
        (face) => {

            if (!face.box) {
                return;
            }


            const box =
                face.box;


            const x =
                Number(box.x);

            const y =
                Number(box.y);

            const boxWidth =
                Number(box.width);

            const boxHeight =
                Number(box.height);


            const emotion =
                face.emotion ||
                "Unknown";


            const confidence =
                Number(
                    face.confidence
                ) || 0;


            /* =====================================
               FACE BOX
            ===================================== */

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


            /* =====================================
               LABEL
            ===================================== */

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
                y - labelHeight - 8;


            if (labelY < 0) {

                labelY =
                    y + 8;

            }


            /* =====================================
               LABEL BACKGROUND
            ===================================== */

            ctx.fillStyle =
                "rgba(79, 70, 229, 0.92)";


            ctx.beginPath();


            ctx.roundRect(
                labelX,
                labelY,
                labelWidth,
                labelHeight,
                8
            );


            ctx.fill();


            /* =====================================
               LABEL TEXT
            ===================================== */

            ctx.fillStyle =
                "#ffffff";


            ctx.fillText(
                label,
                labelX + 12,
                labelY + 22
            );


            /* =====================================
               CORNER MARKERS
            ===================================== */

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

    const size = 18;

    ctx.strokeStyle =
        "#22c55e";

    ctx.lineWidth =
        4;

    ctx.lineCap =
        "round";


    /* TOP LEFT */

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


    /* TOP RIGHT */

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


    /* BOTTOM LEFT */

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


    /* BOTTOM RIGHT */

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
   DARK / LIGHT MODE
========================================================= */

const themeToggle =
    document.getElementById("themeToggle");

const themeIcon =
    document.getElementById("themeIcon");

const themeText =
    document.getElementById("themeText");


/* Load saved theme */

const savedTheme =
    localStorage.getItem("emotionDetectorTheme");


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    updateThemeButton(true);

}


/* Toggle theme */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

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


/* Update button */

function updateThemeButton(isDark) {

    if (!themeIcon || !themeText) {
        return;
    }


    if (isDark) {

        themeIcon.textContent = "☀️";

        themeText.textContent = "Light";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to light mode"
        );

    }

    else {

        themeIcon.textContent = "🌙";

        themeText.textContent = "Dark";

        themeToggle.setAttribute(
            "aria-label",
            "Switch to dark mode"
        );

    }
}
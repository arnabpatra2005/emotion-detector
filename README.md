# windows user READ properly

# 🎭 Real-Time Emotion Detection Project

A Python-based real-time emotion detection system using OpenCV, TensorFlow, and a pre-trained Haar Cascade face detector.

---

## 📁 Project Files

Keep these **3 files** in the same folder:

```
emotion_project/
│── emotion_detection.py
│── emotion_model.hdf5
│── haarcascade_frontalface_default.xml
```

> ⚠️ **Important:** All three files must be in the same directory. The script will not run if any file is missing or in a different folder.

---

## 🛠️ Setup Guide (Windows)

### Step 1: Install Python 3.11

Download and install **Python 3.11** from the official website.

> ✅ **During installation, make sure to tick:** `Add Python to PATH`

Verify the installation by opening **Command Prompt** and running:

```bash
python --version
```

or

```bash
py --version
```

You should see: `Python 3.11.x`

---

### Step 2: Open Terminal in Project Folder

Open one of the following:
- Command Prompt
- PowerShell
- VS Code Terminal

Navigate to your project folder:

```bash
cd Desktop\emotion_project
```

---

### Step 3: Create Virtual Environment

```bash
py -3.11 -m venv ai_env
```

If the above does not work, try:

```bash
python -m venv ai_env
```

---

### Step 4: Activate Virtual Environment

**Command Prompt:**

```bash
ai_env\Scripts\activate
```

**PowerShell:**

```powershell
ai_env\Scripts\Activate.ps1
```

After activation, your terminal will look like this:

```
(ai_env) C:\Users\YourName\Desktop\emotion_project>
```

---

### Step 5: Install Required Packages

```bash
pip install opencv-python tensorflow numpy
```

> 📝 **Note:** `keras` is included with TensorFlow, so no need to install it separately.

---

### Step 6: Run the Project

```bash
python emotion_detection.py
```

If `python` does not work, try:

```bash
py emotion_detection.py
```

---

## ▶️ Full Setup — Quick Reference

```bash
cd Desktop\emotion_project
py -3.11 -m venv ai_env
ai_env\Scripts\activate
pip install opencv-python tensorflow numpy
python emotion_detection.py
```

---

## 🔁 Running the Project Again (Every Time)

Every time you want to run this project:

**1. Activate the environment first:**

```bash
ai_env\Scripts\activate
```

**2. Then run the script:**

```bash
python emotion_detection.py
```

> ⚠️ **Always activate the virtual environment before running.** The installed libraries live inside that environment.

---

## 🐛 Troubleshooting

### Webcam Does Not Open

Open `emotion_detection.py` and find this line:

```python
cap = cv2.VideoCapture(0)
```

Change it to:

```python
cap = cv2.VideoCapture(1)
```

> Some laptops use camera index `1` instead of `0`.

---

### PowerShell Activation Error

Run this once in PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then activate again:

```powershell
ai_env\Scripts\Activate.ps1
```

---

## ❌ Common Errors and Fixes

| # | Error | Cause | Fix |
|---|-------|-------|-----|
| 1 | `python is not recognized` | Python not in PATH | Reinstall Python 3.11 and tick **Add Python to PATH** |
| 2 | Model file not found | `emotion_model.hdf5` missing or in wrong folder | Keep all 3 files in the same folder |
| 3 | Haar cascade file not found | `haarcascade_frontalface_default.xml` missing | Keep it in the same folder as the Python script |
| 4 | Webcam not opening | Another app is using the camera, or wrong index | Close other apps using camera; change index from `0` to `1` |

---

## 📚 Concepts Explained (For Students)

### Why use a virtual environment?
A virtual environment keeps this project's libraries **separate** from other Python projects on your system. It avoids version conflicts.

### Why install these packages?

| Package | Purpose |
|---------|---------|
| `opencv-python` | Camera access and face detection |
| `tensorflow` | Loading and running the trained emotion model |
| `numpy` | Array and image data processing |

### Why activate the environment every time?
Because the installed libraries are stored **inside** the virtual environment folder (`ai_env`). Without activating it, Python won't find them.

---

## 📋 Short Version (Quick Start for Students)

```bash
cd Desktop\emotion_project
py -3.11 -m venv ai_env
ai_env\Scripts\activate
pip install opencv-python tensorflow numpy
python emotion_detection.py
```

---

## ✅ Final Reminder

Before running the project every time:

```bash
ai_env\Scripts\activate
python emotion_detection.py
```
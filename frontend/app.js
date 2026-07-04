let selectedImage = null;
let history = [];

// -----------------------------
// ELEMENTS
// -----------------------------
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

// -----------------------------
// IMAGE PREVIEW
// -----------------------------
imageInput.addEventListener("change", function (event) {
    selectedImage = event.target.files[0];

    if (!selectedImage) return;

    preview.src = URL.createObjectURL(selectedImage);
    preview.style.display = "block";

    result.innerHTML = "";
});

// -----------------------------
// ANALYZE IMAGE (BACKEND AI)
// -----------------------------
async function analyze() {
    if (!selectedImage) {
        result.innerHTML = "⚠️ Please upload an image first";
        return;
    }

    result.innerHTML = `
        <div style="padding:15px;">
            ⏳ Sending image to AI server...
        </div>
    `;

    try {
        let formData = new FormData();
        formData.append("image", selectedImage);

        const API_URL = "https://yapping-revenue-bullwhip.ngrok-free.dev/predict";

        let response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        let data = await response.json();

        let prediction = data.prediction;
        let confidence = data.confidence;

        // -----------------------------
        // SAVE HISTORY
        // -----------------------------
        history.push({
            condition: prediction,
            confidence: (confidence * 100).toFixed(2),
            time: new Date().toLocaleString()
        });

        // -----------------------------
        // COLOR LOGIC
        // -----------------------------
        let color = "green";
        if (prediction.toLowerCase().includes("newcastle")) color = "red";
        if (prediction.toLowerCase().includes("avian")) color = "orange";

        // -----------------------------
        // UI OUTPUT
        // -----------------------------
        result.innerHTML = `
            <div style="
                padding:20px;
                border-radius:12px;
                background:white;
                box-shadow:0 6px 18px rgba(0,0,0,0.12);
                text-align:left;
            ">
                <h2 style="color:${color};">
                    🧾 ${prediction}
                </h2>

                <p><strong>Confidence:</strong> ${(confidence * 100).toFixed(2)}%</p>
                <p><strong>Status:</strong> Analysis Complete</p>
            </div>
        `;

    } catch (error) {
        console.error(error);

        result.innerHTML = `
            <div style="padding:15px; background:#ffe0e0; border-radius:10px;">
                ❌ Failed to connect to AI server<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// -----------------------------
// HISTORY FUNCTION
// -----------------------------
function showHistory() {
    if (history.length === 0) {
        result.innerHTML = "No history yet";
        return;
    }

    let html = `
        <div style="padding:15px; background:white; border-radius:12px;">
        <h3>📊 Prediction History</h3>
    `;

    history.slice().reverse().forEach(item => {
        html += `
            <div style="margin-bottom:10px;">
                <strong>${item.condition}</strong><br>
                Confidence: ${item.confidence}%<br>
                <small>${item.time}</small>
                <hr>
            </div>
        `;
    });

    html += `</div>`;
    result.innerHTML = html;
}

// -----------------------------
// GLOBAL ACCESS (IMPORTANT)
// -----------------------------
window.analyze = analyze;
window.showHistory = showHistory;

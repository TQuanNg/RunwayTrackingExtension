document.addEventListener("DOMContentLoaded", function() {
    const latInput = document.getElementById("latitude");
    const lonInput = document.getElementById("longitude");
    const monitorButton = document.getElementById("showText");
    let isMonitoring = false;
    
    // Restore saved values from storage when the popup is opened
    chrome.storage.local.get(["latitude", "longitude", "isMonitoring"], (data) => {
        if (data.latitude) latInput.value = data.latitude;
        if (data.longitude) lonInput.value = data.longitude;
        updateButtonText(data.isMonitoring);
    });

    latInput.addEventListener("input", () => {
        chrome.storage.local.set({ latitude: latInput.value });
    });

    lonInput.addEventListener("input", () => {
        chrome.storage.local.set({ longitude: lonInput.value });
    });

    
    monitorButton.addEventListener("click", function () {
        const latitude = parseFloat(latInput.value);
        const longitude = parseFloat(lonInput.value);

        if (!latitude || !longitude) {
            document.getElementById("output").innerText = "Please enter latitude and longitude.";
            return;
        }

        chrome.storage.local.get("isMonitoring", (data) => {
            const isMonitoring = !data.isMonitoring; // Toggle state

            chrome.storage.local.set({ latitude, longitude, isMonitoring });

            if (isMonitoring) {
                chrome.alarms.create("fetchFlightsAlarm", { periodInMinutes: 1 });
                output.innerText = "Monitoring flights...";
            } else {
                chrome.alarms.clear("fetchFlightsAlarm", () => {
                    output.innerText = "Monitoring stopped.";
                });
            }

            updateButtonText(isMonitoring);
        });
    });

    function updateButtonText(isMonitoring) {
        monitorButton.innerText = isMonitoring ? "Stop Monitoring" : "Start Monitoring";
    }   
});



/*data.flights
.map(f => `Flight: ${f.flight}, Alt: ${f.alt_baro}, Track: ${f.track}`)
.join("\n");
*/
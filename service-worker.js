function fetchFlights(latitude, longitude) {

    fetch(`https://opendata.adsb.fi/api/v2/lat/${latitude}/lon/${longitude}/dist/5`)
    .then(handleResponse)
    .then(data => processFlightData(data.aircraft))
    .catch(error => console.error("Fetch error:", error));

    return true;
};

function handleResponse(response) {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

function processFlightData(aircraftList) {
    const flights = aircraftList
        .filter(a => a.flight)
        .map(a => ({
            flight: a.flight.trim(),
            alt_baro: a.alt_baro || "N/A",
            track: a.track || "N/A"
        }));

    chrome.storage.local.get(["prevFlights"], (result) => {
        updateFlightData(flights, result.prevFlights || {});
    });

    chrome.storage.local.set({ flights });
}

function updateFlightData(flights, prevFlights) {
    const newFlightData = {};

    flights.forEach(flight => {
        const prevAlt = prevFlights[flight.flight] ?? null;

        if (prevAlt !== null) {
            console.log(`Flight: ${flight.flight}, Previous Altitude: ${prevAlt}, Current Altitude: ${flight.alt_baro}`);

            if (flight.alt_baro < prevAlt) {
                notifyLanding(flight.flight, prevAlt, flight.alt_baro);
            }
        } else {
            console.log(`New Flight: ${flight.flight}, Current Altitude: ${flight.alt_baro}`);
        }

        newFlightData[flight.flight] = flight.alt_baro;
    });

    chrome.storage.local.set({ prevFlights: newFlightData });
}

function notifyLanding(flight, prevAlt, currentAlt) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "hello_extensions.png", // Ensure this file exists in your extension
        title: `Landing Alert: ${flight}`,
        message: `Altitude decreasing! (${prevAlt} → ${currentAlt})`
    });

}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "fetchFlightsAlarm") {
        chrome.storage.local.get(["latitude", "longitude"], (data) => {
            if (data.latitude && data.longitude) {
                fetchFlights(data.latitude, data.longitude);
            }
        });
    }
});

module.exports = { fetchFlights, processFlightData, updateFlightData, handleResponse, notifyLanding };


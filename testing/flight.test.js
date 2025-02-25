global.chrome = {
    alarms: {
        onAlarm: {
            addListener: jest.fn()
        }
    },
    storage: {
        local: {
            get: jest.fn((keys, callback) => callback({ prevFlights: {} })),
            set: jest.fn()
        }
    },
    notifications: {
        create: jest.fn()
    }
};

const { fetchFlights, handleResponse, processFlightData, updateFlightData, notifyLanding } = require('../service-worker.js');

beforeEach(() => {
    fetch.resetMocks();
    jest.clearAllMocks();
});

describe("fetchFlights", () => {
    test("fetches flight data and processes it", async () => {
        const mockResponse = {
            aircraft: [
                { flight: "AB123", alt_baro: 30000, track: 180 },
                { flight: "CD456", alt_baro: 25000, track: 90 }
            ]
        };

        fetch.mockResponseOnce(JSON.stringify(mockResponse));

        fetchFlights(40.7128, -74.006);
        await new Promise(process.nextTick);

        expect(fetch).toHaveBeenCalledWith("https://opendata.adsb.fi/api/v2/lat/40.7128/lon/-74.006/dist/5");
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ flights: expect.any(Array) });
    });

    test("handles fetch failure", async () => {
        console.error = jest.fn();
        fetch.mockReject(new Error("Fetch failed"));

        fetchFlights(40.7128, -74.006);
        await new Promise(process.nextTick);

        expect(console.error).toHaveBeenCalledWith("Fetch error:", expect.any(Error));
    });
});

describe("handleResponse", () => {
    test("throws error on bad response", () => {
        const response = { ok: false, status: 500 };
        expect(() => handleResponse(response)).toThrow("HTTP error! Status: 500");
    });

    test("parses JSON on success", async () => {
        const response = { ok: true, json: jest.fn().mockResolvedValue({ test: "data" }) };
        await expect(handleResponse(response)).resolves.toEqual({ test: "data" });
    });
});

describe("processFlightData", () => {
    test("stores filtered flight data", () => {
        const mockAircraft = [
            { flight: "AB123", alt_baro: 30000, track: 180 },
            { flight: null, alt_baro: 25000, track: 90 } // Should be filtered out
        ];

        processFlightData(mockAircraft);
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ flights: expect.any(Array) });
    });
});

describe("updateFlightData", () => {
    test("updates flight altitudes and triggers notifications", () => {
        const flights = [{ flight: "AB123", alt_baro: 20000 }];
        const prevFlights = { AB123: 25000 };

        updateFlightData(flights, prevFlights);

        expect(chrome.notifications.create).toHaveBeenCalledWith(      
            {
                title: "Landing Alert: AB123",
                message: "Altitude decreasing! (25000 → 20000)",
                iconUrl: "hello_extensions.png",
                type: "basic"
            }
        );
        expect(chrome.storage.local.set).toHaveBeenCalledWith({ prevFlights: { AB123: 20000 } });
    });

    test("does not notify if altitude is increasing", () => {
        const flights = [{ flight: "AB123", alt_baro: 30000 }];
        const prevFlights = { AB123: 25000 };

        updateFlightData(flights, prevFlights);

        expect(chrome.notifications.create).not.toHaveBeenCalled();
    });
});
# 🛬 Runway Tracking Extension

A Chrome Extension that tracks **real-time flight data** using live flight APIs, monitors aircraft positions, and **notifies users of upcoming landings** based on latitude and longitude.

---

## ✈️ Features

- 🔍 **Real-Time Tracking** — Fetches live flight data using the [ADSB.fi API](https://opendata.adsb.fi/api/v2/lat/{latitude}/lon/{longitude}/dist/5)
- 📍 **Geolocation Monitoring** — Detects aircraft within a given distance radius
- 🔔 **Smart Notifications** — Alerts users of nearby or incoming landings
- 🧪 **Fully Tested** — Achieved **100% Jest test coverage** for reliable data fetching, processing, and notification features

---

## ⚙️ Tech Stack

- JavaScript (ES6+)
- Chrome Extension API
- Fetch API / Promises
- Jest (Unit Testing)

---

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TQuanNg/RunwayTrackingExtension.git
   cd runway-tracking-extension
2. **Install dependencies**
   ```bash
   npm install
3. **Run test**
   ```bash
   npm test
4. **Load the extension in Chrome**
- Open chrome://extensions/

- Enable Developer Mode

- Click Load unpacked

- Select your project folder

- ⭐Once loaded, open the extension popup and test by entering any latitude and longitude (you can get these by googling a city name).
For example:

Latitude: 37.7749

Longitude: -122.4194 (San Francisco)

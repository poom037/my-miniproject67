"use client";
import { useState, useEffect } from "react";

const Dashboard = () => {
  // State management for LED, Ultrasonic, Temperature, and Humidity
  const [isLedOn, setIsLedOn] = useState(false);
  const [isUltrasonicOn, setIsUltrasonicOn] = useState(false);
  const [ultrasonic, setUltrasonic] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);

  // Dummy effect to simulate fetching data
  useEffect(() => {
    const fetchData = () => {
      // Here you'd fetch from an API or sensor data source
      setTemperature(Math.random() * 30 + 20); // Example: Random temperature between 20-50°C
      setHumidity(Math.random() * 50 + 30); // Example: Random humidity between 30-80%
      setUltrasonic(Math.random() * 100); // Example: Random ultrasonic distance between 0-100cm
    };

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const toggleLed = () => {
    setIsLedOn(!isLedOn);
    // Here you'd make a request to toggle the LED
  };

  const toggleUltrasonic = () => {
    setIsUltrasonicOn(!isUltrasonicOn);
    // Here you'd make a request to toggle the Ultrasonic sensor
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LED Control */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">LED Control</h2>
            <button
              onClick={toggleLed}
              className={`mt-4 px-4 py-2 rounded-md text-white ${
                isLedOn ? "bg-red-600" : "bg-green-600"
              }`}
            >
              {isLedOn ? "Turn Off LED" : "Turn On LED"}
            </button>
          </div>

          {/* Ultrasonic Sensor Control */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Ultrasonic Sensor Control
            </h2>
            <label className="mt-4 inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={isUltrasonicOn}
                onChange={toggleUltrasonic}
              />
              <div
                className={`relative w-10 h-5 transition bg-gray-200 rounded-full shadow-inner ${
                  isUltrasonicOn ? "bg-blue-600" : ""
                }`}
              >
                <div
                  className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${
                    isUltrasonicOn
                      ? "transform translate-x-full bg-blue-600"
                      : ""
                  }`}
                ></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {isUltrasonicOn ? "On" : "Off"}
              </span>
            </label>
          </div>

          {/* Temperature Data */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Temperature</h2>
            <p className="mt-4 text-2xl font-bold text-gray-900">
              {temperature !== null
                ? `${temperature.toFixed(2)}°C`
                : "Loading..."}
            </p>
          </div>

          {/* Humidity Data */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900">Humidity</h2>
            <p className="mt-4 text-2xl font-bold text-gray-900">
              {humidity !== null ? `${humidity.toFixed(2)}%` : "Loading..."}
            </p>
          </div>

           {/* Ultrasonic Sensor Monitor */}
           {isUltrasonicOn ? (
            <div className="bg-white shadow rounded-lg p-6 ">
              <h2 className="text-lg font-medium text-gray-900">
                Ultrasonic Sensor Monitor
              </h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {ultrasonic !== null
                  ? `${ultrasonic.toFixed(2)}cm`
                  : "Loading..."}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

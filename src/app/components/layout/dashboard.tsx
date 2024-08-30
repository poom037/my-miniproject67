"use client";
import { useState, useEffect } from "react";
import Logo from "../ui/logo";

const Dashboard = () => {
  // state management for LED, Ultrasonic, Temperature, and Humidity
  const [isLedOn, setIsLedOn] = useState(false);
  const [isLedGreenOn, setIsLedGreenOn] = useState(false);
  const [ldr, setLdr] = useState<number | null>(null);
  const [vibration, setVibration] = useState<number | null>(null);
  const [ultrasonic, setUltrasonic] = useState<number | null>(0);
  const [latestId, setLatestId] = useState<number | null>(null); // state to keep track of the latest ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetch("/api/getAll");
        const data = await result.json();
        console.log("Fetched data:", data);

        if (data.length > 0) {
          const latestData = data[data.length - 1];
          setLdr(latestData.ldr);
          setVibration(latestData.vibration);
          setUltrasonic(latestData.ultrasonic);

          // Convert "on" to true and "off" to false
          setIsLedOn(latestData.red === "on");
          setIsLedGreenOn(latestData.green === "on");

          // Update latestId state only if the id is different
          if (latestData.id !== latestId) {
            setLatestId(latestData.id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000); // Fetch data every second
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [latestId]); // Update when latestId changes

  const sendLedState = async (ledColor: string, state: string) => {
    try {
      const response = await fetch("/api/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ led: ledColor, state: state }), // send LED color and state
      });

      if (!response.ok) {
        throw new Error(
          `Failed to toggle ${ledColor} LED: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error sending LED state:", error);
    }
  };

  const toggleLed = async () => {
    const newState = isLedOn ? "off" : "on";
    setIsLedOn(!isLedOn);
    await sendLedState("red", newState); // send "red" and the new state to the API
  };

  const toggleUltrasonic = async () => {
    const newState = isLedGreenOn ? "off" : "on";
    setIsLedGreenOn(!isLedGreenOn);
    await sendLedState("green", newState); // send "green" and the new state to the API
  };
    return (
      <div className="min-h-screen bg-gray-100 bg-gradient-to-br from-green-500 to-black-600">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* LED RED Control */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                LED <span className="text-red-500">RED</span>
              </h2>
              <button
                onClick={toggleLed}
                className={`mt-4 px-4 py-2 rounded-md text-white ${
                  isLedOn ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {isLedOn ? "Turn Off LED" : "Turn On LED"}
              </button>
            </div>

            {/* LED GREEN Control */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">
                LED <span className="text-green-500">GREEN</span>
              </h2>
              <button
                onClick={toggleUltrasonic}
                className={`mt-4 px-4 py-2 rounded-md text-white ${
                  isLedGreenOn ? "bg-red-600" : "bg-green-600"
                }`}
              >
                {isLedGreenOn ? "Turn Off LED" : "Turn On LED"}
              </button>
            </div>

            {/* Vibration Data */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Vibration</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {vibration !== null ? `${vibration}m/s2` : "Loading..."}
              </p>
            </div>

            {/* LDR Data */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">LDR</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {ldr !== null ? `${ldr}Lux` : "Loading..."}
              </p>
            </div>

            {/* Ultrasonic Data */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900">Ultrasonic</h2>
              <p className="mt-4 text-2xl font-bold text-gray-900">
                {ultrasonic !== null ? `${ultrasonic}cm` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Dashboard;

from machine import Pin
import utime
import urequests
import network
import time
import dht

# กำหนด Pin สำหรับ trigger, echo, LED และ DHT11
trigger = Pin(20, Pin.OUT)
echo = Pin(21, Pin.IN)
led = Pin(22, Pin.OUT)
dht_sensor = dht.DHT11(Pin(16))

ssid = "Galaxy A05s 7407"
password = "123456789"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

while wlan.isconnected() == False:
    print('Waiting for connection...')
    time.sleep(1)

print('Connected to WiFi')
print(wlan.ifconfig())

# ฟังก์ชันสำหรับวัดระยะทาง
def ultra():
    trigger.low()
    utime.sleep_us(2)
    trigger.high()
    utime.sleep_us(5)
    trigger.low()
    
    while echo.value() == 0:
        signaloff = utime.ticks_us()
        
    while echo.value() == 1:
        signalon = utime.ticks_us()
        
    timepassed = signalon - signaloff
    distance = (timepassed * 0.0343) / 2
    
    return distance

# ฟังก์ชันสำหรับอ่านค่า DHT11
def read_dht11():
    dht_sensor.measure()
    temperature = dht_sensor.temperature()
    humidity = dht_sensor.humidity()
    return temperature, humidity

# ฟังก์ชันสำหรับส่งข้อมูล Ultrasonic sensor ไปยัง API
def send_ultrasonic_to_api(distance, status):
    try:
        url = "https://my-miniproject67-1nhqv10rf-jaryins-projects.vercel.app/api/post_getUltrasonic"
        headers = {
            "Content-Type": "application/json",
        }
        data = {
            "ultrasonicValue": str(distance),
            "status": status
        }
        
        response = urequests.post(url, json=data, headers=headers)
        print(response.text)
        response.close()
    except Exception as e:
        print("Failed to send ultrasonic data:", e)

# ฟังก์ชันสำหรับส่งข้อมูล DHT11 ไปยัง API
def send_dht11_to_api(temperature, humidity):
    try:
        url = "https://my-miniproject67-ib681mo6p-jaryins-projects.vercel.app/api/getDht11"
        headers = {
            "Content-Type": "application/json",
        }
        data = {
            "temperature": str(temperature),
            "humidity": str(humidity)
        }
        
        response = urequests.post(url, json=data, headers=headers)
        print(response.text)
        response.close()
    except Exception as e:
        print("Failed to send DHT11 data:", e)

# วนลูปเพื่อตรวจจับและส่งข้อมูล
while True:
    distance = ultra()
    temperature, humidity = read_dht11()

    # แสดงค่าที่อ่านจาก DHT11 บนคอนโซล
    print("Temperature:", temperature, "°C")
    print("Humidity:", humidity, "%")
    
    if distance <= 50:
        print("The distance from object is ", distance, "cm")
        led.high()  # เปิด LED เมื่ออยู่ในระยะ 50 cm
        send_ultrasonic_to_api(distance, 1)  # ส่งข้อมูล Ultrasonic sensor
    else:
        print("Object is out of range.")
        led.low()  # ปิด LED เมื่ออยู่นอกระยะ 50 cm
        send_ultrasonic_to_api(distance, 0)  # ส่งข้อมูล Ultrasonic sensor
        
    send_dht11_to_api(temperature, humidity)  # ส่งข้อมูล DHT11 sensor
    
    utime.sleep(0.5)

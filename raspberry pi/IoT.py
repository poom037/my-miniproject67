from machine import Pin
import utime
import urequests
import network
import time
import dht

# กำหนด Pin สำหรับ trigger, echo, LED และ DHT11
trigger = Pin(20, Pin.OUT)
echo = Pin(21, Pin.IN)
led_ultrasonic = Pin(22, Pin.OUT)  # LED สีแดง
led_green = Pin(1, Pin.OUT)  # LED สีเขียว
led_red = Pin(17, Pin.OUT)
dht_sensor = dht.DHT11(Pin(16))

ssid = "Galaxy A05s 7407"
password = "123456789"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

while not wlan.isconnected():
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

# ฟังก์ชันสำหรับดึงข้อมูลจากฐานข้อมูล
def get_led_status():
    try:
        url = "https://my-miniproject67-j2365ebyd-jaryins-projects.vercel.app/api/control"
        response = urequests.get(url)
        data = response.json()
        response.close()
        
        print("Received data:", data)  # พิมพ์ข้อมูลที่ได้รับ
        
        if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            return data[0].get("red", "off"), data[0].get("green", "off")
        else:
            print("Unexpected data format")
            return "off", "off"
    except Exception as e:
        print("Failed to get LED status:", e)
        return "off", "off"

# ฟังก์ชันสำหรับส่งข้อมูลทั้งหมดไปยัง API
def send_all_to_api(distance, ultrasonic_status, temperature, humidity, red_status, green_status):
    try:
        url = "https://my-miniproject67-i1mhnsrfa-jaryins-projects.vercel.app/api/postAll"
        headers = {
            "Content-Type": "application/json",
        }
        
        # ถ้าค่าระยะทางมากกว่า 50 cm จะส่งเป็น 0
        if distance > 50:
            distance = 0
            ultrasonic_status = 0
            
        data = {
            "ultrasonic": str(distance),
            "status": ultrasonic_status,
            "temperature": str(temperature),
            "humidity": str(humidity)
        }
        print("Sending data:", data)  # บันทึกข้อมูลที่กำลังจะส่ง
        
        response = urequests.post(url, json=data, headers=headers)
        print("Response:", response.text)
        response.close()
    except Exception as e:
        print("Failed to send all data:", e)

# วนลูปเพื่อตรวจจับและส่งข้อมูล
while True:
    distance = ultra()
    temperature, humidity = read_dht11()
    
    if distance <= 50:
        print("The distance from object is ", distance, "cm")
        led_ultrasonic.high()  # เปิด LED เมื่ออยู่ในระยะ 50 cm
        ultrasonic_status = 1  # สถานะของ ultrasonic sensor
    else:
        print("Object is out of range.")
        led_ultrasonic.low()  # ปิด LED เมื่ออยู่นอกระยะ 50 cm
        ultrasonic_status = 0
    
    # ดึงข้อมูลสถานะ LED จากฐานข้อมูล
    red_status, green_status = get_led_status()
    
    # ส่งข้อมูลทั้งหมดไปยัง API
    send_all_to_api(distance, ultrasonic_status, temperature, humidity, red_status, green_status)
    
    # อัปเดต LED ตามสถานะที่ได้รับ
    if red_status == "on":
        led_red.high()
    else:
        led_red.low()

    if green_status == "on":
        led_green.high()
    else:
        led_green.low()
    
    utime.sleep(1)

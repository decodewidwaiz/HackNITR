/***************** SENSOR PINS *****************/

// PH Sensor
#define PH_PIN 35
float ph7_voltage = 1.16;
float ph10_voltage = 0.59;

// MQ137 Gas Sensor
#define MQ137_PIN 33

// Rain Sensor
#define RAIN_DIGITAL_PIN 27

#define RAIN_ANALOG_PIN 32

// Flame Sensor
#define FLAME_PIN 14

// Soil Moisture Sensor
#define SOIL_ANALOG_PIN 34

// DHT22
#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

/***************** WIFI + HTTP *****************/

#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "Airtel_Nishant";
const char* password = "Nishant2003@";

// 🔴 CHANGE TO YOUR PC IP
const char* serverURL = "http://192.168.1.6:5000/sensor";

/************************************************/

void setup() {
  Serial.begin(115200);

  pinMode(FLAME_PIN, INPUT);
  pinMode(RAIN_DIGITAL_PIN, INPUT);

  dht.begin();
  delay(2000);  // DHT stabilization

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

/************************************************/

void loop() {

  // pH Sensor
  int phRaw = analogRead(PH_PIN);
  float phVoltage = phRaw * (3.3 / 4095.0);
  float slope = (10.0 - 7.0) / (ph10_voltage - ph7_voltage);
  float phValue = slope * (phVoltage - ph7_voltage) + 7.0;

  // MQ137
  int mq137Value = analogRead(MQ137_PIN);

  // Rain
  int rainDigital = digitalRead(RAIN_DIGITAL_PIN);
  int rainAnalog = analogRead(RAIN_ANALOG_PIN);
  String rainStatus = (rainDigital == 0) ? "Rain Detected" : "No Rain";

  // Flame
  int flameValue = digitalRead(FLAME_PIN);
  String flameStatus = (flameValue == 0) ? "Flame Detected" : "No Flame";

  // DHT22 (NaN-safe)
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) temperature = -1;
  if (isnan(humidity)) humidity = -1;

  // Soil
  int soilRaw = analogRead(SOIL_ANALOG_PIN);
  int soilPercent = map(soilRaw, 0, 2000, 100, 0);
  soilPercent = constrain(soilPercent, 0, 100);

  // JSON (VALID ONLY)
  String jsonData = "{";
  jsonData += "\"ph_value\":" + String(phValue, 2) + ",";
  jsonData += "\"ph_voltage\":" + String(phVoltage, 2) + ",";
  jsonData += "\"mq137_raw\":" + String(mq137Value) + ",";
  jsonData += "\"rain_status\":\"" + rainStatus + "\",";
  jsonData += "\"rain_analog\":" + String(rainAnalog) + ",";
  jsonData += "\"flame_status\":\"" + flameStatus + "\",";
  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"humidity\":" + String(humidity) + ",";
  jsonData += "\"soil_raw\":" + String(soilRaw) + ",";
  jsonData += "\"soil_percent\":" + String(soilPercent);
  jsonData += "}";

  Serial.println("\nJSON Sent:");
  Serial.println(jsonData);

  // SEND TO FLASK
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(jsonData);
    String response = http.getString();

    Serial.println("---- BACKEND RESPONSE ----");
    Serial.print("Status Code: ");
    Serial.println(code);
    Serial.print("Response: ");
    Serial.println(response);
    Serial.println("--------------------------");

    http.end();
  }

  delay(3000);
}

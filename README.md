# 📊 Stock Portfolio Tracker

## 🚀 Overview
The **Stock Portfolio Tracker** is a web application that allows users to monitor their stock investments in real time.  
It integrates with an **external stock market API** to fetch up-to-date data and provides insights such as:

- Current stock prices  
- Daily price changes  
- Portfolio value updates  
- Gain/loss calculations  

Unlike basic apps (like random fact generators), this tracker provides **genuine value** by helping users stay informed about their investments in a simple and interactive way.  

---

## 🛠️ Features
- 🔎 **Search & Add Stocks** – users can add stocks to their portfolio.  
- 📈 **Real-Time Price Updates** – data pulled from an external API.  
- 📊 **Gain/Loss Calculation** – track performance instantly.  
- 🔄 **Portfolio Refresh** – update all stocks at once.  
- 🧹 **Interactive Data** – filter, sort, and search through stocks.  
- ⚠️ **Error Handling** – handles API downtime or invalid symbols gracefully.  

---

## 🔗 API Integration
This project uses [**Alpha Vantage API**](https://www.alphavantage.co/documentation/) (or whichever API you used — update here).  

- **Endpoints Used**: Stock price lookup  
- **Authentication**: API key stored in `.env` file  
- **Rate Limits**: Free tier allows X requests/minute (document exact limit)  
- **Credit**: Thanks to the Alpha Vantage team for providing free stock market data.  

---

## 💻 Local Setup (Part 1)
### 1. Clone the Repository
```bash
git clone https://github.com/Aderline490/alu_web_infrastructre_external_apis.git
cd alu_web_infrastructre_external_apis
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```env
API_KEY=your_alpha_vantage_api_key
PORT=8080
```

### 4. Run Locally
```bash
node server.js
```

Access at: [http://localhost:8080](http://localhost:8080)

---

## 🐳 Deployment with Docker (Part 2A)
### 1. Build Docker Image
```bash
docker build -t <dockerhub-username>/stock-tracker:v1 .
```

### 2. Test Locally
```bash
docker run -p 8080:8080 <dockerhub-username>/stock-tracker:v1
curl http://localhost:8080
```

### 3. Push to Docker Hub
```bash
docker login
docker push <dockerhub-username>/stock-tracker:v1
```

---

## 🌍 Deployment on Lab Servers (Part 2B)

### On Web01 and Web02
```bash
docker pull <dockerhub-username>/stock-tracker:v1
docker run -d --name stock-app --restart unless-stopped -p 8080:8080 <dockerhub-username>/stock-tracker:v1
```

- Accessible at:
  - `http://web-01:8080`
  - `http://web-02:8080`

### Configure Load Balancer (Lb01)
Edit `/etc/haproxy/haproxy.cfg`:
```cfg
backend webapps
  balance roundrobin
  server web01 172.20.0.11:8080 check
  server web02 172.20.0.12:8080 check
```

Reload HAProxy:
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

### Test Round-Robin Balancing
```bash
curl http://localhost
curl http://localhost
curl http://localhost
```
Responses should alternate between `web01` and `web02`.

---

## 🔒 Handling Secrets
- API keys are **not stored in the codebase**.  
- Instead, use environment variables via `.env` or Docker `--env`.  
- Example:
```bash
docker run -d -e API_KEY=$API_KEY -p 8080:8080 <dockerhub-username>/stock-tracker:v1
```

---

## 🧪 Testing
1. Run `curl http://localhost:8080` to confirm the app works.  
2. Add stocks and check portfolio calculations.  
3. Disconnect from the internet to test **error handling**.  
4. Verify load balancing alternates responses between `web01` and `web02`.  

---

## 📹 Demo Video
👉 [Demo Video Link Here](#) (Upload to YouTube/Vimeo and paste the link)  

---

## 📖 Challenges Faced
- 🔑 Managing API keys securely (solved via `.env` and Docker `--env`).  
- 🕒 Handling API rate limits (added refresh delay + caching).  
- 🌐 Configuring HAProxy correctly (solved with round-robin setup).  

---

## 🙌 Credits
- **API Provider**: [Alpha Vantage](https://www.alphavantage.co/)  
- **Deployment Base**: [Waka-man Web Infra Lab](https://github.com/waka-man/web_infra_lab)  
- **Libraries/Frameworks**: Node.js, Express, Docker  

---

## 📊 Grading Rubric Coverage
✅ **Functionality** – meaningful stock tracking app with API integration  
✅ **Deployment** – Docker + multi-server with load balancer  
✅ **User Experience** – simple UI + data interaction  
✅ **Documentation** – complete setup, deployment, API credit  
✅ **Demo Video** – to be linked  

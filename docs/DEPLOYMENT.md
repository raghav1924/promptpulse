# Deployment & Production Operations — PromptPulse

**Target:** Prompt Regression Tester & LLM Output Assertion Engine  
**Author:** Jatin Sharma ([https://jatinsh.netlify.app/](https://jatinsh.netlify.app/))

---

## 1. Container Deployment (Docker)

```bash
docker build -t promptpulse:latest .
docker run -d -p 6060:6060 --name promptpulse promptpulse:latest
```

## 2. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start dist/bin.js --name "promptpulse" -- studio --port 6060
```

## 3. Systemd Service Unit

```ini
[Unit]
Description=PromptPulse Background Service
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/opt/promptpulse
ExecStart=/usr/bin/node dist/bin.js studio --port 6060
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

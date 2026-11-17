# Troubleshooting Guide (promptpulse)

Common operational issues and step-by-step diagnostic resolutions.

---

## 1. Port In Use / EADDRINUSE Error
**Symptom:** Studio server fails to start with `Error: listen EADDRINUSE: address already in use`.  
**Resolution:** Specify an alternate port using the `--port` flag:
```bash
npx promptpulse studio --port 8081
```

## 2. Permission Denied (EACCES)
**Symptom:** CLI cannot read configuration files or project directories.  
**Resolution:** Verify file read permissions:
```bash
chmod +r path/to/file
```

## 3. Node.js Version Incompatibility
**Symptom:** Syntax errors or missing core module exports.  
**Resolution:** Ensure Node.js version is >= 18.0.0:
```bash
node -v
```

---
*For further assistance, reach out at [raghavjatin245@gmail.com](mailto:raghavjatin245@gmail.com)*

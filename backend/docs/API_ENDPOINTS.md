# Legal AI Assistant Backend - API Documentation

## Base URL
```
http://localhost:3000
```

## Quick Test Commands

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. SOS Legal Help
```bash
curl http://localhost:3000/api/sos
```

### 3. Legal Categories
```bash
curl http://localhost:3000/api/categories
```

### 4. Legal News
```bash
curl http://localhost:3000/api/news
```

### 5. AI Chat
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are my legal rights?"}'
```

### 6. AI Voice
```bash
curl -X POST http://localhost:3000/api/ai/voice \
  -H "Content-Type: application/json" \
  -d '{"audioData":"..."}'
```

### 7. AI Document
```bash
curl -X POST http://localhost:3000/api/ai/document \
  -H "Content-Type: application/json" \
  -d '{"documentName":"document.pdf"}'
```

---

## All Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/sos` | GET | Emergency legal help |
| `/api/categories` | GET | Legal practice categories |
| `/api/news` | GET | Crime-related legal news (10 articles) |
| `/api/ai/chat` | POST | Text-based chat |
| `/api/ai/voice` | POST | Voice input |
| `/api/ai/document` | POST | Document upload |

---

## Response Format

All endpoints return standardized JSON responses:

```json
{
  "success": true,
  "data": [],
  "message": "Description"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

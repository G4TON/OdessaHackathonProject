# Pathfinder AI — Gemini via OpenAI-compatible endpoint

This version uses the OpenAI JavaScript SDK, but sends requests to Google Gemini's OpenAI-compatible endpoint. You do **not** need an OpenAI API key.

1. Open a terminal in this folder.
2. Run `npm.cmd install` if PowerShell blocks `npm`.
3. Create a file named `.env` next to `server.js`.
4. Put your Gemini key in it:

```env
GEMINI_API_KEY=your_real_gemini_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
PORT=3000
```

5. Start the server:

```powershell
npm.cmd start
```

6. Open http://localhost:3000
7. Health check: http://localhost:3000/api/health

The backend uses Google's Gemini OpenAI-compatible endpoint:
`https://generativelanguage.googleapis.com/v1beta/openai/`

Never put the Gemini API key in `index.html` or frontend JavaScript.

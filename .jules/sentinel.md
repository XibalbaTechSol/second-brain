## 2026-02-10 - Hardcoded API Key in Start Script
**Vulnerability:** A valid Google Gemini API key was hardcoded in `start.sh` and was being automatically injected into `.env` if the file was missing.
**Learning:** Convenience scripts (like `start.sh`) often bypass security checks to reduce friction for new developers, but this can lead to secrets being committed or exposed.
**Prevention:** Never include secrets in scripts. Use `.env.example` templates and prompt the user for input or fail if secrets are missing.

## 2025-02-18 - Insecure File Upload & Path Traversal

**Vulnerability:** The `/api/upload` endpoint relied on user-provided filenames (`file.name`) without sufficient sanitization. This allowed potential Path Traversal attacks where a malicious user could overwrite critical system files by crafting a filename like `../../config.json`. Additionally, the endpoint lacked authentication, allowing anyone to upload files.

**Learning:** Trusting user input for file system operations is a critical vulnerability. Even "sanitized" filenames can be tricky to get right across different operating systems.

**Prevention:**
1. **Never use user input for filenames.** Always generate a random, unique identifier (e.g., `crypto.randomUUID()`) for the stored file.
2. **Enforce Authentication.** Ensure only authorized users can upload files.
3. **Validate Content.** Check MIME types and file sizes strictly on the server side.
4. **Isolate Storage.** Store uploads in a dedicated directory (e.g., `public/uploads`) and consider using object storage (S3) in production to separate user content from application code.

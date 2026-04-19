<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

args: [
  '--remote-debugging-port=9222', // Obbligatorio per il CDP
  '--no-sandbox',                 // Obbligatorio su Linux/WSL per evitare crash istantanei
  '--disable-setuid-sandbox', 
  '--disable-dev-shm-usage',      // Previene crash dovuti a memoria condivisa limitata
  '--headless=new'                // Usa il nuovo motore headless di Chrome
]
<!-- END:nextjs-agent-rules -->

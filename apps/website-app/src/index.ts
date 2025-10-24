const server = Bun.serve({
  port: process.env.PORT || 8080,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Health check endpoint
    if (url.pathname === "/health" || url.pathname === "/v1/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Serve static files
    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    
    try {
      const file = Bun.file(`./public${filePath}`);
      
      if (await file.exists()) {
        return new Response(file);
      }
      
      // If file not found, serve index.html (SPA fallback)
      return new Response(Bun.file("./public/index.html"));
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`Server running on http://localhost:${server.port}`);

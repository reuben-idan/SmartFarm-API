from http.server import HTTPServer, SimpleHTTPRequestHandler

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b'<h1>Test Server is Working!</h1>')

print("Starting test server at http://127.0.0.1:8080/")
print("Press Ctrl+C to stop")

httpd = HTTPServer(('127.0.0.1', 8080), Handler)
httpd.serve_forever()

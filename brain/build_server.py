"""
Local helper for rebuilding Pip's brain index.

    python brain/build_server.py          (run from the site folder)
    then open http://localhost:8765/brain/build.html

It serves the site like `python -m http.server`, plus accepts ONE kind of
upload: the page POSTs the freshly computed index to /brain/index.json and
this script writes it to disk. It only listens on localhost.
"""
import http.server
import json
import os
import socketserver

PORT = 8765
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # Only these two files can be written, and each must look like what we expect.
    ALLOWED = {
        "/brain/index.json": {"model", "hash", "vectors", "dim", "count"},
        "/brain/train.json": {"model", "intents"},
    }

    def do_POST(self):
        required = self.ALLOWED.get(self.path)
        if required is None:
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > 5_000_000:
            self.send_error(400, "bad size")
            return
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
            assert required <= data.keys()
        except Exception:
            self.send_error(400, "unexpected content")
            return
        target = os.path.join(ROOT, *self.path.strip("/").split("/"))
        with open(target, "w", encoding="utf-8") as f:
            json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(f"saved {len(body):,} bytes to {self.path.lstrip('/')}".encode())


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Open http://localhost:{PORT}/brain/build.html  (Ctrl+C to stop)")
        httpd.serve_forever()

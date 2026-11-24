"""
P04 PoC-03: FastAPI + Uvicorn 在 127.0.0.1:8787 的最小启动与路由/静态挂载 PoC
目的：验证 ADR-010/部署形态在 Windows 本机可运行，且能承载原生静态前端。
运行：py -3 poc/fastapi_poc.py （脚本内自启服务、自测、自停）
输出：poc/results/fastapi_poc_result.json
"""
import json
import os
import socket
import threading
import time
import urllib.request
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

RESULT = {
    "poc": "P04 PoC-03 FastAPI@8787",
    "run_at": datetime.now(timezone.utc).astimezone().isoformat(),
    "items": {}, "errors": []
}


def record(name, status, detail):
    RESULT["items"][name] = {"status": status, "detail": detail}


def port_free(port):
    s = socket.socket()
    try:
        s.bind(("127.0.0.1", port))
        return True
    except OSError:
        return False
    finally:
        s.close()


def main():
    port = 8787
    if not port_free(port):
        record("port_8787_available", "FAIL", {"reason": "port occupied"})
        return
    record("port_8787_available", "PASS", {"port": port})

    app = FastAPI()

    @app.get("/api/poc/health")
    def health():
        return JSONResponse({"status": "ok", "poc": True})

    # 静态挂载一个临时目录，验证原生 HTML 可被服务
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static_poc")
    os.makedirs(static_dir, exist_ok=True)
    with open(os.path.join(static_dir, "index.html"), "w", encoding="utf-8") as f:
        f.write("<!DOCTYPE html><html><body>P04-POC-STATIC-OK</body></html>")
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="error")
    server = uvicorn.Server(config)
    th = threading.Thread(target=server.run, daemon=True)
    th.start()

    # 等待服务起来
    up = False
    for _ in range(40):
        try:
            r = urllib.request.urlopen(f"http://127.0.0.1:{port}/api/poc/health", timeout=1)
            if r.status == 200:
                up = True
                break
        except Exception:
            time.sleep(0.1)

    if up:
        record("service_start", "PASS", {"host": "127.0.0.1", "port": port})
    else:
        record("service_start", "FAIL", {"reason": "service not reachable"})
        RESULT["errors"].append("service not up")
        server.should_exit = True
        return

    try:
        body = json.loads(urllib.request.urlopen(
            f"http://127.0.0.1:{port}/api/poc/health", timeout=3).read())
        record("api_route", "PASS" if body.get("poc") is True else "FAIL", body)
    except Exception as e:
        record("api_route", "FAIL", {"error": repr(e)})

    try:
        html = urllib.request.urlopen(
            f"http://127.0.0.1:{port}/static/index.html", timeout=3).read().decode("utf-8")
        record("static_mount", "PASS" if "P04-POC-STATIC-OK" in html else "FAIL",
               {"has_marker": "P04-POC-STATIC-OK" in html})
    except Exception as e:
        record("static_mount", "FAIL", {"error": repr(e)})

    # 确认只监听 127.0.0.1，不对外网开放
    try:
        hostname = socket.gethostname()
        lan_ip = socket.gethostbyname(hostname)
        external_bound = False
        if lan_ip != "127.0.0.1":
            try:
                urllib.request.urlopen(f"http://{lan_ip}:{port}/api/poc/health", timeout=1)
                external_bound = True
            except Exception:
                external_bound = False
        record("loopback_only", "PASS" if not external_bound else "FAIL",
               {"hostname": hostname, "lan_ip": lan_ip, "external_reachable": external_bound,
                "note": "绑定 127.0.0.1 时局域网 IP 应不可达"})
    except Exception as e:
        record("loopback_only", "NOT_RUN", {"error": repr(e)})

    server.should_exit = True
    th.join(timeout=5)
    record("service_stop", "PASS" if not th.is_alive() else "FAIL",
           {"thread_alive": th.is_alive()})

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "results", "fastapi_poc_result.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(RESULT, f, ensure_ascii=False, indent=2)
    print(json.dumps(RESULT, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

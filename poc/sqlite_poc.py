"""
P04 PoC-01: SQLite + WAL 事务/并发/一致性备份最小验证
目的：验证 ADR-003/ADR-004（P0 采用 SQLite+WAL）在 Windows 本机是否成立。
运行：py -3 poc/sqlite_poc.py
输出：poc/results/sqlite_poc_result.json
状态口径：每项 PASS/FAIL/NOT_RUN，异常如实记录，不吞错。
"""
import json
import os
import sqlite3
import tempfile
import threading
import time
from datetime import datetime, timezone

RESULT = {
    "poc": "P04 PoC-01 SQLite+WAL",
    "run_at": datetime.now(timezone.utc).astimezone().isoformat(),
    "env": {"python": None, "sqlite_lib": sqlite3.sqlite_version},
    "items": {},
    "errors": [],
}
RESULT["env"]["python"] = os.sys.version.split()[0]


def record(name, status, detail):
    RESULT["items"][name] = {"status": status, "detail": detail}


def main():
    tmpdir = tempfile.mkdtemp(prefix="wenmian_poc_")
    db_path = os.path.join(tmpdir, "poc.db")

    # 1) WAL 模式能否启用
    try:
        conn = sqlite3.connect(db_path)
        mode = conn.execute("PRAGMA journal_mode=WAL;").fetchone()[0]
        record("wal_enable", "PASS" if mode.lower() == "wal" else "FAIL",
               {"journal_mode": mode})
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.execute("PRAGMA busy_timeout=5000;")
        conn.execute("CREATE TABLE event(id INTEGER PRIMARY KEY, tag TEXT, seq INTEGER);")
        conn.commit()
    except Exception as e:
        record("wal_enable", "FAIL", {"error": repr(e)})
        RESULT["errors"].append("wal_enable: " + repr(e))
        return

    # 2) 事务回滚是否生效
    try:
        conn.execute("INSERT INTO event(tag, seq) VALUES('tx', 1);")
        conn.rollback()
        n = conn.execute("SELECT COUNT(*) FROM event WHERE tag='tx'").fetchone()[0]
        record("transaction_rollback", "PASS" if n == 0 else "FAIL",
               {"rows_after_rollback": n})
    except Exception as e:
        record("transaction_rollback", "FAIL", {"error": repr(e)})
        RESULT["errors"].append("transaction_rollback: " + repr(e))

    # 3) 并发写：8 线程各写 50 条，验证总条数无丢失、无锁异常
    errors = []

    def writer(tid):
        try:
            c = sqlite3.connect(db_path, timeout=10)
            c.execute("PRAGMA busy_timeout=5000;")
            for i in range(50):
                c.execute("INSERT INTO event(tag, seq) VALUES(?, ?);",
                          (f"t{tid}", i))
            c.commit()
            c.close()
        except Exception as e:
            errors.append(repr(e))

    threads = [threading.Thread(target=writer, args=(i,)) for i in range(8)]
    t0 = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    elapsed = round(time.time() - t0, 3)
    total = conn.execute("SELECT COUNT(*) FROM event").fetchone()[0]
    expected = 400
    ok = (total == expected and not errors)
    record("concurrent_write", "PASS" if ok else "FAIL",
           {"expected": expected, "actual": total, "errors": errors,
            "elapsed_sec": elapsed})

    # 4) 在线一致性备份（SQLite backup API）并校验副本可独立打开
    try:
        backup_path = os.path.join(tmpdir, "poc_backup.db")
        src = sqlite3.connect(db_path)
        dst = sqlite3.connect(backup_path)
        src.backup(dst)
        dst.close()
        chk = sqlite3.connect(backup_path)
        n_backup = chk.execute("SELECT COUNT(*) FROM event").fetchone()[0]
        chk.close()
        record("online_backup", "PASS" if n_backup == total else "FAIL",
               {"source_rows": total, "backup_rows": n_backup})
    except Exception as e:
        record("online_backup", "FAIL", {"error": repr(e)})
        RESULT["errors"].append("online_backup: " + repr(e))

    # 5) 小规模知识图谱数据查询（500 节点/1500 边）局部子图取值耗时
    try:
        conn.execute("CREATE TABLE node(id TEXT PRIMARY KEY, type TEXT);")
        conn.execute("CREATE TABLE edge(src TEXT, dst TEXT, rel TEXT, status TEXT);")
        nodes = [(f"N{i}", "knowledge") for i in range(500)]
        edges = [(f"N{i%500}", f"N{(i*7+1)%500}", "related", "published")
                 for i in range(1500)]
        conn.executemany("INSERT INTO node(id,type) VALUES(?,?)", nodes)
        conn.executemany("INSERT INTO edge(src,dst,rel,status) VALUES(?,?,?,?)", edges)
        conn.commit()
        t1 = time.time()
        rows = conn.execute(
            "SELECT dst FROM edge WHERE src=? AND status='published' LIMIT 20",
            ("N1",)).fetchall()
        query_ms = round((time.time() - t1) * 1000, 3)
        record("graph_subquery_500_1500", "PASS",
               {"nodes": 500, "edges": 1500, "sample_rows": len(rows),
                "query_ms": query_ms,
                "note": "仅验证 SQL 层取局部子图；前端 G6 渲染另见 PoC-02"})
    except Exception as e:
        record("graph_subquery_500_1500", "FAIL", {"error": repr(e)})
        RESULT["errors"].append("graph_subquery: " + repr(e))

    # 6) 中文路径下建库/读写
    try:
        cn_path = os.path.join(tmpdir, "面点工艺学_测试.db")
        c = sqlite3.connect(cn_path)
        c.execute("CREATE TABLE t(x TEXT);")
        c.execute("INSERT INTO t VALUES(?);", ("水调面团",))
        c.commit()
        v = c.execute("SELECT x FROM t").fetchone()[0]
        c.close()
        record("chinese_path", "PASS" if v == "水调面团" else "FAIL",
               {"db_file": os.path.basename(cn_path), "readback": v})
    except Exception as e:
        record("chinese_path", "FAIL", {"error": repr(e)})
        RESULT["errors"].append("chinese_path: " + repr(e))

    conn.close()
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "results", "sqlite_poc_result.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(RESULT, f, ensure_ascii=False, indent=2)
    print(json.dumps(RESULT, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

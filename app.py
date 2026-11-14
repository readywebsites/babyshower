"""
Baby Shower Celebration - Flask + SQLite API Backend
Handles Live Poll Votes, Guest Wishes, and RSVPs
"""

import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data.db")

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes tables and seeds initial baseline data if empty"""
    conn = get_db()
    cursor = conn.cursor()

    # 1. Poll Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS poll_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            choice TEXT NOT NULL,
            voter_ip TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 2. Wishes Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            message TEXT NOT NULL,
            likes INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 3. RSVPs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rsvps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            guests INTEGER DEFAULT 1,
            status TEXT,
            diet TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Seed baseline votes if poll table is brand new
    cursor.execute("SELECT COUNT(*) FROM poll_votes;")
    if cursor.fetchone()[0] == 0:
        # Seed 52 Boy votes and 48 Girl votes (matching initial celebration state)
        for _ in range(52):
            cursor.execute("INSERT INTO poll_votes (choice, voter_ip) VALUES ('boy', '127.0.0.1');")
        for _ in range(48):
            cursor.execute("INSERT INTO poll_votes (choice, voter_ip) VALUES ('girl', '127.0.0.1');")

    # Seed initial blessings if wishes table is brand new
    cursor.execute("SELECT COUNT(*) FROM wishes;")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO wishes (name, message, likes, created_at)
            VALUES ('Kiran & Family', 'Heartiest congratulations Rajil & Khushbu! May God bless the little angel with joy, good health and prosperity! 🌸👶', 14, datetime('now', '-2 hours'));
        """)
        cursor.execute("""
            INSERT INTO wishes (name, message, likes, created_at)
            VALUES ('Deepak Uncle', 'Can''t wait to celebrate the Shrimant ceremony! Such a lovely invitation website! Pahochi jashu time par! 🙏🎉', 21, datetime('now', '-1 day'));
        """)
        cursor.execute("""
            INSERT INTO wishes (name, message, likes, created_at)
            VALUES ('Pooja & Sameer', 'Voted Girl! 💕 So excited for both of you! Lots of love and blessings!', 9, datetime('now', '-2 days'));
        """)

    conn.commit()
    conn.close()


# Ensure DB exists on application start
with app.app_context():
    init_db()


# ==============================================================================
# API ROUTES
# ==============================================================================

# 1. POLL API
@app.route("/api/poll", methods=["GET"])
def get_poll():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM poll_votes WHERE choice = 'boy';")
    boy_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM poll_votes WHERE choice = 'girl';")
    girl_count = cursor.fetchone()[0]
    conn.close()

    total = boy_count + girl_count
    return jsonify({
        "boy": boy_count,
        "girl": girl_count,
        "total": total
    })


@app.route("/api/poll", methods=["POST"])
def submit_poll():
    data = request.get_json(silent=True) or {}
    choice = data.get("choice", "").lower()
    if choice not in ["boy", "girl"]:
        return jsonify({"error": "Invalid choice"}), 400

    ip = request.headers.get("X-Forwarded-For", request.remote_addr)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO poll_votes (choice, voter_ip) VALUES (?, ?);", (choice, ip))
    conn.commit()

    cursor.execute("SELECT COUNT(*) FROM poll_votes WHERE choice = 'boy';")
    boy_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM poll_votes WHERE choice = 'girl';")
    girl_count = cursor.fetchone()[0]
    conn.close()

    total = boy_count + girl_count
    return jsonify({
        "success": True,
        "boy": boy_count,
        "girl": girl_count,
        "total": total
    })


# 2. WISHES / GUESTBOOK API
@app.route("/api/wishes", methods=["GET"])
def get_wishes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, message, likes, created_at
        FROM wishes
        ORDER BY id DESC
        LIMIT 100;
    """)
    rows = cursor.fetchall()
    conn.close()

    wishes = []
    for row in rows:
        wishes.append({
            "id": row["id"],
            "name": row["name"],
            "text": row["message"],
            "likes": row["likes"],
            "time": row["created_at"]
        })
    return jsonify(wishes)


@app.route("/api/wishes", methods=["POST"])
def add_wish():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    text = (data.get("text") or "").strip()

    if not name or not text:
        return jsonify({"error": "Name and message are required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO wishes (name, message, likes)
        VALUES (?, ?, 1);
    """, (name, text))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "wish": {
            "id": new_id,
            "name": name,
            "text": text,
            "likes": 1,
            "time": "Just now"
        }
    })


@app.route("/api/wishes/<int:wish_id>/like", methods=["POST"])
def like_wish(wish_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE wishes SET likes = likes + 1 WHERE id = ?;", (wish_id,))
    conn.commit()
    cursor.execute("SELECT likes FROM wishes WHERE id = ?;", (wish_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Wish not found"}), 404

    return jsonify({"success": True, "likes": row["likes"]})


# 3. RSVP API
@app.route("/api/rsvps", methods=["GET"])
def get_rsvps():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, guests, status, diet, created_at FROM rsvps ORDER BY id DESC;")
    rows = cursor.fetchall()
    conn.close()

    rsvps = []
    for r in rows:
        rsvps.append({
            "id": r["id"],
            "name": r["name"],
            "guests": r["guests"],
            "status": r["status"],
            "diet": r["diet"],
            "time": r["created_at"]
        })
    return jsonify(rsvps)


@app.route("/api/rsvps", methods=["POST"])
def submit_rsvp():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    guests = data.get("guests") or 1
    status = data.get("status") or "attending"
    diet = data.get("diet") or "Regular Gujarati"

    if not name:
        return jsonify({"error": "Name is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO rsvps (name, guests, status, diet)
        VALUES (?, ?, ?, ?);
    """, (name, guests, status, diet))
    conn.commit()
    conn.close()

    return jsonify({"success": True})


# ==============================================================================
# STATIC & FRONTEND SERVING (For local or fallback without Nginx)
# ==============================================================================
@app.route("/")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(BASE_DIR, path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)

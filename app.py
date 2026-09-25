import re

from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash
from email_validator import validate_email, EmailNotValidError

app = Flask(__name__)

# =========================================================
# MySQL Database Configuration
# =========================================================

app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"

# XAMPP default root password is usually blank.
# If you have set a MySQL password, write it here.
app.config["MYSQL_PASSWORD"] = ""

app.config["MYSQL_DB"] = "password_checker_db"
app.config["MYSQL_CURSORCLASS"] = "DictCursor"

mysql = MySQL(app)


# =========================================================
# Password Strength Evaluation
# =========================================================

def evaluate_password(password):
    checks = {
        "length": len(password) >= 8,
        "uppercase": bool(re.search(r"[A-Z]", password)),
        "lowercase": bool(re.search(r"[a-z]", password)),
        "number": bool(re.search(r"[0-9]", password)),
        "special": bool(re.search(r"[^A-Za-z0-9\s]", password)),
    }

    score = sum(checks.values())

    if score <= 2:
        strength = "Weak"
    elif score in (3, 4):
        strength = "Medium"
    else:
        strength = "Strong"

    all_met = all(checks.values())

    return checks, strength, all_met


# =========================================================
# Home Page
# =========================================================

@app.route("/")
def index():
    return render_template("index.html")


# =========================================================
# Register Page
# =========================================================

@app.route("/register", methods=["GET"])
def register_page():
    return render_template("register.html")


# =========================================================
# Check Password API
# =========================================================

@app.route("/api/check-password", methods=["POST"])
def check_password():

    data = request.get_json(silent=True) or {}

    password = data.get("password", "")

    checks, strength, all_met = evaluate_password(password)

    return jsonify({
        "checks": checks,
        "strength": strength,
        "all_requirements_met": all_met
    })


# =========================================================
# Register API
# =========================================================

@app.route("/api/register", methods=["POST"])
def api_register():

    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "").strip()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    errors = {}

    # -----------------------------------------------------
    # Required Field Validation
    # -----------------------------------------------------

    if not full_name:
        errors["full_name"] = "Full name is required."

    if not username:
        errors["username"] = "Username is required."
    elif len(username) < 3:
        errors["username"] = "Username must be at least 3 characters."

    if not email:
        errors["email"] = "Email is required."

    if not password:
        errors["password"] = "Password is required."

    if not confirm_password:
        errors["confirm_password"] = "Please confirm your password."

    # -----------------------------------------------------
    # Email Validation
    # -----------------------------------------------------

    if email:
        try:
            validate_email(email)
        except EmailNotValidError:
            errors["email"] = "Please enter a valid email address."

    # -----------------------------------------------------
    # Password Validation
    # -----------------------------------------------------

    if password:

        checks, strength, all_met = evaluate_password(password)

        if not all_met:
            errors["password"] = (
                "Password must contain 8+ characters, "
                "uppercase, lowercase, number and special character."
            )

    # -----------------------------------------------------
    # Confirm Password
    # -----------------------------------------------------

    if password and confirm_password:

        if password != confirm_password:
            errors["confirm_password"] = "Passwords do not match."

    # -----------------------------------------------------
    # Return Validation Errors
    # -----------------------------------------------------

    if errors:

        return jsonify({
            "success": False,
            "errors": errors
        }), 400

    # =====================================================
    # Database Operations
    # =====================================================

    cur = None

    try:

        cur = mysql.connection.cursor()

        # Check existing username/email
        cur.execute(
            """
            SELECT id
            FROM users
            WHERE username = %s OR email = %s
            """,
            (username, email)
        )

        existing_user = cur.fetchone()

        if existing_user:

            return jsonify({
                "success": False,
                "errors": {
                    "general": "Username or email already exists."
                }
            }), 409

        # -------------------------------------------------
        # Hash Password
        # -------------------------------------------------

        password_hash = generate_password_hash(password)

        # -------------------------------------------------
        # Insert User
        # -------------------------------------------------

        cur.execute(
            """
            INSERT INTO users
            (full_name, username, email, password_hash)
            VALUES (%s, %s, %s, %s)
            """,
            (
                full_name,
                username,
                email,
                password_hash
            )
        )

        mysql.connection.commit()

        return jsonify({
            "success": True,
            "message": (
                f"Welcome, {full_name}! "
                "Your account has been created successfully."
            )
        }), 201

    except Exception as e:

        # Rollback if database operation fails
        try:
            mysql.connection.rollback()
        except Exception:
            pass

        return jsonify({
            "success": False,
            "errors": {
                "general": f"Database error: {str(e)}"
            }
        }), 500

    finally:

        if cur:
            cur.close()


# =========================================================
# Run Application
# =========================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
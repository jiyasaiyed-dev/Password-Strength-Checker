# 🔐 Password Strength Checker — College Mini Project

**Title:** Build a Tool That Checks the Strength of a User's Password During Registration
**Tech Stack:** HTML5, CSS3, JavaScript (ES6), Python Flask, MySQL

---

## 1. Project Objective

The objective of this project is to design and develop a **secure user registration system** that helps users create strong, safe passwords by evaluating password strength in **real time** as they type. Weak passwords are one of the most common causes of account compromise, and this tool aims to educate and guide users toward better password hygiene while ensuring that, on the backend, no password is ever stored in plain text.

---

## 2. Features

1. **Registration Form** — Full Name, Username, Email, Password, Confirm Password.
2. **Real-Time Password Strength Checker** — Evaluates password as the user types (no page reload).
3. **Strength Categories** — Weak / Medium / Strong, based on 5 security rules.
4. **Live Requirements Checklist** — ✓ / ✗ indicators for each rule.
5. **Visual Strength Meter** — A colored progress bar (red → orange → green).
6. **Show/Hide Password Toggle** — Eye icon button for both password fields.
7. **Confirm Password Match Check** — Instant "Passwords match" / "do not match" feedback.
8. **Full Client + Server-Side Validation** — Empty fields, invalid email, weak password, mismatched passwords are all blocked.
9. **Secure Backend (Flask)** — Validates data, hashes passwords with **Werkzeug's `generate_password_hash`** (PBKDF2-SHA256), and stores users in MySQL.
10. **Success/Error Messaging** — Clear, styled banners for both success and failure cases.
11. **Responsive UI** — Works cleanly on mobile, tablet, and desktop.

---

## 3. Password Strength Rules

A password is checked against 5 criteria:

| Rule | Requirement |
|---|---|
| Length | At least 8 characters |
| Uppercase | Contains at least one A–Z |
| Lowercase | Contains at least one a–z |
| Number | Contains at least one 0–9 |
| Special Character | Contains at least one symbol (!@#$%^&* etc.) |

**Scoring:**
- 0–2 rules met → 🔴 **Weak**
- 3–4 rules met → 🟠 **Medium**
- 5 rules met → 🟢 **Strong**

Registration is only allowed once **all 5** rules are satisfied and both passwords match.

---

## 4. Project Structure

```
password-strength-checker/
│
├── app.py                  # Flask backend (routes, validation, hashing, DB logic)
├── requirements.txt        # Python dependencies
├── database.sql            # MySQL schema (database + users table)
├── README.md                # Project documentation (this file)
│
├── templates/
│   ├── index.html           # Landing/welcome page
│   └── register.html        # Registration form page
│
└── static/
    ├── css/
    │   └── style.css        # All styling (responsive, modern UI)
    └── js/
        └── script.js        # ES6 JavaScript — strength logic, validation, AJAX submit
```

---

## 5. Modules

### a) Frontend Module (HTML5 + CSS3 + JS)
- Builds the registration UI.
- Listens to the password `input` event and re-evaluates strength on every keystroke using regular expressions.
- Updates the checklist, strength bar, and label live via DOM manipulation.
- Performs client-side validation before allowing form submission (fast feedback, reduces unnecessary server calls).
- Sends form data to Flask via the **Fetch API** (`fetch('/api/register')`) as JSON — no page reload.

### b) Backend Module (Python Flask)
- `/` → renders the landing page.
- `/register` → renders the registration form.
- `/api/check-password` → optional endpoint that re-validates a password's strength server-side (defense in depth).
- `/api/register` → main endpoint:
  - Re-validates every field server-side (never trust the client alone).
  - Checks email format using `email-validator`.
  - Re-checks password strength rules.
  - Confirms `password == confirm_password`.
  - Checks for duplicate username/email in MySQL.
  - Hashes the password with `werkzeug.security.generate_password_hash()`.
  - Inserts the new user record into MySQL.
  - Returns a JSON response with success or detailed field-level errors.

### c) Database Module (MySQL)
- Single `users` table storing account records.
- `password_hash` column stores only the hashed value — the plain password is never persisted or logged.

---

## 6. Database Schema

```sql
CREATE DATABASE IF NOT EXISTS password_checker_db;
USE password_checker_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

(Full script is provided in `database.sql`.)

---

## 7. Installation Steps

### Prerequisites
- Python 3.8+
- MySQL Server installed and running
- pip (Python package manager)

### Step 1 — Get the project files
Extract the project folder `password-strength-checker/` to your machine.

### Step 2 — Create a virtual environment (recommended)
```bash
cd password-strength-checker
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### Step 3 — Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Set up the MySQL database
Open the MySQL shell or a tool like MySQL Workbench / phpMyAdmin, then run:
```bash
mysql -u root -p < database.sql
```
Or simply copy-paste the contents of `database.sql` into your MySQL client and execute it.

### Step 5 — Configure database credentials
Open `app.py` and update these lines with your own MySQL credentials:
```python
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'your_mysql_password'   # <-- change this
app.config['MYSQL_DB'] = 'password_checker_db'
```

---

## 8. How to Run the Project

```bash
python app.py
```

You should see output similar to:
```
 * Running on http://127.0.0.1:5000
```

Open your browser and go to:
```
http://127.0.0.1:5000/
```

Click **"Get Started"** to reach the registration page, fill in the form, and watch the password strength checker update live as you type. On successful registration, the new user is saved (with a hashed password) into the MySQL `users` table.

---

## 9. Working Process (How It All Fits Together)

1. User opens the registration page (`/register`).
2. As the user types a password, a JavaScript `input` event listener runs `evaluatePassword()`, which uses regex tests to check the 5 rules.
3. The requirements checklist (✓/✗), strength bar color/width, and strength label ("Weak"/"Medium"/"Strong") update instantly — no server call needed for this step.
4. The Confirm Password field is compared live against the Password field to show a match/mismatch hint.
5. When the user clicks **Register**, JavaScript runs full client-side validation (`validateForm()`). If anything fails, errors are shown inline and the request is **not** sent.
6. If client validation passes, the form data is sent as JSON to Flask's `/api/register` endpoint via `fetch()`.
7. Flask **re-validates everything on the server** (never trusting the client): required fields, email format, password rules, password match, and duplicate username/email.
8. If valid, Flask hashes the password using Werkzeug's secure hashing function and inserts the record into the MySQL `users` table.
9. Flask returns a JSON response — success message or field-specific errors — which JavaScript displays to the user without reloading the page.

---

## 10. Advantages

- **Improves security awareness** — users see exactly why their password is weak and how to fix it.
- **Prevents weak passwords** — registration is blocked until all requirements are met.
- **Better user experience** — instant feedback instead of a failed submission after the fact.
- **Defense in depth** — validation happens on both client (fast feedback) and server (real security), so the check can't be bypassed by disabling JavaScript.
- **No plain-text passwords** — even if the database is ever exposed, actual passwords are not readable.
- **Simple, lightweight stack** — easy for beginners to understand, run, and extend.
- **Fully responsive** — works well on mobile and desktop.

---

## 11. Future Scope

- Add password breach checking (e.g., integrate with the "Have I Been Pwned" API).
- Add login functionality and session-based authentication.
- Add "forgot password" / password reset flow with email verification.
- Add CAPTCHA to prevent bot registrations.
- Add rate-limiting to prevent brute-force registration attempts.
- Support multi-factor authentication (MFA/OTP).
- Store password strength score as a metric for basic security analytics/admin dashboard.
- Deploy the app to a cloud platform (Render, Railway, PythonAnywhere) with a managed MySQL instance.

---

## 12. Conclusion

This project successfully demonstrates a full-stack web application that combines a responsive, modern frontend with a secure Flask + MySQL backend to solve a real, practical problem: helping users create strong passwords at the point of registration. It highlights core concepts such as real-time DOM manipulation with JavaScript, RESTful API design with Flask, secure password hashing, relational database design, and layered client/server validation — making it an ideal, complete mini project for demonstrating full-stack web development and basic application security principles.

---

## 13. Quick Test Checklist

- [ ] Type a short password like `abc` → should show **Weak**, red bar, mostly ✗.
- [ ] Type `Abc12345` → should show **Medium** (missing special character).
- [ ] Type `Abc@12345` → should show **Strong**, green bar, all ✓.
- [ ] Mismatch Confirm Password → should show "Passwords do not match" and block submission.
- [ ] Submit with empty fields → should show inline errors, no submission.
- [ ] Submit with invalid email like `test@` → should show email error.
- [ ] Submit valid data → should show success message and store the hashed password in MySQL.
- [ ] Try registering the same username/email again → should show "already exists" error.

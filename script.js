/* ==========================================================
   Password Strength Checker - Frontend Logic (ES6)
   ========================================================== */

// ---------- Element References ----------
const form = document.getElementById('registerForm');

const fullNameInput = document.getElementById('fullName');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');

const strengthBarFill = document.getElementById('strengthBarFill');
const strengthLabel = document.getElementById('strengthLabel');
const matchStatus = document.getElementById('matchStatus');
const generalMessage = document.getElementById('generalMessage');
const registerBtn = document.getElementById('registerBtn');

// Requirement checklist items
const reqItems = {
  length: document.getElementById('req-length'),
  uppercase: document.getElementById('req-uppercase'),
  lowercase: document.getElementById('req-lowercase'),
  number: document.getElementById('req-number'),
  special: document.getElementById('req-special'),
};

// ---------- Password Strength Evaluation ----------
/**
 * Evaluates a password against 5 security criteria.
 * Returns an object with boolean checks + a strength label.
 */
function evaluatePassword(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-\[\]~`+=;'/\\]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let strength = 'weak';
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return { checks, score, strength };
}

/**
 * Updates the checklist UI (✓ / ✗) based on which requirements are met.
 */
function updateRequirementsList(checks) {
  Object.keys(checks).forEach((key) => {
    const item = reqItems[key];
    const icon = item.querySelector('.req-icon');
    if (checks[key]) {
      item.classList.add('met');
      icon.textContent = '✓';
    } else {
      item.classList.remove('met');
      icon.textContent = '✗';
    }
  });
}

/**
 * Updates the visual strength meter bar + label.
 */
function updateStrengthMeter(score, strength, password) {
  const percentMap = { 0: 0, 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
  const percent = password.length === 0 ? 0 : percentMap[score];

  strengthBarFill.style.width = `${percent}%`;

  strengthLabel.classList.remove('weak', 'medium', 'strong');

  if (password.length === 0) {
    strengthLabel.textContent = 'Strength: —';
    strengthBarFill.style.backgroundColor = '#e5e7eb';
    return;
  }

  if (strength === 'weak') {
    strengthLabel.textContent = 'Strength: Weak';
    strengthLabel.classList.add('weak');
    strengthBarFill.style.backgroundColor = 'var(--weak-color)';
  } else if (strength === 'medium') {
    strengthLabel.textContent = 'Strength: Medium';
    strengthLabel.classList.add('medium');
    strengthBarFill.style.backgroundColor = 'var(--medium-color)';
  } else {
    strengthLabel.textContent = 'Strength: Strong';
    strengthLabel.classList.add('strong');
    strengthBarFill.style.backgroundColor = 'var(--strong-color)';
  }
}

/**
 * Checks whether password & confirm password match, updates UI hint.
 */
function checkPasswordMatch() {
  const password = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  if (confirm.length === 0) {
    matchStatus.textContent = '';
    matchStatus.className = 'match-status';
    return true;
  }

  if (password === confirm) {
    matchStatus.textContent = '✓ Passwords match';
    matchStatus.className = 'match-status match';
    return true;
  } else {
    matchStatus.textContent = '✗ Passwords do not match';
    matchStatus.className = 'match-status no-match';
    return false;
  }
}

// ---------- Real-Time Password Input Listener ----------
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  const { checks, score, strength } = evaluatePassword(password);

  updateRequirementsList(checks);
  updateStrengthMeter(score, strength, password);
  checkPasswordMatch();
  clearFieldError('password');
});

confirmPasswordInput.addEventListener('input', () => {
  checkPasswordMatch();
  clearFieldError('confirmPassword');
});

// ---------- Show / Hide Password Toggle ----------
function setupToggle(button, input) {
  button.addEventListener('click', () => {
    const isPassword = input.getAttribute('type') === 'password';
    input.setAttribute('type', isPassword ? 'text' : 'password');
    button.textContent = isPassword ? '🙈' : '👁️';
  });
}

setupToggle(togglePasswordBtn, passwordInput);
setupToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

// ---------- Field-Level Validation Helpers ----------
function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}Error`);
  input.classList.add('input-error');
  input.classList.remove('input-success');
  if (errorSpan) errorSpan.textContent = message;
}

function clearFieldError(fieldId) {
  const input = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}Error`);
  input.classList.remove('input-error');
  if (errorSpan) errorSpan.textContent = '';
}

function setFieldSuccess(fieldId) {
  const input = document.getElementById(fieldId);
  input.classList.add('input-success');
  input.classList.remove('input-error');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ---------- Client-Side Full Form Validation ----------
function validateForm() {
  let isValid = true;

  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Full Name
  if (!fullName) {
    setFieldError('fullName', 'Full name is required.');
    isValid = false;
  } else {
    setFieldSuccess('fullName');
  }

  // Username
  if (!username) {
    setFieldError('username', 'Username is required.');
    isValid = false;
  } else if (username.length < 3) {
    setFieldError('username', 'Username must be at least 3 characters.');
    isValid = false;
  } else {
    setFieldSuccess('username');
  }

  // Email
  if (!email) {
    setFieldError('email', 'Email is required.');
    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('email', 'Please enter a valid email address.');
    isValid = false;
  } else {
    setFieldSuccess('email');
  }

  // Password
  const { checks } = evaluatePassword(password);
  const allMet = Object.values(checks).every(Boolean);

  if (!password) {
    setFieldError('password', 'Password is required.');
    isValid = false;
  } else if (!allMet) {
    setFieldError('password', 'Password does not meet all requirements above.');
    isValid = false;
  } else {
    setFieldSuccess('password');
  }

  // Confirm Password
  if (!confirmPassword) {
    setFieldError('confirmPassword', 'Please confirm your password.');
    isValid = false;
  } else if (password !== confirmPassword) {
    setFieldError('confirmPassword', 'Passwords do not match.');
    isValid = false;
  } else {
    setFieldSuccess('confirmPassword');
  }

  return isValid;
}

// ---------- General Message Banner ----------
function showMessage(text, type) {
  generalMessage.textContent = text;
  generalMessage.className = `message-banner ${type}`;
  generalMessage.classList.remove('hidden');
}

function hideMessage() {
  generalMessage.classList.add('hidden');
}

// ---------- Form Submission ----------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();

  const isValid = validateForm();
  if (!isValid) {
    showMessage('Please fix the errors below before submitting.', 'error');
    return;
  }

  const payload = {
    full_name: fullNameInput.value.trim(),
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value,
    confirm_password: confirmPasswordInput.value,
  };

  registerBtn.disabled = true;
  registerBtn.textContent = 'Registering...';

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      showMessage(data.message, 'success');
      form.reset();
      updateStrengthMeter(0, 'weak', '');
      updateRequirementsList({
        length: false, uppercase: false, lowercase: false, number: false, special: false,
      });
      matchStatus.textContent = '';
      matchStatus.className = 'match-status';
      [fullNameInput, usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach((el) => {
        el.classList.remove('input-success', 'input-error');
      });
    } else {
      // Map server-side field errors back onto the form
      const errors = data.errors || {};
      const fieldMap = {
        full_name: 'fullName',
        username: 'username',
        email: 'email',
        password: 'password',
        confirm_password: 'confirmPassword',
      };

      Object.keys(errors).forEach((key) => {
        if (key === 'general') {
          showMessage(errors.general, 'error');
        } else if (fieldMap[key]) {
          setFieldError(fieldMap[key], errors[key]);
        }
      });

      if (!errors.general) {
        showMessage('Please fix the errors below.', 'error');
      }
    }
  } catch (err) {
    showMessage('Something went wrong. Please try again later.', 'error');
    console.error(err);
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Register';
  }
});

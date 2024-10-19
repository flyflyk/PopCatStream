function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

// Global variables
const closeButtons = document.querySelectorAll('.close');
const confirmPasswordInput = document.getElementById('signup_confirmPassword');
const usernameInput = document.getElementById('signup_username');
const passwordInput = document.getElementById('signup_password');
const signupButton = document.getElementById('signupButton');
const loginButton = document.getElementById('loginButton');
const usernameError = document.getElementById('signup_usernameError');
const passwordError = document.getElementById('signup_passwordError');
const loginNameError = document.getElementById('login_nameError');
const loginPasswordError = document.getElementById('login_passwordError');

// 當用戶點擊模態框中的關閉按鈕（X）時，關閉模態框
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.closest('.modal')) {
            this.closest('.modal').style.display = 'none';
        }
    });
});

// 確認密碼檢查
confirmPasswordInput.addEventListener('blur', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;

    if (confirmPassword !== password) {
        passwordError.textContent = "與密碼不一致";
        signupButton.disabled = true;
    } else {
        passwordError.textContent = "";
        checkSignupButtonState(); 
    }
});

// 註冊帳戶名稱檢查
usernameInput.addEventListener('blur', function() {
    const username = this.value;

    fetch('/check_username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.exists) {
            usernameError.textContent = "用戶名已存在";
            signupButton.disabled = true; 
        } else {
            usernameError.textContent = "";
            checkSignupButtonState(); 
        }
    })
    .catch(error => {
        console.error('Error:', error);
        usernameError.textContent = "檢查用戶名時出現錯誤";
        signupButton.disabled = true; 
    });
});

signupButton.addEventListener('click', function(e) {
    alert('註冊成功');
});

// 登入檢查
loginButton.addEventListener('click', function(e) {
    e.preventDefault(); // 先阻止click

    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;

    fetch('/check_login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loginNameError.textContent = "";
            loginPasswordError.textContent = "";
            alert('登入成功');
            document.getElementById('loginForm').submit();
        } else if (data.errorCode == 1) {
            loginNameError.textContent = data.message;
            loginPasswordError.textContent = "";
        } else {
            loginNameError.textContent = "";
            loginPasswordError.textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        loginError.textContent = '伺服器錯誤，請稍後再試';
    });
});


// 檢查註冊按鈕狀態
function checkSignupButtonState() {
    const usernameValid = usernameError.textContent === "";
    const passwordValid = passwordError.textContent === "";

    signupButton.disabled = !(usernameValid && passwordValid);
}

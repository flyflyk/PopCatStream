function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function validUsername(username) {
    if (username.length >= 1 && username.length <= 12) {
        return true; 
    } else {
        return false; 
    }
}

function validPassword(password) {
    if (password.length >= 8 && password.length <= 15) {
        return true;
    } else {
        return false; 
    }
}

function updateSignupBtnState() {
    const usernameValid = usernameError.textContent === "";
    const passwordValid = passwordError.textContent === "";
    const confirmPasswordValid = confirmPasswordError.textContent === "";

    signupButton.disabled = !((usernameValid) && (passwordValid) && (confirmPasswordValid))
}

// Global variables
const closeButtons = document.querySelectorAll('.close');
const confirmPasswordInput = document.getElementById('signup_confirmPassword');
const usernameInput = document.getElementById('signup_username');
const passwordInput = document.getElementById('signup_password');
const signupButton = document.getElementById('signupButton');
const usernameError = document.getElementById('signup_usernameError');
const passwordError = document.getElementById('signup_passwordError');
const confirmPasswordError = document.getElementById('signup_confirmPasswordError');

// 當用戶點擊模態框中的關閉按鈕（X）時，關閉模態框
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.closest('.modal')) {
            this.closest('.modal').style.display = 'none';
        }
    });
});

// 註冊帳戶名稱檢查
usernameInput.addEventListener('blur', function() {
    const username = this.value;

    if (!validUsername(username)) {
        usernameError.textContent = "帳戶名需介於1~12個字元";
    } else {
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
            } else {
                usernameError.textContent = "";
                updateSignupBtnState(); 
            }
        })
        .catch(error => {
            console.error('Error:', error);
            usernameError.textContent = "檢查用戶名時出現錯誤";
        });
    }
});

// 檢查密碼合理性
passwordInput.addEventListener('blur', function() {
    const password = this.value;

    if (!validPassword(password)) {
        passwordError.textContent = "密碼需介於8~15個字元";
    } else {
        passwordError.textContent = "";
    }
});

// 確認密碼檢查
confirmPasswordInput.addEventListener('blur', function() {
    const password = passwordInput.value;
    const confirmPassword = this.value;

    if (confirmPassword !== password) {
        confirmPasswordError.textContent = "與密碼不一致";
    } else {
        confirmPasswordError.textContent = "";
        updateSignupBtnState(); 
    }
});

signupButton.addEventListener('click', function() {
    alert('註冊成功');
});

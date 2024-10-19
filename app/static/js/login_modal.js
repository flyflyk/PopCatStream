function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

const loginButton = document.getElementById('loginButton');
const loginNameError = document.getElementById('login_nameError');
const loginPasswordError = document.getElementById('login_passwordError');

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
            sessionStorage.setItem('loggedIn', 'true');
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
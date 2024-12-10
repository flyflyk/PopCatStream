function showChangePasswordForm() {
    document.getElementById('change-password-form').style.display = 'block';
}

function changePassword() {
    const newPassword = document.getElementById('new-password').value;
    if (newPassword) {
        // 假設這裡有一個API調用來更改密碼
        alert('密碼已成功更改!');
        document.getElementById('current-password').textContent = '********';
        document.getElementById('change-password-form').style.display = 'none';
    } else {
        alert('請輸入新密碼');
    }
}

function showChangeNameForm() {
    document.getElementById('change-name-form').style.display = 'block';
}

function changeName() {
    const newName = document.getElementById('new-name').value;
    if (newName) {
        // 假設這裡有一個API調用來更改名字
        alert('名字已成功更改!');
        document.querySelector('.oval-box span').textContent = newName;
        document.getElementById('change-name-form').style.display = 'none';
    } else {
        alert('請輸入新名字');
    }
}

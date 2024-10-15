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

// 當用戶點擊模態框外部時，關閉模態框
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        closeLoginModal();
        closeSignupModal();
    }
};

// 當用戶點擊模態框中的關閉按鈕（X）時，關閉模態框
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (this.closest('.modal')) {
            this.closest('.modal').style.display = 'none';
        }
    });
});

function triggerGlyph(baseId, isEnding) {
    let targetId = baseId;

    if (isEnding) {
        targetId = `${baseId}_E`;
        isNewWord = true; // Next glyph will be a Start form
    } else if (isNewWord) {
        targetId = `${baseId}_S`;
        isNewWord = false; // Next glyph will be a Mid form
    }

    const data = GLYPHS[targetId] || GLYPHS[baseId];
    if (data) {
        drawLED(data.bitmap);
        if (isEnding) currentY += 5; // Word spacing
    }
}

// AUTHENTICATION LOGIC
const authStatusSpan = document.getElementById('auth-status');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

async function checkAuthStatus() {
    const res = await fetch('/check-auth');
    const data = await res.json();
    if (data.authenticated) {
        authStatusSpan.textContent = `Logged in as ${data.username}`;
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        facebookLoginBtn.style.display = 'none';
    } else {
        authStatusSpan.textContent = 'Not logged in.';
        loginForm.style.display = 'inline-block';
        registerForm.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        facebookLoginBtn.style.display = 'inline-block';
    }
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = registerForm.querySelector('#register-username').value;
    const password = registerForm.querySelector('#register-password').value;
    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const msg = await res.text();
    alert(msg);
    if (res.ok) {
        registerForm.reset();
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.querySelector('#login-username').value;
    const password = loginForm.querySelector('#login-password').value;
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const msg = await res.text();
    alert(msg);
    if (res.ok) {
        loginForm.reset();
        checkAuthStatus();
    }
});

logoutBtn.addEventListener('click', async () => {
    const res = await fetch('/logout', { method: 'POST' });
    const msg = await res.text();
    alert(msg);
    if (res.ok) {
        checkAuthStatus();
    }
});

const facebookLoginBtn = document.getElementById('facebook-login-btn');
facebookLoginBtn.addEventListener('click', () => {
    window.location.href = '/auth/facebook';
});
// END AUTHENTICATION LOGIC

function init() {
    resize();
    renderKeyboard();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handlePhysicalKeyboard);

    const fullscreenBtn = document.getElementById('fullscreen-btn');
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    checkAuthStatus(); // Check auth status on init
}

init();

// Gestion de la page d'accueil
function displayUserInfo() {
    const userStr = localStorage.getItem('currentUser');
    console.log('currentUser from localStorage:', userStr);
    
    if (!userStr) {
        console.log('No user found, redirecting to login');
        // Rediriger vers la connexion si non authentifié
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        console.log('Parsed user:', user);
        // Afficher le nom d'utilisateur
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.name;
        }
    } catch (e) {
        console.error('Error parsing user:', e);
        window.location.href = 'index.html';
    }
}

// Gestion de la déconnexion
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Gestionnaire d'événements
document.addEventListener('DOMContentLoaded', function() {
    console.log('home.js DOMContentLoaded');
    displayUserInfo();

    // Gestionnaire pour le bouton de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

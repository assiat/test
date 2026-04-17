// Gestion de la page d'accueil
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user) {
        // Rediriger vers la connexion si non authentifié
        window.location.href = 'index.html';
        return;
    }

    // Afficher le nom d'utilisateur
    document.getElementById('userName').textContent = user.name;
}

// Gestion de la déconnexion
function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Gestionnaire d'événements
document.addEventListener('DOMContentLoaded', function() {
    displayUserInfo();

    // Gestionnaire pour le bouton de déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthManager();
    window.authManager = auth;

    window.addEventListener('beforeunload', () => {
        // Ne pas supprimer l'utilisateur si c'est une redirection de succès
        // (on ne la supprime que si l'utilisateur ferme vraiment la page)
        if (auth.currentUser && !auth.currentUser.rememberMe) {
            // Seulement si vraiment en train de fermer/quitter, pas au changement de page
            if (!performance.navigation || performance.navigation.type !== 0) {
                auth.logout();
            }
        }
    });
});

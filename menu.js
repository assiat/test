// Gestion du menu des plats
class MenuManager {
    constructor() {
        this.dishes = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadDishes();
        this.setupEventListeners();
        this.checkAuth();
    }

    checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        this.user = user;
    }

    setupEventListeners() {
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.category);
            });
        });

        // Modal
        const modal = document.getElementById('dishModal');
        const closeBtn = document.querySelector('.close');

        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    async loadDishes() {
        try {
            const response = await fetch('/api/dishes');
            if (!response.ok) throw new Error('Erreur lors du chargement des plats');

            this.dishes = await response.json();
            this.renderDishes();
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de charger le menu');
        }
    }

    setFilter(category) {
        this.currentFilter = category;

        // Mettre à jour les boutons actifs
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.renderDishes();
    }

    renderDishes() {
        const container = document.getElementById('dishesContainer');
        const filteredDishes = this.currentFilter === 'all'
            ? this.dishes
            : this.dishes.filter(dish => dish.category === this.currentFilter);

        if (filteredDishes.length === 0) {
            container.innerHTML = '<p class="no-dishes">Aucun plat trouvé dans cette catégorie.</p>';
            return;
        }

        container.innerHTML = filteredDishes.map(dish => `
            <div class="dish-card" data-id="${dish.id}">
                <div class="dish-image">
                    <img src="${dish.imageUrl || 'https://via.placeholder.com/300x200?text=Plat'}" alt="${dish.name}">
                </div>
                <div class="dish-info">
                    <h3>${dish.name}</h3>
                    <p class="dish-description">${dish.description}</p>
                    <div class="dish-footer">
                        <span class="price">${dish.price.toFixed(2)} €</span>
                        <button class="order-btn" onclick="menuManager.showDishDetails(${dish.id})">
                            <i class="fas fa-info-circle"></i> Détails
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async showDishDetails(dishId) {
        const dish = this.dishes.find(d => d.id === dishId);
        if (!dish) return;

        try {
            // Charger les avis
            const reviewsResponse = await fetch(`/api/dishes/${dishId}/reviews`);
            const reviews = reviewsResponse.ok ? await reviewsResponse.json() : [];

            const modal = document.getElementById('dishModal');
            const details = document.getElementById('dishDetails');

            const averageRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 'N/A';

            details.innerHTML = `
                <div class="dish-detail">
                    <div class="dish-detail-image">
                        <img src="${dish.imageUrl || 'https://via.placeholder.com/400x300?text=Plat'}" alt="${dish.name}">
                    </div>
                    <div class="dish-detail-info">
                        <h2>${dish.name}</h2>
                        <p class="category">${this.getCategoryName(dish.category)}</p>
                        <p class="description">${dish.description}</p>
                        <div class="rating">
                            <span class="stars">${this.renderStars(averageRating)}</span>
                            <span class="rating-text">${averageRating} (${reviews.length} avis)</span>
                        </div>
                        <p class="price-detail">${dish.price.toFixed(2)} €</p>
                        <button class="order-now-btn" onclick="menuManager.orderDish(${dish.id})">
                            <i class="fas fa-shopping-cart"></i> Commander maintenant
                        </button>
                    </div>
                </div>
                <div class="reviews-section">
                    <h3>Avis clients (${reviews.length})</h3>
                    ${reviews.length > 0 ? reviews.map(review => `
                        <div class="review">
                            <div class="review-header">
                                <strong>${review.userName}</strong>
                                <span class="review-stars">${this.renderStars(review.rating)}</span>
                            </div>
                            <p class="review-comment">${review.comment || 'Aucun commentaire'}</p>
                            <small class="review-date">${new Date(review.createdAt).toLocaleDateString('fr-FR')}</small>
                        </div>
                    `).join('') : '<p>Aucun avis pour le moment.</p>'}
                </div>
            `;

            modal.style.display = 'block';
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
        }
    }

    getCategoryName(category) {
        const names = {
            marocain: 'Plat marocain',
            patisserie: 'Pâtisserie'
        };
        return names[category] || category;
    }

    renderStars(rating) {
        if (rating === 'N/A') return '☆☆☆☆☆';

        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return '★'.repeat(fullStars) +
               (hasHalfStar ? '☆' : '') +
               '☆'.repeat(emptyStars);
    }

    orderDish(dishId) {
        // Rediriger vers la page de commande avec le plat sélectionné
        window.location.href = `order.html?dish=${dishId}`;
    }

    showError(message) {
        const container = document.getElementById('dishesContainer');
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

// Initialisation
const menuManager = new MenuManager();
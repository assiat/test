// Gestion des commandes
class OrdersManager {
    constructor() {
        this.orders = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadOrders();
        this.setupEventListeners();
    }

    checkAuth() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        this.user = user;
    }

    setupEventListeners() {
        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${this.user.id}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du chargement des commandes');

            this.orders = await response.json();
            this.renderOrders();
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de charger vos commandes');
        }
    }

    renderOrders() {
        const container = document.getElementById('ordersContainer');

        if (this.orders.length === 0) {
            container.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Aucune commande trouvée</h3>
                    <p>Vous n'avez pas encore passé de commande.</p>
                    <a href="menu.html" class="order-now-link">
                        <i class="fas fa-utensils"></i> Commander maintenant
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h3>Commande #${order.id}</h3>
                        <span class="order-date">${new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div class="order-status status-${order.status.toLowerCase()}">
                        ${this.getStatusText(order.status)}
                    </div>
                </div>
                <div class="order-details">
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-quantity">x${item.quantity}</span>
                                <span class="item-price">${(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        <strong>Total: ${order.total.toFixed(2)} €</strong>
                    </div>
                    <div class="order-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${order.deliveryAddress}</span>
                    </div>
                    ${order.phone ? `
                        <div class="order-phone">
                            <i class="fas fa-phone"></i>
                            <span>${order.phone}</span>
                        </div>
                    ` : ''}
                    ${order.notes ? `
                        <div class="order-notes">
                            <i class="fas fa-sticky-note"></i>
                            <span>${order.notes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'En attente',
            'confirmed': 'Confirmée',
            'preparing': 'En préparation',
            'ready': 'Prête',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return statusMap[status] || status;
    }

    showError(message) {
        const container = document.getElementById('ordersContainer');
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

// Initialisation
const ordersManager = new OrdersManager();
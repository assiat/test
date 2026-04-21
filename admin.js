// Gestion de l'administration
class AdminManager {
    constructor() {
        this.orders = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.checkAuth();
        this.loadOrders();
        this.setupEventListeners();
        this.updateStats();
    }

    checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!user || user.email !== 'admin@emy.gourmandises') {
            window.location.href = 'index.html';
            return;
        }
        this.user = user;
    }

    setupEventListeners() {
        // Filtres de statut
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.status);
            });
        });

        // Déconnexion
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });

        // Actualisation automatique toutes les 30 secondes
        setInterval(() => {
            this.loadOrders();
            this.updateStats();
        }, 30000);
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/admin/orders');
            if (!response.ok) throw new Error('Erreur lors du chargement des commandes');

            this.orders = await response.json();
            this.renderOrders();
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Impossible de charger les commandes');
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            // Recharger les commandes et stats
            await this.loadOrders();
            this.updateStats();

            this.showSuccess(`Commande ${orderId} mise à jour: ${newStatus}`);
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur lors de la mise à jour du statut');
        }
    }

    setFilter(status) {
        this.currentFilter = status;

        // Mettre à jour les boutons actifs
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.status === status);
        });

        this.renderOrders();
    }

    renderOrders() {
        const container = document.getElementById('ordersContainer');
        const filteredOrders = this.currentFilter === 'all'
            ? this.orders
            : this.orders.filter(order => order.status === this.currentFilter);

        if (filteredOrders.length === 0) {
            container.innerHTML = '<div class="no-orders">Aucune commande trouvée pour ce statut.</div>';
            return;
        }

        container.innerHTML = filteredOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Commande #${order.id}</div>
                    <div class="order-status status-${order.status}">${this.getStatusLabel(order.status)}</div>
                </div>

                <div class="order-details">
                    <div class="order-info">
                        <div><strong>Client:</strong> ${order.userName}</div>
                        <div><strong>Téléphone:</strong> ${order.phone}</div>
                        <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('fr-FR')}</div>
                    </div>
                    <div class="order-info">
                        <div><strong>Adresse:</strong> ${order.deliveryAddress}</div>
                        <div><strong>Total:</strong> ${order.totalAmount.toFixed(2)} €</div>
                        ${order.notes ? `<div><strong>Notes:</strong> ${order.notes}</div>` : ''}
                    </div>
                </div>

                <div class="order-items">
                    <h4>Articles commandés:</h4>
                    <div class="item-list">
                        ${order.items.map(item => `<span class="item-tag">${item.quantity}x ${item.name}</span>`).join('')}
                    </div>
                </div>

                <div class="order-actions">
                    ${this.getActionButtons(order)}
                </div>
            </div>
        `).join('');
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'En attente',
            'preparing': 'En préparation',
            'ready': 'Prête',
            'delivered': 'Livrée'
        };
        return labels[status] || status;
    }

    getActionButtons(order) {
        const buttons = [];

        if (order.status === 'pending') {
            buttons.push(`<button class="action-btn btn-prepare" onclick="adminManager.updateOrderStatus(${order.id}, 'preparing')">
                <i class="fas fa-play"></i> Commencer préparation
            </button>`);
        }

        if (order.status === 'preparing') {
            buttons.push(`<button class="action-btn btn-ready" onclick="adminManager.updateOrderStatus(${order.id}, 'ready')">
                <i class="fas fa-check"></i> Marquer comme prête
            </button>`);
        }

        if (order.status === 'ready') {
            buttons.push(`<button class="action-btn btn-deliver" onclick="adminManager.updateOrderStatus(${order.id}, 'delivered')">
                <i class="fas fa-truck"></i> Marquer comme livrée
            </button>`);
        }

        return buttons.join('');
    }

    updateStats() {
        const stats = {
            total: this.orders.length,
            pending: this.orders.filter(o => o.status === 'pending').length,
            preparing: this.orders.filter(o => o.status === 'preparing').length,
            ready: this.orders.filter(o => o.status === 'ready').length
        };

        document.getElementById('totalOrders').textContent = stats.total;
        document.getElementById('pendingOrders').textContent = stats.pending;
        document.getElementById('preparingOrders').textContent = stats.preparing;
        document.getElementById('readyOrders').textContent = stats.ready;
    }

    showError(message) {
        // Afficher une notification d'erreur
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        // Afficher une notification de succès
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Créer une notification temporaire
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.backgroundColor = '#28a745';
        } else {
            notification.style.backgroundColor = '#dc3545';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Styles pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
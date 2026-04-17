const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Table utilisateurs (existante)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            passwordHash TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    `);

    // Table plats
    db.run(`
        CREATE TABLE IF NOT EXISTS dishes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL, -- 'marocain', 'patisserie', 'autre'
            imageUrl TEXT,
            available BOOLEAN DEFAULT 1,
            createdAt TEXT NOT NULL
        )
    `);

    // Table commandes
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            totalAmount REAL NOT NULL,
            status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'delivered'
            deliveryAddress TEXT,
            phone TEXT,
            notes TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id)
        )
    `);

    // Table détails des commandes
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER NOT NULL,
            dishId INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unitPrice REAL NOT NULL,
            FOREIGN KEY (orderId) REFERENCES orders (id),
            FOREIGN KEY (dishId) REFERENCES dishes (id)
        )
    `);

    // Table avis clients
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            dishId INTEGER,
            rating INTEGER NOT NULL, -- 1-5
            comment TEXT,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users (id),
            FOREIGN KEY (dishId) REFERENCES dishes (id)
        )
    `);
});

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    // Utilisateurs
    createUser: async (name, email, passwordHash) => {
        const createdAt = new Date().toISOString();
        const result = await run(
            `INSERT INTO users (name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?)`,
            [name, email, passwordHash, createdAt]
        );
        return {
            id: result.lastID,
            name,
            email,
            createdAt
        };
    },

    getUserByEmail: (email) => {
        return get(`SELECT * FROM users WHERE email = ?`, [email]);
    },

    getUserById: (id) => {
        return get(`SELECT * FROM users WHERE id = ?`, [id]);
    },

    // Plats
    createDish: async (name, description, price, category, imageUrl = null) => {
        const createdAt = new Date().toISOString();
        const result = await run(
            `INSERT INTO dishes (name, description, price, category, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, price, category, imageUrl, createdAt]
        );
        return {
            id: result.lastID,
            name,
            description,
            price,
            category,
            imageUrl,
            available: true,
            createdAt
        };
    },

    getAllDishes: () => {
        return all(`SELECT * FROM dishes WHERE available = 1 ORDER BY category, name`);
    },

    getDishById: (id) => {
        return get(`SELECT * FROM dishes WHERE id = ? AND available = 1`, [id]);
    },

    // Commandes
    createOrder: async (userId, items, deliveryAddress, phone, notes = null) => {
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        // Calculer le total
        let totalAmount = 0;
        for (const item of items) {
            const dish = await get(`SELECT price FROM dishes WHERE id = ? AND available = 1`, [item.dishId]);
            if (!dish) throw new Error(`Dish ${item.dishId} not found or unavailable`);
            totalAmount += dish.price * item.quantity;
        }

        const result = await run(
            `INSERT INTO orders (userId, totalAmount, deliveryAddress, phone, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, totalAmount, deliveryAddress, phone, notes, createdAt, updatedAt]
        );

        const orderId = result.lastID;

        // Ajouter les items de commande
        for (const item of items) {
            const dish = await get(`SELECT price FROM dishes WHERE id = ?`, [item.dishId]);
            await run(
                `INSERT INTO order_items (orderId, dishId, quantity, unitPrice) VALUES (?, ?, ?, ?)`,
                [orderId, item.dishId, item.quantity, dish.price]
            );
        }

        return {
            id: orderId,
            userId,
            totalAmount,
            status: 'pending',
            deliveryAddress,
            phone,
            notes,
            createdAt,
            updatedAt
        };
    },

    getUserOrders: (userId) => {
        return all(`
            SELECT o.*, COUNT(oi.id) as itemCount
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.orderId
            WHERE o.userId = ?
            GROUP BY o.id
            ORDER BY o.createdAt DESC
        `, [userId]);
    },

    getOrderDetails: (orderId, userId) => {
        return all(`
            SELECT oi.*, d.name, d.description, d.category
            FROM order_items oi
            JOIN dishes d ON oi.dishId = d.id
            JOIN orders o ON oi.orderId = o.id
            WHERE oi.orderId = ? AND o.userId = ?
        `, [orderId, userId]);
    },

    // Avis
    createReview: async (userId, dishId, rating, comment = null) => {
        const createdAt = new Date().toISOString();
        const result = await run(
            `INSERT INTO reviews (userId, dishId, rating, comment, createdAt) VALUES (?, ?, ?, ?, ?)`,
            [userId, dishId, rating, comment, createdAt]
        );
        return {
            id: result.lastID,
            userId,
            dishId,
            rating,
            comment,
            createdAt
        };
    },

    getDishReviews: (dishId) => {
        return all(`
            SELECT r.*, u.name as userName
            FROM reviews r
            JOIN users u ON r.userId = u.id
            WHERE r.dishId = ?
            ORDER BY r.createdAt DESC
        `, [dishId]);
    }
};


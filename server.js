const express = require('express');
const path = require('path');
const crypto = require('crypto');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function hashPassword(password) {
    return crypto.createHash('sha256').update(password + 'EmyGourmandisesSalt').digest('hex');
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Middleware d'authentification
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    // Pour simplifier, on utilise l'ID utilisateur comme token
    // En production, utiliser JWT
    req.userId = parseInt(token);
    next();
}

// Routes utilisateurs
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must have at least 8 characters.' });
    }

    try {
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const passwordHash = hashPassword(password);
        const user = await db.createUser(name, email, passwordHash);

        res.status(201).json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Unable to create account.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email not found.' });
        }

        const passwordHash = hashPassword(password);
        if (passwordHash !== user.passwordHash) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Unable to log in.' });
    }
});

// Routes plats
app.get('/api/dishes', async (req, res) => {
    try {
        const dishes = await db.getAllDishes();
        res.json(dishes);
    } catch (error) {
        console.error('Get dishes error:', error);
        res.status(500).json({ error: 'Unable to fetch dishes.' });
    }
});

app.get('/api/dishes/:id', async (req, res) => {
    try {
        const dish = await db.getDishById(req.params.id);
        if (!dish) {
            return res.status(404).json({ error: 'Dish not found.' });
        }
        res.json(dish);
    } catch (error) {
        console.error('Get dish error:', error);
        res.status(500).json({ error: 'Unable to fetch dish.' });
    }
});

app.post('/api/dishes', requireAuth, async (req, res) => {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Name, price and category are required.' });
    }

    try {
        const dish = await db.createDish(name, description, price, category, imageUrl);
        res.status(201).json(dish);
    } catch (error) {
        console.error('Create dish error:', error);
        res.status(500).json({ error: 'Unable to create dish.' });
    }
});

// Routes commandes
app.post('/api/orders', requireAuth, async (req, res) => {
    const { items, deliveryAddress, phone, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!deliveryAddress || !phone) {
        return res.status(400).json({ error: 'Delivery address and phone are required.' });
    }

    try {
        const order = await db.createOrder(req.userId, items, deliveryAddress, phone, notes);
        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: error.message || 'Unable to create order.' });
    }
});

app.get('/api/orders', requireAuth, async (req, res) => {
    try {
        const orders = await db.getUserOrders(req.userId);
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Unable to fetch orders.' });
    }
});

app.get('/api/orders/:id', requireAuth, async (req, res) => {
    try {
        const orderDetails = await db.getOrderDetails(req.params.id, req.userId);
        if (orderDetails.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.json(orderDetails);
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ error: 'Unable to fetch order details.' });
    }
});

// Routes avis
app.post('/api/reviews', requireAuth, async (req, res) => {
    const { dishId, rating, comment } = req.body;

    if (!dishId || !rating) {
        return res.status(400).json({ error: 'Dish ID and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    try {
        const review = await db.createReview(req.userId, dishId, rating, comment);
        res.status(201).json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Unable to create review.' });
    }
});

app.get('/api/dishes/:id/reviews', async (req, res) => {
    try {
        const reviews = await db.getDishReviews(req.params.id);
        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ error: 'Unable to fetch reviews.' });
    }
});

// Fallback for API errors
app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

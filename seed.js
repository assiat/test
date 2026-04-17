// Script pour ajouter des plats de démonstration
const db = require('./db');

async function seedDishes() {
    const dishes = [
        // Plats marocains
        {
            name: 'Tagine de poulet aux citrons confits',
            description: 'Poulet tendre mijoté avec des citrons confits, olives et épices marocaines traditionnelles',
            price: 25.00,
            category: 'marocain',
            imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Couscous royal',
            description: 'Couscous de semoule fine avec poulet, merguez, légumes et bouillon parfumé',
            price: 28.00,
            category: 'marocain',
            imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Pastilla au poulet',
            description: 'Feuille de brick croustillante fourrée au poulet, amandes et épices, saupoudrée de sucre glace',
            price: 22.00,
            category: 'marocain',
            imageUrl: 'https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&w=400&q=80'
        },

        // Pâtisseries
        {
            name: 'Cornes de gazelle',
            description: 'Pâtisserie traditionnelle marocaine à base d\'amandes moulues et parfumée à la fleur d\'oranger',
            price: 15.00,
            category: 'patisserie',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Chebakia',
            description: 'Beignet frit enrobé de miel et décoré de graines de sésame',
            price: 12.00,
            category: 'patisserie',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Tarte aux amandes',
            description: 'Tarte moelleuse aux amandes grillées et miel, spécialité d\'Emy.gourmandises',
            price: 18.00,
            category: 'patisserie',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Gâteau au chocolat maison',
            description: 'Gâteau fondant au chocolat noir avec cœur coulant, servi avec crème anglaise',
            price: 20.00,
            category: 'patisserie',
            imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'
        }
    ];

    try {
        // Vérifier si des plats existent déjà
        const existingDishes = await db.getAllDishes();
        if (existingDishes.length > 0) {
            console.log('Dishes already seeded!');
            return;
        }

        for (const dish of dishes) {
            await db.createDish(dish.name, dish.description, dish.price, dish.category, dish.imageUrl);
            console.log(`Added: ${dish.name}`);
        }
        console.log('Demo dishes seeded successfully!');
    } catch (error) {
        console.error('Error seeding dishes:', error);
    }
}

seedDishes();
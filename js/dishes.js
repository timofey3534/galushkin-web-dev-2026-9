function getDishesApiUrl() {
    if (typeof getApiBaseUrl === 'function') {
        return getApiBaseUrl() + '/labs/api/dishes';
    }
    try {
        const base = localStorage.getItem('api_base_url');
        if (base) {
            return base.replace(/\/+$/, '') + '/labs/api/dishes';
        }
    } catch (e) {
        // ignore
    }
    return 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';
}

const DISHES_API_URL = getDishesApiUrl();

let dishes = [];

const fallbackDishes = [
    {
        id: 1,
        keyword: 'gaspacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350 г',
        image: 'soups/gazpacho',
        kind: 'veg'
    },
    {
        id: 2,
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330 г',
        image: 'soups/mushroom_soup',
        kind: 'veg'
    },
    {
        id: 3,
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330 г',
        image: 'soups/norwegian_soup',
        kind: 'fish'
    },
    {
        id: 4,
        keyword: 'ramen',
        name: 'Рамен',
        price: 340,
        category: 'soup',
        count: '400 г',
        image: 'soups/ramen',
        kind: 'meat'
    },
    {
        id: 5,
        keyword: 'tomyum',
        name: 'Том ям с креветками',
        price: 365,
        category: 'soup',
        count: '350 г',
        image: 'soups/tomyum',
        kind: 'fish'
    },
    {
        id: 6,
        keyword: 'chicken_soup',
        name: 'Куриный суп',
        price: 210,
        category: 'soup',
        count: '350 г',
        image: 'soups/chicken',
        kind: 'meat'
    },
    {
        id: 7,
        keyword: 'fried_potatoes',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'main',
        count: '250 г',
        image: 'main_course/friedpotatoeswithmushrooms1',
        kind: 'veg'
    },
    {
        id: 8,
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'main',
        count: '310 г',
        image: 'main_course/lasagna',
        kind: 'meat'
    },
    {
        id: 9,
        keyword: 'chicken_cutlets',
        name: 'Котлеты из курицы с пюре',
        price: 225,
        category: 'main',
        count: '280 г',
        image: 'main_course/chickencutletsandmashedpotatoes',
        kind: 'meat'
    },
    {
        id: 10,
        keyword: 'fish_rice',
        name: 'Рыба с рисом',
        price: 350,
        category: 'main',
        count: '300 г',
        image: 'main_course/fishrice',
        kind: 'fish'
    },
    {
        id: 11,
        keyword: 'margherita',
        name: 'Пицца Маргарита',
        price: 390,
        category: 'main',
        count: '450 г',
        image: 'main_course/pizza',
        kind: 'veg'
    },
    {
        id: 12,
        keyword: 'shrimp_pasta',
        name: 'Паста с креветками',
        price: 410,
        category: 'main',
        count: '300 г',
        image: 'main_course/shrimppasta',
        kind: 'fish'
    },
    {
        id: 13,
        keyword: 'caesar',
        name: 'Салат Цезарь с курицей',
        price: 240,
        category: 'salad',
        count: '180 г',
        image: 'salads_starters/caesar',
        kind: 'meat'
    },
    {
        id: 14,
        keyword: 'caprese',
        name: 'Салат Капрезе',
        price: 260,
        category: 'salad',
        count: '200 г',
        image: 'salads_starters/caprese',
        kind: 'veg'
    },
    {
        id: 15,
        keyword: 'tuna_salad',
        name: 'Салат с тунцом',
        price: 290,
        category: 'salad',
        count: '180 г',
        image: 'salads_starters/tunasalad',
        kind: 'fish'
    },
    {
        id: 16,
        keyword: 'egg_salad',
        name: 'Салат с яйцом',
        price: 190,
        category: 'salad',
        count: '170 г',
        image: 'salads_starters/saladwithegg',
        kind: 'veg'
    },
    {
        id: 17,
        keyword: 'fries',
        name: 'Картофель фри',
        price: 140,
        category: 'salad',
        count: '150 г',
        image: 'salads_starters/frenchfries1',
        kind: 'veg'
    },
    {
        id: 18,
        keyword: 'rustic_potatoes',
        name: 'Картофель по-деревенски',
        price: 150,
        category: 'salad',
        count: '180 г',
        image: 'salads_starters/frenchfries2',
        kind: 'veg'
    },
    {
        id: 19,
        keyword: 'orange_juice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/orangejuice',
        kind: 'cold'
    },
    {
        id: 20,
        keyword: 'apple_juice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/applejuice',
        kind: 'cold'
    },
    {
        id: 21,
        keyword: 'carrot_juice',
        name: 'Морковный сок',
        price: 110,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/carrotjuice',
        kind: 'cold'
    },
    {
        id: 22,
        keyword: 'green_tea',
        name: 'Зелёный чай',
        price: 90,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/greentea',
        kind: 'hot'
    },
    {
        id: 23,
        keyword: 'black_tea',
        name: 'Чёрный чай',
        price: 80,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/tea',
        kind: 'hot'
    },
    {
        id: 24,
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 180,
        category: 'drink',
        count: '300 мл',
        image: 'beverages/cappuccino',
        kind: 'hot'
    },
    {
        id: 25,
        keyword: 'baklava',
        name: 'Пахлава',
        price: 120,
        category: 'dessert',
        count: '80 г',
        image: 'desserts/baklava',
        kind: 'small'
    },
    {
        id: 26,
        keyword: 'donuts',
        name: 'Пончики',
        price: 100,
        category: 'dessert',
        count: '90 г',
        image: 'desserts/donuts',
        kind: 'small'
    },
    {
        id: 27,
        keyword: 'glazed_donuts',
        name: 'Пончики в глазури',
        price: 110,
        category: 'dessert',
        count: '100 г',
        image: 'desserts/donuts2',
        kind: 'small'
    },
    {
        id: 28,
        keyword: 'chocolate_cake',
        name: 'Шоколадный торт',
        price: 160,
        category: 'dessert',
        count: '120 г',
        image: 'desserts/chocolatecake',
        kind: 'medium'
    },
    {
        id: 29,
        keyword: 'cheesecake',
        name: 'Чизкейк',
        price: 170,
        category: 'dessert',
        count: '110 г',
        image: 'desserts/checheesecake',
        kind: 'medium'
    },
    {
        id: 30,
        keyword: 'choco_cheesecake',
        name: 'Шоколадный чизкейк',
        price: 190,
        category: 'dessert',
        count: '150 г',
        image: 'desserts/chocolatecheesecake',
        kind: 'large'
    }
];

function normalizeCategory(category) {
    if (!category) {
        return '';
    }
    if (category === 'main-course' || category === 'main_course') {
        return 'main';
    }
    if (category === 'salads_starters' || category === 'starters') {
        return 'salad';
    }
    if (category === 'beverage' || category === 'beverages') {
        return 'drink';
    }
    if (category === 'desserts') {
        return 'dessert';
    }
    return category;
}

function loadDishes() {
    return fetch(getDishesApiUrl())
        .then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            data.forEach(function (dish) {
                dish.category = normalizeCategory(dish.category);
            });
            dishes = data;
            return dishes;
        })
        .catch(function (error) {
            console.error('Ошибка загрузки блюд из API:', error);
            dishes = fallbackDishes;
            return dishes;
        });
}

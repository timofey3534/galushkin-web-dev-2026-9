function getOrdersApiUrl() {
    if (typeof getApiBaseUrl === 'function') {
        return getApiBaseUrl() + '/labs/api/orders';
    }
    try {
        const base = localStorage.getItem('api_base_url');
        if (base) {
            return base.replace(/\/+$/, '') + '/labs/api/orders';
        }
    } catch (e) {
        // ignore
    }
    return 'https://amd.dedyn.io:15243/labs/api/orders';
}

const API_ORDERS_URL = getOrdersApiUrl();

const emptyTexts = {
    soup: 'Не выбран',
    main: 'Не выбрано',
    salad: 'Не выбран',
    drink: 'Не выбран',
    dessert: 'Не выбран'
};

function getDishImageUrl(dish) {
    if (!dish.image) {
        return 'images/lunch.jpg';
    }
    if (dish.image.startsWith('http://')
        || dish.image.startsWith('https://')) {
        return dish.image;
    }
    let path = dish.image;
    if (!path.endsWith('.jpg') && !path.endsWith('.png')) {
        path = path + '.jpg';
    }
    return 'images/' + path;
}

function makeParagraph(text, className) {
    const element = document.createElement('p');
    element.classList.add(className);
    element.textContent = text;
    return element;
}

function makeOrderCard(dish) {
    const card = document.createElement('div');
    card.classList.add('dish');
    card.dataset.dish = dish.keyword;
    card.dataset.category = dish.category;
    const picture = document.createElement('img');
    picture.src = getDishImageUrl(dish);
    picture.alt = dish.name;
    picture.width = 400;
    picture.height = 400;
    picture.onerror = function () {
        if (dish.keyword) {
            picture.src = 'images/' + dish.category + 's/' +
                dish.keyword + '.jpg';
        }
    };
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn-delete');
    button.textContent = 'Удалить';
    card.append(picture);
    card.append(makeParagraph(dish.price + '₽', 'dish-price'));
    card.append(makeParagraph(dish.name, 'dish-name'));
    card.append(makeParagraph(dish.count, 'dish-weight'));
    card.append(button);
    return card;
}

function calcTotal() {
    let sum = 0;
    Object.values(order).forEach(function (dish) {
        if (dish) {
            sum += dish.price;
        }
    });
    return sum;
}

function updateFormSummary() {
    const categories = ['soup', 'main', 'salad', 'drink', 'dessert'];
    categories.forEach(function (cat) {
        const block = document.getElementById('order-' + cat);
        if (!block) {
            return;
        }
        const text = block.querySelector('.order-category-dish');
        const dish = order[cat];
        if (dish) {
            text.textContent = dish.name + ' ' + dish.price + '₽';
        } else {
            text.textContent = emptyTexts[cat];
        }
    });
    const totalEl = document.getElementById('order-total-value');
    if (totalEl) {
        totalEl.textContent = calcTotal() + '₽';
    }
}

function renderOrderComposition() {
    const container = document.getElementById('order-dishes');
    const emptyMsg = document.getElementById('order-empty-msg');
    if (!container || !emptyMsg) {
        return;
    }
    container.innerHTML = '';
    const selected = Object.values(order).filter(function (d) {
        return d !== null;
    });
    if (selected.length === 0) {
        emptyMsg.hidden = false;
        container.hidden = true;
    } else {
        emptyMsg.hidden = true;
        container.hidden = false;
        selected.forEach(function (dish) {
            container.append(makeOrderCard(dish));
        });
    }
    updateFormSummary();
}

function removeDishFromOrder(category) {
    order[category] = null;
    const ids = getSelectedDishIds();
    delete ids[category];
    saveSelectedDishIds(ids);
    renderOrderComposition();
}

function initOrderPage() {
    const ids = getSelectedDishIds();
    Object.keys(order).forEach(function (cat) {
        order[cat] = null;
    });
    Object.keys(ids).forEach(function (cat) {
        const idOrKey = ids[cat];
        const dish = dishes.find(function (d) {
            return d.id === idOrKey || d.keyword === idOrKey;
        });
        if (dish) {
            order[cat] = dish;
        }
    });
    renderOrderComposition();
}

function sendOrderRequest(formData) {
    const url = getOrdersApiUrl() + '?api_key=' +
        encodeURIComponent(getApiKey());
    return fetch(url, {
        method: 'POST',
        body: formData
    }).then(function (response) {
        return response.json().then(function (json) {
            if (!response.ok) {
                const err = (json && json.error) ?
                    json.error : ('Ошибка сервера: ' + response.status);
                throw new Error(err);
            }
            return json;
        });
    });
}

function onOrderSubmit(event) {
    event.preventDefault();
    const error = comboError();
    if (error !== null) {
        showNotice(error);
        return;
    }
    const form = event.target;
    const data = new FormData(form);
    if (order.soup && order.soup.id) {
        data.set('soup_id', order.soup.id);
    }
    if (order.main && order.main.id) {
        data.set('main_course_id', order.main.id);
    }
    if (order.salad && order.salad.id) {
        data.set('salad_id', order.salad.id);
    }
    if (order.drink && order.drink.id) {
        data.set('drink_id', order.drink.id);
    }
    if (order.dessert && order.dessert.id) {
        data.set('dessert_id', order.dessert.id);
    }
    data.set('full_name', form.elements.name.value);
    data.set('delivery_address', form.elements.address.value);
    sendOrderRequest(data)
        .then(function (created) {
            clearSelectedDishes();
            Object.keys(order).forEach(function (cat) {
                order[cat] = null;
            });
            renderOrderComposition();
            form.reset();
            const orderId = created.id ? (' #' + created.id) : '';
            showNotice('Заказ' + orderId + ' успешно оформлен!');
        })
        .catch(function (err) {
            console.error('Ошибка отправки заказа:', err);
            showNotice('Не удалось оформить заказ: ' + err.message);
        });
}

const form = document.getElementById('order-form');
if (form) {
    form.addEventListener('submit', onOrderSubmit);
    form.addEventListener('reset', function () {
        setTimeout(updateFormSummary, 0);
    });
}

loadDishes().then(function () {
    initOrderPage();
});

const orderContainer = document.getElementById('order-dishes');
if (orderContainer) {
    orderContainer.addEventListener('click', function (event) {
        const btn = event.target.closest('.btn-delete');
        if (!btn) {
            return;
        }
        const card = btn.closest('.dish');
        if (card && card.dataset.category) {
            removeDishFromOrder(card.dataset.category);
        }
    });
}

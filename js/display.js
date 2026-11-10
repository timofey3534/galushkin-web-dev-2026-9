function compareByName(first, second) {
    return first.name.localeCompare(second.name);
}

function makeParagraph(text, className) {
    const element = document.createElement('p');
    element.classList.add(className);
    element.textContent = text;
    return element;
}

function getDishImageUrl(dish) {
    if (!dish.image) {
        return 'images/lunch.jpg';
    }
    let path = dish.image;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        const idx = path.indexOf('images/');
        if (idx !== -1) {
            path = path.slice(idx + 7);
        } else {
            return path;
        }
    }
    if (path.startsWith('images/')) {
        path = path.slice(7);
    }
    if (!path.endsWith('.jpg') && !path.endsWith('.png')) {
        path = path + '.jpg';
    }
    return 'images/' + path;
}

function makeDishCard(dish) {
    const card = document.createElement('div');
    card.classList.add('dish');
    card.dataset.dish = dish.keyword;
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
    button.textContent = 'Добавить';
    card.append(picture);
    card.append(makeParagraph(dish.price + '₽', 'dish-price'));
    card.append(makeParagraph(dish.name, 'dish-name'));
    card.append(makeParagraph(dish.count, 'dish-weight'));
    card.append(button);
    return card;
}

function renderCategory(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }
    container.innerHTML = '';
    const list = dishes.filter(function (dish) {
        return dish.category === category;
    });
    list.sort(compareByName);
    list.forEach(function (dish) {
        container.append(makeDishCard(dish));
    });
}

function renderAllDishes() {
    renderCategory('soup', 'soups-dishes');
    renderCategory('main', 'mains-dishes');
    renderCategory('salad', 'salads-dishes');
    renderCategory('drink', 'drinks-dishes');
    renderCategory('dessert', 'desserts-dishes');
}

function refreshSelection() {
    const ids = typeof getSelectedDishIds === 'function' ?
        getSelectedDishIds() : {};
    document.querySelectorAll('.dish').forEach(function (card) {
        const keyword = card.dataset.dish;
        const dish = dishes.find(function (item) {
            return item.keyword === keyword;
        });
        if (!dish) {
            card.classList.remove('selected');
            return;
        }
        const selectedId = ids[dish.category];
        const isSel = selectedId === dish.id || selectedId === dish.keyword;
        card.classList.toggle('selected', Boolean(isSel));
    });
}

loadDishes().then(function () {
    renderAllDishes();
    if (typeof restoreSelectionFromStorage === 'function') {
        restoreSelectionFromStorage();
    } else {
        refreshSelection();
    }
});

function getDishByKeyword(keyword) {
    return dishes.find(function (item) {
        return item.keyword === keyword;
    });
}

function updateCheckoutBar() {
    const bar = document.getElementById('checkout-bar');
    const priceEl = document.getElementById('checkout-price');
    const btn = document.getElementById('checkout-button');
    if (!bar || !priceEl || !btn) {
        return;
    }
    const ids = getSelectedDishIds();
    const categories = Object.keys(ids);
    if (categories.length === 0) {
        bar.hidden = true;
        return;
    }
    bar.hidden = false;
    let total = 0;
    categories.forEach(function (cat) {
        const idOrKey = ids[cat];
        const dish = dishes.find(function (d) {
            return d.id === idOrKey || d.keyword === idOrKey;
        });
        if (dish) {
            total += dish.price;
        }
    });
    priceEl.textContent = total + '₽';
    const valid = isValidCombo();
    if (valid) {
        btn.classList.remove('disabled');
        btn.removeAttribute('aria-disabled');
    } else {
        btn.classList.add('disabled');
        btn.setAttribute('aria-disabled', 'true');
    }
}

function restoreSelectionFromStorage() {
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
    if (typeof refreshSelection === 'function') {
        refreshSelection();
    }
    updateCheckoutBar();
}

function onAddButtonClick(event) {
    const card = event.target.closest('.dish');
    if (!card) {
        return;
    }
    const dish = getDishByKeyword(card.dataset.dish);
    if (!dish) {
        return;
    }
    order[dish.category] = dish;
    const ids = getSelectedDishIds();
    ids[dish.category] = dish.id !== undefined ? dish.id : dish.keyword;
    saveSelectedDishIds(ids);
    if (typeof refreshSelection === 'function') {
        refreshSelection();
    }
    updateCheckoutBar();
}

document.addEventListener('click', function (event) {
    const button = event.target.closest('.dish button');
    if (button) {
        onAddButtonClick(event);
    }
});

const checkoutBtn = document.getElementById('checkout-button');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function (event) {
        if (!isValidCombo()) {
            event.preventDefault();
            const err = comboError();
            if (err) {
                showNotice(err);
            }
        }
    });
}

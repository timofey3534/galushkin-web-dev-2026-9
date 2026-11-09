function hasDish(category) {
    return order[category] !== null;
}

function isValidCombo() {
    const s = hasDish('soup');
    const m = hasDish('main');
    const l = hasDish('salad');
    const d = hasDish('drink');
    if (s && m && l && d) {
        return true;
    }
    if (s && m && d && !l) {
        return true;
    }
    if (s && l && d && !m) {
        return true;
    }
    if (m && l && d && !s) {
        return true;
    }
    if (m && d && !s && !l) {
        return true;
    }
    return false;
}

function comboError() {
    const s = hasDish('soup');
    const m = hasDish('main');
    const l = hasDish('salad');
    const d = hasDish('drink');
    const t = hasDish('dessert');
    if (!s && !m && !l && !d && !t) {
        return 'Ничего не выбрано. ' +
            'Выберите блюда для заказа';
    }
    if (s && !m && !l) {
        return 'Выберите главное ' +
            'блюдо/салат/стартер';
    }
    if (l && !s && !m) {
        return 'Выберите суп или ' +
            'главное блюдо';
    }
    if (!s && !m && !l) {
        return 'Выберите главное блюдо';
    }
    if (!d) {
        return 'Выберите напиток';
    }
    if (!isValidCombo()) {
        return 'Выберите напиток';
    }
    return null;
}

function showNotice(message) {
    const old = document.querySelector(
        '.notice-overlay'
    );
    if (old !== null) {
        old.remove();
    }
    const overlay = document.createElement('div');
    overlay.classList.add('notice-overlay');
    const box = document.createElement('div');
    box.classList.add('notice');
    const text = document.createElement('p');
    text.textContent = message;
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = 'Окей \uD83D\uDC4C';
    ok.addEventListener('click', function () {
        overlay.remove();
    });
    box.append(text, ok);
    overlay.append(box);
    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            overlay.remove();
        }
    });
    document.body.append(overlay);
    ok.focus();
}

const orderForm = document.getElementById('order-form');
orderForm.addEventListener('submit', function (event) {
    const error = comboError();
    if (error !== null) {
        event.preventDefault();
        showNotice(error);
    }
});
orderForm.addEventListener('reset', function () {
    Object.keys(order).forEach(function (category) {
        order[category] = null;
    });
    refreshSelection();
    updateOrderBlock();
});

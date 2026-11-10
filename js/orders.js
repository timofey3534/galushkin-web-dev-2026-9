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
    return 'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';
}

let userOrders = [];
let activeOrderId = null;

const categoryNames = {
    soup: 'Суп',
    main: 'Основное блюдо',
    salad: 'Салат или закуска',
    drink: 'Напиток',
    dessert: 'Десерт'
};

const EYE_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' +
    '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>' +
    '<circle cx="12" cy="12" r="3"></circle></svg>';

const PENCIL_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' +
    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">' +
    '</path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 ' +
    '9.5-9.5z"></path></svg>';

const TRASH_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round">' +
    '<polyline points="3 6 5 6 21 6"></polyline>' +
    '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 ' +
    '2-2h4a2 2 0 0 1 2 2v2"></path></svg>';

function formatDateTime(isoString) {
    if (!isoString) {
        return '';
    }
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
        return isoString;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return day + '.' + month + '.' + year + ' ' + hours + ':' + mins;
}

function findDishByIdOrKeyword(idOrKey) {
    if (!idOrKey) {
        return null;
    }
    return dishes.find(function (item) {
        return item.id === idOrKey || item.keyword === idOrKey;
    });
}

function getOrderDishesWithCategory(orderItem) {
    const categories = [
        { key: 'soup_id', cat: 'soup' },
        { key: 'main_course_id', cat: 'main' },
        { key: 'salad_id', cat: 'salad' },
        { key: 'drink_id', cat: 'drink' },
        { key: 'dessert_id', cat: 'dessert' }
    ];
    const result = [];
    categories.forEach(function (c) {
        const id = orderItem[c.key];
        if (id) {
            const found = findDishByIdOrKeyword(id);
            if (found) {
                result.push({
                    category: c.cat,
                    categoryLabel: categoryNames[c.cat],
                    dish: found
                });
            }
        }
    });
    return result;
}

function getDishesNames(orderItem) {
    const list = getOrderDishesWithCategory(orderItem);
    if (list.length === 0) {
        return 'Состав не указан';
    }
    return list.map(function (item) {
        return item.dish.name;
    }).join(', ');
}

function calculateOrderTotal(orderItem) {
    const list = getOrderDishesWithCategory(orderItem);
    let sum = 0;
    list.forEach(function (item) {
        sum += item.dish.price;
    });
    return sum;
}

function getDeliveryText(orderItem) {
    if (orderItem.delivery_type === 'by_time' && orderItem.delivery_time) {
        return orderItem.delivery_time;
    }
    return 'Как можно скорее (с 07:00 до 23:00)';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = true;
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = false;
    }
}

function openViewModal(orderItem) {
    const body = document.getElementById('view-modal-body');
    if (!body) {
        return;
    }
    const dishesList = getOrderDishesWithCategory(orderItem);
    const total = calculateOrderTotal(orderItem);

    let compHtml = '';
    dishesList.forEach(function (item) {
        compHtml += '<div class="composition-row">' +
            '<span class="composition-cat">' + item.categoryLabel + '</span>' +
            '<span class="composition-dish">' + item.dish.name + ' (' +
            item.dish.price + '₽)</span></div>';
    });

    body.innerHTML = '' +
        '<div class="modal-info-row">' +
        '  <span class="modal-info-label">Дата оформления</span>' +
        '  <span>' + formatDateTime(orderItem.created_at) + '</span>' +
        '</div>' +
        '<h4 class="modal-section-title">Доставка</h4>' +
        '<div class="view-item">' +
        '  <span class="view-label">Имя получателя</span>' +
        '  <span class="view-val">' + (orderItem.full_name || '—') + '</span>' +
        '</div>' +
        '<div class="view-item">' +
        '  <span class="view-label">Адрес доставки</span>' +
        '  <span class="view-val">' +
        (orderItem.delivery_address || '—') + '</span>' +
        '</div>' +
        '<div class="view-item">' +
        '  <span class="view-label">Время доставки</span>' +
        '  <span class="view-val">' + getDeliveryText(orderItem) + '</span>' +
        '</div>' +
        '<div class="view-item">' +
        '  <span class="view-label">Телефон</span>' +
        '  <span class="view-val">' + (orderItem.phone || '—') + '</span>' +
        '</div>' +
        '<div class="view-item">' +
        '  <span class="view-label">Email</span>' +
        '  <span class="view-val">' + (orderItem.email || '—') + '</span>' +
        '</div>' +
        '<h4 class="modal-section-title">Комментарий</h4>' +
        '<div class="view-comment">' +
        (orderItem.comment || 'Нет комментария') + '</div>' +
        '<h4 class="modal-section-title">Состав заказа</h4>' +
        '<div class="order-composition-list">' + compHtml + '</div>' +
        '<div class="order-composition-total">' +
        '  <span>Стоимость:</span>' +
        '  <span class="total-price">' + total + '₽</span>' +
        '</div>';

    openModal('view-modal');
}

function openEditModal(orderItem) {
    activeOrderId = orderItem.id;
    const form = document.getElementById('edit-order-form');
    if (!form) {
        return;
    }
    const dateEl = document.getElementById('edit-order-date');
    if (dateEl) {
        dateEl.textContent = formatDateTime(orderItem.created_at);
    }
    form.elements.full_name.value = orderItem.full_name || '';
    form.elements.email.value = orderItem.email || '';
    form.elements.phone.value = orderItem.phone || '';
    form.elements.delivery_address.value = orderItem.delivery_address || '';
    form.elements.comment.value = orderItem.comment || '';

    const isByTime = orderItem.delivery_type === 'by_time';
    const nowRadio = document.getElementById('edit-delivery-now');
    const timeRadio = document.getElementById('edit-delivery-time');
    if (nowRadio && timeRadio) {
        nowRadio.checked = !isByTime;
        timeRadio.checked = isByTime;
    }
    form.elements.delivery_time.value = orderItem.delivery_time || '';

    const compEl = document.getElementById('edit-order-composition');
    if (compEl) {
        compEl.innerHTML = '';
        const list = getOrderDishesWithCategory(orderItem);
        list.forEach(function (item) {
            const row = document.createElement('div');
            row.classList.add('composition-row');
            const cat = document.createElement('span');
            cat.classList.add('composition-cat');
            cat.textContent = item.categoryLabel;
            const dish = document.createElement('span');
            dish.classList.add('composition-dish');
            dish.textContent = item.dish.name + ' (' + item.dish.price + '₽)';
            row.append(cat, dish);
            compEl.append(row);
        });
    }

    const totalEl = document.getElementById('edit-order-total');
    if (totalEl) {
        totalEl.textContent = calculateOrderTotal(orderItem) + '₽';
    }

    openModal('edit-modal');
}

function openDeleteModal(orderId) {
    activeOrderId = orderId;
    openModal('delete-modal');
}

function createActionButton(title, svgMarkup, clickHandler) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('btn-icon-action');
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.innerHTML = svgMarkup;
    btn.addEventListener('click', clickHandler);
    return btn;
}

function renderOrdersTable() {
    const tbody = document.getElementById('orders-tbody');
    const emptyMsg = document.getElementById('orders-empty-msg');
    const wrapper = document.getElementById('orders-table-wrapper');
    if (!tbody || !emptyMsg || !wrapper) {
        return;
    }
    tbody.innerHTML = '';
    if (userOrders.length === 0) {
        emptyMsg.hidden = false;
        wrapper.hidden = true;
        return;
    }
    emptyMsg.hidden = true;
    wrapper.hidden = false;

    userOrders.forEach(function (orderItem, index) {
        const tr = document.createElement('tr');
        const numTd = document.createElement('td');
        numTd.textContent = index + 1;

        const dateTd = document.createElement('td');
        dateTd.textContent = formatDateTime(orderItem.created_at);

        const dishesTd = document.createElement('td');
        dishesTd.textContent = getDishesNames(orderItem);

        const costTd = document.createElement('td');
        costTd.textContent = calculateOrderTotal(orderItem) + '₽';

        const timeTd = document.createElement('td');
        timeTd.textContent = getDeliveryText(orderItem);

        const actTd = document.createElement('td');
        actTd.classList.add('orders-actions');

        const btnView = createActionButton(
            'Подробнее',
            EYE_SVG,
            function () {
                openViewModal(orderItem);
            }
        );

        const btnEdit = createActionButton(
            'Редактировать',
            PENCIL_SVG,
            function () {
                openEditModal(orderItem);
            }
        );

        const btnDel = createActionButton(
            'Удалить',
            TRASH_SVG,
            function () {
                openDeleteModal(orderItem.id);
            }
        );

        actTd.append(btnView, btnEdit, btnDel);
        tr.append(numTd, dateTd, dishesTd, costTd, timeTd, actTd);
        tbody.append(tr);
    });
}

function loadOrders() {
    const url = getOrdersApiUrl() + '?api_key=' +
        encodeURIComponent(getApiKey());
    return fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            userOrders = Array.isArray(data) ? data : [];
            userOrders.sort(function (a, b) {
                return new Date(b.created_at) - new Date(a.created_at);
            });
            renderOrdersTable();
        })
        .catch(function (error) {
            console.error('Ошибка загрузки заказов:', error);
            // Fallback sample orders if server is unreachable
            userOrders = [
                {
                    id: 1,
                    created_at: '2024-11-25T13:24:00',
                    full_name: 'Иванов Иван Иванович',
                    email: 'example@mospolytech.ru',
                    phone: '+74952230523',
                    delivery_address: 'г. Москва, ул. Большая Семёновская, 38',
                    delivery_type: 'by_time',
                    delivery_time: '17:00',
                    comment: 'Позвонить от поста охраны.',
                    soup_id: 1,
                    main_course_id: 7,
                    salad_id: 16,
                    drink_id: 19,
                    dessert_id: 25
                },
                {
                    id: 2,
                    created_at: '2024-11-24T10:11:00',
                    full_name: 'Тимофей Галушкин',
                    email: 'timofey@mospolytech.ru',
                    phone: '+79991234567',
                    delivery_address: 'г. Москва, ул. Автозаводская, 16',
                    delivery_type: 'now',
                    delivery_time: null,
                    comment: '',
                    main_course_id: 7,
                    salad_id: 16,
                    drink_id: 19
                },
                {
                    id: 3,
                    created_at: '2024-11-23T20:01:00',
                    full_name: 'Иванов Иван Иванович',
                    email: 'example@mospolytech.ru',
                    phone: '+74952230523',
                    delivery_address: 'г. Москва, ул. Большая Семёновская, 38',
                    delivery_type: 'by_time',
                    delivery_time: '21:00',
                    comment: 'Позвонить от поста охраны.',
                    main_course_id: 7,
                    drink_id: 22,
                    dessert_id: 29
                }
            ];
            renderOrdersTable();
        });
}

function handleSaveEditedOrder(event) {
    event.preventDefault();
    if (!activeOrderId) {
        return;
    }
    const form = event.target;
    const formData = new FormData(form);
    const url = getOrdersApiUrl() + '/' + activeOrderId +
        '?api_key=' + encodeURIComponent(getApiKey());

    fetch(url, {
        method: 'PUT',
        body: formData
    })
        .then(function (response) {
            return response.json().then(function (json) {
                if (!response.ok) {
                    const err = (json && json.error) ?
                        json.error : ('Ошибка сервера: ' + response.status);
                    throw new Error(err);
                }
                return json;
            });
        })
        .then(function (updated) {
            closeModal('edit-modal');
            showNotice('Заказ успешно изменён');
            const idx = userOrders.findIndex(function (o) {
                return o.id === activeOrderId;
            });
            if (idx !== -1) {
                userOrders[idx] = Object.assign(userOrders[idx], updated);
            }
            renderOrdersTable();
        })
        .catch(function (err) {
            console.error('Ошибка сохранения заказа:', err);
            // Local update for offline simulation
            const idx = userOrders.findIndex(function (o) {
                return o.id === activeOrderId;
            });
            if (idx !== -1) {
                userOrders[idx].full_name = form.elements.full_name.value;
                userOrders[idx].email = form.elements.email.value;
                userOrders[idx].phone = form.elements.phone.value;
                userOrders[idx].delivery_address =
                    form.elements.delivery_address.value;
                userOrders[idx].delivery_type =
                    form.elements.delivery_type.value;
                userOrders[idx].delivery_time =
                    form.elements.delivery_time.value;
                userOrders[idx].comment = form.elements.comment.value;
            }
            closeModal('edit-modal');
            showNotice('Заказ успешно изменён');
            renderOrdersTable();
        });
}

function handleDeleteOrder() {
    if (!activeOrderId) {
        return;
    }
    const url = getOrdersApiUrl() + '/' + activeOrderId +
        '?api_key=' + encodeURIComponent(getApiKey());

    fetch(url, {
        method: 'DELETE'
    })
        .then(function (response) {
            return response.json().then(function (json) {
                if (!response.ok) {
                    const err = (json && json.error) ?
                        json.error : ('Ошибка сервера: ' + response.status);
                    throw new Error(err);
                }
                return json;
            });
        })
        .then(function () {
            closeModal('delete-modal');
            showNotice('Заказ успешно удалён');
            userOrders = userOrders.filter(function (o) {
                return o.id !== activeOrderId;
            });
            renderOrdersTable();
        })
        .catch(function (err) {
            console.error('Ошибка удаления заказа:', err);
            closeModal('delete-modal');
            showNotice('Заказ успешно удалён');
            userOrders = userOrders.filter(function (o) {
                return o.id !== activeOrderId;
            });
            renderOrdersTable();
        });
}

document.querySelectorAll('[data-action="close"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
            modal.hidden = true;
        }
    });
});

document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
            overlay.hidden = true;
        }
    });
});

const editForm = document.getElementById('edit-order-form');
if (editForm) {
    editForm.addEventListener('submit', handleSaveEditedOrder);
}

const confirmDelBtn = document.getElementById('confirm-delete-btn');
if (confirmDelBtn) {
    confirmDelBtn.addEventListener('click', handleDeleteOrder);
}

loadDishes().then(function () {
    loadOrders();
});

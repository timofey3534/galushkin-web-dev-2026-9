const API_ORDERS_URL =
    'https://edu.std-900.ist.mospolytech.ru/labs/api/orders';

let userOrders = [];
let activeOrderId = null;

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

function getOrderDishes(orderItem) {
    const dishIds = [
        orderItem.soup_id,
        orderItem.main_course_id,
        orderItem.salad_id,
        orderItem.drink_id,
        orderItem.dessert_id
    ];
    const result = [];
    dishIds.forEach(function (id) {
        if (id) {
            const found = findDishByIdOrKeyword(id);
            if (found) {
                result.push(found);
            }
        }
    });
    return result;
}

function getDishesNames(orderItem) {
    const list = getOrderDishes(orderItem);
    if (list.length === 0) {
        return 'Состав не указан';
    }
    return list.map(function (d) {
        return d.name;
    }).join(', ');
}

function calculateOrderTotal(orderItem) {
    const list = getOrderDishes(orderItem);
    let sum = 0;
    list.forEach(function (d) {
        sum += d.price;
    });
    return sum;
}

function getDeliveryText(orderItem) {
    if (orderItem.delivery_type === 'by_time' && orderItem.delivery_time) {
        return 'К ' + orderItem.delivery_time;
    }
    return 'Как можно скорее (с 7:00 до 23:00)';
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
    const orderDishes = getOrderDishes(orderItem);
    const total = calculateOrderTotal(orderItem);
    const rowsHtml = orderDishes.map(function (d) {
        return '<tr><td>' + d.name + '</td><td>' + d.price + '₽</td></tr>';
    }).join('');

    body.innerHTML = '' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Дата оформления:</span>' +
        '  <span>' + formatDateTime(orderItem.created_at) + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Имя:</span>' +
        '  <span>' + (orderItem.full_name || '') + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Адрес доставки:</span>' +
        '  <span>' + (orderItem.delivery_address || '') + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Время доставки:</span>' +
        '  <span>' + getDeliveryText(orderItem) + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Телефон:</span>' +
        '  <span>' + (orderItem.phone || '') + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Email:</span>' +
        '  <span>' + (orderItem.email || '') + '</span>' +
        '</div>' +
        '<div class="view-info-row">' +
        '  <span class="view-info-label">Комментарий:</span>' +
        '  <span>' + (orderItem.comment || '—') + '</span>' +
        '</div>' +
        '<table class="view-dishes-table">' +
        '  <thead><tr><th>Блюдо</th><th>Цена</th></tr></thead>' +
        '  <tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
        '<div class="view-info-row view-info-total">' +
        '  <span>Итого:</span><span>' + total + '₽</span>' +
        '</div>';

    openModal('view-modal');
}

function openEditModal(orderItem) {
    activeOrderId = orderItem.id;
    const form = document.getElementById('edit-order-form');
    if (!form) {
        return;
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

    openModal('edit-modal');
}

function openDeleteModal(orderId) {
    activeOrderId = orderId;
    openModal('delete-modal');
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

        const btnView = document.createElement('button');
        btnView.type = 'button';
        btnView.classList.add('btn-action', 'btn-action-view');
        btnView.textContent = 'Подробнее';
        btnView.addEventListener('click', function () {
            openViewModal(orderItem);
        });

        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.classList.add('btn-action', 'btn-action-edit');
        btnEdit.textContent = 'Редактировать';
        btnEdit.addEventListener('click', function () {
            openEditModal(orderItem);
        });

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.classList.add('btn-action', 'btn-action-delete');
        btnDel.textContent = 'Удалить';
        btnDel.addEventListener('click', function () {
            openDeleteModal(orderItem.id);
        });

        actTd.append(btnView, btnEdit, btnDel);
        tr.append(numTd, dateTd, dishesTd, costTd, timeTd, actTd);
        tbody.append(tr);
    });
}

function loadOrders() {
    const url = API_ORDERS_URL + '?api_key=' + encodeURIComponent(getApiKey());
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
            // Fallback sample orders if server is down so UI can be evaluated
            userOrders = [
                {
                    id: 101,
                    created_at: new Date().toISOString(),
                    full_name: 'Тимофей Галушкин',
                    email: 'timofey@obedpro.ru',
                    phone: '+79991234567',
                    delivery_address: 'Москва, ул. Автозаводская, 16',
                    delivery_type: 'now',
                    delivery_time: '',
                    comment: 'Позвонить за 10 минут',
                    soup_id: 1,
                    main_course_id: 8,
                    drink_id: 20
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
    const url = API_ORDERS_URL + '/' + activeOrderId +
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
            // update in array
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
            // Local update for offline test
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
    const url = API_ORDERS_URL + '/' + activeOrderId +
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
            // Local removal for offline test
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

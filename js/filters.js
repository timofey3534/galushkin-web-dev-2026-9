function findDish(keyword) {
    return dishes.find(function (dish) {
        return dish.keyword === keyword;
    });
}

function onFilterClick(event) {
    const button = event.target.closest('button');
    const section = button.closest('.menu-section');
    const kind = button.dataset.kind;
    const wasActive = button.classList.contains('active');
    const buttons = section.querySelectorAll('.filters button');
    buttons.forEach(function (other) {
        other.classList.remove('active');
    });
    const cards = section.querySelectorAll('.dish');
    if (wasActive) {
        cards.forEach(function (card) {
            card.style.display = '';
        });
        return;
    }
    button.classList.add('active');
    cards.forEach(function (card) {
        const dish = findDish(card.dataset.dish);
        if (dish.kind === kind) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

document.querySelectorAll('.filters button').forEach(function (button) {
    button.addEventListener('click', onFilterClick);
});

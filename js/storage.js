const STORAGE_KEY = 'selected_dishes';
const DEFAULT_API_KEY = '5a6e8284-90ab-4848-b4b6-58611186e88e';
const DEFAULT_API_BASE = 'https://edu.std-900.ist.mospolytech.ru';

function getApiKey() {
    return localStorage.getItem('api_key') || DEFAULT_API_KEY;
}

function getApiBaseUrl() {
    return localStorage.getItem('api_base_url') || DEFAULT_API_BASE;
}

function getSelectedDishIds() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveSelectedDishIds(ids) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function clearSelectedDishes() {
    localStorage.removeItem(STORAGE_KEY);
}

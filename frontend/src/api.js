const BASE = '/api';

export const getItems = () => fetch(`${BASE}/items`).then(r => r.json());
export const getCategories = () => fetch(`${BASE}/categories`).then(r => r.json());
export const getLogs = () => fetch(`${BASE}/logs`).then(r => r.json());

export const addItem = (data) =>
  fetch(`${BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const updateItem = (id, data) =>
  fetch(`${BASE}/items/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const deleteItem = (id) =>
  fetch(`${BASE}/items/${id}`, { method: 'DELETE' }).then(r => r.json());

export const lookupBarcode = (code) =>
  fetch(`${BASE}/barcode/${code}`).then(r => r.json());

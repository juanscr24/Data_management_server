import Swal from "sweetalert2";
import { alerError, alertSucces } from "./alerts";

const endPoint = 'http://localhost:3000/products';

// DOM Elements
const $product = document.getElementById("product");
const $price = document.getElementById("price");
const $category = document.getElementById("category");
const $btnSave = document.getElementById("btn-save");
const $form = document.getElementById("userForm");
const cardContainer = document.getElementById("cardContainer");

let editingProductId = null;

const categoryImages = {
    "Home Products": "./public/img/hogar.webp",
    "Vehicles": "./public/img/vehiculos.webp",
    "Technology": "./public/img/tecnologia.webp",
    "Animals": "./public/img/animales.webp",
    "Food": "./public/img/alimentos.webp",
    "Hardware": "./public/img/ferreteria.webp",
    "Clothing & Accessories": "./public/img/ropa.webp",
    "default": "./public/img/default.webp"
};

// Save or update product
$btnSave.addEventListener("click", async function (e) {
    e.preventDefault();
    await saveProduct();
    await renderCards();
    $form.reset();
    editingProductId = null;
    $btnSave.textContent = "Save";
});

async function saveProduct() {
    const product = $product.value.trim();
    const priceStr = $price.value.trim();
    const price = parseFloat(priceStr);
    const category = $category.value;

    if (!product || isNaN(price) || !category) {
        alerError('Please fill all fields!');
        return;
    }

    const response = await fetch(endPoint);
    const existingProducts = await response.json();

    const nameExists = existingProducts.some(p =>
        p.product.toLowerCase() === product.toLowerCase() &&
        p.id != editingProductId
    );

    if (nameExists) {
        alerError('A product with this name already exists!');
        return;
    }

    const newProduct = { product, price, category };

    if (editingProductId !== null) {
        await fetch(`${endPoint}/${editingProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
    } else {
        await fetch(endPoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
    }

    alertSucces("Product saved successfully!");
}

// Render cards only
async function renderCards() {
    const response = await fetch(endPoint);
    const products = await response.json();

    cardContainer.innerHTML = "";

    products.forEach((product) => {
        const imgSrc = categoryImages[product.category] || categoryImages.default;

        const card = document.createElement("article");
        card.classList.add("card");

        card.innerHTML = `
    <img src="${imgSrc}" alt="${product.category}">
    <div class="container_info">
        <h3>${product.product}</h3>
        <p>Category: ${product.category}</p>
        <p>Price: $${product.price}</p>
        <p>ID: ${product.id}</p>
        <div class="actions">
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button class="delete-btn" data-id="${product.id}">Delete</button>
        </div>
    </div>
    `;

        // Events for edit and delete
        card.querySelector(".edit-btn").addEventListener("click", () => {
            editProduct(product.id);
        });

        card.querySelector(".delete-btn").addEventListener("click", () => {
            deleteProduct(product.id);
        });

        cardContainer.appendChild(card);
    });
}

// Load product into form for editing
window.editProduct = async function (id) {
    const response = await fetch(`${endPoint}/${id}`);
    const product = await response.json();

    $product.value = product.product;
    $price.value = product.price;
    $category.value = product.category;
    editingProductId = id;
    $btnSave.textContent = 'Update';
};

// Delete product
window.deleteProduct = async function (id) {
    const result = await Swal.fire({
        title: "Are you sure you want to delete this product?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
        await fetch(`${endPoint}/${id}`, { method: 'DELETE' });
        await renderCards();
        alertSucces("Product has been deleted!");
    }
};

// Initial load
renderCards();

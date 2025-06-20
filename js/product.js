import { getEl, query, queryAll, handleImageUpload, setupImageSourceToggle, notify } from './utils.js';
import { saveData } from './storage.js';

let products = [];
let settings = {};

// Cache DOM elements
const productForm = getEl("product-form");
const productIdInput = getEl("product-id");
const productModelInput = getEl("product-model");
const productNameInput = getEl("product-name");
const productSpecsInput = getEl("product-specs");
const productImageInput = getEl("product-image-input");
const productImageUrlInput = getEl("product-image-url");
const productImagePreview = getEl("product-image-preview");
const productImageStorage = getEl("product-image-storage");
const productUnitInput = getEl("product-unit");
const productHsCodeInput = getEl("product-hs-code");
const productPackagingInput = getEl("product-packaging");
const productNetWeightInput = getEl("product-net-weight");
const productGrossWeightInput = getEl("product-gross-weight");
const productCostInput = getEl("product-cost");
const productMarginInput = getEl("product-margin");
const productPricesDisplay = getEl("product-prices-display");
const productListBody = getEl("product-list-body");
const clearProductFormBtn = getEl("clear-product-form-btn");
const costCurrencyLabel = getEl("cost-currency-label");


function calculatePrices() {
    const cost = parseFloat(productCostInput.value);
    const margin = parseFloat(productMarginInput.value);
    const algo = query('input[name="profit-algo"]:checked').value;
    const currencies = settings.targetCurrencies || [];
    
    if (isNaN(cost) || isNaN(margin) || currencies.length === 0) {
        productPricesDisplay.innerHTML = "请填写成本、利润率并在后台设置汇率。";
        return {};
    }

    let priceBase;
    if (algo === "cost_plus") {
        priceBase = cost * (1 + margin / 100);
    } else {
        if (margin >= 100) {
            productPricesDisplay.innerHTML = '<span style="color:red;">毛利率不能超过100%</span>';
            return {};
        }
        priceBase = cost / (1 - margin / 100);
    }

    const prices = {};
    let pricesHTML = "<strong>销售价格:</strong><ul>";
    currencies.forEach((c) => {
        const price = priceBase / c.rate;
        prices[c.code] = price;
        pricesHTML += `<li>${c.code}: ${price.toFixed(2)}</li>`;
    });
    pricesHTML += "</ul>";
    productPricesDisplay.innerHTML = pricesHTML;
    return prices;
}

function renderProducts() {
    productListBody.innerHTML = "";
    if (!products || products.length === 0) {
        productListBody.innerHTML = '<tr><td colspan="3">您的商品库是空的，请在左侧表单中添加。</td></tr>';
        return;
    }
    products.forEach((p) => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id;
        tr.innerHTML = `<td>${p.model}</td><td>${p.name}</td><td><button class="btn-action btn-edit" data-id="${p.id}">编辑</button><button class="btn-action btn-delete-row" data-id="${p.id}">删除</button></td>`;
        productListBody.appendChild(tr);
    });
}

function handleProductSave(e) {
    e.preventDefault();
    const prices = calculatePrices();
    if (Object.keys(prices).length === 0 && (parseFloat(productCostInput.value) > 0 || parseFloat(productMarginInput.value) > 0)) {
        alert("无法计算价格，请检查成本、利润率和后台汇率设置。");
        return;
    }

    const imageSource = query('input[name="image-source"]:checked').value;
    const productData = {
        id: productIdInput.value || Date.now().toString(),
        model: productModelInput.value.trim(),
        name: productNameInput.value.trim(),
        specs: productSpecsInput.value.trim(),
        image: imageSource === "local" ? productImageStorage.value : productImageUrlInput.value.trim(),
        unit: productUnitInput.value.trim(),
        hsCode: productHsCodeInput.value.trim(),
        packaging: productPackagingInput.value.trim(),
        netWeight: productNetWeightInput.value.trim(),
        grossWeight: productGrossWeightInput.value.trim(),
        cost: parseFloat(productCostInput.value) || 0,
        margin: parseFloat(productMarginInput.value) || 0,
        profitAlgo: query('input[name="profit-algo"]:checked').value,
        prices: prices,
    };

    if (!productData.model || !productData.name) {
        alert("请填写完整的产品型号和名称！");
        return;
    }

    const existingIndex = products.findIndex((p) => p.id === productData.id);
    if (existingIndex > -1) {
        products[existingIndex] = productData;
    } else {
        if (products.some((p) => p.model.toLowerCase() === productData.model.toLowerCase())) {
            alert("产品型号已存在！");
            return;
        }
        products.push(productData);
    }
    
    saveData("products", products);
    renderProducts();
    clearProductFormBtn.click();
    alert("商品已保存！");
    notify('productsUpdated', { products });
}

function handleProductListClick(e) {
    const button = e.target.closest("button.btn-action");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;

    if (button.classList.contains("btn-edit")) {
        const product = products.find((p) => p.id === id);
        if (!product) return;

        productForm.reset();
        productIdInput.value = product.id;
        productModelInput.value = product.model;
        productNameInput.value = product.name;
        productSpecsInput.value = product.specs;
        productUnitInput.value = product.unit;
        productHsCodeInput.value = product.hsCode || "";
        productPackagingInput.value = product.packaging || "";
        productNetWeightInput.value = product.netWeight || "";
        productGrossWeightInput.value = product.grossWeight || "";
        productCostInput.value = product.cost || "";
        productMarginInput.value = product.margin || "";
        if (product.profitAlgo) {
            query(`input[name="profit-algo"][value="${product.profitAlgo}"]`).checked = true;
        }
        calculatePrices();

        const isUrl = product.image && (product.image.startsWith("http") || product.image.startsWith("//"));
        query(`input[name="image-source"][value="${isUrl ? 'url' : 'local'}"]`).checked = true;
        if (isUrl) {
            productImageUrlInput.value = product.image;
        } else {
            productImageStorage.value = product.image || "";
            productImagePreview.src = product.image || "#";
            productImagePreview.style.display = product.image ? "block" : "none";
        }
        query('input[name="image-source"]:checked').dispatchEvent(new Event("change", { bubbles: true }));

    } else if (button.classList.contains("btn-delete-row")) {
        if (confirm(`确定要删除此商品吗？`)) {
            products = products.filter((p) => p.id !== id);
            saveData("products", products);
            renderProducts();
            notify('productsUpdated', { products });
        }
    }
}

export function initProducts(initialProducts, initialSettings) {
    products = initialProducts;
    settings = initialSettings;

    productForm.addEventListener("submit", handleProductSave);
    productListBody.addEventListener("click", handleProductListClick);
    
    [productCostInput, productMarginInput, ...queryAll('input[name="profit-algo"]')].forEach((el) => {
        el.addEventListener("input", calculatePrices);
    });

    clearProductFormBtn.addEventListener("click", () => {
        productForm.reset();
        productImagePreview.style.display = "none";
        productIdInput.value = "";
        productPricesDisplay.innerHTML = "";
        query('input[name="image-source"][value="local"]').checked = true;
        query('input[name="image-source"]:checked').dispatchEvent(new Event("change", { bubbles: true }));
    });

    setupImageSourceToggle("image-source", "image-source-local", "image-source-url");
    productImageInput.addEventListener("change", () => handleImageUpload(productImageInput, productImagePreview, productImageStorage));
    
    document.addEventListener('settingsUpdated', (e) => {
        settings = e.detail.settings;
        costCurrencyLabel.textContent = settings.baseCurrency || "CNY";
        calculatePrices();
    });
    
    costCurrencyLabel.textContent = settings.baseCurrency || "CNY";
    renderProducts();
}
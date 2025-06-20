import { getEl, query, queryAll, notify } from './utils.js';
import { saveData, loadData } from './storage.js';

// --- 模块状态 ---
let settings = {};
let products = [];
let customers = [];
let quoteItems = [];
let tableColumns = [];
let draggedColumnId = null;

// --- 默认列结构 ---
const defaultColumns = [
    { id: 'image', label: 'Image', type: 'standard', draggable: false, editable: false, width: '8%' },
    { id: 'description', label: 'Description', type: 'standard', draggable: true, editable: true, width: 'auto' },
    { id: 'qty', label: 'QTY', type: 'standard', draggable: true, editable: true, width: '8%' },
    { id: 'unit', label: 'Unit', type: 'standard', draggable: true, editable: true, width: '8%' },
    { id: 'unitPrice', label: 'Unit Price', type: 'standard', draggable: true, editable: true, width: '12%' },
    { id: 'amount', label: 'Amount', type: 'standard', draggable: false, editable: false, width: '14%' },
    { id: 'actions', label: '操作', type: 'actions', draggable: false, editable: false, width: '6%' },
];

// --- DOM 缓存 ---
const piForm = getEl("pi-form");
const quoteProductTable = getEl("quote-product-table");
const tableHead = quoteProductTable.querySelector('thead');
const tableBody = quoteProductTable.querySelector('tbody');
const docTypeSelect = getEl("doc-type");
const docCurrencySelect = getEl("doc-currency");
const linkCustomerSelect = getEl("link-customer-select");
const clearCustomerLinkBtn = getEl("clear-customer-link");
const docIncotermsInput = getEl("doc-incoterms");
const docPreparedByInput = getEl("doc-prepared-by");
const docRemarksInput = getEl("doc-remarks");
const quoteCurrencyLabel = getEl("quote-currency-label");
const docDateInput = getEl("doc-date");
const docIdInput = getEl("doc-id");
const generateDocIdBtn = getEl("generate-doc-id-btn");
const docValidityInput = getEl("doc-validity");
const paymentTermsInput = getEl("payment-terms");
const leadTimeInput = getEl("lead-time");
const portLoadingInput = getEl("port-loading");
const portDestinationInput = getEl("port-destination");
const subtotalSpan = getEl("subtotal");
const freightCostInput = getEl("freight-cost");
const insuranceCostInput = getEl("insurance-cost");
const grandTotalSpan = getEl("grand-total");
const showProductModalBtn = getEl("show-product-modal-btn");
const exportExcelBtn = getEl("export-excel-btn");
const buyerNameInput = getEl("buyer-name");
const buyerAddressInput = getEl("buyer-address");
const buyerAttnInput = getEl("buyer-attn");
const productSelectModal = getEl("product-select-modal");
const modalProductList = getEl("modal-product-list");
const modalSearchInput = getEl("modal-search-input");
const closeProductModalBtn = productSelectModal.querySelector('.close-modal-btn');
const printShowBordersCheckbox = getEl('print-show-borders');

// --- 核心功能函数 ---

function renderTable() {
    renderTableHead();
    renderTableBody();
    updateTotals();
    saveData('tableColumns', tableColumns);
}

function renderTableHead() {
    tableHead.innerHTML = '';
    const tr = document.createElement('tr');
    
    tableColumns.forEach(col => {
        const th = document.createElement('th');
        th.style.width = col.width || 'auto';
        th.dataset.colId = col.id;
        th.draggable = col.draggable;

        if (col.draggable) {
            const dragHandle = document.createElement('i');
            dragHandle.className = 'fas fa-grip-vertical col-drag-handle';
            th.appendChild(dragHandle);
        }

        const labelSpan = document.createElement('span');
        labelSpan.textContent = col.label;
        if (col.editable) {
            labelSpan.contentEditable = true;
            labelSpan.addEventListener('blur', (e) => {
                const newLabel = e.target.textContent.trim();
                if (newLabel) {
                    col.label = newLabel;
                    saveData('tableColumns', tableColumns);
                } else {
                    e.target.textContent = col.label;
                }
            });
             labelSpan.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        }
        th.appendChild(labelSpan);

        if (col.type === 'custom') {
            const fillBtn = document.createElement('i');
            fillBtn.className = 'fas fa-pencil-alt col-action-btn fill-col-btn';
            fillBtn.title = '批量填充此列';
            th.appendChild(fillBtn);
            
            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'fas fa-minus-circle col-action-btn delete-col-btn';
            deleteBtn.title = '删除此列';
            th.appendChild(deleteBtn);
        }

        if (col.type === 'actions') {
            const addBtn = document.createElement('i');
            addBtn.className = 'fas fa-plus-circle col-action-btn add-col-btn';
            addBtn.title = '在此前方插入新列';
            th.appendChild(addBtn);
        }
        tr.appendChild(th);
    });
    tableHead.appendChild(tr);
}

function renderTableBody() {
    tableBody.innerHTML = '';
    quoteItems.forEach((item, rowIndex) => {
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIndex;

        tableColumns.forEach(col => {
            const td = document.createElement('td');
            let content = '';

            switch (col.id) {
                case 'image':
                    td.style.textAlign = 'center';
                    content = item.image ? `<img src="${item.image}" alt="${item.name}">` : '';
                    break;
                case 'description':
                    content = `<p><strong>${item.model}:</strong> ${item.name}</p><textarea class="quote-item-specs" data-row-index="${rowIndex}">${item.specs || ''}</textarea>`;
                    break;
                case 'qty':
                    content = `<input type="number" class="quote-item-input" data-field="qty" value="${item.qty}" min="1">`;
                    break;
                case 'unit':
                    content = `<input type="text" class="quote-item-input" data-field="unit" value="${item.unit}">`;
                    break;
                case 'unitPrice':
                    const currency = docCurrencySelect.value;
                    const price = item.unitPrice_manual !== undefined ? item.unitPrice_manual : ((item.prices && item.prices[currency]) ? item.prices[currency] : 0);
                    content = `<input type="number" class="quote-item-input" data-field="unitPrice" value="${price.toFixed(2)}" step="0.01">`;
                    break;
                case 'amount':
                    td.className = 'quote-item-amount';
                    content = '0.00';
                    break;
                case 'actions':
                    content = `<button type="button" class="btn-action btn-delete-row" title="删除此行">&times;</button>`;
                    break;
                default:
                    if (col.type === 'custom') {
                        td.contentEditable = true;
                        td.dataset.field = col.id;
                        content = item.customData[col.id] || '';
                    }
            }
            td.innerHTML = content;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

function updateTotals() {
    let subtotal = 0;
    const currency = docCurrencySelect.value;
    
    quoteItems.forEach((item, rowIndex) => {
        const row = tableBody.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (!row) return;

        const unitPrice = item.unitPrice_manual !== undefined ? item.unitPrice_manual : ((item.prices && item.prices[currency]) ? item.prices[currency] : 0);
        const amount = item.qty * unitPrice;
        
        const amountCell = row.querySelector('.quote-item-amount');
        if (amountCell) amountCell.textContent = amount.toFixed(2);
        
        subtotal += amount;
    });

    const freight = parseFloat(freightCostInput.value) || 0;
    const insurance = parseFloat(insuranceCostInput.value) || 0;
    const grandTotal = subtotal + freight + insurance;
    
    subtotalSpan.textContent = `${subtotal.toFixed(2)} ${currency}`;
    grandTotalSpan.textContent = `${grandTotal.toFixed(2)} ${currency}`;
}

function handleTableHeadClick(e) {
    const target = e.target;
    const colId = target.closest('th')?.dataset.colId;

    if (target.classList.contains('add-col-btn')) {
        const colName = prompt("请输入新列的名称:", "自定义列");
        if (colName) {
            const newCol = { id: `custom_${Date.now()}`, label: colName, type: 'custom', draggable: true, editable: true, width: '120px' };
            const actionsIndex = tableColumns.findIndex(c => c.type === 'actions');
            tableColumns.splice(actionsIndex, 0, newCol);
            quoteItems.forEach(item => { if(!item.customData) item.customData = {}; item.customData[newCol.id] = ''; });
            renderTable();
        }
    } else if (target.classList.contains('delete-col-btn')) {
        if (confirm(`确定要删除 "${tableColumns.find(c => c.id === colId)?.label}" 这一列吗？`)) {
            tableColumns = tableColumns.filter(c => c.id !== colId);
            quoteItems.forEach(item => { if(item.customData) delete item.customData[colId]; });
            renderTable();
        }
    } else if (target.classList.contains('fill-col-btn')) {
        const fillValue = prompt(`请输入要批量填充到 "${tableColumns.find(c => c.id === colId)?.label}" 列的值:`);
        if (fillValue !== null) {
            quoteItems.forEach(item => { if(!item.customData) item.customData = {}; item.customData[colId] = fillValue; });
            renderTable();
        }
    }
}

function handleTableBodyEvent(e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;
    const rowIndex = parseInt(row.dataset.rowIndex, 10);
    if (isNaN(rowIndex)) return;
    const item = quoteItems[rowIndex];

    if (target.classList.contains('btn-delete-row')) {
        quoteItems.splice(rowIndex, 1);
        renderTable();
        return;
    }

    const field = target.dataset.field;
    if (target.classList.contains('quote-item-input')) {
        const value = target.type === 'number' ? parseFloat(target.value) || 0 : target.value;
        if (field === 'unitPrice') item.unitPrice_manual = value;
        else item[field] = value;
        updateTotals();
    }
    
    if (target.classList.contains('quote-item-specs')) {
         item.specs = target.value;
    }

    if (target.isContentEditable) {
        if (field) item.customData[field] = target.textContent;
    }
}

function handlePiFormSubmit(e) {
    e.preventDefault();
    if (quoteItems.length === 0) {
        alert("请至少向报价单中添加一个商品后再生成！"); return;
    }
    const customerId = linkCustomerSelect.value;
    if (customerId) {
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
            if (!customer.documents) customer.documents = [];
            const docId = docIdInput.value;
            if (docId && !customer.documents.includes(docId)) {
                customer.documents.push(docId);
                saveData("customers", customers);
                notify('customersUpdated', { customers });
            }
        }
    }
    const currency = docCurrencySelect.value;
    const docType = docTypeSelect.value.replace(/_/g, " ");
    const cleanText = (text) => text.replace(/\n/g, "<br>");
    const showBorders = printShowBordersCheckbox.checked;

    let printColumns = tableColumns.filter(c => c.type !== 'actions');
    printColumns.unshift({ id: 'itemNo', label: 'Item', width: '5%' });

    let theadHTML = '<tr>';
    printColumns.forEach(col => {
        theadHTML += `<th style="width: ${col.width || 'auto'};">${col.label}</th>`;
    });
    theadHTML += '</tr>';

    let tableContentHTML = quoteItems.map((item, index) => {
        let rowHTML = '<tr class="product-row">';
        printColumns.forEach(col => {
            let cellContent = '';
            let className = '';
            switch (col.id) {
                case 'itemNo': cellContent = index + 1; className = 'class="center"'; break;
                case 'image': cellContent = item.image ? `<img src="${item.image}" alt="${item.name}">` : ''; className = 'class="center"'; break;
                case 'description': 
                    cellContent = `<p><strong>${item.model}:</strong> ${item.name}</p>`;
                    if(item.specs) cellContent += `<p>${item.specs.replace(/\n/g, "<br>")}</p>`;
                    className = 'class="desc"';
                    break;
                case 'qty': cellContent = item.qty; className = 'class="center"'; break;
                case 'unit': cellContent = item.unit; className = 'class="center"'; break;
                case 'unitPrice': 
                    const price = item.unitPrice_manual !== undefined ? item.unitPrice_manual : ((item.prices && item.prices[currency]) ? item.prices[currency] : 0);
                    cellContent = price.toFixed(2);
                    className = 'class="amount"';
                    break;
                case 'amount':
                     const unitPriceForAmount = item.unitPrice_manual !== undefined ? item.unitPrice_manual : ((item.prices && item.prices[currency]) ? item.prices[currency] : 0);
                     cellContent = (item.qty * unitPriceForAmount).toFixed(2);
                     className = 'class="amount"';
                    break;
                default: 
                    if(col.type === 'custom') cellContent = item.customData[col.id] || '';
            }
            rowHTML += `<td ${className}>${cellContent}</td>`;
        });
        rowHTML += '</tr>';
        return rowHTML;
    }).join('');

    const subtotalVal = quoteItems.reduce((acc, item) => {
        const unitPrice = item.unitPrice_manual !== undefined ? item.unitPrice_manual : ((item.prices && item.prices[currency]) ? item.prices[currency] : 0);
        return acc + (item.qty * unitPrice);
    }, 0);
    const freight = parseFloat(freightCostInput.value) || 0;
    const insurance = parseFloat(insuranceCostInput.value) || 0;
    const grandTotalValue = grandTotalSpan.textContent;
    let summaryHTML = '';
    const colspan = printColumns.length - 2;

    if (freight === 0 && insurance === 0) {
        summaryHTML = `<tr class="summary-row grand-total"><td colspan="${colspan}" class="no-border"></td><td class="label">TOTAL</td><td class="amount">${grandTotalValue}</td></tr>`;
    } else {
        summaryHTML = `<tr class="summary-row subtotal"><td colspan="${colspan}" class="no-border"></td><td class="label">Subtotal</td><td class="amount">${subtotalVal.toFixed(2)} ${currency}</td></tr>`;
        if (freight > 0) summaryHTML += `<tr class="summary-row"><td colspan="${colspan}" class="no-border"></td><td class="label">Freight</td><td class="amount">${freight.toFixed(2)} ${currency}</td></tr>`;
        if (insurance > 0) summaryHTML += `<tr class="summary-row"><td colspan="${colspan}" class="no-border"></td><td class="label">Insurance</td><td class="amount">${insurance.toFixed(2)} ${currency}</td></tr>`;
        summaryHTML += `<tr class="summary-row grand-total"><td colspan="${colspan}" class="no-border"></td><td class="label">TOTAL</td><td class="amount">${grandTotalValue}</td></tr>`;
    }
    tableContentHTML += summaryHTML;
    
    const buyerInfoHTML = `<div class="buyer-info"><h3>CUSTOMER:</h3><p><span class="label">Company:</span>${buyerNameInput.value}</p><p><span class="label">Address:</span>${cleanText(buyerAddressInput.value)}</p>${buyerAttnInput.value.trim() ? `<p><span class="label">Attn:</span>${buyerAttnInput.value}</p>` : ""}</div>`;
    const docInfoHTML = `<div class="doc-info"><h3>INFO:</h3><p><span class="label">No.:</span>${docIdInput.value}</p><p><span class="label">Date:</span>${docDateInput.value}</p><p><span class="label">Incoterms:</span>${docIncotermsInput.value}</p><p><span class="label">Validity:</span>${docValidityInput.value} Days</p></div>`;
    const footerHTML = settings.companySeal ? `<footer class="print-footer"><div class="prepared-by">${docPreparedByInput.value.trim() ? `<p>Prepared by: ${docPreparedByInput.value}</p>` : ""}</div><div class="signature"><img src="${settings.companySeal}" class="seal-image" alt="Company Seal"><p>Authorized Signature</p><p>_________________________</p></div></footer>` : '';

    getEl("print-preview-area").innerHTML = `<div class="print-container ${showBorders ? '' : 'no-borders'}"><header class="print-header"><div class="seller-info"><h1>${settings.companyName || "Your Company Name"}</h1><p>${cleanText(settings.companyAddress) || "Your Company Address"}</p><p>${cleanText(settings.companyContact) || "Tel / Email"}</p></div><div class="doc-title">${settings.logo ? `<img src="${settings.logo}" alt="Company Logo">` : ""}<h2>${docType}</h2></div></header><section class="print-meta">${buyerInfoHTML}${docInfoHTML}</section><table class="print-table"><thead>${theadHTML}</thead><tbody>${tableContentHTML}</tbody></table><section class="print-terms"><h3>TERMS & CONDITIONS:</h3>${portLoadingInput.value.trim() ? `<p><strong>Port of Loading:</strong> ${portLoadingInput.value}</p>` : ""}${portDestinationInput.value.trim() ? `<p><strong>Port of Destination:</strong> ${portDestinationInput.value}</p>` : ""}<p><strong>Payment Terms:</strong> ${cleanText(paymentTermsInput.value)}</p><p><strong>Lead Time:</strong> ${cleanText(leadTimeInput.value)}</p>${docRemarksInput.value.trim() ? `<p><strong>Remarks:</strong> ${cleanText(docRemarksInput.value)}</p>` : ""}</section>${docTypeSelect.value === "PROFORMA INVOICE" && settings.bankInfo ? `<section class="print-terms"><h3>BANK INFORMATION:</h3><p>${cleanText(settings.bankInfo)}</p></section>` : ""}${footerHTML}</div>`;
    
    window.print();
}

function resetForm() {
    piForm.reset();
    quoteItems = [];
    tableColumns = JSON.parse(JSON.stringify(defaultColumns));
    renderTable();
    linkCustomerSelect.value = "";
    linkCustomerSelect.dispatchEvent(new Event("change"));
}

function generateDocId() {
    const prefix = docTypeSelect.value === "QUOTATION" ? "QT" : "PI";
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Date.now().toString().slice(-4);
    docIdInput.value = `${prefix}${date}-${random}`;
}

function populateLinkCustomerSelect() {
    const currentVal = linkCustomerSelect.value;
    linkCustomerSelect.innerHTML = '<option value="">-- 关联到CRM客户 --</option>';
    customers.sort((a, b) => a.name.localeCompare(b.name)).forEach((c) => {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        linkCustomerSelect.appendChild(option);
    });
    linkCustomerSelect.value = currentVal;
}

function renderModalProducts(filter = "") {
    modalProductList.innerHTML = "";
    const lowerCaseFilter = filter.toLowerCase();
    const filtered = products.filter(
        (p) => p.model.toLowerCase().includes(lowerCaseFilter) || p.name.toLowerCase().includes(lowerCaseFilter)
    );
    if (filtered.length === 0) {
        modalProductList.innerHTML = '<tr><td colspan="4">没有找到匹配的商品</td></tr>';
        return;
    }
    filtered.forEach((p) => {
        const tr = document.createElement("tr");
        tr.dataset.id = p.id;
        tr.innerHTML = `<td><img src="${p.image || "https://placehold.co/60x60/eee/ccc?text=No+Img"}" alt="${p.name}"></td><td>${p.model}</td><td>${p.name}</td><td><button class="btn-primary btn-action btn-add-quote">添加</button></td>`;
        modalProductList.appendChild(tr);
    });
}

function renderCurrencyOptions() {
    const availableCurrencies = settings.targetCurrencies && settings.targetCurrencies.length > 0 ? settings.targetCurrencies : [{ code: "USD", rate: 7.25 }];
    docCurrencySelect.innerHTML = availableCurrencies.map((c) => `<option value="${c.code}">${c.code}</option>`).join("");
    quoteCurrencyLabel.textContent = docCurrencySelect.value || "USD";
}

function setInitialFormValues() {
    const s = settings;
    docDateInput.valueAsDate = new Date();
    generateDocId();
    docIncotermsInput.value = s.defaultIncoterms || "FOB SHANGHAI";
    paymentTermsInput.value = s.defaultPayment || "30% T/T deposit, 70% balance against B/L copy.";
    leadTimeInput.value = s.defaultLeadtime || "25-30 days after receiving deposit.";
    portLoadingInput.value = s.defaultPortLoading || "Shanghai, China";
    docValidityInput.value = s.defaultValidity || "30";
    docPreparedByInput.value = s.preparedBy || "";
    renderCurrencyOptions();
    populateLinkCustomerSelect();
}

function handleDragStart(e) {
    const th = e.target.closest('th');
    if (!th || !th.draggable) return;
    draggedColumnId = th.dataset.colId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedColumnId);
    setTimeout(() => {
        th.classList.add('dragging');
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    const th = e.target.closest('th');
    if (!th || !th.draggable) return;
    th.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('th')?.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const targetTh = e.target.closest('th');
    targetTh?.classList.remove('drag-over');
    
    const droppedOnColumnId = targetTh?.dataset.colId;
    if (!droppedOnColumnId || draggedColumnId === droppedOnColumnId) {
        document.querySelector('.dragging')?.classList.remove('dragging');
        return;
    }

    const draggedIndex = tableColumns.findIndex(c => c.id === draggedColumnId);
    const targetIndex = tableColumns.findIndex(c => c.id === droppedOnColumnId);

    if (draggedIndex > -1 && targetIndex > -1) {
        const [draggedItem] = tableColumns.splice(draggedIndex, 1);
        tableColumns.splice(targetIndex, 0, draggedItem);
        renderTable();
    }
    draggedColumnId = null;
}

export function selectCustomerInPiForm(customerId) {
    linkCustomerSelect.value = customerId;
    linkCustomerSelect.dispatchEvent(new Event('change'));
}

export function initPiGenerator(initialSettings, initialProducts, initialCustomers) {
    settings = initialSettings;
    products = initialProducts;
    customers = initialCustomers;
    tableColumns = loadData('tableColumns', JSON.parse(JSON.stringify(defaultColumns)));

    piForm.addEventListener("submit", handlePiFormSubmit);
    piForm.addEventListener("reset", resetForm);
    
    tableHead.addEventListener('click', handleTableHeadClick);
    tableBody.addEventListener('click', handleTableBodyEvent);
    tableBody.addEventListener('input', handleTableBodyEvent);
    tableBody.addEventListener('blur', handleTableBodyEvent, true);

    tableHead.addEventListener('dragstart', handleDragStart);
    tableHead.addEventListener('dragover', handleDragOver);
    tableHead.addEventListener('dragleave', handleDragLeave);
    tableHead.addEventListener('drop', handleDrop);
    
    generateDocIdBtn.addEventListener("click", generateDocId);
    exportExcelBtn.addEventListener("click", () => alert('Excel导出功能暂不支持动态列。'));
    
    linkCustomerSelect.addEventListener("change", (e) => {
        const customerId = e.target.value;
        if (!customerId) {
            buyerNameInput.value = ""; buyerAddressInput.value = ""; buyerAttnInput.value = "";
            return;
        }
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
            buyerNameInput.value = customer.name;
            buyerAddressInput.value = customer.address || "";
            const mainContact = customer.contacts && customer.contacts.length > 0 ? customer.contacts[0].name : "";
            buyerAttnInput.value = mainContact;
        }
    });
    clearCustomerLinkBtn.addEventListener("click", () => {
        linkCustomerSelect.value = "";
        linkCustomerSelect.dispatchEvent(new Event("change"));
    });

    docCurrencySelect.addEventListener("change", () => {
        quoteCurrencyLabel.textContent = docCurrencySelect.value;
        renderTable();
    });

    freightCostInput.addEventListener("input", updateTotals);
    insuranceCostInput.addEventListener("input", updateTotals);
    
    showProductModalBtn.addEventListener("click", () => {
        renderModalProducts();
        productSelectModal.style.display = "block";
    });
    closeProductModalBtn.addEventListener('click', () => productSelectModal.style.display = 'none');
    modalProductList.addEventListener("click", (e) => {
        const btn = e.target.closest("button.btn-add-quote");
        if (btn) {
            const product = products.find((p) => p.id === btn.closest("tr").dataset.id);
            if (product) {
                const newItem = { ...product, qty: 1, specs: product.specs || "", customData: {} };
                tableColumns.forEach(col => { if(col.type === 'custom') newItem.customData[col.id] = ''; });
                quoteItems.push(newItem);
                renderTable();
            }
            productSelectModal.style.display = "none";
        }
    });

    document.addEventListener('settingsUpdated', (e) => { settings = e.detail.settings; renderCurrencyOptions(); renderTable(); });
    document.addEventListener('productsUpdated', (e) => { products = e.detail.products; });
    document.addEventListener('customersUpdated', (e) => { customers = e.detail.customers; populateLinkCustomerSelect(); });
    document.addEventListener('moduleChanged', (e) => { if (e.detail.targetId === 'pi-generator') { setInitialFormValues(); } });

    renderTable();
}
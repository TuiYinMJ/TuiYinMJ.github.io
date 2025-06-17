// 全局变量
let templates = JSON.parse(localStorage.getItem('templates')) || {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期字段
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('validUntil').value = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    document.getElementById('deliveryDate').value = new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0];

    // 初始化表单验证
    const form = document.getElementById('quoteForm');
    form.addEventListener('submit', handleSubmit);

    // 初始化预览按钮
    document.getElementById('previewBtn').addEventListener('click', generatePreview);

    // 初始化模板管理按钮
    document.getElementById('saveTemplate').addEventListener('click', saveTemplate);
    document.getElementById('loadTemplate').addEventListener('click', loadTemplate);

    // 初始化商品行
    document.getElementById('addProduct').addEventListener('click', addProductRow);
    document.querySelector('.remove-btn').addEventListener('click', function() {
        if (document.querySelectorAll('.product-row').length > 1) {
            this.closest('.product-row').remove();
        }
    });

    // 初始化文档类型切换
    document.getElementById('documentType').addEventListener('change', updateFormFields);
});

// 更新表单字段
function updateFormFields() {
    const docType = document.getElementById('documentType').value;
    const isPI = docType === 'PI';
    
    // 更新必填字段
    document.getElementById('bankName').required = isPI;
    document.getElementById('swiftCode').required = isPI;
    document.getElementById('bankAccount').required = isPI;
    document.getElementById('advancePayment').required = isPI;
    
    // 更新字段显示
    const bankFields = document.querySelectorAll('#bankName, #swiftCode, #bankAccount').forEach(field => {
        field.closest('.row').style.display = isPI ? 'flex' : 'none';
    });
}

// 添加商品行
function addProductRow() {
    const productRows = document.getElementById('productRows');
    const newRow = document.createElement('div');
    newRow.className = 'product-row row mb-3';
    newRow.innerHTML = `
        <div class="col-md-3">
            <input type="text" class="form-control" placeholder="商品名称" required>
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control" placeholder="规格型号">
        </div>
        <div class="col-md-1">
            <input type="text" class="form-control" placeholder="单位">
        </div>
        <div class="col-md-1">
            <input type="number" class="form-control" placeholder="数量" required>
        </div>
        <div class="col-md-2">
            <input type="number" step="0.01" class="form-control" placeholder="单价" required>
        </div>
        <div class="col-md-2">
            <input type="text" class="form-control" placeholder="HS编码">
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-danger remove-btn">×</button>
        </div>
    `;
    productRows.appendChild(newRow);
    newRow.querySelector('.remove-btn').addEventListener('click', function() {
        if (document.querySelectorAll('.product-row').length > 1) {
            this.closest('.product-row').remove();
        }
    });
}

// 保存模板
function saveTemplate() {
    const templateName = document.getElementById('templateName').value;
    if (!templateName) {
        alert('请输入模板名称');
        return;
    }

    const templateData = {
        type: document.getElementById('templateType').value,
        data: collectFormData()
    };

    templates[templateName] = templateData;
    localStorage.setItem('templates', JSON.stringify(templates));
    alert('模板保存成功');
}

// 加载模板
function loadTemplate() {
    const templateName = document.getElementById('templateName').value;
    if (!templateName || !templates[templateName]) {
        alert('模板不存在');
        return;
    }

    const template = templates[templateName];
    document.getElementById('templateType').value = template.type;
    document.getElementById('documentType').value = template.type;
    fillFormData(template.data);
    updateFormFields();
}

// 收集表单数据
function collectFormData() {
    const products = Array.from(document.querySelectorAll('.product-row')).map(row => {
        const inputs = row.querySelectorAll('input');
        return {
            name: inputs[0].value,
            specification: inputs[1].value,
            unit: inputs[2].value,
            quantity: parseFloat(inputs[3].value) || 0,
            price: parseFloat(inputs[4].value) || 0,
            hsCode: inputs[5].value
        };
    });

    return {
        documentType: document.getElementById('documentType').value,
        invoiceNo: document.getElementById('invoiceNo').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        validUntil: document.getElementById('validUntil').value,
        companyLogo: document.getElementById('companyLogo').value,
        companyName: document.getElementById('companyName').value,
        companyAddress: document.getElementById('companyAddress').value,
        companyContact: document.getElementById('companyContact').value,
        companyPhone: document.getElementById('companyPhone').value,
        companyEmail: document.getElementById('companyEmail').value,
        bankName: document.getElementById('bankName').value,
        swiftCode: document.getElementById('swiftCode').value,
        bankAccount: document.getElementById('bankAccount').value,
        clientName: document.getElementById('clientName').value,
        clientAddress: document.getElementById('clientAddress').value,
        clientContact: document.getElementById('clientContact').value,
        clientPhone: document.getElementById('clientPhone').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientFax: document.getElementById('clientFax').value,
        products: products,
        paymentTerms: document.getElementById('paymentTerms').value,
        deliveryTerms: document.getElementById('deliveryTerms').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        portOfLoading: document.getElementById('portOfLoading').value,
        portOfDestination: document.getElementById('portOfDestination').value,
        transportMode: document.getElementById('transportMode').value,
        advancePayment: document.getElementById('advancePayment').value,
        moq: document.getElementById('moq').value,
        packageType: document.getElementById('packageType').value,
        packageSize: document.getElementById('packageSize').value,
        packageWeight: document.getElementById('packageWeight').value,
        remarks: document.getElementById('remarks').value,
        terms: document.getElementById('terms').value
    };
}

// 填充表单数据
function fillFormData(data) {
    Object.keys(data).forEach(key => {
        if (key !== 'products') {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
            }
        }
    });

    // 填充商品数据
    const productRows = document.getElementById('productRows');
    productRows.innerHTML = '';
    data.products.forEach(product => {
        addProductRow();
        const lastRow = productRows.lastElementChild;
        const inputs = lastRow.querySelectorAll('input');
        inputs[0].value = product.name;
        inputs[1].value = product.specification;
        inputs[2].value = product.unit;
        inputs[3].value = product.quantity;
        inputs[4].value = product.price;
        inputs[5].value = product.hsCode;
    });
}

// 处理表单提交
function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }

    const formData = collectFormData();
    const docType = formData.documentType;
    
    if (docType === 'PI') {
        generatePI(formData);
    } else {
        generateQuotation(formData);
    }
}

// 表单验证
function validateForm() {
    const form = document.getElementById('quoteForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

// 生成预览
function generatePreview() {
    if (!validateForm()) {
        return;
    }

    const formData = collectFormData();
    const docType = formData.documentType;
    
    if (docType === 'PI') {
        generatePI(formData, true);
    } else {
        generateQuotation(formData, true);
    }
}

// 生成形式发票
function generatePI(data, isPreview = false) {
    const fitToPage = document.getElementById('fitToPage').checked;
    const content = `
        <div class="document-container ${fitToPage ? 'fit-to-page' : ''}">
            <div class="document-header">
                ${data.companyLogo ? `<img src="${data.companyLogo}" alt="Company Logo" class="company-logo">` : ''}
                <h1>PROFORMA INVOICE</h1>
                <div class="document-info">
                    <p>Invoice No: ${data.invoiceNo}</p>
                    <p>Date: ${formatDate(data.invoiceDate)}</p>
                    <p>Valid Until: ${formatDate(data.validUntil)}</p>
                </div>
            </div>

            <div class="document-section">
                <div class="section-row">
                    <div class="section-col">
                        <h3>Seller Information</h3>
                        <p>${data.companyName}</p>
                        <p>${data.companyAddress}</p>
                        <p>Contact: ${data.companyContact}</p>
                        <p>Tel: ${data.companyPhone}</p>
                        <p>Email: ${data.companyEmail}</p>
                    </div>
                    <div class="section-col">
                        <h3>Buyer Information</h3>
                        <p>${data.clientName}</p>
                        <p>${data.clientAddress}</p>
                        <p>Contact: ${data.clientContact}</p>
                        <p>Tel: ${data.clientPhone}</p>
                        <p>Email: ${data.clientEmail}</p>
                    </div>
                </div>
            </div>

            <div class="document-section">
                <h3>Product Details</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Product Name</th>
                            <th>Specification</th>
                            <th>Unit</th>
                            <th>Quantity</th>
                            <th>Unit Price (USD)</th>
                            <th>Amount (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateProductRows(data.products)}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" class="text-end"><strong>Total Amount:</strong></td>
                            <td class="text-end"><strong>${calculateTotal(data.products)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="document-section">
                <div class="section-row">
                    <div class="section-col">
                        <h3>Payment Terms</h3>
                        <p>Payment Method: ${data.paymentTerms}</p>
                        <p>Advance Payment: ${data.advancePayment}%</p>
                        <p>Bank Name: ${data.bankName}</p>
                        <p>SWIFT Code: ${data.swiftCode}</p>
                        <p>Account No: ${data.bankAccount}</p>
                    </div>
                    <div class="section-col">
                        <h3>Delivery Terms</h3>
                        <p>Delivery Terms: ${data.deliveryTerms}</p>
                        <p>Port of Loading: ${data.portOfLoading}</p>
                        <p>Port of Destination: ${data.portOfDestination}</p>
                        <p>Delivery Date: ${formatDate(data.deliveryDate)}</p>
                        <p>Transport Mode: ${data.transportMode}</p>
                    </div>
                </div>
            </div>

            <div class="document-section">
                <h3>Package Information</h3>
                <p>Package Type: ${data.packageType}</p>
                <p>Package Size: ${data.packageSize}</p>
                <p>Package Weight: ${data.packageWeight} kg</p>
            </div>

            ${data.remarks ? `
            <div class="document-section">
                <h3>Remarks</h3>
                <p>${data.remarks}</p>
            </div>
            ` : ''}

            ${data.terms ? `
            <div class="document-section">
                <h3>Terms and Conditions</h3>
                <p>${data.terms}</p>
            </div>
            ` : ''}

            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <p>For and on behalf of</p>
                        <p>${data.companyName}</p>
                        <div class="signature-line"></div>
                        <p>Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (isPreview) {
        showPreview(content);
    } else {
        printDocument(content);
    }
}

// 生成报价单
function generateQuotation(data, isPreview = false) {
    const fitToPage = document.getElementById('fitToPage').checked;
    const content = `
        <div class="document-container ${fitToPage ? 'fit-to-page' : ''}">
            <div class="document-header">
                ${data.companyLogo ? `<img src="${data.companyLogo}" alt="Company Logo" class="company-logo">` : ''}
                <h1>QUOTATION</h1>
                <div class="document-info">
                    <p>Quotation No: ${data.invoiceNo}</p>
                    <p>Date: ${formatDate(data.invoiceDate)}</p>
                    <p>Valid Until: ${formatDate(data.validUntil)}</p>
                </div>
            </div>

            <div class="document-section">
                <div class="section-row">
                    <div class="section-col">
                        <h3>Company Information</h3>
                        <p>${data.companyName}</p>
                        <p>${data.companyAddress}</p>
                        <p>Contact: ${data.companyContact}</p>
                        <p>Tel: ${data.companyPhone}</p>
                        <p>Email: ${data.companyEmail}</p>
                    </div>
                    <div class="section-col">
                        <h3>Customer Information</h3>
                        <p>${data.clientName}</p>
                        <p>${data.clientAddress}</p>
                        <p>Contact: ${data.clientContact}</p>
                        <p>Tel: ${data.clientPhone}</p>
                        <p>Email: ${data.clientEmail}</p>
                    </div>
                </div>
            </div>

            <div class="document-section">
                <h3>Product Details</h3>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Product Name</th>
                            <th>Specification</th>
                            <th>Unit</th>
                            <th>MOQ</th>
                            <th>Unit Price (USD)</th>
                            <th>Amount (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generateProductRows(data.products)}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" class="text-end"><strong>Total Amount:</strong></td>
                            <td class="text-end"><strong>${calculateTotal(data.products)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="document-section">
                <div class="section-row">
                    <div class="section-col">
                        <h3>Payment Terms</h3>
                        <p>Payment Method: ${data.paymentTerms}</p>
                        <p>Advance Payment: ${data.advancePayment}%</p>
                    </div>
                    <div class="section-col">
                        <h3>Delivery Terms</h3>
                        <p>Delivery Terms: ${data.deliveryTerms}</p>
                        <p>Port of Loading: ${data.portOfLoading}</p>
                        <p>Port of Destination: ${data.portOfDestination}</p>
                        <p>Delivery Date: ${formatDate(data.deliveryDate)}</p>
                        <p>Transport Mode: ${data.transportMode}</p>
                    </div>
                </div>
            </div>

            <div class="document-section">
                <h3>Package Information</h3>
                <p>Package Type: ${data.packageType}</p>
                <p>Package Size: ${data.packageSize}</p>
                <p>Package Weight: ${data.packageWeight} kg</p>
            </div>

            ${data.remarks ? `
            <div class="document-section">
                <h3>Remarks</h3>
                <p>${data.remarks}</p>
            </div>
            ` : ''}

            ${data.terms ? `
            <div class="document-section">
                <h3>Terms and Conditions</h3>
                <p>${data.terms}</p>
            </div>
            ` : ''}

            <div class="document-footer">
                <div class="signature-section">
                    <div class="signature-box">
                        <p>For and on behalf of</p>
                        <p>${data.companyName}</p>
                        <div class="signature-line"></div>
                        <p>Authorized Signature</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (isPreview) {
        showPreview(content);
    } else {
        printDocument(content);
    }
}

// 生成商品行
function generateProductRows(products) {
    return products.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.specification}</td>
            <td>${product.unit}</td>
            <td class="text-end">${product.quantity}</td>
            <td class="text-end">${formatNumber(product.price)}</td>
            <td class="text-end">${formatNumber(product.quantity * product.price)}</td>
        </tr>
    `).join('');
}

// 计算总金额
function calculateTotal(products) {
    const total = products.reduce((sum, product) => {
        return sum + (product.quantity * product.price);
    }, 0);
    return formatNumber(total);
}

// 格式化数字
function formatNumber(number) {
    return Number(number).toFixed(2);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 显示预览
function showPreview(content) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = content;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// 打印文档
function printDocument(content) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Document</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px;">
                <button onclick="window.print()" class="btn btn-primary">打印</button>
                <button onclick="window.close()" class="btn btn-secondary">关闭</button>
            </div>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
}

function generatePrintContent(data) {
    const isPI = data.documentType === 'PI';
    const documentTitle = isPI ? 'PROFORMA INVOICE' : 'QUOTATION';
    
    return `
        <div class="print-content">
            <div class="print-header">
                ${data.companyLogo ? `<img src="${data.companyLogo}" alt="Company Logo">` : ''}
                <div class="print-title">${documentTitle}</div>
                <div class="print-info">
                    <div>No.: ${data.invoiceNo}</div>
                    <div>Date: ${formatDate(data.invoiceDate)}</div>
                    ${data.validUntil ? `<div>Valid Until: ${formatDate(data.validUntil)}</div>` : ''}
                </div>
            </div>

            <div class="print-section">
                <div class="row">
                    <div class="col-6">
                        <h3>Seller Information</h3>
                        <div>${data.companyName}</div>
                        <div>${data.companyAddress}</div>
                        <div>Contact: ${data.companyContact}</div>
                        <div>Tel: ${data.companyPhone}</div>
                        <div>Email: ${data.companyEmail}</div>
                    </div>
                    <div class="col-6">
                        <h3>Buyer Information</h3>
                        <div>${data.clientName}</div>
                        <div>${data.clientAddress}</div>
                        <div>Contact: ${data.clientContact}</div>
                        <div>Tel: ${data.clientPhone}</div>
                        <div>Email: ${data.clientEmail}</div>
                    </div>
                </div>
            </div>

            <div class="print-section">
                <h3>Product Details</h3>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Description</th>
                            <th>Specification</th>
                            <th>Unit</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.products.map((product, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${product.name}</td>
                                <td>${product.specification || '-'}</td>
                                <td>${product.unit || 'PCS'}</td>
                                <td>${product.quantity}</td>
                                <td>${formatCurrency(product.price)}</td>
                                <td>${formatCurrency(product.quantity * product.price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6" class="text-end"><strong>Total Amount:</strong></td>
                            <td><strong>${formatCurrency(calculateTotal(data.products))}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="print-section">
                <h3>Terms & Conditions</h3>
                <div class="row">
                    <div class="col-6">
                        <div><strong>Payment Terms:</strong> ${data.paymentTerms}</div>
                        <div><strong>Delivery Terms:</strong> ${data.deliveryTerms}</div>
                        <div><strong>Port of Loading:</strong> ${data.portOfLoading}</div>
                        <div><strong>Port of Destination:</strong> ${data.portOfDestination}</div>
                    </div>
                    <div class="col-6">
                        <div><strong>Delivery Time:</strong> ${formatDate(data.deliveryDate)}</div>
                        <div><strong>Transport Mode:</strong> ${data.transportMode}</div>
                        <div><strong>Package Type:</strong> ${data.packageType}</div>
                        <div><strong>MOQ:</strong> ${data.moq}</div>
                    </div>
                </div>
            </div>

            ${data.remarks ? `
                <div class="print-section">
                    <h3>Remarks</h3>
                    <div>${data.remarks}</div>
                </div>
            ` : ''}

            ${data.terms ? `
                <div class="print-section">
                    <h3>Terms & Conditions</h3>
                    <div>${data.terms}</div>
                </div>
            ` : ''}

            <div class="print-section">
                <div class="row">
                    <div class="col-6">
                        <div class="print-signature">
                            <div class="print-signature-line"></div>
                            <div>Authorized Signature</div>
                            <div>${data.companyName}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="print-signature">
                            <div class="print-signature-line"></div>
                            <div>Authorized Signature</div>
                            <div>${data.clientName}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function printDocument() {
    const data = collectFormData();
    const printContent = generatePrintContent(data);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${data.documentType === 'PI' ? 'Proforma Invoice' : 'Quotation'}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                ${document.querySelector('style').textContent}
            </style>
        </head>
        <body>
            ${printContent}
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// 工具函数
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateTotal(products) {
    return products.reduce((total, product) => {
        return total + (product.quantity * product.price);
    }, 0);
}
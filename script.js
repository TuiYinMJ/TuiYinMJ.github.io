// 初始化事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认日期
    const today = new Date();
    document.getElementById('invoiceDate').valueAsDate = today;
    document.getElementById('validUntil').valueAsDate = new Date(today.setDate(today.getDate() + 30));
    
    // 商品添加功能
    document.getElementById('addProduct').addEventListener('click', addProductRow);
    
    // 表单提交处理
    document.getElementById('quoteForm').addEventListener('submit', handleSubmit);
    
    // 预览按钮
    document.getElementById('previewBtn').addEventListener('click', () => {
        const products = collectProductData();
        const piData = preparePIData(products);
        generatePreview(piData);
    });
    
    // 初始化第一个商品行
    initializeFirstProductRow();
});

// 初始化第一个商品行
function initializeFirstProductRow() {
    const firstRow = document.querySelector('.product-row');
    if (firstRow) {
        firstRow.querySelector('.remove-btn').style.display = 'none';
    }
}

// 添加商品行
function addProductRow() {
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
    
    document.getElementById('productRows').appendChild(newRow);
    
    // 添加删除按钮事件
    newRow.querySelector('.remove-btn').addEventListener('click', () => {
        newRow.remove();
    });
}

// 表单提交处理
function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const products = collectProductData();
    const piData = preparePIData(products);
    
    generatePreview(piData);
    generateExcel(piData);
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

// 收集商品数据
function collectProductData() {
    return Array.from(document.querySelectorAll('.product-row')).map(row => {
        const inputs = row.querySelectorAll('input');
        return {
            productName: inputs[0].value,
            specification: inputs[1].value,
            unit: inputs[2].value,
            quantity: inputs[3].value,
            unitPrice: inputs[4].value,
            hsCode: inputs[5].value,
            totalAmount: (inputs[3].value * inputs[4].value).toFixed(2)
        };
    });
}

// 准备PI数据
function preparePIData(products) {
    const documentType = document.getElementById('documentType').value;
    return {
        documentType: documentType,
        documentNo: document.getElementById('invoiceNo').value,
        documentDate: document.getElementById('invoiceDate').value,
        validUntil: document.getElementById('validUntil').value,
        companyLogo: document.getElementById('companyLogo').value,
        seller: {
            name: document.getElementById('companyName').value,
            address: document.getElementById('companyAddress').value,
            contact: document.getElementById('companyContact').value,
            phone: document.getElementById('companyPhone').value,
            email: document.getElementById('companyEmail').value
        },
        buyer: {
            name: document.getElementById('clientName').value,
            address: document.getElementById('clientAddress').value,
            contact: document.getElementById('clientContact').value,
            phone: document.getElementById('clientPhone').value,
            email: document.getElementById('clientEmail').value
        },
        paymentTerms: document.getElementById('paymentTerms').value,
        deliveryTerms: document.getElementById('deliveryTerms').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        portOfLoading: document.getElementById('portOfLoading').value,
        portOfDestination: document.getElementById('portOfDestination').value,
        remarks: document.getElementById('remarks').value,
        products: products,
        totalAmount: products.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0).toFixed(2)
    };
}

// 生成预览
function generatePreview(data) {
    const documentType = data.documentType === 'PI' ? 'PROFORMA INVOICE' : 'QUOTATION';
    const previewHtml = `
        <div class="preview-section">
            <div class="text-center mb-4">
                ${data.companyLogo ? `<img src="${data.companyLogo}" class="company-logo">` : ''}
                <h2>${data.seller.name}</h2>
                <h3>${documentType}</h3>
            </div>
            
            <div class="invoice-info">
                <div class="row">
                    <div class="col-md-6">
                        <h4>Seller Information</h4>
                        <p>Address: ${data.seller.address}</p>
                        <p>Contact: ${data.seller.contact}</p>
                        <p>Phone: ${data.seller.phone}</p>
                        <p>Email: ${data.seller.email}</p>
                    </div>
                    <div class="col-md-6">
                        <h4>Buyer Information</h4>
                        <p>Company: ${data.buyer.name}</p>
                        <p>Address: ${data.buyer.address}</p>
                        <p>Contact: ${data.buyer.contact}</p>
                        <p>Phone: ${data.buyer.phone}</p>
                        <p>Email: ${data.buyer.email}</p>
                    </div>
                </div>
            </div>
            
            <div class="invoice-details mb-4">
                <div class="row">
                    <div class="col-md-4">
                        <p><strong>Document No.:</strong> ${data.documentNo}</p>
                        <p><strong>Date:</strong> ${data.documentDate}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Payment Terms:</strong> ${data.paymentTerms}</p>
                        <p><strong>Delivery Terms:</strong> ${data.deliveryTerms}</p>
                    </div>
                    <div class="col-md-4">
                        <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
                        <p><strong>Valid Until:</strong> ${data.validUntil}</p>
                    </div>
                </div>
            </div>
            
            <table class="product-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Specification</th>
                        <th>Unit</th>
                        <th>Quantity</th>
                        <th>Unit Price (USD)</th>
                        <th>HS Code</th>
                        <th>Amount (USD)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.products.map(p => `
                        <tr>
                            <td>${p.productName}</td>
                            <td>${p.specification}</td>
                            <td>${p.unit}</td>
                            <td class="text-end">${p.quantity}</td>
                            <td class="text-end">${p.unitPrice}</td>
                            <td>${p.hsCode}</td>
                            <td class="text-end">${p.totalAmount}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-amount">
                Total Amount: USD ${data.totalAmount}
            </div>
            
            <div class="shipping-info mt-4">
                <p><strong>Port of Loading:</strong> ${data.portOfLoading}</p>
                <p><strong>Port of Destination:</strong> ${data.portOfDestination}</p>
            </div>
            
            ${data.remarks ? `
                <div class="remarks mt-4">
                    <h4>Remarks:</h4>
                    <p>${data.remarks}</p>
                </div>
            ` : ''}
            
            <div class="text-center mt-4">
                <button class="btn btn-primary" onclick="window.print()">Print</button>
                <button class="btn btn-secondary ms-2" onclick="generateExcel(${JSON.stringify(data)})">Export Excel</button>
            </div>
        </div>
    `;
    
    document.getElementById('result').innerHTML = previewHtml;
}

// 生成Excel文件
function generateExcel(data) {
    const wb = XLSX.utils.book_new();
    const documentType = data.documentType === 'PI' ? 'PROFORMA INVOICE' : 'QUOTATION';
    
    // 准备数据
    const wsData = [
        [documentType],
        [''],
        ['Seller Information'],
        ['Company Name', data.seller.name],
        ['Address', data.seller.address],
        ['Contact', data.seller.contact],
        ['Phone', data.seller.phone],
        ['Email', data.seller.email],
        [''],
        ['Buyer Information'],
        ['Company Name', data.buyer.name],
        ['Address', data.buyer.address],
        ['Contact', data.buyer.contact],
        ['Phone', data.buyer.phone],
        ['Email', data.buyer.email],
        [''],
        ['Document Information'],
        ['Document No.', data.documentNo],
        ['Date', data.documentDate],
        ['Valid Until', data.validUntil],
        ['Payment Terms', data.paymentTerms],
        ['Delivery Terms', data.deliveryTerms],
        ['Delivery Date', data.deliveryDate],
        ['Port of Loading', data.portOfLoading],
        ['Port of Destination', data.portOfDestination],
        [''],
        ['Product Details'],
        ['Product Name', 'Specification', 'Unit', 'Quantity', 'Unit Price (USD)', 'HS Code', 'Amount (USD)'],
        ...data.products.map(p => [
            p.productName,
            p.specification,
            p.unit,
            p.quantity,
            p.unitPrice,
            p.hsCode,
            p.totalAmount
        ]),
        [''],
        ['Total Amount', '', '', '', '', '', `USD ${data.totalAmount}`],
        [''],
        ['Remarks'],
        [data.remarks || '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 设置列宽
    const colWidths = [
        { wch: 30 }, // Product Name
        { wch: 20 }, // Specification
        { wch: 10 }, // Unit
        { wch: 10 }, // Quantity
        { wch: 15 }, // Unit Price
        { wch: 15 }, // HS Code
        { wch: 15 }  // Amount
    ];
    ws['!cols'] = colWidths;
    
    // 设置单元格样式
    const range = XLSX.utils.decode_range(ws['!ref']);
    for(let R = range.s.r; R <= range.e.r; ++R) {
        for(let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = {c: C, r: R};
            const cell_ref = XLSX.utils.encode_cell(cell_address);
            if(!ws[cell_ref]) continue;
            
            // 设置标题行样式
            if(R === 0 || R === 2 || R === 10 || R === 17 || R === 25) {
                ws[cell_ref].s = {
                    font: { bold: true, sz: 12 },
                    alignment: { horizontal: 'center' }
                };
            }
            
            // 设置产品表头样式
            if(R === 26) {
                ws[cell_ref].s = {
                    font: { bold: true },
                    alignment: { horizontal: 'center' },
                    fill: { fgColor: { rgb: "CCCCCC" } }
                };
            }
            
            // 设置数值列对齐方式
            if(C === 3 || C === 4 || C === 6) { // Quantity, Unit Price, Amount
                ws[cell_ref].s = {
                    alignment: { horizontal: 'right' }
                };
            }
            
            // 设置总金额行样式
            if(R === range.e.r - 3) {
                ws[cell_ref].s = {
                    font: { bold: true },
                    alignment: { horizontal: 'right' }
                };
            }
        }
    }
    
    // 设置打印区域
    ws['!print'] = {
        area: {
            s: { r: 0, c: 0 },
            e: { r: range.e.r, c: range.e.c }
        },
        fit: { w: 1, h: 1 },
        gridLines: true,
        paperSize: 9, // A4
        orientation: 'portrait'
    };
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, documentType);
    
    // 生成并下载Excel文件
    const fileName = `${documentType}_${data.documentNo}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
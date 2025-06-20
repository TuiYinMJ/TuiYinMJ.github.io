import { getEl, query, queryAll, notify } from './utils.js';
import { loadData, saveData } from './storage.js';
import { initDashboard } from './dashboard.js';
import { initSettings } from './settings.js';
import { initProducts } from './product.js';
import { initCrm, openCustomerModal } from './crm.js';
import { initPiGenerator, selectCustomerInPiForm } from './pi_generator.js';

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Load All Data ---
    let settings = loadData("settings", {});
    let products = loadData("products", []);
    let customers = loadData("customers", []);

    // --- 2. Initialize All Modules ---
    initDashboard(customers);
    initSettings(settings);
    initProducts(products, settings);
    initCrm(customers);
    initPiGenerator(settings, products, customers);

    // --- 3. Setup Global Event Handlers (Navigation, Data I/O) ---
    const navLinks = queryAll(".nav-link");
    const modules = queryAll(".module");
    const exportBtn = getEl("export-data-btn");
    const importInput = getEl("import-data-input");

    function handleNavClick(e) {
        e.preventDefault();
        const link = e.target.closest('a.nav-link');
        if (!link) return;

        const targetId = link.dataset.target;
        if (!targetId || link.classList.contains("active")) return;

        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        modules.forEach((module) => module.classList.toggle("active", module.id === targetId));

        // Pass fresh data to the moduleChanged event
        notify('moduleChanged', { targetId, settings, products, customers });
    }
    
    query('.sidebar-nav').addEventListener("click", handleNavClick);

    exportBtn.addEventListener("click", () => {
        try {
            // Re-fetch data from localStorage to ensure it's the latest before exporting
            const currentSettings = loadData("settings", {});
            const currentProducts = loadData("products", []);
            const currentCustomers = loadData("customers", []);
            const data = JSON.stringify({ settings: currentSettings, products: currentProducts, customers: currentCustomers }, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `trade_helper_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(a.href);
        } catch (error) {
            alert("导出失败! " + error.message);
        }
    });
    
    importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && confirm("【警告】导入备份将覆盖所有现有数据（设置、商品、客户）！确定继续吗？")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.settings && data.products && data.customers) {
                        saveData("settings", data.settings);
                        saveData("products", data.products);
                        saveData("customers", data.customers);
                        alert("数据导入成功！页面将自动刷新以应用更改。");
                        window.location.reload();
                    } else {
                        alert("导入失败：文件格式不正确，缺少必要的数据键。");
                    }
                } catch (err) {
                    alert("导入失败：文件解析错误。");
                }
            };
            reader.readAsText(file);
        }
        e.target.value = "";
    });

    // --- 4. Cross-Module Communication Handlers (The Fix) ---
    
    // Request from CRM to open PI Generator for a customer
    document.addEventListener('requestPiGenerator', (e) => {
        const { customerId } = e.detail;
        const piLink = query('.nav-link[data-target="pi-generator"]');
        if (piLink) piLink.click();
        
        setTimeout(() => {
            selectCustomerInPiForm(customerId);
        }, 50);
    });

    // Request from Dashboard to open CRM Modal for a customer
    document.addEventListener('requestCrmModal', (e) => {
        const { customerId } = e.detail;
        const crmLink = query('.nav-link[data-target="crm-manager"]');
        if (crmLink && !crmLink.classList.contains('active')) {
             crmLink.click();
        }
        // Directly call the exported function from the CRM module
        openCustomerModal(customerId);
    });
});
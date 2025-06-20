import { getEl, query, queryAll, handleImageUpload, setupImageSourceToggle, notify } from './utils.js';
import { saveData } from './storage.js';

let settings = {};

// Cache DOM elements
const settingsForm = getEl("settings-form");
const companyNameInput = getEl("setting-company-name");
const companyAddressInput = getEl("setting-company-address");
const companyContactInput = getEl("setting-company-contact");
const companyLogoInput = getEl("setting-company-logo-input");
const companyLogoUrlInput = getEl("setting-company-logo-url");
const companyLogoPreview = getEl("setting-company-logo-preview");
const companyLogoStorage = getEl("setting-company-logo-storage");

const companySealInput = getEl("setting-company-seal-input");
const companySealPreview = getEl("setting-company-seal-preview");
const companySealStorage = getEl("setting-company-seal-storage");

const bankInfoInput = getEl("setting-bank-info");
const baseCurrencyInput = getEl("setting-base-currency");
const currencyPairsContainer = getEl("currency-pairs-container");
const addCurrencyBtn = getEl("add-currency-btn");
const defaultPortLoadingInput = getEl("setting-default-port-loading");
const defaultIncotermsInput = getEl("setting-default-incoterms");
const defaultValidityInput = getEl("setting-default-validity");
const defaultPaymentInput = getEl("setting-default-payment");
const defaultLeadtimeInput = getEl("setting-default-leadtime");


function addCurrencyRow(currency = { code: "", rate: "" }) {
    const div = document.createElement("div");
    div.className = "currency-pair";
    div.innerHTML = `
        <input type="text" class="currency-code" placeholder="币种代码 (如: USD)" value="${currency.code}" style="flex: 1;">
        <input type="number" class="currency-rate" placeholder="对基准货币的汇率" value="${currency.rate}" style="flex: 2;" step="0.0001">
        <button type="button" class="delete-item-btn" title="删除此币种">&times;</button>
    `;
    currencyPairsContainer.appendChild(div);
    div.querySelector(".delete-item-btn").addEventListener("click", () => div.remove());
}

function renderSettings() {
    const s = settings;
    companyNameInput.value = s.companyName || "";
    companyAddressInput.value = s.companyAddress || "";
    companyContactInput.value = s.companyContact || "";
    bankInfoInput.value = s.bankInfo || "";
    baseCurrencyInput.value = s.baseCurrency || "CNY";

    currencyPairsContainer.innerHTML = "";
    const currencies =
        s.targetCurrencies && s.targetCurrencies.length > 0
            ? s.targetCurrencies
            : [{ code: "USD", rate: "7.25" }];
    currencies.forEach(addCurrencyRow);

    defaultPaymentInput.value = s.defaultPayment || "30% T/T deposit, 70% balance before shipment.";
    defaultLeadtimeInput.value = s.defaultLeadtime || "About 25-30 days after receiving deposit.";
    defaultPortLoadingInput.value = s.defaultPortLoading || "";
    defaultIncotermsInput.value = s.defaultIncoterms || "";
    defaultValidityInput.value = s.defaultValidity || "30";

    // Logo
    if (s.logo) {
        companyLogoStorage.value = s.logo;
        companyLogoPreview.src = s.logo;
        companyLogoPreview.style.display = "block";
        const isUrl = s.logo.startsWith("http");
        query(`input[name="logo-source"][value="${isUrl ? 'url' : 'local'}"]`).checked = true;
        if(isUrl) companyLogoUrlInput.value = s.logo;
    } else {
        query('input[name="logo-source"][value="local"]').checked = true;
        companyLogoPreview.style.display = "none";
    }
    query('input[name="logo-source"]:checked').dispatchEvent(new Event("change", { bubbles: true }));

    // 印章
    if (s.companySeal) {
        companySealStorage.value = s.companySeal;
        companySealPreview.src = s.companySeal;
        companySealPreview.style.display = "block";
    } else {
        companySealPreview.style.display = "none";
    }
}

function handleSettingsSave(e) {
    e.preventDefault();
    const currencies = [];
    queryAll(".currency-pair").forEach((row) => {
        const code = row.querySelector(".currency-code").value.trim().toUpperCase();
        const rate = parseFloat(row.querySelector(".currency-rate").value);
        if (code && !isNaN(rate)) {
            currencies.push({ code, rate });
        }
    });

    const logoSource = query('input[name="logo-source"]:checked').value;
    const newSettings = {
        companyName: companyNameInput.value.trim(),
        companyAddress: companyAddressInput.value.trim(),
        companyContact: companyContactInput.value.trim(),
        logo: logoSource === "local" ? companyLogoStorage.value : companyLogoUrlInput.value.trim(),
        companySeal: companySealStorage.value || "",
        bankInfo: bankInfoInput.value.trim(),
        baseCurrency: baseCurrencyInput.value.trim().toUpperCase() || 'CNY',
        targetCurrencies: currencies,
        defaultPayment: defaultPaymentInput.value.trim(),
        defaultLeadtime: defaultLeadtimeInput.value.trim(),
        defaultPortLoading: defaultPortLoadingInput.value.trim(),
        defaultIncoterms: defaultIncotermsInput.value.trim(),
        defaultValidity: defaultValidityInput.value.trim(),
    };
    
    Object.assign(settings, newSettings);
    saveData("settings", settings);
    
    alert("设置已保存！");
    renderSettings();
    notify('settingsUpdated', { settings });
}

export function initSettings(initialSettings) {
    settings = initialSettings;

    settingsForm.addEventListener("submit", handleSettingsSave);
    addCurrencyBtn.addEventListener("click", () => addCurrencyRow());

    setupImageSourceToggle("logo-source", "logo-source-local", "logo-source-url");
    companyLogoInput.addEventListener("change", () => handleImageUpload(companyLogoInput, companyLogoPreview, companyLogoStorage));
    
    companySealInput.addEventListener("change", () => handleImageUpload(companySealInput, companySealPreview, companySealStorage));

    renderSettings();
}
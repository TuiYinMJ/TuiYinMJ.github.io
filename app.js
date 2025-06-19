document.addEventListener("DOMContentLoaded", () => {
	// --- Global State ---
	let settings = {};
	let products = [];
	let customers = [];
	let quoteItems = [];

	// --- Utility Functions ---
	const getEl = (id) => document.getElementById(id);
	const query = (selector) => document.querySelector(selector);
	const queryAll = (selector) => document.querySelectorAll(selector);
	const saveData = (key, data) =>
		localStorage.setItem(key, JSON.stringify(data));
	const loadData = (key, def = null) => {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : def;
	};
	const handleImageUpload = (fileInput, previewEl, storageEl) => {
		const file = fileInput.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			previewEl.src = e.target.result;
			previewEl.style.display = "block";
			if (storageEl) storageEl.value = e.target.result;
		};
		reader.readAsDataURL(file);
	};

	// --- DOM CACHE ---
	// General
	const navLinks = queryAll(".nav-link");
	const modules = queryAll(".module");
	const exportBtn = getEl("export-data-btn");
	const importInput = getEl("import-data-input");

	// CRM
	const crmSearchInput = getEl("crm-search-input");
	const crmCountryFilter = getEl("crm-country-filter");
	const crmRatingFilter = getEl("crm-rating-filter");
	const customerListBody = getEl("customer-list-body");
	const addNewCustomerBtn = getEl("add-new-customer-btn");
	const customerModal = getEl("customer-modal");
	const customerModalTitle = getEl("customer-modal-title");
	const closeCustomerModalBtn = customerModal.querySelector(".close-modal-btn");
	const customerForm = getEl("customer-form");
	const customerIdInput = getEl("customer-id");
	const customerNameInput = getEl("customer-name");
	const customerCountryInput = getEl("customer-country");
	const customerRatingInput = getEl("customer-rating");
	const customerSourceInput = getEl("customer-source");
	const customerWebsiteInput = getEl("customer-website");
	const customerAddressInput = getEl("customer-address");
	const contactsContainer = getEl("contacts-container");
	const addContactBtn = getEl("add-contact-btn");
	const followUpsContainer = getEl("follow-ups-container");
	const addFollowUpBtn = getEl("add-follow-up-btn");
	const deleteCustomerBtn = getEl("delete-customer-btn");

	// PI Generator
	const settingsForm = getEl("settings-form");
	const companyNameInput = getEl("setting-company-name");
	const companyAddressInput = getEl("setting-company-address");
	const companyContactInput = getEl("setting-company-contact");
	const bankInfoInput = getEl("setting-bank-info");
	const baseCurrencyInput = getEl("setting-base-currency");
	const currencyPairsContainer = getEl("currency-pairs-container");
	const addCurrencyBtn = getEl("add-currency-btn");
	const defaultPaymentInput = getEl("setting-default-payment");
	const defaultLeadtimeInput = getEl("setting-default-leadtime");
	const defaultPortLoadingInput = getEl("setting-default-port-loading");
	const defaultIncotermsInput = getEl("setting-default-incoterms");
	const defaultValidityInput = getEl("setting-default-validity");
	const logoSourceRadios = queryAll('input[name="logo-source"]');
	const logoSourceLocalDiv = getEl("logo-source-local");
	const logoSourceUrlDiv = getEl("logo-source-url");
	const companyLogoInput = getEl("setting-company-logo-input");
	const companyLogoUrlInput = getEl("setting-company-logo-url");
	const companyLogoPreview = getEl("setting-company-logo-preview");
	const companyLogoStorage = getEl("setting-company-logo-storage");
	const productForm = getEl("product-form");
	const productIdInput = getEl("product-id");
	const productModelInput = getEl("product-model");
	const productNameInput = getEl("product-name");
	const productSpecsInput = getEl("product-specs");
	const imageSourceRadios = queryAll('input[name="image-source"]');
	const imageSourceLocalDiv = getEl("image-source-local");
	const imageSourceUrlDiv = getEl("image-source-url");
	const productImageInput = getEl("product-image-input");
	const productImageUrlInput = getEl("product-image-url");
	const productImagePreview = getEl("product-image-preview");
	const productImageStorage = getEl("product-image-storage");
	const productUnitInput = getEl("product-unit");
	const productHsCodeInput = getEl("product-hs-code");
	const productPackagingInput = getEl("product-packaging");
	const productNetWeightInput = getEl("product-net-weight");
	const productGrossWeightInput = getEl("product-gross-weight");
	const costCurrencyLabel = getEl("cost-currency-label");
	const productCostInput = getEl("product-cost");
	const productMarginInput = getEl("product-margin");
	const productPricesDisplay = getEl("product-prices-display");
	const productListBody = getEl("product-list-body");
	const clearProductFormBtn = getEl("clear-product-form-btn");
	const piForm = getEl("pi-form");
	const docTypeSelect = getEl("doc-type");
	const docCurrencySelect = getEl("doc-currency");
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
	const quoteProductList = getEl("quote-product-list");
	const subtotalSpan = getEl("subtotal");
	const freightCostInput = getEl("freight-cost");
	const insuranceCostInput = getEl("insurance-cost");
	const grandTotalSpan = getEl("grand-total");
	const productSelectModal = getEl("product-select-modal");
	const showProductModalBtn = getEl("show-product-modal-btn");
	const closeModalBtn = query(".close-modal-btn");
	const modalProductList = getEl("modal-product-list");
	const modalSearchInput = getEl("modal-search-input");
	const exportExcelBtn = getEl("export-excel-btn");
	const buyerNameInput = getEl("buyer-name");
	const buyerAddressInput = getEl("buyer-address");
	const buyerAttnInput = getEl("buyer-attn");
	const portDestinationInput = getEl("port-destination");

	// --- CRM Functions ---
	const renderCustomerList = () => {
		const searchTerm = crmSearchInput.value.toLowerCase();
		const countryFilter = crmCountryFilter.value;
		const ratingFilter = crmRatingFilter.value;

		const filteredCustomers = customers.filter((c) => {
			const nameMatch = c.name.toLowerCase().includes(searchTerm);
			const countryMatch = !countryFilter || c.country === countryFilter;
			const ratingMatch = !ratingFilter || c.rating == ratingFilter;
			return nameMatch && countryMatch && ratingMatch;
		});

		customerListBody.innerHTML = "";
		if (filteredCustomers.length === 0) {
			customerListBody.innerHTML = `<tr><td colspan="5">没有找到匹配的客户</td></tr>`;
			return;
		}

		filteredCustomers.forEach((c) => {
			const lastFollowUp =
				c.followUps.length > 0
					? c.followUps[c.followUps.length - 1].date
					: "无记录";
			const tr = document.createElement("tr");
			tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.country || "N/A"}</td>
                <td class="star-rating">${"★".repeat(c.rating)}${"☆".repeat(
				5 - c.rating
			)}</td>
                <td>${lastFollowUp}</td>
                <td><button class="btn-action btn-edit" data-id="${
									c.id
								}">详情</button></td>
            `;
			customerListBody.appendChild(tr);
		});
	};

	const populateCountryFilter = () => {
		const countries = [
			...new Set(customers.map((c) => c.country).filter(Boolean)),
		];
		crmCountryFilter.innerHTML = '<option value="">所有国家</option>';
		countries.sort().forEach((country) => {
			const option = document.createElement("option");
			option.value = country;
			option.textContent = country;
			crmCountryFilter.appendChild(option);
		});
	};

	const openCustomerModal = (customerId = null) => {
		customerForm.reset();
		customerIdInput.value = "";
		contactsContainer.innerHTML = "";
		followUpsContainer.innerHTML = "";

		if (customerId) {
			const customer = customers.find((c) => c.id === customerId);
			if (!customer) return;
			customerModalTitle.textContent = "编辑客户信息";
			customerIdInput.value = customer.id;
			customerNameInput.value = customer.name;
			customerCountryInput.value = customer.country;
			customerRatingInput.value = customer.rating;
			customerSourceInput.value = customer.source;
			customerWebsiteInput.value = customer.website;
			customerAddressInput.value = customer.address;
			customer.contacts.forEach(addContactRow);
			customer.followUps.forEach(addFollowUpRow);
			deleteCustomerBtn.style.display = "inline-block";
		} else {
			customerModalTitle.textContent = "新增客户";
			addContactRow(); // Add one empty contact by default
			addFollowUpRow(); // Add one empty follow-up by default
			deleteCustomerBtn.style.display = "none";
		}
		customerModal.style.display = "block";
	};

	const addContactRow = (contact = {}) => {
		const div = document.createElement("div");
		div.className = "contact-card";
		div.innerHTML = `
            <button type="button" class="delete-item-btn">&times;</button>
            <div class="form-grid-col3">
                <input type="text" class="contact-name" placeholder="姓名" value="${
									contact.name || ""
								}">
                <input type="text" class="contact-position" placeholder="职位" value="${
									contact.position || ""
								}">
                <input type="email" class="contact-email" placeholder="邮箱" value="${
									contact.email || ""
								}">
            </div>
            <div class="form-grid-col2">
                <input type="tel" class="contact-phone" placeholder="电话" value="${
									contact.phone || ""
								}">
                <input type="text" class="contact-social" placeholder="社交账号 (e.g., WhatsApp)" value="${
									contact.social || ""
								}">
            </div>
        `;
		contactsContainer.appendChild(div);
		div
			.querySelector(".delete-item-btn")
			.addEventListener("click", () => div.remove());
	};

	const addFollowUpRow = (followUp = {}) => {
		const div = document.createElement("div");
		div.className = "follow-up-card";
		div.innerHTML = `
            <button type="button" class="delete-item-btn">&times;</button>
            <div class="form-grid-col2">
                <input type="date" class="follow-up-date" value="${
									followUp.date || new Date().toISOString().slice(0, 10)
								}">
                <input type="text" class="follow-up-method" placeholder="方式 (e.g., Email, Phone)" value="${
									followUp.method || ""
								}">
            </div>
            <textarea class="follow-up-notes" placeholder="跟进内容纪要..." rows="3">${
							followUp.notes || ""
						}</textarea>
        `;
		followUpsContainer.appendChild(div);
		div
			.querySelector(".delete-item-btn")
			.addEventListener("click", () => div.remove());
	};

	const handleCustomerFormSubmit = (e) => {
		e.preventDefault();
		const id = customerIdInput.value || Date.now().toString();

		const contacts = [];
		queryAll("#contacts-container .contact-card").forEach((card) => {
			contacts.push({
				name: card.querySelector(".contact-name").value.trim(),
				position: card.querySelector(".contact-position").value.trim(),
				email: card.querySelector(".contact-email").value.trim(),
				phone: card.querySelector(".contact-phone").value.trim(),
				social: card.querySelector(".contact-social").value.trim(),
			});
		});

		const followUps = [];
		queryAll("#follow-ups-container .follow-up-card").forEach((card) => {
			followUps.push({
				date: card.querySelector(".follow-up-date").value,
				method: card.querySelector(".follow-up-method").value.trim(),
				notes: card.querySelector(".follow-up-notes").value.trim(),
			});
		});
		// Sort follow-ups by date, newest first
		followUps.sort((a, b) => new Date(b.date) - new Date(a.date));

		const customerData = {
			id,
			name: customerNameInput.value.trim(),
			country: customerCountryInput.value.trim(),
			rating: parseInt(customerRatingInput.value, 10),
			source: customerSourceInput.value.trim(),
			website: customerWebsiteInput.value.trim(),
			address: customerAddressInput.value.trim(),
			contacts: contacts.filter((c) => c.name || c.email),
			followUps: followUps.filter((f) => f.date || f.notes),
		};

		if (!customerData.name) {
			alert("公司名称为必填项！");
			return;
		}

		const existingIndex = customers.findIndex((c) => c.id === id);
		if (existingIndex > -1) {
			customers[existingIndex] = customerData;
		} else {
			customers.push(customerData);
		}

		saveData("customers", customers);
		renderCustomerList();
		populateCountryFilter();
		customerModal.style.display = "none";
	};

	const handleDeleteCustomer = () => {
		const id = customerIdInput.value;
		if (
			confirm(
				`确定要删除客户 “${customerNameInput.value}” 吗？此操作不可撤销。`
			)
		) {
			customers = customers.filter((c) => c.id !== id);
			saveData("customers", customers);
			renderCustomerList();
			populateCountryFilter();
			customerModal.style.display = "none";
		}
	};

	// --- Core Functions ---
	const addCurrencyRow = (currency = { code: "", rate: "" }) => {
		const div = document.createElement("div");
		div.className = "currency-pair";
		div.innerHTML = `
            <input type="text" class="currency-code" placeholder="币种代码 (如: USD)" value="${currency.code}" style="flex: 1;">
            <input type="number" class="currency-rate" placeholder="对基准货币的汇率" value="${currency.rate}" style="flex: 2;" step="0.0001">
            <button type="button" class="delete-item-btn">&times;</button>
        `;
		currencyPairsContainer.appendChild(div);
		div
			.querySelector(".delete-item-btn")
			.addEventListener("click", () => div.remove());
	};

	const renderSettings = () => {
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
				: [{ code: "USD", rate: 7.25 }];
		currencies.forEach(addCurrencyRow);

		defaultPaymentInput.value = s.defaultPayment || "";
		defaultLeadtimeInput.value = s.defaultLeadtime || "";
		defaultPortLoadingInput.value = s.defaultPortLoading || "";
		defaultIncotermsInput.value = s.defaultIncoterms || "";
		defaultValidityInput.value = s.defaultValidity || "30";
		costCurrencyLabel.textContent = s.baseCurrency || "CNY";
		if (s.logo) {
			companyLogoStorage.value = s.logo;
			companyLogoPreview.src = s.logo;
			companyLogoPreview.style.display = "block";
			if (s.logo.startsWith("http")) {
				query('input[name="logo-source"][value="url"]').click();
				companyLogoUrlInput.value = s.logo;
			} else {
				query('input[name="logo-source"][value="local"]').click();
			}
		} else {
			query('input[name="logo-source"][value="local"]').click();
			companyLogoPreview.style.display = "none";
		}
	};

	const renderProducts = () => {
		productListBody.innerHTML = "";
		products.forEach((p) => {
			const tr = document.createElement("tr");
			tr.dataset.id = p.id;
			tr.innerHTML = `<td>${p.model}</td><td>${p.name}</td><td><button class="btn-action btn-edit" data-id="${p.id}">编辑</button><button class="btn-action btn-delete-row" data-id="${p.id}">删除</button></td>`;
			productListBody.appendChild(tr);
		});
	};

	const renderModalProducts = (filter = "") => {
		modalProductList.innerHTML = "";
		const filtered = products.filter(
			(p) =>
				p.model.toLowerCase().includes(filter.toLowerCase()) ||
				p.name.toLowerCase().includes(filter.toLowerCase())
		);
		if (filtered.length === 0) {
			modalProductList.innerHTML =
				'<tr><td colspan="4">没有找到匹配的商品</td></tr>';
			return;
		}
		filtered.forEach((p) => {
			const tr = document.createElement("tr");
			tr.dataset.id = p.id;
			tr.innerHTML = `<td><img src="${
				p.image || "https://placehold.co/60x60/eee/ccc?text=No+Img"
			}" alt="${p.name}"></td><td>${p.model}</td><td>${
				p.name
			}</td><td><button class="btn-primary btn-action btn-add-quote">添加</button></td>`;
			modalProductList.appendChild(tr);
		});
	};

	const renderQuoteItems = () => {
		const currency = docCurrencySelect.value;
		quoteProductList.innerHTML = "";
		quoteItems.forEach((item, index) => {
			const tr = document.createElement("tr");
			tr.dataset.index = index;
			const price = item.prices[currency] || 0;
			tr.innerHTML = `
                <td><img src="${
									item.image || "https://placehold.co/60x60/eee/ccc?text=No+Img"
								}" alt="${item.name}"></td>
                <td><p><strong>${item.model}</strong>: ${
				item.name
			}</p><textarea class="quote-item-specs" rows="3">${
				item.specs
			}</textarea></td>
                <td><input type="number" class="quote-item-qty" value="${
									item.qty
								}" min="1"></td>
                <td><input type="text" class="quote-item-unit" value="${
									item.unit
								}"></td>
                <td><input type="number" class="quote-item-price" value="${price.toFixed(
									2
								)}" step="0.01"></td>
                <td class="quote-item-amount">${(item.qty * price).toFixed(
									2
								)}</td>
                <td><button class="btn-action btn-delete-row">&times;</button></td>`;
			quoteProductList.appendChild(tr);
		});
		updateTotals();
	};

	const renderCurrencyOptions = () => {
		const currencies =
			settings.targetCurrencies && settings.targetCurrencies.length > 0
				? settings.targetCurrencies
				: [{ code: "USD", rate: 7.25 }];
		docCurrencySelect.innerHTML = currencies
			.map((c) => `<option value="${c.code}">${c.code}</option>`)
			.join("");
		if (docCurrencySelect.value) {
			quoteCurrencyLabel.textContent = docCurrencySelect.value;
		}
	};

	const calculatePrices = () => {
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
				productPricesDisplay.innerHTML =
					'<span style="color:red;">毛利率不能超100%</span>';
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
	};

	const updateTotals = () => {
		const currency = docCurrencySelect.value;
		let subtotal = 0;
		queryAll("#quote-product-list tr").forEach((row) => {
			const price =
				parseFloat(row.querySelector(".quote-item-price").value) || 0;
			const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
			subtotal += qty * price;
		});
		const freight = parseFloat(freightCostInput.value) || 0;
		const insurance = parseFloat(insuranceCostInput.value) || 0;
		const grandTotal = subtotal + freight + insurance;
		subtotalSpan.textContent = `${subtotal.toFixed(2)} ${currency}`;
		grandTotalSpan.textContent = `${grandTotal.toFixed(2)} ${currency}`;
	};

	const generateDocId = () => {
		const prefix = docTypeSelect.value.slice(0, 2);
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const random = Date.now().toString().slice(-5);
		docIdInput.value = `${prefix}-${date}-${random}`;
	};

	const handleNavClick = (e) => {
		e.preventDefault();
		const targetId = e.target.dataset.target;
		navLinks.forEach((link) => link.classList.remove("active"));
		e.target.classList.add("active");
		modules.forEach((module) =>
			module.classList.toggle("active", module.id === targetId)
		);
		if (targetId === "pi-generator") {
			renderCurrencyOptions();
			const s = settings;
			docDateInput.valueAsDate = new Date();
			generateDocId();
			docIncotermsInput.value = s.defaultIncoterms || "";
			paymentTermsInput.value =
				s.defaultPayment ||
				"Example: 30% T/T deposit, 70% balance against B/L copy.";
			leadTimeInput.value =
				s.defaultLeadtime || "Example: 25-30 days after receiving deposit.";
			portLoadingInput.value = s.defaultPortLoading || "";
			docValidityInput.value = s.defaultValidity || "30";
			docPreparedByInput.value = s.preparedBy || "";
		} else if (targetId === "crm-manager") {
			renderCustomerList();
			populateCountryFilter();
		}
	};

	const handleSettingsSave = (e) => {
		e.preventDefault();
		const currencies = [];
		queryAll(".currency-pair").forEach((row) => {
			const code = row
				.querySelector(".currency-code")
				.value.trim()
				.toUpperCase();
			const rate = parseFloat(row.querySelector(".currency-rate").value.trim());
			if (code && !isNaN(rate)) {
				currencies.push({ code, rate });
			}
		});

		const logoSource = query('input[name="logo-source"]:checked').value;
		settings = {
			companyName: companyNameInput.value,
			companyAddress: companyAddressInput.value,
			companyContact: companyContactInput.value,
			bankInfo: bankInfoInput.value,
			baseCurrency: baseCurrencyInput.value.trim().toUpperCase(),
			targetCurrencies: currencies,
			defaultPayment: defaultPaymentInput.value,
			defaultLeadtime: defaultLeadtimeInput.value,
			defaultPortLoading: defaultPortLoadingInput.value,
			defaultIncoterms: defaultIncotermsInput.value,
			defaultValidity: defaultValidityInput.value,
			logo:
				logoSource === "local"
					? companyLogoStorage.value
					: companyLogoUrlInput.value.trim(),
		};
		saveData("settings", settings);
		alert("设置已保存！");
		renderSettings();
		costCurrencyLabel.textContent = settings.baseCurrency || "CNY";
	};

	const handleProductSave = (e) => {
		e.preventDefault();
		const prices = calculatePrices();
		if (Object.keys(prices).length === 0) {
			alert("无法计算价格，请检查成本、利润率和后台汇率设置。");
			return;
		}
		const imageSource = query('input[name="image-source"]:checked').value;
		const productData = {
			id: productIdInput.value || Date.now().toString(),
			model: productModelInput.value.trim(),
			name: productNameInput.value.trim(),
			specs: productSpecsInput.value.trim(),
			image:
				imageSource === "local"
					? productImageStorage.value
					: productImageUrlInput.value.trim(),
			unit: productUnitInput.value.trim(),
			hsCode: productHsCodeInput.value.trim(),
			packaging: productPackagingInput.value.trim(),
			netWeight: productNetWeightInput.value.trim(),
			grossWeight: productGrossWeightInput.value.trim(),
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
			if (products.some((p) => p.model === productData.model)) {
				alert("产品型号已存在！");
				return;
			}
			products.push(productData);
		}
		saveData("products", products);
		renderProducts();
		clearProductFormBtn.click();
		alert("商品已保存！");
	};

	const handleProductListClick = (e) => {
		const button = e.target.closest("button.btn-action");
		if (!button) return;
		const id = button.dataset.id;
		if (!id) return;

		if (button.classList.contains("btn-edit")) {
			const product = products.find((p) => p.id === id);
			if (!product) return;
			productIdInput.value = product.id;
			productModelInput.value = product.model;
			productNameInput.value = product.name;
			productSpecsInput.value = product.specs;
			productUnitInput.value = product.unit;
			productHsCodeInput.value = product.hsCode || "";
			productPackagingInput.value = product.packaging || "";
			productNetWeightInput.value = product.netWeight || "";
			productGrossWeightInput.value = product.grossWeight || "";
			if (
				product.image &&
				(product.image.startsWith("http") || product.image.startsWith("//"))
			) {
				query('input[name="image-source"][value="url"]').click();
				productImageUrlInput.value = product.image;
				productImagePreview.style.display = "none";
			} else {
				query('input[name="image-source"][value="local"]').click();
				productImageStorage.value = product.image || "";
				productImagePreview.src = product.image || "#";
				productImagePreview.style.display = product.image ? "block" : "none";
			}
			productCostInput.value = "";
			productMarginInput.value = "";
			productPricesDisplay.innerHTML = "请重新输入成本和利润率以更新价格。";
		} else if (button.classList.contains("btn-delete-row")) {
			if (confirm(`确定要删除此商品吗？`)) {
				products = products.filter((p) => p.id !== id);
				saveData("products", products);
				renderProducts();
			}
		}
	};

	const handlePiFormSubmit = (e) => {
		e.preventDefault();
		const currency = docCurrencySelect.value;
		const bankInfoHTML =
			docTypeSelect.value === "PROFORMA INVOICE" && settings.bankInfo
				? `<div class="print-terms"><h3>BANK INFORMATION:</h3><p>${settings.bankInfo.replace(
						/\n/g,
						"<br>"
				  )}</p></div>`
				: "";
		const remarksHTML = docRemarksInput.value.trim()
			? `<div class="print-terms"><h3>REMARKS:</h3><p>${docRemarksInput.value.replace(
					/\n/g,
					"<br>"
			  )}</p></div>`
			: "";
		const attnHTML = buyerAttnInput.value.trim()
			? `<p>Attn: ${buyerAttnInput.value}</p>`
			: "";
		const preparedByHTML = docPreparedByInput.value.trim()
			? `<p>Prepared by: ${docPreparedByInput.value}</p>`
			: "<p></p>";

		getEl("print-preview-area").innerHTML = `
            <div class="print-container">
                <header class="print-header">
                    <div class="seller-info"><h1>${
											settings.companyName || "Your Company"
										}</h1><p>${
			settings.companyAddress || "Your Address"
		}</p><p>${settings.companyContact || "Your Contact"}</p></div>
                    <div class="doc-title">${
											settings.logo
												? `<img src="${settings.logo}" alt="logo">`
												: ""
										}<h2>${docTypeSelect.value.replace(/_/g, " ")}</h2></div>
                </header>
                <section class="print-meta">
                    <div class="buyer-info"><h3>TO:</h3><p><strong>${
											buyerNameInput.value
										}</strong></p><p>${buyerAddressInput.value.replace(
			/\n/g,
			"<br>"
		)}</p>${attnHTML}</div>
                    <div class="doc-info">
                        <p><strong>No.:</strong> ${
													docIdInput.value
												}</p><p><strong>Date:</strong> ${docDateInput.value}</p>
                        <p><strong>Incoterms:</strong> ${
													docIncotermsInput.value
												}</p><p><strong>Validity:</strong> ${
			docValidityInput.value
		} Days</p>
                    </div>
                </section>
                <table class="print-table">
                    <thead><tr><th>Item No.</th><th>Image</th><th class="desc">Description</th><th>QTY</th><th>Unit</th><th>Unit Price(${currency})</th><th>Amount(${currency})</th></tr></thead>
                    <tbody>${quoteItems
											.map((item, index) => {
												const row = query(
													`#quote-product-list tr[data-index="${index}"]`
												);
												const price =
													parseFloat(
														row.querySelector(".quote-item-price").value
													) || 0;
												const qty =
													parseInt(
														row.querySelector(".quote-item-qty").value
													) || 0;

												const descriptionParts = [];
												descriptionParts.push(
													`<strong>${item.model}:</strong> ${item.name}`
												);

												const specs = row
													.querySelector(".quote-item-specs")
													.value.trim();
												if (specs)
													descriptionParts.push(specs.replace(/\n/g, "<br>"));
												if (item.packaging)
													descriptionParts.push(`Packaging: ${item.packaging}`);
												if (item.hsCode)
													descriptionParts.push(`HS Code: ${item.hsCode}`);
												if (item.netWeight || item.grossWeight) {
													descriptionParts.push(
														`N.W.:${item.netWeight || "N/A"} KGS / G.W.:${
															item.grossWeight || "N/A"
														} KGS`
													);
												}

												return `<tr>
                            <td>${index + 1}</td>
                            <td><img src="${
															item.image ||
															"https://placehold.co/60x60/eee/ccc?text=No+Img"
														}"></td>
                            <td class="desc">${descriptionParts.join(
															"<br>"
														)}</td>
                            <td>${qty}</td>
                            <td>${item.unit}</td>
                            <td>${price.toFixed(2)}</td>
                            <td>${(qty * price).toFixed(2)}</td>
                        </tr>`;
											})
											.join("")}
                    </tbody>
                </table>
                <section class="print-summary">
                    <table>
                        <tr><td>Subtotal:</td><td>${
													subtotalSpan.textContent
												}</td></tr>
                        ${
													(parseFloat(freightCostInput.value) || 0) > 0
														? `<tr><td>Freight Cost:</td><td>${parseFloat(
																freightCostInput.value || 0
														  ).toFixed(2)} ${currency}</td></tr>`
														: ""
												}
                        ${
													(parseFloat(insuranceCostInput.value) || 0) > 0
														? `<tr><td>Insurance:</td><td>${parseFloat(
																insuranceCostInput.value || 0
														  ).toFixed(2)} ${currency}</td></tr>`
														: ""
												}
                        <tr class="grand-total"><td>GRAND TOTAL:</td><td>${
													grandTotalSpan.textContent
												}</td></tr>
                    </table>
                </section>
                <section class="print-terms">
                    <h3>TERMS & CONDITIONS:</h3>
                    ${
											portLoadingInput.value.trim()
												? `<p><strong>Port of Loading:</strong> ${portLoadingInput.value}</p>`
												: ""
										}
                    ${
											portDestinationInput.value.trim()
												? `<p><strong>Port of Destination:</strong> ${portDestinationInput.value}</p>`
												: ""
										}
                    <p><strong>Payment Terms:</strong> ${paymentTermsInput.value.replace(
											/\n/g,
											"<br>"
										)}</p>
                    <p><strong>Lead Time:</strong> ${leadTimeInput.value.replace(
											/\n/g,
											"<br>"
										)}</p>
                </section>
                ${remarksHTML}
                ${bankInfoHTML}
                <footer class="print-footer">
                    ${preparedByHTML}
                    <div><p>Authorized Signature</p><p style="margin-top:20px;">_________________________</p></div>
                </footer>
            </div>`;
		window.print();
	};

	const handleQuoteListUpdate = (e) => {
		const row = e.target.closest("tr");
		if (!row) return;
		if (e.target.classList.contains("btn-delete-row")) {
			const index = parseInt(row.dataset.index, 10);
			quoteItems.splice(index, 1);
			renderQuoteItems();
		} else if (e.target.matches(".quote-item-qty, .quote-item-price")) {
			updateTotals();
			const price =
				parseFloat(row.querySelector(".quote-item-price").value) || 0;
			const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
			row.querySelector(".quote-item-amount").textContent = (
				qty * price
			).toFixed(2);
		}
	};

	const handleExportToExcel = () => {
		exportExcelBtn.textContent = "正在生成...";
		exportExcelBtn.disabled = true;

		const docType = docTypeSelect.value.replace(/_/g, " ");
		const currency = docCurrencySelect.value;
		const fileName = `${docType}_${docIdInput.value || "Draft"}.xls`;

		// Use the same logic as print to generate the HTML string
		const bankInfoHTML =
			docTypeSelect.value === "PROFORMA INVOICE" && settings.bankInfo
				? `<p><b>BANK INFORMATION:</b><br>${settings.bankInfo.replace(
						/\n/g,
						"<br>"
				  )}</p>`
				: "";
		const remarksHTML = docRemarksInput.value.trim()
			? `<p><b>REMARKS:</b><br>${docRemarksInput.value.replace(
					/\n/g,
					"<br>"
			  )}</p>`
			: "";
		const attnHTML = buyerAttnInput.value.trim()
			? `<tr><td colspan="2">Attn: ${buyerAttnInput.value}</td></tr>`
			: "";

		const productRows = quoteItems
			.map((item, index) => {
				const row = query(`#quote-product-list tr[data-index="${index}"]`);
				const price =
					parseFloat(row.querySelector(".quote-item-price").value) || 0;
				const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;

				const descriptionParts = [];
				descriptionParts.push(`<b>${item.model}:</b> ${item.name}`);

				const specs = row.querySelector(".quote-item-specs").value.trim();
				if (specs) descriptionParts.push(specs.replace(/\n/g, "<br>"));
				if (item.packaging)
					descriptionParts.push(`Packaging: ${item.packaging}`);
				if (item.hsCode) descriptionParts.push(`HS Code: ${item.hsCode}`);
				if (item.netWeight || item.grossWeight) {
					descriptionParts.push(
						`N.W.:${item.netWeight || "N/A"} KGS / G.W.:${
							item.grossWeight || "N/A"
						} KGS`
					);
				}

				return `<tr>
                <td style="text-align:center; vertical-align:top;">${
									index + 1
								}</td>
                <td style="text-align:center; vertical-align:top;"><img src="${
									item.image || "https://placehold.co/80x80/eee/ccc?text=No+Img"
								}" width="80" height="80"></td>
                <td style="vertical-align:top;">${descriptionParts.join(
									"<br>"
								)}</td>
                <td style="text-align:center; vertical-align:top;">${qty}</td>
                <td style="text-align:center; vertical-align:top;">${
									item.unit
								}</td>
                <td style="text-align:right; vertical-align:top;">${price.toFixed(
									2
								)}</td>
                <td style="text-align:right; vertical-align:top;">${(
									qty * price
								).toFixed(2)}</td>
            </tr>`;
			})
			.join("");

		const freightCost = parseFloat(freightCostInput.value) || 0;
		const insuranceCost = parseFloat(insuranceCostInput.value) || 0;

		const summaryHTML = `
            <tr>
                <td colspan="5" rowspan="4">
                    <p><b>TERMS & CONDITIONS:</b></p>
                    ${
											portLoadingInput.value.trim()
												? `<p>Port of Loading: ${portLoadingInput.value}</p>`
												: ""
										}
                    ${
											portDestinationInput.value.trim()
												? `<p>Port of Destination: ${portDestinationInput.value}</p>`
												: ""
										}
                    <p>Payment Terms: ${paymentTermsInput.value.replace(
											/\n/g,
											"<br>"
										)}</p>
                    <p>Lead Time: ${leadTimeInput.value.replace(
											/\n/g,
											"<br>"
										)}</p>
                </td>
                <td>Subtotal:</td>
                <td style="text-align:right;">${
									subtotalSpan.textContent.split(" ")[0]
								}</td>
            </tr>
            ${
							freightCost > 0
								? `<tr><td>Freight Cost:</td><td style="text-align:right;">${freightCost.toFixed(
										2
								  )}</td></tr>`
								: "<tr><td></td><td></td></tr>"
						}
            ${
							insuranceCost > 0
								? `<tr><td>Insurance:</td><td style="text-align:right;">${insuranceCost.toFixed(
										2
								  )}</td></tr>`
								: "<tr><td></td><td></td></tr>"
						}
            <tr>
                <td><b>GRAND TOTAL:</b></td>
                <td style="text-align:right;"><b>${
									grandTotalSpan.textContent.split(" ")[0]
								}</b></td>
            </tr>
        `;

		const finalHTML = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8"></head>
            <body>
                <table border="1">
                    <tr>
                        <td colspan="4" style="font-size:14pt;">
                            <b>${settings.companyName || ""}</b><br>
                            ${(settings.companyAddress || "").replace(
															/\n/g,
															"<br>"
														)}<br>
                            ${(settings.companyContact || "").replace(
															/\n/g,
															"<br>"
														)}
                        </td>
                        <td colspan="3" style="text-align:center; vertical-align:middle; font-size:18pt; font-weight:bold;">
                            ${
															settings.logo
																? `<img src="${settings.logo}" width="180"><br>`
																: ""
														}
                            ${docType}
                        </td>
                    </tr>
                    <tr><td colspan="7"></td></tr>
                    <tr>
                        <td colspan="2"><b>TO:</b></td>
                        <td></td>
                        <td colspan="2"><b>No.:</b></td>
                        <td colspan="2">${docIdInput.value}</td>
                    </tr>
                     <tr>
                        <td colspan="2">${buyerNameInput.value}</td>
                        <td></td>
                        <td colspan="2"><b>Date:</b></td>
                        <td colspan="2">${docDateInput.value}</td>
                    </tr>
                     <tr>
                        <td colspan="2" rowspan="2">${buyerAddressInput.value.replace(
													/\n/g,
													"<br>"
												)}</td>
                        <td></td>
                        <td colspan="2"><b>Incoterms:</b></td>
                        <td colspan="2">${docIncotermsInput.value}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td colspan="2"><b>Validity:</b></td>
                        <td colspan="2">${docValidityInput.value} Days</td>
                    </tr>
                    ${attnHTML}
                    <tr><td colspan="7"></td></tr>
                    <tr style="background-color:#f2f2f2; font-weight:bold; text-align:center;">
                        <td>Item No.</td>
                        <td>Image</td>
                        <td>Description</td>
                        <td>QTY</td>
                        <td>Unit</td>
                        <td>Unit Price(${currency})</td>
                        <td>Amount(${currency})</td>
                    </tr>
                    ${productRows}
                    <tr><td colspan="7"></td></tr>
                    ${summaryHTML}
                    <tr><td colspan="7"></td></tr>
                    <tr><td colspan="7">${remarksHTML}</td></tr>
                    <tr><td colspan="7">${bankInfoHTML}</td></tr>
                </table>
            </body>
            </html>
        `;

		const blob = new Blob([finalHTML], { type: "application/vnd.ms-excel" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		exportExcelBtn.textContent = "导出为 Excel";
		exportExcelBtn.disabled = false;
	};

	function init() {
		// Load all data
		settings = loadData("settings", {});
		products = loadData("products", []);
		customers = loadData("customers", []);

		// Initial render
		renderSettings();
		renderProducts();
		renderCustomerList();
		populateCountryFilter();

		// General Event Listeners
		navLinks.forEach((link) => link.addEventListener("click", handleNavClick));
		exportBtn.addEventListener("click", () => {
			const data = JSON.stringify({ settings, products, customers }, null, 2);
			const blob = new Blob([data], { type: "application/json" });
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = `trade_helper_backup_${new Date()
				.toISOString()
				.slice(0, 10)}.json`;
			a.click();
			URL.revokeObjectURL(a.href);
		});
		importInput.addEventListener("change", (e) => {
			const file = e.target.files[0];
			if (
				file &&
				confirm(
					"导入数据将覆盖现有所有数据（包括设置、商品和客户），确定继续吗？"
				)
			) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const data = JSON.parse(event.target.result);
						if (data.settings && data.products && data.customers) {
							saveData("settings", data.settings);
							saveData("products", data.products);
							saveData("customers", data.customers);
							alert("数据导入成功！页面将重新加载。");
							window.location.reload();
						} else {
							alert("文件格式不正确！缺少必要数据。");
						}
					} catch (err) {
						alert("导入失败，文件可能已损坏。");
						console.error(err);
					}
				};
				reader.readAsText(file);
			}
			e.target.value = "";
		});

		// CRM Event Listeners
		addNewCustomerBtn.addEventListener("click", () => openCustomerModal());
		customerListBody.addEventListener("click", (e) => {
			if (e.target.classList.contains("btn-edit")) {
				openCustomerModal(e.target.dataset.id);
			}
		});
		[crmSearchInput, crmCountryFilter, crmRatingFilter].forEach((el) => {
			el.addEventListener("input", renderCustomerList);
		});
		closeCustomerModalBtn.addEventListener(
			"click",
			() => (customerModal.style.display = "none")
		);
		addContactBtn.addEventListener("click", () => addContactRow());
		addFollowUpBtn.addEventListener("click", () => addFollowUpRow());
		customerForm.addEventListener("submit", handleCustomerFormSubmit);
		deleteCustomerBtn.addEventListener("click", handleDeleteCustomer);

		// Settings Event Listeners
		settingsForm.addEventListener("submit", handleSettingsSave);
		addCurrencyBtn.addEventListener("click", () => addCurrencyRow());
		const setupImageSourceToggle = (radioName, localDivId, urlDivId) => {
			queryAll(`input[name="${radioName}"]`).forEach((r) =>
				r.addEventListener("change", (e) => {
					const isLocal = e.target.value === "local";
					getEl(localDivId).style.display = isLocal ? "block" : "none";
					getEl(urlDivId).style.display = isLocal ? "none" : "block";
				})
			);
		};
		setupImageSourceToggle(
			"logo-source",
			"logo-source-local",
			"logo-source-url"
		);
		setupImageSourceToggle(
			"image-source",
			"image-source-local",
			"image-source-url"
		);
		companyLogoInput.addEventListener("change", () =>
			handleImageUpload(
				companyLogoInput,
				companyLogoPreview,
				companyLogoStorage
			)
		);

		// Product Event Listeners
		productImageInput.addEventListener("change", () =>
			handleImageUpload(
				productImageInput,
				productImagePreview,
				productImageStorage
			)
		);
		productForm.addEventListener("submit", handleProductSave);
		[
			productCostInput,
			productMarginInput,
			...queryAll('input[name="profit-algo"]'),
		].forEach((el) => el.addEventListener("input", calculatePrices));
		clearProductFormBtn.addEventListener("click", () => {
			productForm.reset();
			productImagePreview.style.display = "none";
			productIdInput.value = "";
			productPricesDisplay.innerHTML = "";
			query('input[name="image-source"][value="local"]').click();
		});
		productListBody.addEventListener("click", handleProductListClick);

		// PI Event Listeners
		piForm.addEventListener("submit", handlePiFormSubmit);
		piForm.addEventListener("reset", () => {
			quoteItems = [];
			renderQuoteItems();
		});
		generateDocIdBtn.addEventListener("click", generateDocId);
		docCurrencySelect.addEventListener("change", () => {
			quoteCurrencyLabel.textContent = docCurrencySelect.value;
			renderQuoteItems();
		});
		exportExcelBtn.addEventListener("click", handleExportToExcel);
		showProductModalBtn.addEventListener("click", () => {
			renderModalProducts();
			productSelectModal.style.display = "block";
		});
		productSelectModal
			.querySelector(".close-modal-btn")
			.addEventListener(
				"click",
				() => (productSelectModal.style.display = "none")
			);
		window.addEventListener("click", (e) => {
			if (e.target == productSelectModal)
				productSelectModal.style.display = "none";
			if (e.target == customerModal) customerModal.style.display = "none";
		});
		modalSearchInput.addEventListener("input", (e) =>
			renderModalProducts(e.target.value)
		);
		modalProductList.addEventListener("click", (e) => {
			const btn = e.target.closest("button.btn-add-quote");
			if (btn) {
				const product = products.find(
					(p) => p.id === btn.closest("tr").dataset.id
				);
				if (product) {
					quoteItems.push({ ...product, qty: 1 });
					renderQuoteItems();
				}
				productSelectModal.style.display = "none";
			}
		});
		quoteProductList.addEventListener("input", handleQuoteListUpdate);
		quoteProductList.addEventListener("click", handleQuoteListUpdate);
		[freightCostInput, insuranceCostInput].forEach((el) =>
			el.addEventListener("input", updateTotals)
		);
	}

	init();
});

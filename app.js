document.addEventListener("DOMContentLoaded", () => {
	let settings = {};
	let products = [];
	let quoteItems = [];

	const getEl = (id) => document.getElementById(id);
	const query = (selector) => document.querySelector(selector);
	const queryAll = (selector) => document.querySelectorAll(selector);

	// --- DOM CACHE ---
	const navLinks = queryAll(".nav-link");
	const modules = queryAll(".module");
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
	const exportBtn = getEl("export-data-btn");
	const importInput = getEl("import-data-input");
	const buyerNameInput = getEl("buyer-name");
	const buyerAddressInput = getEl("buyer-address");
	const buyerAttnInput = getEl("buyer-attn");
	const portDestinationInput = getEl("port-destination");

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

	const addCurrencyRow = (currency = { code: "", rate: "" }) => {
		const div = document.createElement("div");
		div.className = "currency-pair";
		div.innerHTML = `
            <input type="text" class="currency-code" placeholder="币种代码 (如: USD)" value="${currency.code}" style="flex: 1;">
            <input type="number" class="currency-rate" placeholder="对基准货币的汇率" value="${currency.rate}" style="flex: 2;" step="0.0001">
            <button type="button" class="remove-currency-btn">&times;</button>
        `;
		currencyPairsContainer.appendChild(div);
		div
			.querySelector(".remove-currency-btn")
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
			tr.innerHTML = `<td>${p.model}</td><td>${p.name}</td><td><button class="btn-action btn-edit">编辑</button><button class="btn-action btn-delete">删除</button></td>`;
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
                <td><button class="btn-action btn-delete btn-delete-quote-item">删除</button></td>`;
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
		const tr = button.closest("tr");
		if (!tr || !tr.dataset.id) return;
		const id = tr.dataset.id;
		const product = products.find((p) => p.id === id);
		if (!product) {
			console.error("Data inconsistency error.", id);
			alert("出现数据错误，请刷新页面。");
			return;
		}
		if (button.classList.contains("btn-edit")) {
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
		} else if (button.classList.contains("btn-delete")) {
			if (confirm(`确定要删除型号为 ${product.model} 的商品吗？`)) {
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
		const remarksHTML = docRemarksInput.value
			? `<div class="print-terms"><h3>REMARKS:</h3><p>${docRemarksInput.value.replace(
					/\n/g,
					"<br>"
			  )}</p></div>`
			: "";
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
		)}</p><p>Attn: ${buyerAttnInput.value}</p></div>
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

												// --- KEY CHANGE: Build description string with <br> tags ---
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
                        <tr><td>Freight Cost:</td><td>${parseFloat(
													freightCostInput.value || 0
												).toFixed(2)} ${currency}</td></tr>
                        <tr><td>Insurance:</td><td>${parseFloat(
													insuranceCostInput.value || 0
												).toFixed(2)} ${currency}</td></tr>
                        <tr class="grand-total"><td>GRAND TOTAL:</td><td>${
													grandTotalSpan.textContent
												}</td></tr>
                    </table>
                </section>
                <section class="print-terms">
                    <h3>TERMS & CONDITIONS:</h3>
                    <p><strong>Port of Loading:</strong> ${
											portLoadingInput.value
										}</p><p><strong>Port of Destination:</strong> ${
			portDestinationInput.value
		}</p>
                    <p><strong>Payment Terms:</strong> ${paymentTermsInput.value.replace(
											/\n/g,
											"<br>"
										)}</p><p><strong>Lead Time:</strong> ${leadTimeInput.value.replace(
			/\n/g,
			"<br>"
		)}</p>
                </section>
                ${remarksHTML}
                ${bankInfoHTML}
                <footer class="print-footer">
                    <p>Prepared by: ${docPreparedByInput.value || "N/A"}</p>
                    <div><p>Authorized Signature</p><p style="margin-top:20px;">_________________________</p></div>
                </footer>
            </div>`;
		window.print();
	};

	const handleQuoteListUpdate = (e) => {
		const row = e.target.closest("tr");
		if (!row) return;
		if (e.target.classList.contains("btn-delete-quote-item")) {
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

	function init() {
		settings = loadData("settings", {});
		products = loadData("products", []);

		renderSettings();
		renderProducts();

		navLinks.forEach((link) => link.addEventListener("click", handleNavClick));

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

		showProductModalBtn.addEventListener("click", () => {
			renderModalProducts();
			productSelectModal.style.display = "block";
		});
		closeModalBtn.addEventListener(
			"click",
			() => (productSelectModal.style.display = "none")
		);
		window.addEventListener("click", (e) => {
			if (e.target == productSelectModal)
				productSelectModal.style.display = "none";
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

		exportBtn.addEventListener("click", () => {
			const data = JSON.stringify({ settings, products }, null, 2);
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
			if (file && confirm("导入数据将覆盖现有所有设置和商品，确定继续吗？")) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const data = JSON.parse(event.target.result);
						if (data.settings && data.products) {
							saveData("settings", data.settings);
							saveData("products", data.products);
							alert("数据导入成功！页面将重新加载。");
							window.location.reload();
						} else {
							alert("文件格式不正确！");
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
	}

	init();
});

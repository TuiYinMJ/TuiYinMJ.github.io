document.addEventListener("DOMContentLoaded", () => {
	// --- 全局状态 ---
	let settings = {};
	let products = [];
	let customers = [];
	let quoteItems = [];
	let customerStatusChart = null; // 用于存储Chart.js的实例

	// --- 工具函数 ---
	const getEl = (id) => document.getElementById(id);
	const query = (selector) => document.querySelector(selector);
	const queryAll = (selector) => document.querySelectorAll(selector);
	const saveData = (key, data) =>
		localStorage.setItem(key, JSON.stringify(data));
	const loadData = (key, def = null) => {
		const data = localStorage.getItem(key);
		try {
			return data ? JSON.parse(data) : def;
		} catch (e) {
			console.error(`Error loading data for key: ${key}`, e);
			alert(`加载数据 "${key}" 时出错, 数据可能已损坏。将使用默认值。`);
			return def;
		}
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

	// --- DOM 缓存 ---
	// 通用
	const navLinks = queryAll(".nav-link");
	const modules = queryAll(".module");
	const exportBtn = getEl("export-data-btn");
	const importInput = getEl("import-data-input");

	// 仪表盘
	const todayTasksContainer = getEl("today-tasks-container");
	const customerStatusChartCanvas = getEl("customer-status-chart");
	const analyticsWidget = getEl("analytics-widget");

	// CRM
	const crmSearchInput = getEl("crm-search-input");
	const crmStatusFilter = getEl("crm-status-filter");
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
	const customerIndustryInput = getEl("customer-industry");
	const customerStatusInput = getEl("customer-status");
	const customerRatingInput = getEl("customer-rating");
	const customerSourceInput = getEl("customer-source");
	const customerWebsiteInput = getEl("customer-website");
	const customerAddressInput = getEl("customer-address");
	const customerForwarderInput = getEl("customer-forwarder");
	const customerNotesInput = getEl("customer-notes");
	const customerNextFollowupDateInput = getEl("customer-next-followup-date");
	const customerNextFollowupTaskInput = getEl("customer-next-followup-task");
	const contactsContainer = getEl("contacts-container");
	const addContactBtn = getEl("add-contact-btn");
	const followUpsContainer = getEl("follow-ups-container");
	const addFollowUpBtn = getEl("add-follow-up-btn");
	const documentsContainer = getEl("documents-container");
	const deleteCustomerBtn = getEl("delete-customer-btn");
	const exportCrmBtn = getEl("export-crm-btn");
	const importCrmInput = getEl("import-crm-input");

	// PI 生成器 & 商品管理
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
	const companyLogoInput = getEl("setting-company-logo-input");
	const companyLogoUrlInput = getEl("setting-company-logo-url");
	const companyLogoPreview = getEl("setting-company-logo-preview");
	const companyLogoStorage = getEl("setting-company-logo-storage");
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
	const costCurrencyLabel = getEl("cost-currency-label");
	const productCostInput = getEl("product-cost");
	const productMarginInput = getEl("product-margin");
	const productPricesDisplay = getEl("product-prices-display");
	const productListBody = getEl("product-list-body");
	const clearProductFormBtn = getEl("clear-product-form-btn");
	const piForm = getEl("pi-form");
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
	const quoteProductList = getEl("quote-product-list");
	const subtotalSpan = getEl("subtotal");
	const freightCostInput = getEl("freight-cost");
	const insuranceCostInput = getEl("insurance-cost");
	const grandTotalSpan = getEl("grand-total");
	const productSelectModal = getEl("product-select-modal");
	const showProductModalBtn = getEl("show-product-modal-btn");
	const modalProductList = getEl("modal-product-list");
	const modalSearchInput = getEl("modal-search-input");
	const exportExcelBtn = getEl("export-excel-btn");
	const buyerNameInput = getEl("buyer-name");
	const buyerAddressInput = getEl("buyer-address");
	const buyerAttnInput = getEl("buyer-attn");
	const portDestinationInput = getEl("port-destination");

	// --- 仪表盘功能 ---
	const renderDashboardTasks = () => {
		todayTasksContainer.innerHTML = "";
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tasks = customers
			.filter((c) => c.nextFollowUpDate)
			.map((c) => ({
				...c,
				followUpDateObj: new Date(c.nextFollowUpDate),
			}))
			.filter(
				(c) =>
					c.followUpDateObj <= today &&
					c.status !== "已成交" &&
					c.status !== "无意向"
			)
			.sort((a, b) => a.followUpDateObj - b.followUpDateObj);

		if (tasks.length === 0) {
			todayTasksContainer.innerHTML = "<p>今日无待办事项。</p>";
			return;
		}

		tasks.forEach((task) => {
			const div = document.createElement("div");
			div.className = "task-item";
			if (task.followUpDateObj < today) {
				div.classList.add("overdue");
			}
			div.innerHTML = `
                <div class="task-details">
                    <strong data-id="${task.id}">${task.name}</strong>
                    <p>${task.nextFollowUpTask}</p>
                </div>
                <span class="task-date">${task.nextFollowUpDate}</span>
            `;
			todayTasksContainer.appendChild(div);
		});
	};

	const renderDashboardAnalytics = () => {
		const statusCounts = customers.reduce((acc, customer) => {
			const status = customer.status || "其他";
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		}, {});

		const labels = Object.keys(statusCounts);
		const data = Object.values(statusCounts);

		const statusColors = {
			潜在客户: "#4285f4",
			已询盘: "#fbbc04",
			已报价: "#34a853",
			样品单: "#ff6d01",
			已成交: "#d93025",
			无意向: "#70757a",
			其他: "#9aa0a6",
		};
		const backgroundColors = labels.map(
			(label) => statusColors[label] || "#cccccc"
		);

		if (customerStatusChart) {
			customerStatusChart.destroy();
		}

		const chartContainer = analyticsWidget.querySelector(".chart-container");
		chartContainer.innerHTML = '<canvas id="customer-status-chart"></canvas>';
		const newCanvas = getEl("customer-status-chart");

		if (labels.length === 0) {
			chartContainer.innerHTML = "<p>暂无客户数据以生成图表。</p>";
			return;
		}

		customerStatusChart = new Chart(newCanvas, {
			type: "pie",
			data: {
				labels: labels,
				datasets: [
					{
						label: "客户",
						data: data,
						backgroundColor: backgroundColors,
						borderColor: "#ffffff",
						borderWidth: 2,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: "top",
					},
					tooltip: {
						callbacks: {
							label: function (context) {
								let label = context.label || "";
								if (label) {
									label += ": ";
								}
								if (context.parsed !== null) {
									label += `${context.parsed} 个`;
								}
								return label;
							},
						},
					},
				},
			},
		});
	};

	// --- CRM 功能 ---
	const getStatusClass = (status) => {
		const mapping = {
			潜在客户: "status-潜在客户",
			已询盘: "status-已询盘",
			已报价: "status-已报价",
			样品单: "status-样品单",
			已成交: "status-已成交",
			无意向: "status-无意向",
			其他: "status-其他",
		};
		return mapping[status] || "status-其他";
	};

	const renderCustomerList = () => {
		const searchTerm = crmSearchInput.value.toLowerCase();
		const statusFilter = crmStatusFilter.value;
		const ratingFilter = crmRatingFilter.value;

		const filteredCustomers = customers.filter((c) => {
			const searchFields = [c.name, c.country, c.industry, c.source]
				.join(" ")
				.toLowerCase();
			const nameMatch = searchFields.includes(searchTerm);
			const statusMatch = !statusFilter || c.status === statusFilter;
			const ratingMatch = !ratingFilter || c.rating == ratingFilter;
			return nameMatch && statusMatch && ratingMatch;
		});

		customerListBody.innerHTML = "";
		if (filteredCustomers.length === 0) {
			customerListBody.innerHTML = `<tr><td colspan="5">没有找到匹配的客户</td></tr>`;
			return;
		}

		filteredCustomers.sort((a, b) => {
			const dateA = a.nextFollowUpDate
				? new Date(a.nextFollowUpDate).getTime()
				: Infinity;
			const dateB = b.nextFollowUpDate
				? new Date(b.nextFollowUpDate).getTime()
				: Infinity;
			if (dateA !== dateB) return dateA - dateB;
			return (b.rating || 0) - (a.rating || 0);
		});

		filteredCustomers.forEach((c) => {
			const tr = document.createElement("tr");
			tr.innerHTML = `
                <td>${c.name}<br><small style="color: #5f6368;">${
				c.country || ""
			}</small></td>
                <td><span class="status-badge ${getStatusClass(c.status)}">${
				c.status
			}</span></td>
                <td class="star-rating">${"★".repeat(
									c.rating || 0
								)}${"☆".repeat(5 - (c.rating || 0))}</td>
                <td>${
									c.nextFollowUpDate || "无计划"
								}<br><small style="color: #5f6368;">${
				c.nextFollowUpTask || ""
			}</small></td>
                <td>
                    <button class="btn-action btn-new-quote" data-id="${
											c.id
										}">新建报价</button>
                    <button class="btn-action btn-edit" data-id="${
											c.id
										}">详情</button>
                </td>
            `;
			customerListBody.appendChild(tr);
		});
	};

	const openCustomerModal = (customerId = null) => {
		customerForm.reset();
		customerIdInput.value = "";
		contactsContainer.innerHTML = "";
		followUpsContainer.innerHTML = "";
		documentsContainer.innerHTML = "";

		if (customerId) {
			const customer = customers.find((c) => c.id === customerId);
			if (!customer) return;
			customerModalTitle.textContent = "编辑客户信息";
			customerIdInput.value = customer.id;
			customerNameInput.value = customer.name;
			customerCountryInput.value = customer.country;
			customerIndustryInput.value = customer.industry || "";
			customerStatusInput.value = customer.status || "潜在客户";
			customerRatingInput.value = customer.rating || 3;
			customerSourceInput.value = customer.source;
			customerWebsiteInput.value = customer.website;
			customerAddressInput.value = customer.address;
			customerForwarderInput.value = customer.forwarderInfo || "";
			customerNotesInput.value = customer.notes || "";
			customerNextFollowupDateInput.value = customer.nextFollowUpDate || "";
			customerNextFollowupTaskInput.value = customer.nextFollowUpTask || "";
			(customer.contacts || []).forEach(addContactRow);
			(customer.followUps || [])
				.sort((a, b) => new Date(b.date) - new Date(a.date))
				.forEach(addFollowUpRow);
			(customer.documents || []).forEach((doc) => {
				const div = document.createElement("div");
				div.className = "document-item";
				div.textContent = doc;
				documentsContainer.appendChild(div);
			});
			deleteCustomerBtn.style.display = "inline-block";
		} else {
			customerModalTitle.textContent = "新增客户";
			customerStatusInput.value = "潜在客户";
			customerRatingInput.value = 3;
			addContactRow();
			addFollowUpRow();
			deleteCustomerBtn.style.display = "none";
		}
		customerModal.style.display = "block";
	};

	const addContactRow = (contact = {}) => {
		const div = document.createElement("div");
		div.className = "contact-card";
		div.innerHTML = `
            <button type="button" class="delete-item-btn" title="删除此联系人">&times;</button>
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
            <button type="button" class="delete-item-btn" title="删除此记录">&times;</button>
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

		const contacts = Array.from(
			queryAll("#contacts-container .contact-card")
		).map((card) => ({
			name: card.querySelector(".contact-name").value.trim(),
			position: card.querySelector(".contact-position").value.trim(),
			email: card.querySelector(".contact-email").value.trim(),
			phone: card.querySelector(".contact-phone").value.trim(),
			social: card.querySelector(".contact-social").value.trim(),
		}));

		const followUps = Array.from(
			queryAll("#follow-ups-container .follow-up-card")
		).map((card) => ({
			date: card.querySelector(".follow-up-date").value,
			method: card.querySelector(".follow-up-method").value.trim(),
			notes: card.querySelector(".follow-up-notes").value.trim(),
		}));

		const existingCustomer = customers.find((c) => c.id === id);

		const customerData = {
			id,
			name: customerNameInput.value.trim(),
			country: customerCountryInput.value.trim(),
			industry: customerIndustryInput.value.trim(),
			status: customerStatusInput.value,
			rating: parseInt(customerRatingInput.value, 10),
			source: customerSourceInput.value.trim(),
			website: customerWebsiteInput.value.trim(),
			address: customerAddressInput.value.trim(),
			forwarderInfo: customerForwarderInput.value.trim(),
			notes: customerNotesInput.value.trim(),
			nextFollowUpDate: customerNextFollowupDateInput.value,
			nextFollowUpTask: customerNextFollowupTaskInput.value.trim(),
			contacts: contacts.filter((c) => c.name || c.email),
			followUps: followUps.filter((f) => f.date || f.notes),
			documents: existingCustomer ? existingCustomer.documents : [],
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
		renderDashboardTasks();
		renderDashboardAnalytics();
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
			renderDashboardTasks();
			renderDashboardAnalytics();
			customerModal.style.display = "none";
		}
	};

	// --- 商品与PI/报价单功能 ---
	const addCurrencyRow = (currency = { code: "", rate: "" }) => {
		const div = document.createElement("div");
		div.className = "currency-pair";
		div.innerHTML = `
            <input type="text" class="currency-code" placeholder="币种代码 (如: USD)" value="${currency.code}" style="flex: 1;">
            <input type="number" class="currency-rate" placeholder="对基准货币的汇率" value="${currency.rate}" style="flex: 2;" step="0.0001">
            <button type="button" class="delete-item-btn" title="删除此币种">&times;</button>
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

		defaultPaymentInput.value =
			s.defaultPayment || "30% T/T deposit, 70% balance before shipment.";
		defaultLeadtimeInput.value =
			s.defaultLeadtime || "About 25-30 days after receiving deposit.";
		defaultPortLoadingInput.value = s.defaultPortLoading || "";
		defaultIncotermsInput.value = s.defaultIncoterms || "";
		defaultValidityInput.value = s.defaultValidity || "30";
		costCurrencyLabel.textContent = s.baseCurrency || "CNY";
		if (s.logo) {
			companyLogoStorage.value = s.logo;
			companyLogoPreview.src = s.logo;
			companyLogoPreview.style.display = "block";
			if (s.logo.startsWith("http")) {
				query('input[name="logo-source"][value="url"]').checked = true;
				companyLogoUrlInput.value = s.logo;
			} else {
				query('input[name="logo-source"][value="local"]').checked = true;
			}
			// Trigger change to show/hide corresponding div
			query('input[name="logo-source"]:checked').dispatchEvent(
				new Event("change", { bubbles: true })
			);
		} else {
			query('input[name="logo-source"][value="local"]').checked = true;
			query('input[name="logo-source"]:checked').dispatchEvent(
				new Event("change", { bubbles: true })
			);
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
		const lowerCaseFilter = filter.toLowerCase();
		const filtered = products.filter(
			(p) =>
				p.model.toLowerCase().includes(lowerCaseFilter) ||
				p.name.toLowerCase().includes(lowerCaseFilter)
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
			}</p><textarea class="quote-item-specs" rows="3" placeholder="可在此处编辑本次报价的规格...">${
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
                <td><button class="btn-action btn-delete-row" title="删除此行">&times;</button></td>`;
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
					'<span style="color:red;">毛利率不能超过100%</span>';
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
		let subtotal = 0;
		quoteItems.forEach((item, index) => {
			const row = query(`#quote-product-list tr[data-index="${index}"]`);
			if (row) {
				const price =
					parseFloat(row.querySelector(".quote-item-price").value) || 0;
				const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
				subtotal += qty * price;
			}
		});

		const freight = parseFloat(freightCostInput.value) || 0;
		const insurance = parseFloat(insuranceCostInput.value) || 0;
		const grandTotal = subtotal + freight + insurance;
		const currency = docCurrencySelect.value;
		subtotalSpan.textContent = `${subtotal.toFixed(2)} ${currency}`;
		grandTotalSpan.textContent = `${grandTotal.toFixed(2)} ${currency}`;
	};

	const generateDocId = () => {
		const prefix = docTypeSelect.value === "QUOTATION" ? "QT" : "PI";
		const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
		const random = Date.now().toString().slice(-4);
		docIdInput.value = `${prefix}${date}-${random}`;
	};

	const handleNavClick = (e) => {
		e.preventDefault();
		const targetId = e.target.dataset.target;
		if (!targetId || e.target.classList.contains("active")) return;

		navLinks.forEach((link) => link.classList.remove("active"));
		e.target.classList.add("active");
		modules.forEach((module) =>
			module.classList.toggle("active", module.id === targetId)
		);

		if (targetId === "dashboard") {
			renderDashboardTasks();
			renderDashboardAnalytics();
		} else if (targetId === "crm-manager") {
			renderCustomerList();
		} else if (targetId === "pi-generator") {
			renderCurrencyOptions();
			populateLinkCustomerSelect();
			const s = settings;
			docDateInput.valueAsDate = new Date();
			generateDocId();
			docIncotermsInput.value = s.defaultIncoterms || "FOB SHANGHAI";
			paymentTermsInput.value =
				s.defaultPayment || "30% T/T deposit, 70% balance against B/L copy.";
			leadTimeInput.value =
				s.defaultLeadtime || "25-30 days after receiving deposit.";
			portLoadingInput.value = s.defaultPortLoading || "Shanghai, China";
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
			const rate = parseFloat(row.querySelector(".currency-rate").value);
			if (code && !isNaN(rate)) {
				currencies.push({ code, rate });
			}
		});

		const logoSource = query('input[name="logo-source"]:checked').value;
		settings = {
			companyName: companyNameInput.value.trim(),
			companyAddress: companyAddressInput.value.trim(),
			companyContact: companyContactInput.value.trim(),
			bankInfo: bankInfoInput.value.trim(),
			baseCurrency: baseCurrencyInput.value.trim().toUpperCase(),
			targetCurrencies: currencies,
			defaultPayment: defaultPaymentInput.value.trim(),
			defaultLeadtime: defaultLeadtimeInput.value.trim(),
			defaultPortLoading: defaultPortLoadingInput.value.trim(),
			defaultIncoterms: defaultIncotermsInput.value.trim(),
			defaultValidity: defaultValidityInput.value.trim(),
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
		if (
			Object.keys(prices).length === 0 &&
			(parseFloat(productCostInput.value) > 0 ||
				parseFloat(productMarginInput.value) > 0)
		) {
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
			cost: parseFloat(productCostInput.value) || 0, // 保存成本和利润率，方便编辑
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
			if (
				products.some(
					(p) => p.model.toLowerCase() === productData.model.toLowerCase()
				)
			) {
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

			// 恢复价格计算部分
			productCostInput.value = product.cost || "";
			productMarginInput.value = product.margin || "";
			if (product.profitAlgo) {
				query(
					`input[name="profit-algo"][value="${product.profitAlgo}"]`
				).checked = true;
			}
			calculatePrices(); // 重新计算并显示价格

			if (
				product.image &&
				(product.image.startsWith("http") || product.image.startsWith("//"))
			) {
				query('input[name="image-source"][value="url"]').checked = true;
				productImageUrlInput.value = product.image;
			} else {
				query('input[name="image-source"][value="local"]').checked = true;
				productImageStorage.value = product.image || "";
				productImagePreview.src = product.image || "#";
				productImagePreview.style.display = product.image ? "block" : "none";
			}
			query('input[name="image-source"]:checked').dispatchEvent(
				new Event("change", { bubbles: true })
			);
		} else if (button.classList.contains("btn-delete-row")) {
			if (confirm(`确定要删除此商品吗？`)) {
				products = products.filter((p) => p.id !== id);
				saveData("products", products);
				renderProducts();
			}
		}
	};

	/**
	 * [V13.1 重构] 提交PI/报价单表单，生成专业打印预览
	 */
	const handlePiFormSubmit = (e) => {
		e.preventDefault();

		// 如果有关联客户，将单据号存入客户档案
		const customerId = linkCustomerSelect.value;
		if (customerId) {
			const customer = customers.find((c) => c.id === customerId);
			if (customer) {
				if (!customer.documents) customer.documents = [];
				const docId = docIdInput.value;
				if (docId && !customer.documents.includes(docId)) {
					customer.documents.push(docId);
					saveData("customers", customers);
				}
			}
		}

		// 准备打印所需数据
		const currency = docCurrencySelect.value;
		const docType = docTypeSelect.value.replace(/_/g, " ");
		const cleanText = (text) => text.replace(/\n/g, "<br>");

		// 生成商品行HTML
		const productRowsHTML = quoteItems
			.map((item, index) => {
				const row = query(`#quote-product-list tr[data-index="${index}"]`);
				const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
				const price =
					parseFloat(row.querySelector(".quote-item-price").value) || 0;
				const unit = row.querySelector(".quote-item-unit").value;
				const customSpecs = row.querySelector(".quote-item-specs").value.trim();

				// 构建详细描述
				let descriptionHTML = `<p><strong>${item.model}:</strong> ${item.name}</p>`;
				if (customSpecs) descriptionHTML += `<p>${cleanText(customSpecs)}</p>`;
				if (item.packaging)
					descriptionHTML += `<p>Packaging: ${item.packaging}</p>`;
				if (item.netWeight || item.grossWeight) {
					descriptionHTML += `<p>N.W.:${item.netWeight || "N/A"} KGS / G.W.:${
						item.grossWeight || "N/A"
					} KGS</p>`;
				}
				if (item.hsCode) descriptionHTML += `<p>HS Code: ${item.hsCode}</p>`;

				return `<tr>
                <td>${index + 1}</td>
                <td><img src="${
									item.image || "https://placehold.co/60x60/eee/ccc?text=No+Img"
								}" alt="${item.name}"></td>
                <td class="desc">${descriptionHTML}</td>
                <td>${qty}</td>
                <td>${unit}</td>
                <td class="amount">${price.toFixed(2)}</td>
                <td class="amount">${(qty * price).toFixed(2)}</td>
            </tr>`;
			})
			.join("");

		// 生成费用行HTML
		const subtotalVal = quoteItems.reduce((acc, item, index) => {
			const row = query(`#quote-product-list tr[data-index="${index}"]`);
			const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
			const price =
				parseFloat(row.querySelector(".quote-item-price").value) || 0;
			return acc + qty * price;
		}, 0);
		const freight = parseFloat(freightCostInput.value) || 0;
		const insurance = parseFloat(insuranceCostInput.value) || 0;
		let summaryRowsHTML = `<tr><td>Subtotal</td><td class="amount">${subtotalVal.toFixed(
			2
		)} ${currency}</td></tr>`;
		if (freight > 0)
			summaryRowsHTML += `<tr><td>Freight Cost</td><td class="amount">${freight.toFixed(
				2
			)} ${currency}</td></tr>`;
		if (insurance > 0)
			summaryRowsHTML += `<tr><td>Insurance</td><td class="amount">${insurance.toFixed(
				2
			)} ${currency}</td></tr>`;

		// 生成最终的打印预览HTML
		getEl("print-preview-area").innerHTML = `
            <div class="print-container">
                <header class="print-header">
                    <div class="seller-info">
                        <h1>${settings.companyName || "Your Company Name"}</h1>
                        <p>${
													cleanText(settings.companyAddress) ||
													"Your Company Address"
												}</p>
                        <p>${
													cleanText(settings.companyContact) || "Tel / Email"
												}</p>
                    </div>
                    <div class="doc-title">
                        ${
													settings.logo
														? `<img src="${settings.logo}" alt="Company Logo">`
														: ""
												}
                        <h2>${docType}</h2>
                    </div>
                </header>

                <section class="print-meta">
                    <div class="buyer-info">
                        <h3>TO:</h3>
                        <p><strong>${buyerNameInput.value}</strong></p>
                        <p>${cleanText(buyerAddressInput.value)}</p>
                        ${
													buyerAttnInput.value.trim()
														? `<p><strong>Attn:</strong> ${buyerAttnInput.value}</p>`
														: ""
												}
                    </div>
                    <div class="doc-info">
                        <h3>INFO:</h3>
                        <p><strong>No.:</strong> ${docIdInput.value}</p>
                        <p><strong>Date:</strong> ${docDateInput.value}</p>
                        <p><strong>Incoterms:</strong> ${
													docIncotermsInput.value
												}</p>
                        <p><strong>Validity:</strong> ${
													docValidityInput.value
												} Days</p>
                    </div>
                </section>

                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Image</th>
                            <th style="width: 40%;">Description</th>
                            <th>QTY</th>
                            <th>Unit</th>
                            <th>Unit Price(${currency})</th>
                            <th>Amount(${currency})</th>
                        </tr>
                    </thead>
                    <tbody>${productRowsHTML}</tbody>
                </table>
                <section class="print-summary">
                    <table>
                        <tbody>
                            ${summaryRowsHTML}
                            <tr class="grand-total">
                                <td>GRAND TOTAL</td>
                                <td class="amount">${
																	grandTotalSpan.textContent
																}</td>
                            </tr>
                        </tbody>
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
                    <p><strong>Payment Terms:</strong> ${cleanText(
											paymentTermsInput.value
										)}</p>
                    <p><strong>Lead Time:</strong> ${cleanText(
											leadTimeInput.value
										)}</p>
                    ${
											docRemarksInput.value.trim()
												? `<p><strong>Remarks:</strong> ${cleanText(
														docRemarksInput.value
												  )}</p>`
												: ""
										}
                </section>

                ${
									docTypeSelect.value === "PROFORMA INVOICE" &&
									settings.bankInfo
										? `
                <section class="print-terms">
                    <h3>BANK INFORMATION:</h3>
                    <p>${cleanText(settings.bankInfo)}</p>
                </section>`
										: ""
								}

                <footer class="print-footer">
                    <div class="prepared-by">
                        ${
													docPreparedByInput.value.trim()
														? `<p>Prepared by: ${docPreparedByInput.value}</p>`
														: ""
												}
                    </div>
                    <div class="signature">
                        <p>Authorized Signature</p>
                        <p>_________________________</p>
                    </div>
                </footer>
            </div>`;
		window.print();
	};

	const handleQuoteListUpdate = (e) => {
		const row = e.target.closest("tr");
		if (!row) return;

		const index = parseInt(row.dataset.index, 10);

		if (e.target.classList.contains("btn-delete-row")) {
			quoteItems.splice(index, 1);
			renderQuoteItems(); // This will re-render and update totals
		} else if (
			e.target.matches(
				".quote-item-qty, .quote-item-price, .quote-item-unit, .quote-item-specs"
			)
		) {
			// Update the data model first
			const item = quoteItems[index];
			if (item) {
				item.qty = parseInt(row.querySelector(".quote-item-qty").value) || 1;
				item.specs = row.querySelector(".quote-item-specs").value;
				item.unit = row.querySelector(".quote-item-unit").value;
				// Price is handled by the updateTotals logic which reads directly from input
			}
			updateTotals(); // This calculates totals based on current DOM state
			const price =
				parseFloat(row.querySelector(".quote-item-price").value) || 0;
			const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
			row.querySelector(".quote-item-amount").textContent = (
				qty * price
			).toFixed(2);
		}
	};

	/**
	 * [V13.1 彻底重构] 导出为原生的、多工作表的 XLSX 文件
	 */
	const handleExportToExcel = () => {
		exportExcelBtn.textContent = "正在生成...";
		exportExcelBtn.disabled = true;

		try {
			const wb = XLSX.utils.book_new();
			const docType = docTypeSelect.value.replace(/_/g, " ");
			const currency = docCurrencySelect.value;

			// --- 工作表1: 摘要信息 ---
			const summaryData = [
				[settings.companyName],
				[settings.companyAddress],
				[settings.companyContact],
				[], // Spacer
				["TO:", buyerNameInput.value, "No.:", docIdInput.value],
				["Address:", buyerAddressInput.value, "Date:", docDateInput.value],
				[
					"Attn:",
					buyerAttnInput.value.trim(),
					"Incoterms:",
					docIncotermsInput.value,
				],
				["", "", "Validity:", `${docValidityInput.value} Days`],
			];
			const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
			// 设置列宽和合并单元格
			wsSummary["!cols"] = [{ wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 25 }];
			wsSummary["!merges"] = [
				{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Company Name
				{ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }, // Company Address
				{ s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Company Contact
				{ s: { r: 5, c: 1 }, e: { r: 5, c: 1 } }, // Buyer Address merge if needed
			];
			XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

			// --- 工作表2: 商品列表 ---
			const productHeader = [
				"Item",
				"Model",
				"Name",
				"Description",
				"QTY",
				"Unit",
				`Unit Price (${currency})`,
				`Amount (${currency})`,
			];
			const productData = quoteItems.map((item, index) => {
				const row = query(`#quote-product-list tr[data-index="${index}"]`);
				const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
				const price =
					parseFloat(row.querySelector(".quote-item-price").value) || 0;
				const unit = row.querySelector(".quote-item-unit").value;
				const customSpecs = row.querySelector(".quote-item-specs").value.trim();

				let fullDesc = item.name + "\n" + customSpecs;
				return [
					index + 1,
					item.model,
					fullDesc,
					``,
					qty,
					unit,
					price,
					qty * price,
				];
			});

			const subtotal = quoteItems.reduce((sum, item, index) => {
				const row = query(`#quote-product-list tr[data-index="${index}"]`);
				const qty = parseInt(row.querySelector(".quote-item-qty").value) || 0;
				const price =
					parseFloat(row.querySelector(".quote-item-price").value) || 0;
				return sum + qty * price;
			}, 0);
			const freight = parseFloat(freightCostInput.value) || 0;
			const insurance = parseFloat(insuranceCostInput.value) || 0;
			const grandTotal = subtotal + freight + insurance;

			// 添加总计行
			const totalRows = [
				[], // Spacer
				["", "", "", "", "", "Subtotal:", subtotal],
			];
			if (freight > 0)
				totalRows.push(["", "", "", "", "", "Freight Cost:", freight]);
			if (insurance > 0)
				totalRows.push(["", "", "", "", "", "Insurance:", insurance]);
			totalRows.push(["", "", "", "", "", "GRAND TOTAL:", grandTotal]);

			const wsProducts = XLSX.utils.aoa_to_sheet([
				productHeader,
				...productData,
				...totalRows,
			]);
			wsProducts["!cols"] = [
				{ wch: 5 },
				{ wch: 20 },
				{ wch: 40 },
				{ wch: 0 },
				{ wch: 8 },
				{ wch: 10 },
				{ wch: 15 },
				{ wch: 15 },
			];

			// 格式化数字列
			const numberFormat = "#,##0.00";
			const priceCol = "G";
			const amountCol = "H";
			for (let i = 0; i < productData.length; i++) {
				const r = i + 1; // 0-indexed row, plus header
				wsProducts[`${priceCol}${r + 1}`].t = "n";
				wsProducts[`${priceCol}${r + 1}`].z = numberFormat;
				wsProducts[`${amountCol}${r + 1}`].t = "n";
				wsProducts[`${amountCol}${r + 1}`].z = numberFormat;
			}
			// Format total rows
			wsProducts[`G${productData.length + 3}`].t = "n";
			wsProducts[`G${productData.length + 3}`].z = numberFormat;
			if (freight > 0) {
				wsProducts[`G${productData.length + 4}`].t = "n";
				wsProducts[`G${productData.length + 4}`].z = numberFormat;
			}
			if (insurance > 0) {
				wsProducts[`G${productData.length + 4 + (freight > 0 ? 1 : 0)}`].t =
					"n";
				wsProducts[`G${productData.length + 4 + (freight > 0 ? 1 : 0)}`].z =
					numberFormat;
			}
			wsProducts[`G${totalRows.length + productData.length}`].t = "n";
			wsProducts[`G${totalRows.length + productData.length}`].z = numberFormat;

			XLSX.utils.book_append_sheet(wb, wsProducts, "Product List");

			// --- 导出文件 ---
			const fileName = `${docType}_${docIdInput.value || "Draft"}.xlsx`;
			XLSX.writeFile(wb, fileName);
		} catch (error) {
			console.error("Failed to export Excel file:", error);
			alert("导出Excel失败，请检查控制台错误信息。");
		} finally {
			exportExcelBtn.textContent = "导出为 Excel";
			exportExcelBtn.disabled = false;
		}
	};

	// --- CRM 导入/导出 ---
	const handleCrmExport = () => {
		try {
			const wb = XLSX.utils.book_new();

			const customersData = customers.map((c) => ({
				客户ID: c.id,
				公司名称: c.name,
				状态: c.status,
				星级: c.rating,
				国家: c.country,
				客户来源: c.source,
				所属行业: c.industry,
				公司网址: c.website,
				公司地址: c.address,
				下次跟进日期: c.nextFollowUpDate,
				下次跟进任务: c.nextFollowUpTask,
				货代信息: c.forwarderInfo,
				备注: c.notes,
			}));
			const wsCustomers = XLSX.utils.json_to_sheet(customersData);
			XLSX.utils.book_append_sheet(wb, wsCustomers, "客户主数据");

			const contactsData = [];
			customers.forEach((c) => {
				(c.contacts || []).forEach((ct) => {
					contactsData.push({
						客户ID: c.id,
						公司名称: c.name,
						联系人姓名: ct.name,
						职位: ct.position,
						邮箱: ct.email,
						电话: ct.phone,
						社交账号: ct.social,
					});
				});
			});
			const wsContacts = XLSX.utils.json_to_sheet(contactsData);
			XLSX.utils.book_append_sheet(wb, wsContacts, "联系人");

			const followUpsData = [];
			customers.forEach((c) => {
				(c.followUps || []).forEach((f) => {
					followUpsData.push({
						客户ID: c.id,
						公司名称: c.name,
						跟进日期: f.date,
						跟进方式: f.method,
						跟进内容: f.notes,
					});
				});
			});
			const wsFollowUps = XLSX.utils.json_to_sheet(followUpsData);
			XLSX.utils.book_append_sheet(wb, wsFollowUps, "跟进记录");

			const documentsData = [];
			customers.forEach((c) => {
				(c.documents || []).forEach((doc) => {
					documentsData.push({ 客户ID: c.id, 公司名称: c.name, 单据号: doc });
				});
			});
			const wsDocuments = XLSX.utils.json_to_sheet(documentsData);
			XLSX.utils.book_append_sheet(wb, wsDocuments, "关联单据");

			XLSX.writeFile(
				wb,
				`CRM_Data_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
			);
		} catch (error) {
			alert("导出CRM数据失败！");
			console.error(error);
		}
	};

	const handleCrmImport = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		if (!confirm("【警告】导入CRM数据将覆盖现有的所有客户信息，确定继续吗？")) {
			e.target.value = "";
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const data = event.target.result;
				const workbook = XLSX.read(data, { type: "binary", cellDates: true });
				const newCustomers = [];

				const wsCustomers = workbook.Sheets["客户主数据"];
				const customerJson = XLSX.utils.sheet_to_json(wsCustomers);

				customerJson.forEach((row) => {
					let nextFollowUpDate = row["下次跟进日期"];
					if (nextFollowUpDate instanceof Date) {
						nextFollowUpDate.setMinutes(
							nextFollowUpDate.getMinutes() +
								nextFollowUpDate.getTimezoneOffset()
						);
						nextFollowUpDate = nextFollowUpDate.toISOString().slice(0, 10);
					}

					newCustomers.push({
						id: row["客户ID"]?.toString() || Date.now().toString(),
						name: row["公司名称"] || "",
						status: row["状态"] || "潜在客户",
						rating: row["星级"] || 3,
						country: row["国家"] || "",
						source: row["客户来源"] || "",
						industry: row["所属行业"] || "",
						website: row["公司网址"] || "",
						address: row["公司地址"] || "",
						nextFollowUpDate: nextFollowUpDate || "",
						nextFollowUpTask: row["下次跟进任务"] || "",
						forwarderInfo: row["货代信息"] || "",
						notes: row["备注"] || "",
						contacts: [],
						followUps: [],
						documents: [],
					});
				});

				const wsContacts = workbook.Sheets["联系人"];
				if (wsContacts) {
					const contactsJson = XLSX.utils.sheet_to_json(wsContacts);
					contactsJson.forEach((row) => {
						const customer = newCustomers.find((c) => c.id == row["客户ID"]);
						if (customer) {
							customer.contacts.push({
								name: row["联系人姓名"] || "",
								position: row["职位"] || "",
								email: row["邮箱"] || "",
								phone: row["电话"] || "",
								social: row["社交账号"] || "",
							});
						}
					});
				}

				const wsFollowUps = workbook.Sheets["跟进记录"];
				if (wsFollowUps) {
					const followUpsJson = XLSX.utils.sheet_to_json(wsFollowUps);
					followUpsJson.forEach((row) => {
						const customer = newCustomers.find((c) => c.id == row["客户ID"]);
						if (customer) {
							let followUpDate = row["跟进日期"];
							if (followUpDate instanceof Date) {
								followUpDate.setMinutes(
									followUpDate.getMinutes() + followUpDate.getTimezoneOffset()
								);
								followUpDate = followUpDate.toISOString().slice(0, 10);
							}
							customer.followUps.push({
								date: followUpDate || "",
								method: row["跟进方式"] || "",
								notes: row["跟进内容"] || "",
							});
						}
					});
				}

				const wsDocuments = workbook.Sheets["关联单据"];
				if (wsDocuments) {
					const documentsJson = XLSX.utils.sheet_to_json(wsDocuments);
					documentsJson.forEach((row) => {
						const customer = newCustomers.find((c) => c.id == row["客户ID"]);
						if (customer && row["单据号"]) {
							customer.documents.push(row["单据号"].toString());
						}
					});
				}

				customers = newCustomers;
				saveData("customers", customers);
				renderCustomerList();
				renderDashboardTasks();
				renderDashboardAnalytics();
				alert("CRM数据导入成功！");
			} catch (error) {
				alert("导入失败，文件格式不正确或已损坏。");
				console.error(error);
			} finally {
				e.target.value = "";
			}
		};
		reader.readAsBinaryString(file);
	};

	const populateLinkCustomerSelect = () => {
		linkCustomerSelect.innerHTML =
			'<option value="">-- 关联到CRM客户 --</option>';
		customers
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach((c) => {
				const option = document.createElement("option");
				option.value = c.id;
				option.textContent = c.name;
				linkCustomerSelect.appendChild(option);
			});
	};

	function init() {
		// 加载所有数据
		settings = loadData("settings", {});
		products = loadData("products", []);
		customers = loadData("customers", []);

		// 初始渲染
		renderSettings();
		renderProducts();
		renderCustomerList();
		renderDashboardTasks();
		renderDashboardAnalytics();

		// --- 通用事件监听 ---
		navLinks.forEach((link) => link.addEventListener("click", handleNavClick));
		exportBtn.addEventListener("click", () => {
			try {
				const data = JSON.stringify({ settings, products, customers }, null, 2);
				const blob = new Blob([data], { type: "application/json" });
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob);
				a.download = `trade_helper_backup_${new Date()
					.toISOString()
					.slice(0, 10)}.json`;
				a.click();
				URL.revokeObjectURL(a.href);
			} catch (error) {
				alert("导出失败! " + error.message);
			}
		});
		importInput.addEventListener("change", (e) => {
			const file = e.target.files[0];
			if (
				file &&
				confirm(
					"【警告】导入备份将覆盖所有现有数据（设置、商品、客户）！确定继续吗？"
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
							alert("数据导入成功！页面将自动刷新以应用更改。");
							window.location.reload();
						} else {
							alert(
								"导入失败：文件格式不正确，缺少必要的数据键 (settings, products, customers)。"
							);
						}
					} catch (err) {
						alert("导入失败：文件解析错误，可能已损坏或不是有效的JSON文件。");
						console.error(err);
					}
				};
				reader.readAsText(file);
			}
			e.target.value = "";
		});

		// --- CRM 事件监听 ---
		addNewCustomerBtn.addEventListener("click", () => openCustomerModal());
		customerListBody.addEventListener("click", (e) => {
			const button = e.target.closest("button");
			if (!button) return;
			const id = button.dataset.id;
			if (button.classList.contains("btn-edit")) {
				openCustomerModal(id);
			} else if (button.classList.contains("btn-new-quote")) {
				const customer = customers.find((c) => c.id === id);
				if (!customer) return;
				query('.nav-link[data-target="pi-generator"]').click();
				setTimeout(() => {
					// 使用延时确保UI切换完成
					linkCustomerSelect.value = id;
					linkCustomerSelect.dispatchEvent(new Event("change"));
				}, 50);
			}
		});
		todayTasksContainer.addEventListener("click", (e) => {
			if (e.target.tagName === "STRONG") {
				const id = e.target.dataset.id;
				query('.nav-link[data-target="crm-manager"]').click();
				openCustomerModal(id);
			}
		});
		[crmSearchInput, crmStatusFilter, crmRatingFilter].forEach((el) => {
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
		exportCrmBtn.addEventListener("click", handleCrmExport);
		importCrmInput.addEventListener("change", handleCrmImport);

		// --- 设置事件监听 ---
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

		// --- 商品事件监听 ---
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
			query('input[name="image-source"][value="local"]').checked = true;
			query('input[name="image-source"]:checked').dispatchEvent(
				new Event("change", { bubbles: true })
			);
		});
		productListBody.addEventListener("click", handleProductListClick);

		// --- PI 事件监听 ---
		piForm.addEventListener("submit", handlePiFormSubmit);
		piForm.addEventListener("reset", () => {
			quoteItems = [];
			renderQuoteItems();
			linkCustomerSelect.value = "";
			linkCustomerSelect.dispatchEvent(new Event("change"));
		});
		linkCustomerSelect.addEventListener("change", (e) => {
			const customerId = e.target.value;
			if (!customerId) {
				buyerNameInput.value = "";
				buyerAddressInput.value = "";
				buyerAttnInput.value = "";
				return;
			}
			const customer = customers.find((c) => c.id === customerId);
			if (customer) {
				buyerNameInput.value = customer.name;
				buyerAddressInput.value = customer.address || "";
				const mainContact =
					customer.contacts && customer.contacts.length > 0
						? customer.contacts[0].name
						: "";
				buyerAttnInput.value = mainContact;
			}
		});
		clearCustomerLinkBtn.addEventListener("click", () => {
			linkCustomerSelect.value = "";
			linkCustomerSelect.dispatchEvent(new Event("change"));
		});
		generateDocIdBtn.addEventListener("click", generateDocId);
		docCurrencySelect.addEventListener("change", () => {
			quoteCurrencyLabel.textContent = docCurrencySelect.value;
			renderQuoteItems(); // Re-render to update prices for new currency
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

		// [V13.1 修复] 模态框关闭逻辑
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
					// 添加一个全新的副本，防止引用污染
					quoteItems.push({ ...product, qty: 1, specs: product.specs || "" });
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

	init(); // 启动应用
});

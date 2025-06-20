import { getEl } from './utils.js';
import { notify } from './utils.js';

let customerStatusChart = null; // Chart.js instance

/**
 * Renders the "Today's Tasks" widget on the dashboard.
 * @param {Array} customers - The array of all customer objects.
 */
function renderDashboardTasks(customers) {
    const todayTasksContainer = getEl("today-tasks-container");
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
                <strong data-id="${task.id}" class="task-customer-link" style="cursor: pointer;">${task.name}</strong>
                <p>${task.nextFollowUpTask}</p>
            </div>
            <span class="task-date">${task.nextFollowUpDate}</span>
        `;
        todayTasksContainer.appendChild(div);
    });
}

/**
 * Renders the customer funnel analysis chart on the dashboard.
 * @param {Array} customers - The array of all customer objects.
 */
function renderDashboardAnalytics(customers) {
    const analyticsWidget = getEl("analytics-widget");
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
}

/**
 * Initializes the dashboard module.
 * @param {Array} customers - The initial array of customer data.
 */
export function initDashboard(customers) {
    const todayTasksContainer = getEl("today-tasks-container");

    todayTasksContainer.addEventListener("click", (e) => {
        const link = e.target.closest(".task-customer-link");
        if (link) {
            const customerId = link.dataset.id;
            // Notify the main app to handle the navigation and modal opening
            notify('requestCrmModal', { customerId });
        }
    });

    document.addEventListener('customersUpdated', (e) => {
        renderDashboardTasks(e.detail.customers);
        renderDashboardAnalytics(e.detail.customers);
    });

    document.addEventListener('moduleChanged', (e) => {
        if (e.detail.targetId === 'dashboard') {
            // Re-render dashboard data when the tab is clicked, ensuring it's fresh
            const freshCustomers = e.detail.customers;
            renderDashboardTasks(freshCustomers);
            renderDashboardAnalytics(freshCustomers);
        }
    });

    // Initial render
    renderDashboardTasks(customers);
    renderDashboardAnalytics(customers);
}
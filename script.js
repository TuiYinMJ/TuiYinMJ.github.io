class BusinessStrategyTool {
    constructor() {
        this.currentPage = 'business-model-canvas';
        this.notes = this.loadNotes();
        this.swotItems = this.loadSWOTItems();
        this.competitors = this.loadCompetitors();
        this.financialData = this.loadFinancialData();
        this.businessPlanData = this.loadBusinessPlanData();
        this.assessmentScores = this.loadAssessmentScores();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderNotes();
        this.renderSWOTItems();
        this.renderCompetitors();
        this.renderFinancialResults();
        this.updateAssessmentScores();
        this.showPage(this.currentPage);
        this.addMobileMenuToggle();
    }

    bindEvents() {
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('href').substring(1);
                this.showPage(pageId);
            });
        });

        // 商业模式画布按钮事件
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('exportCanvasBtn').addEventListener('click', () => {
            this.exportCanvas();
        });

        document.getElementById('clearCanvasBtn').addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('templateBtn').addEventListener('click', () => {
            this.showTemplates();
        });

        // 模态框事件
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('noteModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNote();
        });

        // 拖拽功能
        this.enableDragAndDrop();
        this.enableDoubleClickEdit();
    }

    showPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 移除所有导航链接的激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            document.querySelector(`[href="#${pageId}"]`).classList.add('active');
            this.currentPage = pageId;
        }
    }

    // 商业模式画布功能
    openModal() {
        document.getElementById('noteModal').style.display = 'block';
        document.getElementById('noteContent').focus();
    }

    closeModal() {
        document.getElementById('noteModal').style.display = 'none';
        document.getElementById('noteForm').reset();
    }

    addNote() {
        const section = document.getElementById('noteSection').value;
        const content = document.getElementById('noteContent').value.trim();
        const color = document.getElementById('noteColor').value;

        if (!content) {
            this.showMessage('请输入便利贴内容！', 'error');
            return;
        }

        const note = {
            id: Date.now().toString(),
            section: section,
            content: content,
            color: color,
            timestamp: new Date().toISOString()
        };

        this.notes.push(note);
        this.saveNotes();
        this.renderNotes();
        this.closeModal();
        this.showMessage('便利贴添加成功！', 'success');
    }

    deleteNote(noteId) {
        if (confirm('确定要删除这个便利贴吗？')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
            this.showMessage('便利贴已删除', 'info');
        }
    }

    renderNotes() {
        document.querySelectorAll('.notes-container').forEach(container => {
            container.innerHTML = '';
        });

        this.notes.forEach(note => {
            const container = document.querySelector(`[data-section="${note.section}"] .notes-container`);
            if (container) {
                const noteElement = this.createNoteElement(note);
                container.appendChild(noteElement);
            }
        });
    }

    createNoteElement(note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = `note ${this.getColorClass(note.color)}`;
        noteDiv.setAttribute('data-note-id', note.id);
        noteDiv.setAttribute('draggable', 'true');

        const content = document.createElement('div');
        content.textContent = note.content;
        content.className = 'note-content';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNote(note.id);
        });

        noteDiv.appendChild(content);
        noteDiv.appendChild(deleteBtn);

        return noteDiv;
    }

    getColorClass(color) {
        const colorMap = {
            '#ffeb3b': 'yellow',
            '#e91e63': 'pink',
            '#2196f3': 'blue',
            '#4caf50': 'green',
            '#ff9800': 'orange'
        };
        return colorMap[color] || 'yellow';
    }

    enableDragAndDrop() {
        let draggedNote = null;

        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('note')) {
                draggedNote = e.target;
                e.target.style.opacity = '0.5';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('note')) {
                e.target.style.opacity = '1';
                draggedNote = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedNote && e.target.classList.contains('canvas-section')) {
                const section = e.target.getAttribute('data-section');
                const noteId = draggedNote.getAttribute('data-note-id');
                
                const noteIndex = this.notes.findIndex(note => note.id === noteId);
                if (noteIndex !== -1) {
                    this.notes[noteIndex].section = section;
                    this.saveNotes();
                    this.renderNotes();
                    this.showMessage('Note moved successfully', 'success');
                }
            }
        });
    }

    enableDoubleClickEdit() {
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('note') || e.target.classList.contains('note-content')) {
                const noteElement = e.target.classList.contains('note') ? e.target : e.target.parentElement;
                const noteId = noteElement.getAttribute('data-note-id');
                this.editNote(noteId);
            }
        });
    }

    editNote(noteId) {
        const noteIndex = this.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return;

        const note = this.notes[noteIndex];
        const newContent = prompt('Edit note content:', note.content);
        
        if (newContent !== null && newContent.trim() !== '') {
            this.notes[noteIndex].content = newContent.trim();
            this.saveNotes();
            this.renderNotes();
            this.showMessage('Note updated successfully', 'success');
        }
    }

    exportCanvas() {
        this.showMessage('Generating canvas image...', 'info');
        
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                this.captureCanvas();
            };
            document.head.appendChild(script);
        } else {
            this.captureCanvas();
        }
    }

    captureCanvas() {
        const canvasElement = document.querySelector('.business-model-canvas');
        
        html2canvas(canvasElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f8fafc'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `business_model_canvas_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('Canvas exported successfully!', 'success');
        }).catch(error => {
            console.error('Export failed:', error);
            this.showMessage('Export failed, please try again', 'error');
        });
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the entire canvas? All notes will be deleted!')) {
            this.notes = [];
            this.saveNotes();
            this.renderNotes();
            this.showMessage('Canvas cleared', 'info');
        }
    }

    showTemplates() {
        const templates = {
            'E-commerce Platform': [
                { section: 'value-propositions', content: 'Convenient online shopping experience', color: '#ffeb3b' },
                { section: 'value-propositions', content: 'Wide product selection', color: '#ffeb3b' },
                { section: 'customer-segments', content: 'Online shoppers', color: '#2196f3' },
                { section: 'customer-segments', content: 'Young professionals', color: '#2196f3' },
                { section: 'channels', content: 'Website', color: '#4caf50' },
                { section: 'channels', content: 'Mobile app', color: '#4caf50' },
                { section: 'revenue-streams', content: 'Product sales commission', color: '#ff9800' },
                { section: 'revenue-streams', content: 'Advertising revenue', color: '#ff9800' }
            ],
            'SaaS Service': [
                { section: 'value-propositions', content: 'Cloud-based software service', color: '#ffeb3b' },
                { section: 'value-propositions', content: 'Automatic updates and maintenance', color: '#ffeb3b' },
                { section: 'customer-segments', content: 'Small and medium businesses', color: '#2196f3' },
                { section: 'customer-relationships', content: 'Subscription-based service', color: '#e91e63' },
                { section: 'revenue-streams', content: 'Monthly/annual subscription fees', color: '#ff9800' },
                { section: 'key-activities', content: 'Software development', color: '#4caf50' },
                { section: 'key-activities', content: 'Customer support', color: '#4caf50' }
            ]
        };

        const templateNames = Object.keys(templates);
        const selectedTemplate = prompt(`Select template:\n${templateNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\nEnter template number:`);
        
        if (selectedTemplate && templateNames[selectedTemplate - 1]) {
            const templateName = templateNames[selectedTemplate - 1];
            if (confirm(`Are you sure you want to use the "${templateName}" template? This will replace all current notes.`)) {
                this.notes = templates[templateName].map(note => ({
                    ...note,
                    id: Date.now().toString() + Math.random(),
                    timestamp: new Date().toISOString()
                }));
                this.saveNotes();
                this.renderNotes();
                this.showMessage(`"${templateName}" template loaded`, 'success');
            }
        }
    }

    // SWOT分析功能
    addSWOTItem() {
        const quadrant = prompt('Select quadrant:\n1. Strengths\n2. Weaknesses\n3. Opportunities\n4. Threats\n\nEnter quadrant number:');
        const content = prompt('Enter item content:');
        
        if (quadrant && content) {
            const quadrants = ['strengths', 'weaknesses', 'opportunities', 'threats'];
            const selectedQuadrant = quadrants[parseInt(quadrant) - 1];
            
            if (selectedQuadrant) {
                const item = {
                    id: Date.now().toString(),
                    quadrant: selectedQuadrant,
                    content: content,
                    timestamp: new Date().toISOString()
                };
                
                this.swotItems.push(item);
                this.saveSWOTItems();
                this.renderSWOTItems();
                this.showMessage('SWOT item added successfully', 'success');
            }
        }
    }

    renderSWOTItems() {
        document.querySelectorAll('.swot-items').forEach(container => {
            container.innerHTML = '';
        });

        this.swotItems.forEach(item => {
            const container = document.querySelector(`.${item.quadrant} .swot-items`);
            if (container) {
                const itemElement = this.createSWOTItemElement(item);
                container.appendChild(itemElement);
            }
        });
    }

    createSWOTItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'swot-item';
        itemDiv.setAttribute('data-item-id', item.id);
        itemDiv.textContent = item.content;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSWOTItem(item.id);
        });

        itemDiv.appendChild(deleteBtn);
        return itemDiv;
    }

    deleteSWOTItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.swotItems = this.swotItems.filter(item => item.id !== itemId);
            this.saveSWOTItems();
            this.renderSWOTItems();
            this.showMessage('Item deleted', 'info');
        }
    }

    exportSWOT() {
        this.showMessage('Generating SWOT analysis image...', 'info');
        
        if (typeof html2canvas === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                this.captureSWOT();
            };
            document.head.appendChild(script);
        } else {
            this.captureSWOT();
        }
    }

    captureSWOT() {
        const swotElement = document.querySelector('.swot-grid');
        
        html2canvas(swotElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#f8fafc'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `swot_analysis_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('SWOT analysis exported successfully!', 'success');
        }).catch(error => {
            console.error('Export failed:', error);
            this.showMessage('Export failed, please try again', 'error');
        });
    }

    clearSWOT() {
        if (confirm('Are you sure you want to clear all SWOT items?')) {
            this.swotItems = [];
            this.saveSWOTItems();
            this.renderSWOTItems();
            this.showMessage('SWOT analysis cleared', 'info');
        }
    }

    // 价值主张画布功能
    editValueProposition() {
        this.showMessage('Click on any section to edit content', 'info');
    }

    editVPItem(itemId) {
        const currentContent = document.getElementById(itemId).textContent;
        const newContent = prompt(`Edit ${itemId.replace('-', ' ')}:`, currentContent);
        
        if (newContent !== null) {
            document.getElementById(itemId).textContent = newContent;
            this.showMessage('Content updated successfully', 'success');
        }
    }

    exportValueProposition() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 精益画布功能
    editLeanCanvas() {
        this.showMessage('Click on any section to edit content', 'info');
    }

    editLeanSection(sectionId) {
        const currentContent = document.getElementById(sectionId).textContent;
        const newContent = prompt(`Edit ${sectionId}:`, currentContent);
        
        if (newContent !== null) {
            document.getElementById(sectionId).textContent = newContent;
            this.showMessage('Content updated successfully', 'success');
        }
    }

    exportLeanCanvas() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 竞争分析功能
    addCompetitor() {
        this.showMessage('Use the form below to add competitor information', 'info');
    }

    saveCompetitor() {
        const name = document.getElementById('competitor-name').value.trim();
        const strengths = document.getElementById('competitor-strengths').value.trim();
        const weaknesses = document.getElementById('competitor-weaknesses').value.trim();

        if (!name) {
            this.showMessage('Please enter competitor name', 'error');
            return;
        }

        const competitor = {
            id: Date.now().toString(),
            name: name,
            strengths: strengths.split('\n').filter(s => s.trim()),
            weaknesses: weaknesses.split('\n').filter(w => w.trim()),
            timestamp: new Date().toISOString()
        };

        this.competitors.push(competitor);
        this.saveCompetitors();
        this.renderCompetitors();
        
        // 清空表单
        document.getElementById('competitor-name').value = '';
        document.getElementById('competitor-strengths').value = '';
        document.getElementById('competitor-weaknesses').value = '';
        
        this.showMessage('Competitor added successfully', 'success');
    }

    renderCompetitors() {
        const container = document.getElementById('competitor-container');
        container.innerHTML = '';

        this.competitors.forEach(competitor => {
            const card = this.createCompetitorCard(competitor);
            container.appendChild(card);
        });
    }

    createCompetitorCard(competitor) {
        const card = document.createElement('div');
        card.className = 'competitor-card';
        card.setAttribute('data-competitor-id', competitor.id);

        let strengthsHTML = '';
        let weaknessesHTML = '';

        if (competitor.strengths && competitor.strengths.length > 0) {
            strengthsHTML = `
                <div class="competitor-strengths">
                    <h4>Strengths</h4>
                    <ul class="competitor-list">
                        ${competitor.strengths.map(strength => `<li>${strength}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (competitor.weaknesses && competitor.weaknesses.length > 0) {
            weaknessesHTML = `
                <div class="competitor-weaknesses">
                    <h4>Weaknesses</h4>
                    <ul class="competitor-list">
                        ${competitor.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>${competitor.name}</h3>
            ${strengthsHTML}
            ${weaknessesHTML}
            <button class="delete-btn" onclick="window.businessStrategyTool.deleteCompetitor('${competitor.id}')">Delete</button>
        `;

        return card;
    }

    deleteCompetitor(competitorId) {
        if (confirm('Are you sure you want to delete this competitor?')) {
            this.competitors = this.competitors.filter(competitor => competitor.id !== competitorId);
            this.saveCompetitors();
            this.renderCompetitors();
            this.showMessage('Competitor deleted', 'info');
        }
    }

    exportCompetitiveAnalysis() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 财务规划功能
    addFinancialData() {
        this.showMessage('Use the form below to enter financial data', 'info');
    }

    calculateFinancials() {
        const monthlyRevenue = parseFloat(document.getElementById('monthly-revenue').value.replace(/[^0-9.-]+/g, '')) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value.replace(/[^0-9.-]+/g, '')) || 0;
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value.replace(/[^0-9.-]+/g, '')) || 0;

        const monthlyProfit = monthlyRevenue - monthlyExpenses;
        const annualProfit = monthlyProfit * 12;
        const breakEvenMonths = initialInvestment > 0 ? Math.ceil(initialInvestment / monthlyProfit) : 0;
        const roi = initialInvestment > 0 ? (annualProfit / initialInvestment * 100).toFixed(1) : 0;

        this.financialData = {
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit,
            annualProfit,
            initialInvestment,
            breakEvenMonths,
            roi,
            timestamp: new Date().toISOString()
        };

        this.saveFinancialData();
        this.renderFinancialResults();
        this.showMessage('Financial calculations completed', 'success');
    }

    renderFinancialResults() {
        const container = document.getElementById('financial-results');
        const data = this.financialData;

        if (!data.monthlyRevenue) {
            container.innerHTML = '<p>Enter financial data above to see results</p>';
            return;
        }

        container.innerHTML = `
            <h3>Financial Results</h3>
            <table class="financial-table">
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Monthly Revenue</td>
                    <td>$${data.monthlyRevenue.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Monthly Expenses</td>
                    <td>$${data.monthlyExpenses.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Monthly Profit</td>
                    <td>$${data.monthlyProfit.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Annual Profit</td>
                    <td>$${data.annualProfit.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>Break-even (months)</td>
                    <td>${data.breakEvenMonths}</td>
                </tr>
                <tr>
                    <td>ROI</td>
                    <td>${data.roi}%</td>
                </tr>
            </table>
        `;
    }

    exportFinancialPlan() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 市场分析功能
    addMarketData() {
        this.showMessage('Use the form below to enter market data', 'info');
    }

    calculateMarketShare() {
        const tam = document.getElementById('tam-input').value;
        const sam = document.getElementById('sam-input').value;
        const som = document.getElementById('som-input').value;

        if (tam && sam && som) {
            this.showMessage('Market share calculations completed', 'success');
        } else {
            this.showMessage('Please enter all market data fields', 'error');
        }
    }

    exportMarketAnalysis() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 商业计划书功能
    generateBusinessPlan() {
        this.showMessage('Business plan generation feature coming soon!', 'info');
    }

    exportBusinessPlan() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 商业模式评估功能
    rateCriterion(criterionId) {
        const ratingElement = document.querySelector(`[data-criterion="${criterionId}"]`);
        const currentRating = ratingElement.textContent.length;
        const newRating = currentRating < 5 ? currentRating + 1 : 1;
        
        ratingElement.textContent = '★'.repeat(newRating) + '☆'.repeat(5 - newRating);
        
        this.assessmentScores[criterionId] = newRating * 2; // Convert to 10-point scale
        this.saveAssessmentScores();
        this.updateAssessmentScores();
        this.showMessage('Rating updated', 'success');
    }

    updateAssessmentScores() {
        const scores = this.assessmentScores;
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        
        document.getElementById('total-score').textContent = `${totalScore}/100`;
        document.getElementById('value-score').textContent = scores['value-clarity'] || 0;
        document.getElementById('market-score').textContent = scores['market-feasibility'] || 0;
        document.getElementById('profit-score').textContent = scores['profit-model'] || 0;
        document.getElementById('advantage-score').textContent = scores['competitive-advantage'] || 0;
        document.getElementById('scalability-score').textContent = scores['scalability'] || 0;
    }

    // 思维框架功能
    createCustomFramework() {
        this.showMessage('Custom framework creation feature coming soon!', 'info');
    }

    exportThinkingFrameworks() {
        this.showMessage('Export feature coming soon!', 'info');
    }

    // 移动端菜单
    addMobileMenuToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '☰';
        toggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
        document.body.appendChild(toggle);
    }

    // 数据存储功能
    saveNotes() {
        localStorage.setItem('businessModelCanvas', JSON.stringify(this.notes));
    }

    loadNotes() {
        const saved = localStorage.getItem('businessModelCanvas');
        return saved ? JSON.parse(saved) : [];
    }

    saveSWOTItems() {
        localStorage.setItem('swotAnalysis', JSON.stringify(this.swotItems));
    }

    loadSWOTItems() {
        const saved = localStorage.getItem('swotAnalysis');
        return saved ? JSON.parse(saved) : [];
    }

    saveCompetitors() {
        localStorage.setItem('competitors', JSON.stringify(this.competitors));
    }

    loadCompetitors() {
        const saved = localStorage.getItem('competitors');
        return saved ? JSON.parse(saved) : [];
    }

    saveFinancialData() {
        localStorage.setItem('financialData', JSON.stringify(this.financialData));
    }

    loadFinancialData() {
        const saved = localStorage.getItem('financialData');
        return saved ? JSON.parse(saved) : {};
    }

    saveBusinessPlanData() {
        localStorage.setItem('businessPlanData', JSON.stringify(this.businessPlanData));
    }

    loadBusinessPlanData() {
        const saved = localStorage.getItem('businessPlanData');
        return saved ? JSON.parse(saved) : {};
    }

    saveAssessmentScores() {
        localStorage.setItem('assessmentScores', JSON.stringify(this.assessmentScores));
    }

    loadAssessmentScores() {
        const saved = localStorage.getItem('assessmentScores');
        return saved ? JSON.parse(saved) : {
            'value-clarity': 8,
            'market-feasibility': 7,
            'profit-model': 6,
            'competitive-advantage': 8,
            'scalability': 6
        };
    }

    // 消息提示功能
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: var(--radius);
            color: white;
            font-weight: 600;
            z-index: 1001;
            transition: all 0.3s ease;
            transform: translateX(100%);
            box-shadow: var(--shadow-lg);
            font-size: 14px;
        `;

        const colors = {
            success: '#059669',
            error: '#dc2626',
            info: '#2563eb',
            warning: '#d97706'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// 全局函数
function addSWOTItem() {
    window.businessStrategyTool.addSWOTItem();
}

function exportSWOT() {
    window.businessStrategyTool.exportSWOT();
}

function clearSWOT() {
    window.businessStrategyTool.clearSWOT();
}

function editValueProposition() {
    window.businessStrategyTool.editValueProposition();
}

function editVPItem(itemId) {
    window.businessStrategyTool.editVPItem(itemId);
}

function exportValueProposition() {
    window.businessStrategyTool.exportValueProposition();
}

function editLeanCanvas() {
    window.businessStrategyTool.editLeanCanvas();
}

function editLeanSection(sectionId) {
    window.businessStrategyTool.editLeanSection(sectionId);
}

function exportLeanCanvas() {
    window.businessStrategyTool.exportLeanCanvas();
}

function addCompetitor() {
    window.businessStrategyTool.addCompetitor();
}

function saveCompetitor() {
    window.businessStrategyTool.saveCompetitor();
}

function exportCompetitiveAnalysis() {
    window.businessStrategyTool.exportCompetitiveAnalysis();
}

function addFinancialData() {
    window.businessStrategyTool.addFinancialData();
}

function calculateFinancials() {
    window.businessStrategyTool.calculateFinancials();
}

function exportFinancialPlan() {
    window.businessStrategyTool.exportFinancialPlan();
}

function addMarketData() {
    window.businessStrategyTool.addMarketData();
}

function calculateMarketShare() {
    window.businessStrategyTool.calculateMarketShare();
}

function exportMarketAnalysis() {
    window.businessStrategyTool.exportMarketAnalysis();
}

function generateBusinessPlan() {
    window.businessStrategyTool.generateBusinessPlan();
}

function exportBusinessPlan() {
    window.businessStrategyTool.exportBusinessPlan();
}

function rateCriterion(criterionId) {
    window.businessStrategyTool.rateCriterion(criterionId);
}

function createCustomFramework() {
    window.businessStrategyTool.createCustomFramework();
}

function exportThinkingFrameworks() {
    window.businessStrategyTool.exportThinkingFrameworks();
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('addNoteBtn').click();
    }
    
    if (e.key === 'Escape') {
        const modal = document.getElementById('noteModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.businessStrategyTool = new BusinessStrategyTool();
});

// 添加示例数据（首次使用时）
if (!localStorage.getItem('businessModelCanvas') && localStorage.getItem('firstVisit') === null) {
    const exampleNotes = [
        {
            id: '1',
            section: 'value-propositions',
            content: 'Provide high-quality products and services',
            color: '#ffeb3b',
            timestamp: new Date().toISOString()
        },
        {
            id: '2',
            section: 'customer-segments',
            content: 'Young professionals',
            color: '#2196f3',
            timestamp: new Date().toISOString()
        }
    ];
    localStorage.setItem('businessModelCanvas', JSON.stringify(exampleNotes));
    localStorage.setItem('firstVisit', 'true');
}

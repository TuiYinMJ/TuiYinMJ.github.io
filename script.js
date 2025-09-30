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
        this.showMessage('欢迎使用商业策略工具箱！', 'info');
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
        const newContent = prompt('编辑便利贴内容:', note.content);
        
        if (newContent !== null && newContent.trim() !== '') {
            this.notes[noteIndex].content = newContent.trim();
            this.saveNotes();
            this.renderNotes();
            this.showMessage('便利贴更新成功', 'success');
        }
    }

    exportCanvas() {
        this.showMessage('正在生成画布图像...', 'info');
        
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
            link.download = `商业模式画布_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('画布导出成功！', 'success');
        }).catch(error => {
            console.error('导出失败:', error);
            this.showMessage('导出失败，请重试', 'error');
        });
    }

    clearCanvas() {
        if (confirm('确定要清空整个画布吗？所有便利贴都将被删除！')) {
            this.notes = [];
            this.saveNotes();
            this.renderNotes();
            this.showMessage('画布已清空', 'info');
        }
    }

    showTemplates() {
        const templates = {
            '电子商务平台': [
                { section: 'value-propositions', content: '便捷的在线购物体验', color: '#ffeb3b' },
                { section: 'value-propositions', content: '丰富的产品选择', color: '#ffeb3b' },
                { section: 'customer-segments', content: '在线购物者', color: '#2196f3' },
                { section: 'customer-segments', content: '年轻专业人士', color: '#2196f3' },
                { section: 'channels', content: '网站', color: '#4caf50' },
                { section: 'channels', content: '移动应用', color: '#4caf50' },
                { section: 'revenue-streams', content: '产品销售佣金', color: '#ff9800' },
                { section: 'revenue-streams', content: '广告收入', color: '#ff9800' },
                { section: 'key-activities', content: '平台维护', color: '#e91e63' },
                { section: 'key-activities', content: '物流配送', color: '#e91e63' },
                { section: 'key-partners', content: '供应商', color: '#9c27b0' },
                { section: 'key-partners', content: '支付平台', color: '#9c27b0' },
                { section: 'key-resources', content: '技术团队', color: '#f44336' },
                { section: 'key-resources', content: '物流网络', color: '#f44336' },
                { section: 'customer-relationships', content: '用户支持', color: '#00bcd4' },
                { section: 'customer-relationships', content: '会员计划', color: '#00bcd4' },
                { section: 'cost-structure', content: '平台开发成本', color: '#795548' },
                { section: 'cost-structure', content: '运营成本', color: '#795548' }
            ],
            'SaaS服务': [
                { section: 'value-propositions', content: '基于云的软件服务', color: '#ffeb3b' },
                { section: 'value-propositions', content: '自动更新和维护', color: '#ffeb3b' },
                { section: 'customer-segments', content: '中小企业', color: '#2196f3' },
                { section: 'customer-relationships', content: '基于订阅的服务模式', color: '#e91e63' },
                { section: 'revenue-streams', content: '月度/年度订阅费', color: '#ff9800' },
                { section: 'key-activities', content: '软件开发', color: '#4caf50' },
                { section: 'key-activities', content: '客户支持', color: '#4caf50' },
                { section: 'key-partners', content: '云服务提供商', color: '#9c27b0' },
                { section: 'key-resources', content: '技术人才', color: '#f44336' },
                { section: 'channels', content: '直销', color: '#00bcd4' },
                { section: 'channels', content: '合作伙伴', color: '#00bcd4' },
                { section: 'cost-structure', content: '研发成本', color: '#795548' },
                { section: 'cost-structure', content: '服务器成本', color: '#795548' }
            ],
            '线下零售店': [
                { section: 'value-propositions', content: '个性化购物体验', color: '#ffeb3b' },
                { section: 'value-propositions', content: '即时产品获取', color: '#ffeb3b' },
                { section: 'customer-segments', content: '本地消费者', color: '#2196f3' },
                { section: 'customer-segments', content: '特定产品爱好者', color: '#2196f3' },
                { section: 'key-activities', content: '库存管理', color: '#4caf50' },
                { section: 'key-activities', content: '客户服务', color: '#4caf50' },
                { section: 'key-resources', content: '实体店铺', color: '#f44336' },
                { section: 'key-resources', content: '专业团队', color: '#f44336' },
                { section: 'revenue-streams', content: '产品销售收入', color: '#ff9800' },
                { section: 'cost-structure', content: '租金成本', color: '#795548' },
                { section: 'cost-structure', content: '人员成本', color: '#795548' }
            ]
        };

        const templateNames = Object.keys(templates);
        const selectedTemplate = prompt(`选择模板:\n${templateNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\n请输入模板编号:`);
        
        if (selectedTemplate && templateNames[selectedTemplate - 1]) {
            const templateName = templateNames[selectedTemplate - 1];
            if (confirm(`确定要使用"${templateName}"模板吗？这将替换当前所有便利贴。`)) {
                this.notes = templates[templateName].map(note => ({
                    ...note,
                    id: Date.now().toString() + Math.random(),
                    timestamp: new Date().toISOString()
                }));
                this.saveNotes();
                this.renderNotes();
                this.showMessage(`已加载"${templateName}"模板`, 'success');
            }
        }
    }

    // SWOT分析功能
    addSWOTItem() {
        const quadrant = prompt('请选择SWOT象限:\n1. 优势\n2. 劣势\n3. 机会\n4. 威胁\n\n请输入象限编号:');
        const content = prompt('请输入SWOT项目内容:');
        
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
                this.showMessage('SWOT项目添加成功！', 'success');
            } else {
                this.showMessage('请输入有效的象限编号(1-4)', 'error');
            }
        } else {
            this.showMessage('请填写完整的SWOT项目信息', 'error');
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
        if (confirm('确定要删除这个SWOT项目吗？')) {
            this.swotItems = this.swotItems.filter(item => item.id !== itemId);
            this.saveSWOTItems();
            this.renderSWOTItems();
            this.showMessage('SWOT项目已删除', 'info');
        }
    }

    exportSWOT() {
        this.showMessage('正在生成SWOT分析图像，请稍候...', 'info');
        
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
            link.download = `SWOT分析_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('SWOT分析导出成功！', 'success');
        }).catch(error => {
            console.error('导出失败:', error);
            this.showMessage('导出失败，请重试', 'error');
        });
    }

    clearSWOT() {
        if (confirm('确定要清空所有SWOT项目吗？此操作不可撤销！')) {
            this.swotItems = [];
            this.saveSWOTItems();
            this.renderSWOTItems();
            this.showMessage('SWOT分析已清空', 'info');
        }
    }

    // 价值主张画布功能
    editValueProposition() {
        this.showMessage('请点击任何部分编辑价值主张内容', 'info');
    }

    editVPItem(itemId) {
        const currentContent = document.getElementById(itemId).textContent;
        const displayName = itemId.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
        const newContent = prompt(`请编辑 ${displayName}:`, currentContent);
        
        if (newContent !== null && newContent.trim() !== '') {
            document.getElementById(itemId).textContent = newContent.trim();
            this.showMessage('价值主张内容更新成功！', 'success');
        } else if (newContent !== null && newContent.trim() === '') {
            this.showMessage('内容不能为空，请重新输入', 'error');
        }
    }

    exportValueProposition() {
        this.showMessage('价值主张画布导出功能即将上线！', 'info');
    }

    // 精益画布功能
    editLeanCanvas() {
        this.showMessage('点击任何部分编辑内容', 'info');
    }

    editLeanSection(sectionId) {
        const currentContent = document.getElementById(sectionId).textContent;
        const newContent = prompt(`编辑 ${sectionId}:`, currentContent);
        
        if (newContent !== null && newContent.trim() !== '') {
            document.getElementById(sectionId).textContent = newContent.trim();
            this.showMessage('内容更新成功', 'success');
        } else if (newContent !== null && newContent.trim() === '') {
            this.showMessage('内容不能为空，请重新输入', 'error');
        }
    }

    exportLeanCanvas() {
        this.showMessage('导出功能即将上线！', 'info');
    }

    addLeanCanvasItem() {
        const section = prompt('请选择部分:\n1. 问题\n2. 解决方案\n3. 关键指标\n4. 独特卖点\n5. 客户细分\n6. 渠道\n7. 收入来源\n8. 成本结构\n9. 门槛优势\n\n请输入部分编号:');
        const content = prompt('请输入内容:');
        
        if (section && content) {
            let sectionName;
            switch(section) {
                case '1':
                    sectionName = 'problems';
                    break;
                case '2':
                    sectionName = 'solutions';
                    break;
                case '3':
                    sectionName = 'key-metrics';
                    break;
                case '4':
                    sectionName = 'unique-value-proposition';
                    break;
                case '5':
                    sectionName = 'customer-segments';
                    break;
                case '6':
                    sectionName = 'channels';
                    break;
                case '7':
                    sectionName = 'revenue-streams';
                    break;
                case '8':
                    sectionName = 'cost-structure';
                    break;
                case '9':
                    sectionName = 'unfair-advantage';
                    break;
                default:
                    this.showMessage('请输入有效的部分编号(1-9)', 'error');
                    return;
            }
            
            const item = {
                id: Date.now().toString(),
                content: content,
                section: sectionName,
                timestamp: new Date().toISOString()
            };
            
            if (!this.leanCanvasItems) this.leanCanvasItems = [];
            this.leanCanvasItems.push(item);
            if (this.saveLeanCanvasItems) this.saveLeanCanvasItems();
            if (this.renderLeanCanvasItems) this.renderLeanCanvasItems();
            this.showMessage('精益画布项目添加成功！', 'success');
        } else {
            this.showMessage('请填写完整的精益画布项目信息', 'error');
        }
    }

    deleteLeanCanvasItem(itemId) {
        if (confirm('确定要删除这个精益画布项目吗？')) {
            if (this.leanCanvasItems) {
                this.leanCanvasItems = this.leanCanvasItems.filter(item => item.id !== itemId);
                if (this.saveLeanCanvasItems) this.saveLeanCanvasItems();
                if (this.renderLeanCanvasItems) this.renderLeanCanvasItems();
                this.showMessage('精益画布项目已删除', 'info');
            }
        }
    }

    clearLeanCanvas() {
        if (confirm('确定要清空所有精益画布项目吗？此操作不可撤销！')) {
            this.leanCanvasItems = [];
            if (this.saveLeanCanvasItems) this.saveLeanCanvasItems();
            if (this.renderLeanCanvasItems) this.renderLeanCanvasItems();
            this.showMessage('所有精益画布项目已清空', 'info');
        }
    }

    // 竞争分析功能
    addCompetitor() {
        this.showMessage('请使用下面的表单添加竞争对手详细信息', 'info');
    }

    saveCompetitor() {
        const name = document.getElementById('competitor-name').value.trim();
        const strengths = document.getElementById('competitor-strengths').value.trim();
        const weaknesses = document.getElementById('competitor-weaknesses').value.trim();

        if (!name) {
            this.showMessage('请输入竞争对手名称', 'error');
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
        
        this.showMessage(`竞争对手"${name}"添加成功！`, 'success');
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
                    <h4>优势</h4>
                    <ul class="competitor-list">
                        ${competitor.strengths.map(strength => `<li>${strength}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (competitor.weaknesses && competitor.weaknesses.length > 0) {
            weaknessesHTML = `
                <div class="competitor-weaknesses">
                    <h4>劣势</h4>
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
            <button class="delete-btn" onclick="window.businessStrategyTool.deleteCompetitor('${competitor.id}')">删除</button>
        `;

        return card;
    }

    deleteCompetitor(competitorId) {
        const competitor = this.competitors.find(c => c.id === competitorId);
        if (competitor && confirm(`确定要删除竞争对手"${competitor.name}"吗？`)) {
            this.competitors = this.competitors.filter(c => c.id !== competitorId);
            this.saveCompetitors();
            this.renderCompetitors();
            this.showMessage(`竞争对手"${competitor.name}"已删除`, 'info');
        }
    }

    exportCompetitiveAnalysis() {
        this.showMessage('导出功能即将上线！', 'info');
    }

    // 财务规划功能
    addFinancialData() {
        this.showMessage('使用下面的表单输入财务数据', 'info');
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
        this.showMessage('财务计算完成', 'success');
    }

    renderFinancialResults() {
        const container = document.getElementById('financial-results');
        const data = this.financialData;

        if (!data.monthlyRevenue) {
            container.innerHTML = '<p>请在上方输入财务数据查看结果</p>';
            return;
        }

        container.innerHTML = `
            <h3>财务结果</h3>
            <table class="financial-table">
                <tr>
                    <th>指标</th>
                    <th>数值</th>
                </tr>
                <tr>
                    <td>月收入</td>
                    <td>$${data.monthlyRevenue.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>月支出</td>
                    <td>$${data.monthlyExpenses.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>月利润</td>
                    <td>$${data.monthlyProfit.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>年利润</td>
                    <td>$${data.annualProfit.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>收支平衡期（月）</td>
                    <td>${data.breakEvenMonths}</td>
                </tr>
                <tr>
                    <td>投资回报率(ROI)</td>
                    <td>${data.roi}%</td>
                </tr>
            </table>
        `;
    }

    exportFinancialPlan() {
        this.showMessage('导出功能即将上线！', 'info');
    }

    // 市场分析功能
    addMarketData() {
        this.showMessage('请使用下面的表单输入市场数据', 'info');
    }

    calculateMarketShare() {
        const tam = document.getElementById('tam-input').value;
        const sam = document.getElementById('sam-input').value;
        const som = document.getElementById('som-input').value;

        if (tam && sam && som) {
            this.showMessage('市场份额计算完成', 'success');
        } else {
            this.showMessage('请填写所有市场数据字段', 'error');
        }
    }

    exportMarketAnalysis() {
        this.showMessage('导出功能即将上线！', 'info');
    }

    // 商业计划书功能
    saveBusinessPlan() {
        const businessPlan = {
            executiveSummary: document.getElementById('executive-summary').value,
            companyDescription: document.getElementById('company-description').value,
            marketAnalysis: document.getElementById('market-analysis').value,
            organizationManagement: document.getElementById('organization-management').value,
            productsServices: document.getElementById('products-services').value,
            marketingSales: document.getElementById('marketing-sales').value,
            financialPlan: document.getElementById('financial-plan').value,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('businessPlan', JSON.stringify(businessPlan));
        this.showMessage('商业计划书已成功保存！', 'success');
    }

    loadBusinessPlan() {
        const businessPlan = JSON.parse(localStorage.getItem('businessPlan')) || {};
        
        document.getElementById('executive-summary').value = businessPlan.executiveSummary || '';
        document.getElementById('company-description').value = businessPlan.companyDescription || '';
        document.getElementById('market-analysis').value = businessPlan.marketAnalysis || '';
        document.getElementById('organization-management').value = businessPlan.organizationManagement || '';
        document.getElementById('products-services').value = businessPlan.productsServices || '';
        document.getElementById('marketing-sales').value = businessPlan.marketingSales || '';
        document.getElementById('financial-plan').value = businessPlan.financialPlan || '';
        
        if (Object.keys(businessPlan).length > 0) {
            this.showMessage('已加载上次保存的商业计划书内容', 'info');
        }
    }

    generateBusinessPlanTemplate() {
        if (confirm('确定要使用商业计划书模板吗？这将替换当前所有内容。')) {
            const template = {
                executiveSummary: '本商业计划书旨在概述[公司名称]的商业理念、目标市场、竞争优势及财务规划。\n\n[公司名称]成立于[成立年份]，专注于[核心业务]，致力于为[目标客户]提供[核心价值]。\n\n本文档详细阐述了公司的战略规划、市场定位、运营模式及财务预测，为公司未来[X]年的发展提供清晰的路线图。',
                companyDescription: '1. 公司使命\n[公司名称]的使命是[使命描述]。\n\n2. 公司愿景\n我们的愿景是[愿景描述]。\n\n3. 价值观\n- [价值观1]\n- [价值观2]\n- [价值观3]\n\n4. 公司历史\n公司成立于[成立年份]，由[创始人背景]创立。自成立以来，我们已[重要里程碑]。\n\n5. 法律结构\n公司采用[法律形式，如有限责任公司、股份有限公司等]形式，总部位于[总部地址]。',
                marketAnalysis: '1. 行业概览\n[行业名称]行业目前正处于[发展阶段，如快速增长期、成熟期等]，市场规模达[市场规模]，年增长率约为[增长率]%。\n\n2. 目标市场\n我们的目标市场主要分为以下几类：\n- [目标市场1]\n- [目标市场2]\n- [目标市场3]\n\n3. 市场趋势\n当前市场主要趋势包括：\n- [趋势1]\n- [趋势2]\n- [趋势3]\n\n4. 竞争分析\n主要竞争对手包括：\n- [竞争对手1]：优势在于[优势]，劣势在于[劣势]\n- [竞争对手2]：优势在于[优势]，劣势在于[劣势]\n\n我们的竞争优势在于[核心竞争优势]。',
                organizationManagement: '1. 管理团队\n- [姓名]：[职位]，负责[职责]，拥有[背景经验]\n- [姓名]：[职位]，负责[职责]，拥有[背景经验]\n- [姓名]：[职位]，负责[职责]，拥有[背景经验]\n\n2. 组织结构\n公司采用[组织结构类型，如扁平化、矩阵式等]组织结构，下设[部门1]、[部门2]、[部门3]等部门。\n\n3. 人员规划\n预计未来[X]年内，公司员工规模将从目前的[当前人数]人增长至[目标人数]人，主要增加[重点部门]的人员配置。',
                productsServices: '1. 核心产品/服务\n- [产品/服务1]：[详细描述]，解决了[客户痛点]\n- [产品/服务2]：[详细描述]，解决了[客户痛点]\n- [产品/服务3]：[详细描述]，解决了[客户痛点]\n\n2. 产品/服务特点\n我们的产品/服务具有以下特点：\n- [特点1]\n- [特点2]\n- [特点3]\n\n3. 研发规划\n未来[X]年内，我们计划投入[研发资金]用于产品研发，重点开发[重点研发方向]。\n\n4. 知识产权\n公司目前拥有[专利数量]项专利，[商标数量]项商标，正在申请[申请中数量]项知识产权保护。',
                marketingSales: '1. 营销策略\n我们将采用以下营销策略：\n- [营销渠道1]：[具体策略]\n- [营销渠道2]：[具体策略]\n- [营销渠道3]：[具体策略]\n\n2. 销售策略\n销售团队将采用[销售模式，如直销、代理等]模式，目标在[时间]内实现[销售目标]。\n\n3. 定价策略\n我们的定价策略基于[定价依据，如成本加成、竞争定价等]，具体价格为[价格区间]。\n\n4. 品牌建设\n品牌建设计划包括[品牌活动1]、[品牌活动2]、[品牌活动3]等，目标是在[时间]内建立[品牌目标]。',
                financialPlan: '1. 收入预测\n未来[X]年的收入预测如下：\n- 第1年：[金额]\n- 第2年：[金额]\n- 第3年：[金额]\n主要收入来源为[收入来源1]、[收入来源2]、[收入来源3]。\n\n2. 支出预测\n主要支出包括：\n- 运营成本：[金额]\n- 人力成本：[金额]\n- 营销成本：[金额]\n- 研发成本：[金额]\n\n3. 盈利能力分析\n预计第[X]年实现盈利，净利润率约为[利润率]%。\n\n4. 资金需求\n公司目前需要[资金需求]资金，主要用于[用途1]、[用途2]、[用途3]。\n\n5. 投资回报\n投资者预计在[时间]内获得[回报率]%的投资回报。'
            };
            
            document.getElementById('executive-summary').value = template.executiveSummary;
            document.getElementById('company-description').value = template.companyDescription;
            document.getElementById('market-analysis').value = template.marketAnalysis;
            document.getElementById('organization-management').value = template.organizationManagement;
            document.getElementById('products-services').value = template.productsServices;
            document.getElementById('marketing-sales').value = template.marketingSales;
            document.getElementById('financial-plan').value = template.financialPlan;
            
            this.showMessage('商业计划书模板已加载，请根据实际情况修改内容', 'success');
        }
    }

    exportBusinessPlan() {
        this.showMessage('导出功能即将上线！', 'info');
    }

    // 商业模式评估功能
    rateCriterion(criterionId) {
        const ratingElement = document.querySelector(`[data-criterion="${criterionId}"]`);
        const currentRating = ratingElement.textContent.length;
        const newRating = currentRating < 5 ? currentRating + 1 : 1;
        
        ratingElement.textContent = '★'.repeat(newRating) + '☆'.repeat(5 - newRating);
        
        this.assessmentScores[criterionId] = newRating * 2; // 转换为10分制
        this.saveAssessmentScores();
        this.updateAssessmentScores();
        this.showMessage('评分已更新', 'success');
    }

    updateAssessmentScores() {
        const scores = this.assessmentScores;
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const averageScore = Math.round(totalScore / Object.values(scores).length);
        
        let message = '';
        if (averageScore >= 80) {
            message = '您的商业模式非常出色！';
        } else if (averageScore >= 60) {
            message = '您的商业模式良好，但仍有改进空间。';
        } else if (averageScore >= 40) {
            message = '您的商业模式需要显著改进。';
        } else {
            message = '您的商业模式需要从根本上重新设计。';
        }
        
        document.getElementById('total-score').textContent = `${totalScore}/100`;
        document.getElementById('value-score').textContent = scores['value-clarity'] || 0;
        document.getElementById('market-score').textContent = scores['market-feasibility'] || 0;
        document.getElementById('profit-score').textContent = scores['profit-model'] || 0;
        document.getElementById('advantage-score').textContent = scores['competitive-advantage'] || 0;
        document.getElementById('scalability-score').textContent = scores['scalability'] || 0;
        
        // 假设这些元素存在于HTML中
        const averageScoreElement = document.getElementById('business-model-average-score');
        if (averageScoreElement) {
            averageScoreElement.textContent = averageScore;
        }
        
        const feedbackElement = document.getElementById('business-model-feedback');
        if (feedbackElement) {
            feedbackElement.textContent = message;
        }
    }

    // 思维框架功能
    createCustomFramework() {
        this.showMessage('自定义框架创建功能即将上线！', 'info');
    }

    exportThinkingFrameworks() {
        this.showMessage('导出功能即将上线！', 'info');
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
        // 创建消息容器
        const messageContainer = document.createElement('div');
        messageContainer.className = `notification notification-${type}`;
        messageContainer.textContent = message;
        
        // 设置基本样式
        messageContainer.style.cssText = `
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
            min-width: 250px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // 设置不同类型消息的背景色
        const colors = {
            success: '#059669', // 成功 - 绿色
            error: '#dc2626',   // 错误 - 红色
            info: '#2563eb',    // 信息 - 蓝色
            warning: '#d97706'  // 警告 - 橙色
        };
        messageContainer.style.backgroundColor = colors[type] || colors.info;

        // 添加消息图标
        const icon = document.createElement('span');
        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '!'
        };
        icon.textContent = icons[type] || icons.info;
        icon.style.fontWeight = 'bold';
        messageContainer.prepend(icon);

        // 添加到页面
        document.body.appendChild(messageContainer);

        // 显示消息
        setTimeout(() => {
            messageContainer.style.transform = 'translateX(0)';
        }, 100);

        // 3秒后隐藏消息
        setTimeout(() => {
            messageContainer.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageContainer.parentNode) {
                    messageContainer.parentNode.removeChild(messageContainer);
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
            content: '提供高质量的产品和服务',
            color: '#ffeb3b',
            timestamp: new Date().toISOString()
        },
        {
            id: '2',
            section: 'customer-segments',
            content: '年轻专业人士',
            color: '#2196f3',
            timestamp: new Date().toISOString()
        }
    ];
    localStorage.setItem('businessModelCanvas', JSON.stringify(exampleNotes));
    localStorage.setItem('firstVisit', 'true');
}

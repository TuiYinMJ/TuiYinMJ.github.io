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
        this.initMarketAnalysis();
        this.showMessage('欢迎使用商业策略工具箱！', 'info');
    }
    
    // 初始化市场分析功能
    initMarketAnalysis() {
        // 当市场分析页面可见时，渲染保存的市场数据
        const marketAnalysisSection = document.getElementById('market-analysis');
        
        // 检查是否已经存在市场分析页面
        if (marketAnalysisSection) {
            // 初始渲染市场数据
            this.renderMarketData();
            
            // 尝试加载之前的市场份额计算结果
            const marketShareResult = JSON.parse(localStorage.getItem('marketShareResult') || 'null');
            if (marketShareResult) {
                const tamInput = document.getElementById('tam-input');
                const samInput = document.getElementById('sam-input');
                const somInput = document.getElementById('som-input');
                
                if (tamInput) tamInput.value = marketShareResult.tam;
                if (samInput) samInput.value = marketShareResult.sam;
                if (somInput) somInput.value = marketShareResult.som;
            }
            
            // 监听页面切换事件，当用户切换到市场分析页面时重新渲染数据
            const renderMarketDataWhenVisible = () => {
                // 检查市场分析部分是否在视口中
                const rect = marketAnalysisSection.getBoundingClientRect();
                const isVisible = (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
                
                if (isVisible) {
                    this.renderMarketData();
                }
            };
            
            // 添加滚动和调整窗口大小事件监听器
            window.addEventListener('scroll', renderMarketDataWhenVisible);
            window.addEventListener('resize', renderMarketDataWhenVisible);
        }
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
        const itemElement = document.getElementById(itemId);
        const currentContent = itemElement.textContent;
        const placeholder = this.getValuePropositionPlaceholder(itemId);
        
        // 如果当前内容是占位符，使用空字符串作为默认值
        const defaultValue = currentContent === placeholder ? '' : currentContent;
        const displayName = itemId.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
        
        const newContent = prompt(`请编辑 ${displayName}:`, defaultValue);
        
        if (newContent !== null) {
            if (newContent.trim() !== '') {
                itemElement.textContent = newContent.trim();
                this.showMessage('价值主张内容更新成功！', 'success');
            } else {
                // 如果用户输入为空，恢复占位符
                itemElement.textContent = placeholder;
                this.showMessage('已恢复为默认提示文本', 'info');
            }
        }
    }

    getValuePropositionPlaceholder(itemId) {
        const placeholders = {
            'customer-jobs': '客户需要完成的工作',
            'customer-pains': '客户面临的痛点',
            'customer-gains': '客户期望的收益',
            'products-services': '您的产品或服务',
            'pain-relievers': '如何缓解客户痛点',
            'gain-creators': '如何创造客户收益'
        };
        return placeholders[itemId] || '请输入内容';
    }

    exportValueProposition() {
        this.showMessage('价值主张画布导出功能即将上线！', 'info');
    }

    // 精益画布功能
    editLeanCanvas() {
        this.showMessage('点击任何部分编辑内容', 'info');
    }

    editLeanSection(sectionId) {
        const itemElement = document.getElementById(sectionId);
        const currentContent = itemElement.textContent;
        const placeholder = this.getLeanCanvasPlaceholder(sectionId);
        
        // 如果当前内容是占位符，使用空字符串作为默认值
        const defaultValue = currentContent === placeholder ? '' : currentContent;
        const displayName = sectionId.replace('-', ' ').replace(/^\w/, c => c.toUpperCase());
        
        const newContent = prompt(`编辑 ${displayName}:`, defaultValue);
        
        if (newContent !== null) {
            if (newContent.trim() !== '') {
                itemElement.textContent = newContent.trim();
                this.showMessage('内容更新成功', 'success');
            } else {
                // 如果用户输入为空，恢复占位符
                itemElement.textContent = placeholder;
                this.showMessage('已恢复为默认提示文本', 'info');
            }
        }
    }

    getLeanCanvasPlaceholder(sectionId) {
        const placeholders = {
            'problem': '你的产品解决了什么问题？',
            'solution': '你的解决方案是什么？',
            'key-metrics': '如何衡量成功？',
            'unique-value-proposition': '为什么用户选择你？',
            'unfair-advantage': '你有什么别人难以复制的优势？',
            'channels': '如何接触客户？',
            'customer-segments': '你的目标客户是谁？',
            'cost-structure': '主要成本是什么？',
            'revenue-streams': '如何赚钱？'
        };
        return placeholders[sectionId] || '请输入内容';
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
        if (this.competitors.length === 0) {
            this.showMessage('暂无竞争分析数据可供导出', 'info');
            return;
        }
        
        // 准备导出内容
        let content = "竞争分析报告\n\n";
        
        this.competitors.forEach((competitor, index) => {
            content += `=== 竞争对手 ${index + 1}: ${competitor.name} ===\n`;
            
            if (competitor.strengths && competitor.strengths.length > 0) {
                content += "优势:\n";
                competitor.strengths.forEach((strength, i) => {
                    content += `  ${i + 1}. ${strength}\n`;
                });
            }
            
            if (competitor.weaknesses && competitor.weaknesses.length > 0) {
                content += "劣势:\n";
                competitor.weaknesses.forEach((weakness, i) => {
                    content += `  ${i + 1}. ${weakness}\n`;
                });
            }
            
            content += "\n";
        });
        
        // 添加竞争优势分析
        content += "=== 本公司竞争优势分析 ===\n";
        content += "基于以上竞争对手分析，我们可以识别出以下潜在的竞争机会：\n";
        content += "1. [在此输入基于竞争对手劣势的机会]\n";
        content += "2. [在此输入差异化竞争策略]\n";
        content += "3. [在此输入如何利用自身优势]\n\n";
        
        // 添加分析日期
        content += `报告生成日期: ${new Date().toLocaleDateString('zh-CN')}\n`;
        
        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `竞争分析报告_${new Date().toISOString().split('T')[0]}.txt`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showMessage('竞争分析报告已导出！', 'success');
    }

    // 财务规划功能
    addFinancialData() {
        // 创建模态窗口提供详细的财务数据填写指导
        const modal = document.createElement('div');
        modal.className = 'financial-guide-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            max-width: 600px;
            width: 90%;
            z-index: 1001;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3>财务数据填写指南</h3>
                <button class="close-btn" onclick="this.closest('.financial-guide-modal').remove()">×</button>
            </div>
            <div class="modal-content">
                <div class="guide-section">
                    <h4>月度收入预测</h4>
                    <p>请输入您预期的月度收入金额。这个数字应该基于您的市场分析和销售预测。</p>
                    <p><strong>示例:</strong> 50000 或 50,000 (系统会自动忽略非数字字符)</p>
                </div>
                
                <div class="guide-section">
                    <h4>月度运营费用</h4>
                    <p>请输入您预期的月度运营成本，包括：</p>
                    <ul>
                        <li>租金和水电费</li>
                        <li>员工薪资</li>
                        <li>营销费用</li>
                        <li>原材料和库存成本</li>
                        <li>其他日常开销</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h4>初始投资需求</h4>
                    <p>请输入您启动业务所需的总投资金额，包括：</p>
                    <ul>
                        <li>设备和固定资产</li>
                        <li>初始库存</li>
                        <li>前期市场推广</li>
                        <li>办公空间装修</li>
                        <li>法律和注册费用</li>
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h4>如何获得更准确的预测</h4>
                    <ol>
                        <li>进行详细的市场调研</li>
                        <li>与行业专家咨询</li>
                        <li>参考类似业务的财务数据</li>
                        <li>考虑季节性和市场波动</li>
                        <li>制定保守和乐观两种预测方案</li>
                    </ol>
                </div>
            </div>
        `;
        
        // 添加遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        `;
        overlay.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        });
        
        // 添加到页面
        document.body.appendChild(overlay);
        document.body.appendChild(modal);
        
        // 添加样式
        this.addModalStyles();
        
        this.showMessage('财务数据填写指南已打开', 'info');
    }
    
    // 添加模态窗口通用样式
    addModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: var(--color-primary);
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                }
                
                .close-btn:hover {
                    background-color: #f5f5f5;
                }
                
                .guide-section {
                    margin-bottom: 20px;
                }
                
                .guide-section h4 {
                    color: var(--color-secondary);
                    margin-bottom: 8px;
                }
                
                .guide-section p {
                    margin-bottom: 8px;
                    color: #333;
                }
                
                .guide-section ul,
                .guide-section ol {
                    margin-bottom: 12px;
                    padding-left: 20px;
                }
                
                .guide-section li {
                    margin-bottom: 4px;
                }
                
                .financial-input-tip {
                    display: block;
                    font-size: 12px;
                    color: #666;
                    margin-top: 4px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    calculateFinancials() {
        const monthlyRevenue = parseFloat(document.getElementById('monthly-revenue').value.replace(/[^0-9.-]+/g, '')) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value.replace(/[^0-9.-]+/g, '')) || 0;
        const initialInvestment = parseFloat(document.getElementById('initial-investment').value.replace(/[^0-9.-]+/g, '')) || 0;

        // 验证输入
        if (monthlyRevenue <= 0) {
            this.showMessage('请输入有效的月度收入', 'error');
            return;
        }
        
        if (monthlyExpenses <= 0) {
            this.showMessage('请输入有效的月度支出', 'error');
            return;
        }

        // 计算各项财务指标
        const monthlyProfit = monthlyRevenue - monthlyExpenses;
        const annualProfit = monthlyProfit * 12;
        const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(initialInvestment / monthlyProfit) : '无限（亏损状态）';
        const roi = initialInvestment > 0 && monthlyProfit > 0 ? (annualProfit / initialInvestment * 100).toFixed(1) : 0;
        
        // 计算毛利率（简化版）
        const grossMargin = monthlyRevenue > 0 ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1) : 0;
        
        // 计算现金流
        const monthlyCashFlow = monthlyProfit;
        const annualCashFlow = monthlyCashFlow * 12;

        this.financialData = {
            monthlyRevenue,
            monthlyExpenses,
            monthlyProfit,
            annualProfit,
            initialInvestment,
            breakEvenMonths,
            roi,
            grossMargin,
            monthlyCashFlow,
            annualCashFlow,
            timestamp: new Date().toISOString()
        };

        this.saveFinancialData();
        this.renderFinancialResults();
        this.showMessage('财务计算完成', 'success');
    }

    renderFinancialResults() {
        const container = document.getElementById('financial-results');
        const data = this.financialData || {};

        if (!data.monthlyRevenue || data.monthlyRevenue <= 0) {
            container.innerHTML = `
                <div class="financial-placeholder">
                    <p>请在上方输入财务数据查看详细分析结果</p>
                    <div class="financial-tips">
                        <h4>财务分析可以帮助您：</h4>
                        <ul>
                            <li>评估业务的盈利能力</li>
                            <li>确定收支平衡点</li>
                            <li>计算投资回报率</li>
                            <li>制定合理的财务目标</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        // 确定财务健康状况
        let financialHealth = '';
        let healthClass = '';
        
        if (data.monthlyProfit > 0) {
            if (data.grossMargin >= 30) {
                financialHealth = '良好';
                healthClass = 'financial-healthy';
            } else if (data.grossMargin >= 15) {
                financialHealth = '一般';
                healthClass = 'financial-average';
            } else {
                financialHealth = '需要改进';
                healthClass = 'financial-needs-improvement';
            }
        } else {
            financialHealth = '亏损';
            healthClass = 'financial-loss';
        }

        container.innerHTML = `
            <h3>财务分析结果</h3>
            
            <!-- 财务概览卡片 -->
            <div class="financial-overview">
                <div class="overview-card ${healthClass}">
                    <h4>财务健康状况</h4>
                    <p class="health-status">${financialHealth}</p>
                </div>
                <div class="overview-card">
                    <h4>月利润</h4>
                    <p class="profit-amount">${this.formatCurrency(data.monthlyProfit)}</p>
                </div>
                <div class="overview-card">
                    <h4>投资回报率</h4>
                    <p class="roi-amount">${data.roi}%</p>
                </div>
            </div>

            <!-- 详细财务表格 -->
            <table class="financial-table">
                <tr>
                    <th>指标</th>
                    <th>数值</th>
                    <th>说明</th>
                </tr>
                <tr>
                    <td>月收入</td>
                    <td>${this.formatCurrency(data.monthlyRevenue)}</td>
                    <td>您预期的月度销售收入</td>
                </tr>
                <tr>
                    <td>月支出</td>
                    <td>${this.formatCurrency(data.monthlyExpenses)}</td>
                    <td>您的月度运营成本</td>
                </tr>
                <tr>
                    <td>月利润</td>
                    <td class="${data.monthlyProfit >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(data.monthlyProfit)}
                    </td>
                    <td>收入减去支出的余额</td>
                </tr>
                <tr>
                    <td>年利润</td>
                    <td class="${data.annualProfit >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(data.annualProfit)}
                    </td>
                    <td>月利润乘以12个月</td>
                </tr>
                <tr>
                    <td>毛利率</td>
                    <td>${data.grossMargin}%</td>
                    <td>利润占收入的百分比</td>
                </tr>
                <tr>
                    <td>月度现金流</td>
                    <td>${this.formatCurrency(data.monthlyCashFlow)}</td>
                    <td>每月的净现金流入</td>
                </tr>
                <tr>
                    <td>年度现金流</td>
                    <td>${this.formatCurrency(data.annualCashFlow)}</td>
                    <td>每年的净现金流入</td>
                </tr>
                <tr>
                    <td>初始投资</td>
                    <td>${this.formatCurrency(data.initialInvestment)}</td>
                    <td>启动业务所需的资金</td>
                </tr>
                <tr>
                    <td>收支平衡期</td>
                    <td>${data.breakEvenMonths}</td>
                    <td>收回初始投资所需时间</td>
                </tr>
                <tr>
                    <td>投资回报率(ROI)</td>
                    <td>${data.roi}%</td>
                    <td>年度利润与初始投资的比率</td>
                </tr>
            </table>

            <!-- 财务建议 -->
            <div class="financial-recommendations">
                <h4>改进建议</h4>
                <ul>
                    ${this.generateFinancialRecommendations(data)}
                </ul>
            </div>
        `;
    }

    // 格式化货币
    formatCurrency(amount) {
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        const formatted = new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(absAmount);
        return isNegative ? `-${formatted}` : formatted;
    }

    // 生成财务建议
    generateFinancialRecommendations(data) {
        let recommendations = [];
        
        // 基于毛利率的建议
        if (data.grossMargin < 15) {
            recommendations.push('考虑提高产品/服务定价或降低成本以提高毛利率');
        } else if (data.grossMargin < 30) {
            recommendations.push('探索优化成本结构或增加高利润产品的方法');
        }
        
        // 基于收支平衡期的建议
        if (typeof data.breakEvenMonths === 'number' && data.breakEvenMonths > 24) {
            recommendations.push('考虑调整业务模式或增加收入来源以缩短收支平衡期');
        }
        
        // 基于ROI的建议
        if (parseFloat(data.roi) < 10) {
            recommendations.push('评估投资回报率，考虑更高效的资源配置');
        }
        
        // 正利润建议
        if (data.monthlyProfit > 0) {
            recommendations.push('考虑将部分利润再投资以促进业务增长');
        } else {
            recommendations.push('紧急：分析成本结构，寻找减少开支或增加收入的方法');
        }
        
        // 通用建议
        recommendations.push('定期更新财务预测以反映业务实际表现');
        recommendations.push('考虑创建多种财务情景（保守、中性、乐观）进行分析');
        
        return recommendations.map(rec => `<li>${rec}</li>`).join('');
    }

    exportFinancialPlan() {
        const data = this.financialData;
        
        // 检查是否有数据可导出
        if (!data || !data.monthlyRevenue) {
            this.showMessage('请先输入并计算财务数据', 'error');
            return;
        }
        
        // 创建财务报告内容
        let content = `=== 财务规划报告 ===\n\n`;
        content += `报告生成日期: ${new Date().toLocaleDateString('zh-CN')}\n\n`;
        
        content += `=== 财务概览 ===\n`;
        content += `月度收入: ${this.formatCurrency(data.monthlyRevenue)}\n`;
        content += `月度支出: ${this.formatCurrency(data.monthlyExpenses)}\n`;
        content += `月度利润: ${this.formatCurrency(data.monthlyProfit)}\n`;
        content += `年度利润: ${this.formatCurrency(data.annualProfit)}\n`;
        content += `毛利率: ${data.grossMargin}%\n\n`;
        
        content += `=== 投资分析 ===\n`;
        content += `初始投资: ${this.formatCurrency(data.initialInvestment)}\n`;
        content += `收支平衡期: ${data.breakEvenMonths}\n`;
        content += `投资回报率(ROI): ${data.roi}%\n\n`;
        
        content += `=== 现金流分析 ===\n`;
        content += `月度现金流: ${this.formatCurrency(data.monthlyCashFlow)}\n`;
        content += `年度现金流: ${this.formatCurrency(data.annualCashFlow)}\n\n`;
        
        content += `=== 财务建议 ===\n`;
        const recommendations = this.generateFinancialRecommendations(data).split('</li><li>');
        recommendations.forEach((rec, index) => {
            // 移除HTML标签
            const cleanRec = rec.replace(/<li>|<\/li>/g, '').trim();
            content += `${index + 1}. ${cleanRec}\n`;
        });
        
        // 添加注释说明
        content += `\n=== 注释 ===\n`;
        content += `* 本报告基于您提供的财务数据生成\n`;
        content += `* 所有计算结果仅供参考，不构成投资建议\n`;
        content += `* 请根据实际业务情况定期更新数据\n`;
        
        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `财务规划报告_${new Date().toISOString().split('T')[0]}.txt`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showMessage('财务规划报告已导出！', 'success');
    }

    // 市场分析功能
    addMarketData() {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background-color: #fefefe;
            margin: 10% auto;
            padding: 20px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            width: 90%;
            max-width: 500px;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">添加市场数据</h3>
                <span class="close" style="cursor: pointer; font-size: 24px;">&times;</span>
            </div>
            <form id="marketDataForm">
                <div class="form-group">
                    <label for="marketSegment">市场细分:</label>
                    <input type="text" id="marketSegment" placeholder="例如：高端咖啡爱好者" required>
                </div>
                <div class="form-group">
                    <label for="segmentTAM">细分市场TAM:</label>
                    <input type="text" id="segmentTAM" placeholder="例如：100亿美元" required>
                </div>
                <div class="form-group">
                    <label for="segmentGrowthRate">增长率(%):</label>
                    <input type="number" id="segmentGrowthRate" min="0" max="100" placeholder="例如：8" required>
                </div>
                <div class="form-group">
                    <label for="marketInsights">市场洞察:</label>
                    <textarea id="marketInsights" rows="3" placeholder="输入您的市场洞察..."></textarea>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary">取消</button>
                    <button type="submit" class="btn">保存数据</button>
                </div>
            </form>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // 关闭按钮功能
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 取消按钮功能
        modal.querySelector('.btn-secondary').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // 表单提交
        modal.querySelector('#marketDataForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const segment = document.getElementById('marketSegment').value;
            const tam = document.getElementById('segmentTAM').value;
            const growthRate = document.getElementById('segmentGrowthRate').value;
            const insights = document.getElementById('marketInsights').value;
            
            // 保存市场数据到localStorage
            let marketData = JSON.parse(localStorage.getItem('marketData') || '[]');
            marketData.push({
                id: Date.now(),
                segment,
                tam,
                growthRate,
                insights,
                date: new Date().toISOString()
            });
            localStorage.setItem('marketData', JSON.stringify(marketData));
            
            // 显示成功消息
            this.showMessage('市场数据已添加！', 'success');
            
            // 关闭模态框
            document.body.removeChild(modal);
            
            // 刷新市场分析页面数据显示
            this.renderMarketData();
        });
        
        // 添加使用指南按钮
        const showGuideBtn = document.createElement('button');
        showGuideBtn.innerText = '查看使用指南';
        showGuideBtn.className = 'btn btn-small';
        showGuideBtn.style.cssText = `
            margin-top: 10px;
            background-color: var(--light-bg);
            color: var(--text-color);
        `;
        showGuideBtn.addEventListener('click', () => {
            this.showMarketGuide();
        });
        modalContent.appendChild(showGuideBtn);
    }
    
    // 显示市场分析指南
    showMarketGuide() {
        const guideModal = document.createElement('div');
        guideModal.className = 'modal';
        guideModal.style.cssText = `
            display: block;
            position: fixed;
            z-index: 1001;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        `;
        
        const guideContent = document.createElement('div');
        guideContent.className = 'modal-content';
        guideContent.style.cssText = `
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        guideContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">市场分析指南</h3>
                <span class="close" style="cursor: pointer; font-size: 24px;">&times;</span>
            </div>
            <div style="line-height: 1.6;">
                <h4 style="margin-top: 0;">如何有效进行市场分析</h4>
                <p>市场分析是制定业务策略的基础，它帮助您了解目标市场的规模、趋势和竞争格局。</p>
                
                <h4>市场细分</h4>
                <p>将潜在客户划分为具有相似需求和特征的群体，有助于更精准地定位和营销。</p>
                <p><strong>示例：</strong>高端咖啡爱好者、注重健康的消费者、忙碌的职场人士</p>
                
                <h4>市场规模(TAM/SAM/SOM)</h4>
                <ul>
                    <li><strong>TAM (Total Addressable Market):</strong> 总可寻址市场，指产品或服务可能覆盖的所有潜在市场规模</li>
                    <li><strong>SAM (Serviceable Available Market):</strong> 可服务可用市场，指在TAM中，您的产品或服务实际能够服务的那部分市场</li>
                    <li><strong>SOM (Serviceable Obtainable Market):</strong> 可服务可获得市场，指在SAM中，您预计能够实际获得的市场份额</li>
                </ul>
                
                <h4>增长率</h4>
                <p>市场增长率反映了市场的发展速度和潜力，高增长率通常意味着更多机会。</p>
                
                <h4>市场洞察</h4>
                <p>基于数据分析得出的关于市场趋势、消费者行为和竞争格局的深入理解。</p>
                
                <p style="color: var(--primary-color); font-weight: bold;">提示：定期更新市场数据，以保持您的分析与市场变化同步。</p>
            </div>
        `;
        
        guideModal.appendChild(guideContent);
        document.body.appendChild(guideModal);
        
        // 关闭按钮功能
        guideModal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(guideModal);
        });
        
        // 点击模态框外部关闭
        guideModal.addEventListener('click', (e) => {
            if (e.target === guideModal) {
                document.body.removeChild(guideModal);
            }
        });
    }
    
    // 渲染市场数据
    renderMarketData() {
        // 从localStorage获取市场数据
        const marketData = JSON.parse(localStorage.getItem('marketData') || '[]');
        
        // 检查是否已存在市场数据列表容器
        let dataContainer = document.getElementById('market-data-list');
        
        if (!dataContainer) {
            // 创建市场数据列表容器
            dataContainer = document.createElement('div');
            dataContainer.id = 'market-data-list';
            dataContainer.className = 'market-data-list';
            dataContainer.style.cssText = `
                margin-top: 20px;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                overflow: hidden;
            `;
            
            // 查找位置插入数据列表
            const analysisSection = document.querySelector('.market-analysis');
            if (analysisSection) {
                analysisSection.appendChild(dataContainer);
            }
        }
        
        // 如果有数据，显示数据列表
        if (marketData.length > 0) {
            let html = `
                <div style="background-color: var(--light-bg); padding: 10px; font-weight: bold;">
                    已保存的市场数据
                </div>
            `;
            
            marketData.forEach(item => {
                const date = new Date(item.date).toLocaleDateString('zh-CN');
                html += `
                    <div style="padding: 12px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <h4 style="margin: 0;">${item.segment}</h4>
                                <p style="margin: 5px 0; color: var(--light-text);">添加日期: ${date}</p>
                            </div>
                            <button class="delete-btn" data-id="${item.id}">✕</button>
                        </div>
                        <div style="margin-top: 8px;">
                            <p><strong>TAM:</strong> ${item.tam}</p>
                            <p><strong>增长率:</strong> ${item.growthRate}%</p>
                            ${item.insights ? `<p><strong>洞察:</strong> ${item.insights}</p>` : ''}
                        </div>
                    </div>
                `;
            });
            
            dataContainer.innerHTML = html;
            
            // 添加删除功能
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    this.deleteMarketData(id);
                });
            });
        } else {
            // 如果没有数据，显示提示信息
            dataContainer.innerHTML = `
                <div style="background-color: var(--light-bg); padding: 10px; font-weight: bold;">
                    已保存的市场数据
                </div>
                <div style="padding: 20px; text-align: center; color: var(--light-text);">
                    暂无保存的市场数据，请点击"添加市场数据"按钮添加
                </div>
            `;
        }
    }
    
    // 删除市场数据
    deleteMarketData(id) {
        let marketData = JSON.parse(localStorage.getItem('marketData') || '[]');
        marketData = marketData.filter(item => item.id !== id);
        localStorage.setItem('marketData', JSON.stringify(marketData));
        
        // 重新渲染数据列表
        this.renderMarketData();
        
        // 显示删除成功消息
        this.showMessage('市场数据已删除！', 'success');
    }

    calculateMarketShare() {
        const tam = document.getElementById('tam-input').value;
        const sam = document.getElementById('sam-input').value;
        const som = document.getElementById('som-input').value;

        // 数据验证
        if (!tam || !sam || !som) {
            this.showMessage('请填写所有市场数据字段', 'error');
            return;
        }

        try {
            // 提取数字值进行计算
            const extractNumber = (value) => {
                // 移除非数字字符，处理中文数字单位
                let numStr = value.replace(/[^\d.]/g, '');
                let multiplier = 1;
                
                // 检查单位
                if (value.includes('亿')) {
                    multiplier = 100000000;
                } else if (value.includes('万')) {
                    multiplier = 10000;
                } else if (value.includes('K') || value.includes('k')) {
                    multiplier = 1000;
                } else if (value.includes('M') || value.includes('m')) {
                    multiplier = 1000000;
                } else if (value.includes('B') || value.includes('b')) {
                    multiplier = 1000000000;
                }
                
                const num = parseFloat(numStr);
                if (isNaN(num)) {
                    throw new Error('数据格式不正确');
                }
                return num * multiplier;
            };
            
            // 计算市场份额百分比
            const tamNum = extractNumber(tam);
            const samNum = extractNumber(sam);
            const somNum = extractNumber(som);
            
            // 验证数值逻辑合理性
            if (samNum > tamNum || somNum > samNum || tamNum <= 0) {
                throw new Error('市场数据逻辑不合理，请检查输入');
            }
            
            const samPercentage = (samNum / tamNum * 100).toFixed(2);
            const somPercentage = (somNum / samNum * 100).toFixed(2);
            const totalMarketShare = (somNum / tamNum * 100).toFixed(4);
            
            // 显示结果
            let resultsHtml = document.getElementById('market-share-results');
            
            if (!resultsHtml) {
                // 创建结果容器
                resultsHtml = document.createElement('div');
                resultsHtml.id = 'market-share-results';
                resultsHtml.className = 'market-results';
                
                // 查找位置插入结果
                const inputSection = document.querySelector('.data-input-section');
                inputSection.after(resultsHtml);
            }
            
            // 设置结果样式
            resultsHtml.style.cssText = `
                background: #f8fafc;
                padding: 16px;
                border-radius: var(--radius);
                margin-top: 16px;
                border-left: 4px solid var(--primary-color);
            `;
            
            // 创建图表容器
            let chartContainer = document.createElement('div');
            chartContainer.className = 'market-share-chart';
            chartContainer.style.cssText = `
                margin-top: 16px;
                padding: 12px;
                background: white;
                border-radius: var(--radius);
                border: 1px solid var(--border-color);
            `;
            
            // 生成简单的进度条可视化
            const generateProgressBar = (value, label) => {
                return `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span>${label}</span>
                            <span><strong>${value}%</strong></span>
                        </div>
                        <div style="width: 100%; height: 8px; background: var(--light-bg); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${Math.min(value, 100)}%; height: 100%; background: var(--primary-color);"></div>
                        </div>
                    </div>
                `;
            };
            
            // 更新结果内容
            resultsHtml.innerHTML = `
                <h4 style="margin-top: 0;">市场份额计算结果</h4>
                <div style="margin-bottom: 8px;">可服务可用市场(SAM)占总可寻址市场(TAM)的比例: <strong>${samPercentage}%</strong></div>
                <div style="margin-bottom: 8px;">可服务可获得市场(SOM)占可服务可用市场(SAM)的比例: <strong>${somPercentage}%</strong></div>
                <div style="margin-bottom: 8px;">预计总市场份额(SOM/TAM): <strong>${totalMarketShare}%</strong></div>
                
                ${chartContainer.outerHTML}
            `;
            
            // 填充图表内容
            const chartElement = resultsHtml.querySelector('.market-share-chart');
            chartElement.innerHTML = `
                <h5 style="margin-top: 0;">市场份额可视化</h5>
                ${generateProgressBar(samPercentage, 'SAM / TAM')}
                ${generateProgressBar(somPercentage, 'SOM / SAM')}
                ${generateProgressBar(totalMarketShare, 'SOM / TAM')}
            `;
            
            // 保存计算结果到localStorage
            const marketShareResult = {
                tam,
                sam,
                som,
                samPercentage,
                somPercentage,
                totalMarketShare,
                calculatedAt: new Date().toISOString()
            };
            localStorage.setItem('marketShareResult', JSON.stringify(marketShareResult));
            
            // 生成建议
            let suggestions = [];
            if (parseFloat(totalMarketShare) < 1) {
                suggestions.push('您的市场份额目标相对保守，可以考虑扩大目标市场。');
            } else if (parseFloat(totalMarketShare) > 10) {
                suggestions.push('您的市场份额目标相对较高，建议制定详细的市场渗透策略。');
            }
            
            if (parseFloat(samPercentage) < 20) {
                suggestions.push('您的SAM占TAM比例较小，可能存在未开发的市场机会。');
            }
            
            if (suggestions.length > 0) {
                const suggestionElement = document.createElement('div');
                suggestionElement.style.cssText = `
                    margin-top: 12px;
                    padding: 10px;
                    background: #f0f9ff;
                    border-left: 4px solid #0ea5e9;
                    border-radius: var(--radius);
                `;
                
                let suggestionHtml = '<h5 style="margin-top: 0;">战略建议:</h5><ul style="margin: 5px 0;">';
                suggestions.forEach(suggestion => {
                    suggestionHtml += `<li>${suggestion}</li>`;
                });
                suggestionHtml += '</ul>';
                
                suggestionElement.innerHTML = suggestionHtml;
                resultsHtml.appendChild(suggestionElement);
            }
            
            this.showMessage('市场份额计算完成！结果已显示', 'success');
        } catch (error) {
            this.showMessage(`计算错误: ${error.message}`, 'error');
        }
    }

    exportMarketAnalysis() {
        try {
            // 获取市场规模数据
            const tam = document.getElementById('tam-input').value || '未填写';
            const sam = document.getElementById('sam-input').value || '未填写';
            const som = document.getElementById('som-input').value || '未填写';
            const trends = document.getElementById('trends-input').value || '未填写';
            
            // 获取保存的市场数据
            const marketData = JSON.parse(localStorage.getItem('marketData') || '[]');
            
            // 获取市场份额计算结果
            const marketShareResult = JSON.parse(localStorage.getItem('marketShareResult') || 'null');
            
            // 数据检查
            if (!tam && !sam && !som && !trends && marketData.length === 0 && !marketShareResult) {
                this.showMessage('没有可导出的市场分析数据', 'error');
                return;
            }
            
            // 准备导出内容
            let content = "市场分析报告\n";
            content += "=" . repeat(50) + "\n\n";
            content += `报告生成日期: ${new Date().toLocaleDateString('zh-CN')}\n`;
            content += `生成时间: ${new Date().toLocaleTimeString('zh-CN')}\n\n`;
            
            // 市场规模分析部分
            content += "一、市场规模分析\n";
            content += "-" . repeat(40) + "\n";
            content += `1. 总可寻址市场(TAM): ${tam}\n`;
            content += `2. 可服务可用市场(SAM): ${sam}\n`;
            content += `3. 可服务可获得市场(SOM): ${som}\n\n`;
            
            // 市场份额计算结果（如果有）
            if (marketShareResult) {
                content += "二、市场份额计算结果\n";
                content += "-" . repeat(40) + "\n";
                content += `1. 可服务可用市场(SAM)占总可寻址市场(TAM)的比例: ${marketShareResult.samPercentage}%\n`;
                content += `2. 可服务可获得市场(SOM)占可服务可用市场(SAM)的比例: ${marketShareResult.somPercentage}%\n`;
                content += `3. 预计总市场份额(SOM/TAM): ${marketShareResult.totalMarketShare}%\n`;
                content += `4. 计算时间: ${new Date(marketShareResult.calculatedAt).toLocaleString('zh-CN')}\n\n`;
            }
            
            // 细分市场数据（如果有）
            if (marketData.length > 0) {
                content += "三、细分市场分析\n";
                content += "-" . repeat(40) + "\n";
                
                marketData.forEach((item, index) => {
                    content += `细分市场 ${index + 1}:\n`;
                    content += `  1. 市场名称: ${item.segment}\n`;
                    content += `  2. 市场规模(TAM): ${item.tam}\n`;
                    content += `  3. 年增长率: ${item.growthRate}%\n`;
                    if (item.insights) {
                        content += `  4. 市场洞察: ${item.insights}\n`;
                    }
                    content += `  5. 添加日期: ${new Date(item.date).toLocaleDateString('zh-CN')}\n\n`;
                });
            }
            
            // 市场趋势分析部分
            if (trends && trends.trim() !== '') {
                content += "四、市场趋势分析\n";
                content += "-" . repeat(40) + "\n";
                content += `关键市场趋势及潜在影响:\n${trends}\n\n`;
            }
            
            // 生成总结
            content += "五、总结与建议\n";
            content += "-" . repeat(40) + "\n";
            
            let summaryPoints = [];
            
            if (marketShareResult) {
                const totalMarketShare = parseFloat(marketShareResult.totalMarketShare);
                const samPercentage = parseFloat(marketShareResult.samPercentage);
                
                if (totalMarketShare < 1) {
                    summaryPoints.push("市场份额目标相对保守，可以考虑扩大目标市场覆盖范围或增加产品线。");
                } else if (totalMarketShare > 10) {
                    summaryPoints.push("市场份额目标相对较高，建议制定详细的市场渗透策略和资源配置计划。");
                } else {
                    summaryPoints.push("市场份额目标设定较为合理，符合行业平均水平。");
                }
                
                if (samPercentage < 20) {
                    summaryPoints.push("SAM占TAM比例较小，可能存在未开发的市场机会，建议进一步研究市场细分。");
                }
            }
            
            if (marketData.length > 0) {
                summaryPoints.push(`已分析${marketData.length}个细分市场，建议定期更新这些数据以反映市场变化。`);
            }
            
            if (trends && trends.trim() !== '') {
                summaryPoints.push("市场趋势分析已完成，建议持续监控这些趋势的发展变化。");
            }
            
            if (summaryPoints.length > 0) {
                summaryPoints.forEach((point, index) => {
                    content += `${index + 1}. ${point}\n`;
                });
            } else {
                content += "基于现有数据，无法生成具体建议。建议完善市场数据后重新生成报告。\n";
            }
            
            content += "\n";
            content += "=" . repeat(50) + "\n";
            content += "报告生成完毕。请注意，本报告仅供参考，实际决策请结合更多市场调研数据。";
            
            // 创建下载链接
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `市场分析报告_${new Date().toISOString().split('T')[0]}.txt`;
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.showMessage('市场分析报告已导出！', 'success');
        } catch (error) {
            this.showMessage(`导出失败: ${error.message}`, 'error');
        }
    }

    // 商业计划书功能
    saveBusinessPlan() {
        const businessPlan = {
            executiveSummary: document.getElementById('executive-summary').value,
            companyDescription: document.getElementById('company-description').value,
            marketAnalysis: document.getElementById('market-analysis-text').value,
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
        document.getElementById('market-analysis-text').value = businessPlan.marketAnalysis || '';
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
            document.getElementById('market-analysis-text').value = template.marketAnalysis;
            document.getElementById('organization-management').value = template.organizationManagement;
            document.getElementById('products-services').value = template.productsServices;
            document.getElementById('marketing-sales').value = template.marketingSales;
            document.getElementById('financial-plan').value = template.financialPlan;
            
            this.showMessage('商业计划书模板已加载，请根据实际情况修改内容', 'success');
        }
    }

    exportBusinessPlan() {
        // 检查是否有内容可导出
        const hasContent = document.getElementById('executive-summary').value.trim() || 
                          document.getElementById('company-description').value.trim() || 
                          document.getElementById('market-analysis-text').value.trim() || 
                          document.getElementById('organization-management').value.trim() || 
                          document.getElementById('products-services').value.trim() || 
                          document.getElementById('marketing-sales').value.trim() || 
                          document.getElementById('financial-plan').value.trim();
        
        if (!hasContent) {
            this.showMessage('请先填写商业计划书内容', 'error');
            return;
        }
        
        // 创建商业计划书导出内容
        let content = `=== 商业计划书 ===\n\n`;
        content += `报告生成日期: ${new Date().toLocaleDateString('zh-CN')}\n\n`;
        
        // 执行摘要
        const executiveSummary = document.getElementById('executive-summary').value.trim() || '未填写';
        content += `=== 执行摘要 ===\n`;
        content += `${executiveSummary}\n\n`;
        
        // 公司描述
        const companyDescription = document.getElementById('company-description').value.trim() || '未填写';
        content += `=== 公司描述 ===\n`;
        content += `${companyDescription}\n\n`;
        
        // 市场分析
        const marketAnalysis = document.getElementById('market-analysis-text').value.trim() || '未填写';
        content += `=== 市场分析 ===\n`;
        content += `${marketAnalysis}\n\n`;
        
        // 组织与管理
        const organizationManagement = document.getElementById('organization-management').value.trim() || '未填写';
        content += `=== 组织与管理 ===\n`;
        content += `${organizationManagement}\n\n`;
        
        // 服务或产品线
        const productsServices = document.getElementById('products-services').value.trim() || '未填写';
        content += `=== 服务或产品线 ===\n`;
        content += `${productsServices}\n\n`;
        
        // 营销与销售
        const marketingSales = document.getElementById('marketing-sales').value.trim() || '未填写';
        content += `=== 营销与销售 ===\n`;
        content += `${marketingSales}\n\n`;
        
        // 财务规划
        const financialPlan = document.getElementById('financial-plan').value.trim() || '未填写';
        content += `=== 财务规划 ===\n`;
        content += `${financialPlan}\n\n`;
        
        // 添加注释说明
        content += `=== 注释 ===\n`;
        content += `* 本商业计划书由商业决策助手工具生成\n`;
        content += `* 请根据实际业务情况进行调整和完善\n`;
        content += `* 建议定期更新商业计划以适应市场变化\n`;
        
        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `商业计划书_${new Date().toISOString().split('T')[0]}.txt`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showMessage('商业计划书已导出！', 'success');
    }
    
    // 初始化商业计划书自动保存功能
    initBusinessPlanAutoSave() {
        // 监听所有计划输入框的变化
        const planInputs = document.querySelectorAll('.plan-input');
        planInputs.forEach(input => {
            input.addEventListener('input', () => {
                // 延迟保存，避免频繁保存
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveBusinessPlan();
                }, 2000);
            });
        });
        
        // 页面加载时加载已保存的计划
        this.loadBusinessPlan();
    }

    // 商业模式评估功能
    initBusinessModelAssessment() {
        // 页面加载时初始化
        this.initBusinessPlanAutoSave();
        // 设置初始评分（不是示例数据）
        this.assessmentScores = {
            'value-clarity': 0,
            'market-feasibility': 0,
            'profit-model': 0,
            'competitive-advantage': 0,
            'scalability': 0
        };
        
        // 显示评估步骤说明
        const instructions = document.getElementById('assessment-instructions');
        if (instructions) {
            instructions.innerHTML = `
                <div class="assessment-guide">
                    <h3>商业模式评估指南</h3>
                    <ol>
                        <li>点击每个评估维度的星星进行评分（1-5星，对应10分制的2-10分）</li>
                        <li>完成所有5个维度的评分后，系统将自动计算总分和平均分</li>
                        <li>根据评分结果，系统会提供针对性的反馈和改进建议</li>
                    </ol>
                </div>
            `;
        }
        
        this.showMessage('请根据您的商业模式实际情况进行评估', 'info');
    }

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
        let detailedFeedback = '';
        
        if (averageScore >= 80) {
            message = '您的商业模式非常出色！';
            detailedFeedback = '您的商业模式在各个维度都表现优异，具有很强的市场竞争力和可持续性。建议继续保持创新，巩固竞争优势。';
        } else if (averageScore >= 60) {
            message = '您的商业模式良好，但仍有改进空间。';
            detailedFeedback = '您的商业模式基础扎实，但在某些维度还可以进一步优化。请查看各维度得分，重点提升得分较低的方面。';
        } else if (averageScore >= 40) {
            message = '您的商业模式需要显著改进。';
            detailedFeedback = '您的商业模式存在明显不足，建议重新审视核心价值主张和盈利模式，进行针对性调整。';
        } else {
            message = '您的商业模式需要从根本上重新设计。';
            detailedFeedback = '您的商业模式面临严峻挑战，建议重新分析市场需求，重新定位产品或服务，并重新构建商业逻辑。';
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
            feedbackElement.innerHTML = `
                <p class="feedback-main">${message}</p>
                <p class="feedback-detail">${detailedFeedback}</p>
            `;
        }
        
        // 添加各维度的改进建议
        this.showDimensionFeedback(scores);
    }
    
    showDimensionFeedback(scores) {
        const dimensionFeedback = {
            'value-clarity': {
                high: '您的价值主张非常清晰，客户能够明确理解您提供的价值。',
                medium: '您的价值主张基本明确，但可以进一步提炼和简化。',
                low: '您的价值主张不够清晰，建议重新定义产品或服务的核心价值。'
            },
            'market-feasibility': {
                high: '您的商业模式具有很强的市场可行性，需求明确。',
                medium: '您的商业模式市场可行性一般，建议进一步验证市场需求。',
                low: '您的商业模式市场可行性较低，需要重新评估目标市场。'
            },
            'profit-model': {
                high: '您的盈利模式设计合理，具有良好的盈利能力。',
                medium: '您的盈利模式基本可行，但盈利潜力有限。',
                low: '您的盈利模式存在明显问题，建议重新设计收入来源。'
            },
            'competitive-advantage': {
                high: '您拥有显著的竞争优势，难以被竞争对手复制。',
                medium: '您具有一定的竞争优势，但不够突出。',
                low: '您缺乏明显的竞争优势，建议寻找差异化竞争策略。'
            },
            'scalability': {
                high: '您的商业模式具有很强的可扩展性，易于复制和增长。',
                medium: '您的商业模式具有一定的可扩展性，但存在限制因素。',
                low: '您的商业模式扩展性较差，难以实现规模化发展。'
            }
        };
        
        // 获取反馈容器
        const feedbackContainer = document.getElementById('dimension-feedback');
        if (!feedbackContainer) return;
        
        let feedbackHTML = '<h4>各维度改进建议</h4>';
        
        for (const [dimension, score] of Object.entries(scores)) {
            let feedback;
            if (score >= 8) {
                feedback = dimensionFeedback[dimension].high;
            } else if (score >= 5) {
                feedback = dimensionFeedback[dimension].medium;
            } else {
                feedback = dimensionFeedback[dimension].low;
            }
            
            // 获取维度的中文名称
            const dimensionNames = {
                'value-clarity': '价值清晰度',
                'market-feasibility': '市场可行性',
                'profit-model': '盈利模式',
                'competitive-advantage': '竞争优势',
                'scalability': '可扩展性'
            };
            
            feedbackHTML += `<div class="dimension-feedback-item">
                <strong>${dimensionNames[dimension]}:</strong> ${feedback}
            </div>`;
        }
        
        feedbackContainer.innerHTML = feedbackHTML;
    }
    
    saveAssessmentScores() {
        localStorage.setItem('assessmentScores', JSON.stringify(this.assessmentScores));
    }
    
    loadAssessmentScores() {
        const saved = localStorage.getItem('assessmentScores');
        if (saved) {
            this.assessmentScores = JSON.parse(saved);
        }
    }

    // 思维框架功能
    createCustomFramework() {
        const frameworkName = prompt('请输入自定义框架名称:');
        if (!frameworkName) return;
        
        const frameworkDescription = prompt('请输入框架描述:');
        const frameworkSteps = prompt('请输入框架步骤 (用分号分隔):');
        
        if (frameworkDescription && frameworkSteps) {
            const customFramework = {
                id: `custom-${Date.now()}`,
                name: frameworkName,
                description: frameworkDescription,
                steps: frameworkSteps.split(';').map(step => step.trim()),
                createdAt: new Date().toISOString()
            };
            
            // 获取已保存的框架
            const savedFrameworks = this.loadThinkingFrameworks();
            savedFrameworks.push(customFramework);
            localStorage.setItem('thinkingFrameworks', JSON.stringify(savedFrameworks));
            
            // 刷新页面显示
            this.renderCustomFrameworks();
            
            this.showMessage(`自定义框架"${frameworkName}"已创建！`, 'success');
        }
    }
    
    loadThinkingFrameworks() {
        const saved = localStorage.getItem('thinkingFrameworks');
        return saved ? JSON.parse(saved) : [];
    }
    
    renderCustomFrameworks() {
        const frameworkGrid = document.querySelector('.framework-grid');
        if (!frameworkGrid) return;
        
        const customFrameworks = this.loadThinkingFrameworks();
        customFrameworks.forEach(framework => {
            // 检查是否已存在该框架
            if (document.getElementById(framework.id)) return;
            
            const card = document.createElement('div');
            card.className = 'framework-card';
            card.id = framework.id;
            
            let stepsHtml = '';
            framework.steps.forEach((step, index) => {
                stepsHtml += `<li>${step}</li>`;
            });
            
            card.innerHTML = `
                <h3>${framework.name}</h3>
                <p>${framework.description}</p>
                <div class="framework-guide">
                    <h4>如何应用:</h4>
                    <ol>${stepsHtml}</ol>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm" onclick="window.businessStrategyTool.deleteCustomFramework('${framework.id}')">删除</button>
                </div>
            `;
            
            frameworkGrid.appendChild(card);
        });
    }
    
    deleteCustomFramework(frameworkId) {
        if (confirm('确定要删除这个自定义框架吗？')) {
            const savedFrameworks = this.loadThinkingFrameworks();
            const filteredFrameworks = savedFrameworks.filter(f => f.id !== frameworkId);
            localStorage.setItem('thinkingFrameworks', JSON.stringify(filteredFrameworks));
            
            const element = document.getElementById(frameworkId);
            if (element) {
                element.remove();
            }
            
            this.showMessage('自定义框架已删除！', 'success');
        }
    }

    exportThinkingFrameworks() {
        // 收集所有框架内容
        let content = "思维框架集合\n\n";
        
        // 获取自定义框架
        const customFrameworks = this.loadThinkingFrameworks();
        
        if (customFrameworks.length > 0) {
            content += "自定义框架:\n";
            customFrameworks.forEach((framework, index) => {
                content += `${index + 1}. ${framework.name}\n`;
                content += `描述: ${framework.description}\n`;
                content += `步骤:\n`;
                framework.steps.forEach((step, stepIndex) => {
                    content += `  ${stepIndex + 1}. ${step}\n`;
                });
                content += "\n";
            });
        }
        
        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `思维框架_${new Date().toISOString().split('T')[0]}.txt`;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        this.showMessage('思维框架已导出！', 'success');
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
            'value-clarity': 0,
            'market-feasibility': 0,
            'profit-model': 0,
            'competitive-advantage': 0,
            'scalability': 0
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

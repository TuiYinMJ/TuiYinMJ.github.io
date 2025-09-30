class BusinessStrategyTool {
    constructor() {
        this.currentPage = 'business-model-canvas';
        this.notes = this.loadNotes();
        this.swotItems = this.loadSWOTItems();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderNotes();
        this.renderSWOTItems();
        this.showPage(this.currentPage);
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
            alert('请输入便利贴内容！');
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
        deleteBtn.title = '删除';
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
                    this.showMessage('便利贴已移动', 'success');
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
            this.showMessage('便利贴已更新', 'success');
        }
    }

    exportCanvas() {
        this.showMessage('正在生成画布图片...', 'info');
        
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
            backgroundColor: '#667eea'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `商业模式画布_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('画布图片导出成功！', 'success');
        }).catch(error => {
            console.error('导出失败:', error);
            this.showMessage('导出失败，请重试', 'error');
        });
    }

    clearCanvas() {
        if (confirm('确定要清空整个画布吗？所有便利贴将被删除！')) {
            this.notes = [];
            this.saveNotes();
            this.renderNotes();
            this.showMessage('画布已清空', 'info');
        }
    }

    showTemplates() {
        const templates = {
            '电商平台': [
                { section: 'value-propositions', content: '便捷的在线购物体验', color: '#ffeb3b' },
                { section: 'value-propositions', content: '丰富的商品选择', color: '#ffeb3b' },
                { section: 'customer-segments', content: '网购消费者', color: '#2196f3' },
                { section: 'customer-segments', content: '年轻白领', color: '#2196f3' },
                { section: 'channels', content: '官方网站', color: '#4caf50' },
                { section: 'channels', content: '移动APP', color: '#4caf50' },
                { section: 'revenue-streams', content: '商品销售佣金', color: '#ff9800' },
                { section: 'revenue-streams', content: '广告收入', color: '#ff9800' }
            ],
            'SaaS服务': [
                { section: 'value-propositions', content: '云端软件服务', color: '#ffeb3b' },
                { section: 'value-propositions', content: '自动更新和维护', color: '#ffeb3b' },
                { section: 'customer-segments', content: '中小企业', color: '#2196f3' },
                { section: 'customer-relationships', content: '订阅制服务', color: '#e91e63' },
                { section: 'revenue-streams', content: '月费/年费订阅', color: '#ff9800' },
                { section: 'key-activities', content: '软件开发', color: '#4caf50' },
                { section: 'key-activities', content: '客户支持', color: '#4caf50' }
            ]
        };

        const templateNames = Object.keys(templates);
        const selectedTemplate = prompt(`选择模板:\n${templateNames.map((name, index) => `${index + 1}. ${name}`).join('\n')}\n\n输入模板编号:`);
        
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
                this.showMessage(`"${templateName}"模板已加载`, 'success');
            }
        }
    }

    // SWOT分析功能
    addSWOTItem() {
        const quadrant = prompt('选择象限:\n1. 优势\n2. 劣势\n3. 机会\n4. 威胁\n\n输入象限编号:');
        const content = prompt('输入项目内容:');
        
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
                this.showMessage('SWOT项目已添加', 'success');
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
        deleteBtn.title = '删除';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSWOTItem(item.id);
        });

        itemDiv.appendChild(deleteBtn);
        return itemDiv;
    }

    deleteSWOTItem(itemId) {
        if (confirm('确定要删除这个项目吗？')) {
            this.swotItems = this.swotItems.filter(item => item.id !== itemId);
            this.saveSWOTItems();
            this.renderSWOTItems();
            this.showMessage('项目已删除', 'info');
        }
    }

    exportSWOT() {
        this.showMessage('正在生成SWOT分析图片...', 'info');
        
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
            backgroundColor: '#667eea'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `SWOT分析_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.showMessage('SWOT分析图片导出成功！', 'success');
        }).catch(error => {
            console.error('导出失败:', error);
            this.showMessage('导出失败，请重试', 'error');
        });
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

    // 消息提示功能
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            transition: all 0.3s ease;
            transform: translateX(100%);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-size: 14px;
        `;

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
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

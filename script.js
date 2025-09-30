class BusinessModelCanvas {
    constructor() {
        this.notes = this.loadNotes();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderNotes();
    }

    bindEvents() {
        // 添加便利贴按钮
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openModal();
        });

        // 保存按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCanvas();
        });

        // 清空按钮
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearCanvas();
        });

        // 模态框关闭按钮
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('noteModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // 便利贴表单提交
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNote();
        });

        // 拖拽功能
        this.enableDragAndDrop();
    }

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

        // 显示成功提示
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
        // 清空所有区域的便利贴
        document.querySelectorAll('.notes-container').forEach(container => {
            container.innerHTML = '';
        });

        // 渲染便利贴
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

        // 便利贴内容
        const content = document.createElement('div');
        content.textContent = note.content;
        content.className = 'note-content';

        // 删除按钮
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
            if (draggedNote && e.target.classList.contains('section')) {
                const section = e.target.getAttribute('data-section');
                const noteId = draggedNote.getAttribute('data-note-id');
                
                // 更新便利贴的区域
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

    saveCanvas() {
        this.saveNotes();
        this.showMessage('画布已保存！', 'success');
        
        // 创建下载链接
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `商业模式画布_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    clearCanvas() {
        if (confirm('确定要清空整个画布吗？所有便利贴将被删除！')) {
            this.notes = [];
            this.saveNotes();
            this.renderNotes();
            this.showMessage('画布已清空', 'info');
        }
    }

    saveNotes() {
        localStorage.setItem('businessModelCanvas', JSON.stringify(this.notes));
    }

    loadNotes() {
        const saved = localStorage.getItem('businessModelCanvas');
        return saved ? JSON.parse(saved) : [];
    }

    showMessage(message, type = 'info') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1001;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;

        // 设置颜色
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        messageDiv.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(messageDiv);

        // 显示动画
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);

        // 自动隐藏
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

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl+N 或 Cmd+N 添加便利贴
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('addNoteBtn').click();
    }
    
    // Escape 关闭模态框
    if (e.key === 'Escape') {
        const modal = document.getElementById('noteModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BusinessModelCanvas();
});

// 添加一些示例数据（首次使用时）
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
        },
        {
            id: '3',
            section: 'revenue-streams',
            content: '产品销售',
            color: '#4caf50',
            timestamp: new Date().toISOString()
        }
    ];
    localStorage.setItem('businessModelCanvas', JSON.stringify(exampleNotes));
    localStorage.setItem('firstVisit', 'true');
}

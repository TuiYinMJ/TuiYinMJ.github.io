// 思维框架与商业分析模式模块

/**
 * SWOT分析相关功能
 */
export const SWOT = {
  /**
   * 添加SWOT分析项
   * @param {string} type - SWOT类型（strengths, weaknesses, opportunities, threats）
   * @param {string} text - 分析内容
   */
  addItem: (type, text) => {
    if (!text.trim()) return;

    const container = document.getElementById(`${type}-list`);
    if (!container) return;

    const itemId = `${type}-${Date.now()}`;
    const item = document.createElement('div');
    item.className = 'swot-item';
    item.id = itemId;
    item.innerHTML = `
      <span class="swot-text">${text}</span>
      <button class="delete-btn" onclick="removeSWOTItem('${itemId}')">删除</button>
    `;
    
    container.appendChild(item);
    
    // 保存到本地存储
    SWOT.saveData();
  },
  
  /**
   * 移除SWOT分析项
   * @param {string} itemId - 分析项ID
   */
  removeItem: (itemId) => {
    const item = document.getElementById(itemId);
    if (item) {
      item.remove();
      SWOT.saveData();
    }
  },
  
  /**
   * 保存SWOT数据到本地存储
   */
  saveData: () => {
    const types = ['strengths', 'weaknesses', 'opportunities', 'threats'];
    const data = {};
    
    types.forEach(type => {
      const container = document.getElementById(`${type}-list`);
      if (container) {
        const items = Array.from(container.querySelectorAll('.swot-item')).map(item => {
          return item.querySelector('.swot-text').textContent;
        });
        data[type] = items;
      }
    });
    
    localStorage.setItem('swotData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载SWOT数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('swotData') || '{}');
    
    Object.entries(data).forEach(([type, items]) => {
      const container = document.getElementById(`${type}-list`);
      if (container && Array.isArray(items)) {
        items.forEach(text => {
          SWOT.addItem(type, text);
        });
      }
    });
  },
  
  /**
   * 导出SWOT分析为文本
   */
  exportData: () => {
    const types = {
      strengths: '优势（Strengths）',
      weaknesses: '劣势（Weaknesses）',
      opportunities: '机会（Opportunities）',
      threats: '威胁（Threats）'
    };
    
    let content = 'SWOT分析报告\n';
    content += '=================\n\n';
    
    Object.entries(types).forEach(([key, label]) => {
      content += `${label}:\n`;
      const container = document.getElementById(`${key}-list`);
      if (container) {
        const items = container.querySelectorAll('.swot-item .swot-text');
        if (items.length > 0) {
          items.forEach((item, index) => {
            content += `${index + 1}. ${item.textContent}\n`;
          });
        } else {
          content += '暂无内容\n';
        }
      }
      content += '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SWOT分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * 波特五力模型
 */
export const PorterFiveForces = {
  /**
   * 保存波特五力分析数据
   */
  saveData: () => {
    const forces = ['rivalry', 'suppliers', 'buyers', 'threatOfNewEntrants', 'threatOfSubstitutes'];
    const data = {};
    
    forces.forEach(force => {
      const element = document.getElementById(`porter-${force}`);
      if (element) {
        data[force] = element.value;
      }
    });
    
    localStorage.setItem('porterFiveForcesData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载波特五力分析数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('porterFiveForcesData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(`porter-${key}`);
      if (element) {
        element.value = value;
      }
    });
  },
  
  /**
   * 导出波特五力分析报告
   */
  exportData: () => {
    const forces = {
      rivalry: '现有竞争者的竞争程度',
      suppliers: '供应商的议价能力',
      buyers: '购买者的议价能力',
      threatOfNewEntrants: '潜在竞争者进入的能力',
      threatOfSubstitutes: '替代品的替代能力'
    };
    
    let content = '波特五力模型分析报告\n';
    content += '=====================\n\n';
    
    Object.entries(forces).forEach(([key, label]) => {
      content += `${label}:\n`;
      const element = document.getElementById(`porter-${key}`);
      if (element && element.value.trim()) {
        content += `${element.value}\n`;
      } else {
        content += '暂无内容\n';
      }
      content += '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '波特五力模型分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * PEST分析
 */
export const PESTAnalysis = {
  /**
   * 保存PEST分析数据
   */
  saveData: () => {
    const factors = ['political', 'economic', 'social', 'technological'];
    const data = {};
    
    factors.forEach(factor => {
      const element = document.getElementById(`pest-${factor}`);
      if (element) {
        data[factor] = element.value;
      }
    });
    
    localStorage.setItem('pestAnalysisData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载PEST分析数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('pestAnalysisData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(`pest-${key}`);
      if (element) {
        element.value = value;
      }
    });
  },
  
  /**
   * 导出PEST分析报告
   */
  exportData: () => {
    const factors = {
      political: '政治因素（Political）',
      economic: '经济因素（Economic）',
      social: '社会因素（Social）',
      technological: '技术因素（Technological）'
    };
    
    let content = 'PEST分析报告\n';
    content += '=============\n\n';
    
    Object.entries(factors).forEach(([key, label]) => {
      content += `${label}:\n`;
      const element = document.getElementById(`pest-${key}`);
      if (element && element.value.trim()) {
        content += `${element.value}\n`;
      } else {
        content += '暂无内容\n';
      }
      content += '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PEST分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * BCG矩阵分析
 */
export const BCGMatrix = {
  /**
   * 保存BCG矩阵数据
   */
  saveData: () => {
    const quadrants = ['stars', 'cashCows', 'questionMarks', 'dogs'];
    const data = {};
    
    quadrants.forEach(quadrant => {
      const element = document.getElementById(`bcg-${quadrant}`);
      if (element) {
        data[quadrant] = element.value;
      }
    });
    
    localStorage.setItem('bcgMatrixData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载BCG矩阵数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('bcgMatrixData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      const element = document.getElementById(`bcg-${key}`);
      if (element) {
        element.value = value;
      }
    });
  },
  
  /**
   * 导出BCG矩阵分析报告
   */
  exportData: () => {
    const quadrants = {
      stars: '明星业务（Stars）- 高增长、高市场份额',
      cashCows: '现金牛业务（Cash Cows）- 低增长、高市场份额',
      questionMarks: '问题业务（Question Marks）- 高增长、低市场份额',
      dogs: '瘦狗业务（Dogs）- 低增长、低市场份额'
    };
    
    let content = 'BCG矩阵分析报告\n';
    content += '=================\n\n';
    
    Object.entries(quadrants).forEach(([key, label]) => {
      content += `${label}:\n`;
      const element = document.getElementById(`bcg-${key}`);
      if (element && element.value.trim()) {
        content += `${element.value}\n`;
      } else {
        content += '暂无内容\n';
      }
      content += '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BCG矩阵分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * 思维框架工具
 */
export const ThinkingFrameworks = {
  /**
   * 创建自定义思维框架
   * @param {string} name - 框架名称
   * @param {string} description - 框架描述
   * @param {Array} steps - 框架步骤
   */
  createFramework: (name, description, steps) => {
    if (!name.trim()) return false;
    
    const frameworks = ThinkingFrameworks.getFrameworks();
    const newFramework = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      steps: steps || [],
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    frameworks.push(newFramework);
    ThinkingFrameworks.saveFrameworks(frameworks);
    return newFramework;
  },
  
  /**
   * 获取所有思维框架
   * @returns {Array} 框架数组
   */
  getFrameworks: () => {
    const frameworks = localStorage.getItem('thinkingFrameworks');
    if (frameworks) {
      return JSON.parse(frameworks);
    }
    
    // 返回默认框架
    return [
      {
        id: 'first-principles',
        name: '第一性原理思维',
        description: '从最基本的原理出发，层层推导问题的解决方法',
        steps: [
          '确定要解决的问题',
          '分解问题，找到最基本的假设',
          '质疑这些假设是否正确',
          '从基本原理重新构建解决方案'
        ],
        isCustom: false
      },
      {
        id: 'mece',
        name: 'MECE原则',
        description: '相互独立，完全穷尽的思维方式',
        steps: [
          '确定分析的问题范围',
          '将问题分解为多个独立的部分',
          '确保各部分完全覆盖问题的所有方面',
          '检查是否存在重叠或遗漏'
        ],
        isCustom: false
      },
      {
        id: 'scamper',
        name: 'SCAMPER技术',
        description: '通过七个维度激发创意',
        steps: [
          '替代（Substitute）- 有什么可以替代？',
          '组合（Combine）- 可以与什么组合？',
          '适应（Adapt）- 如何调整以适应新情况？',
          '修改（Modify）- 可以做哪些改变？',
          '用途（Put to other uses）- 还有其他用途吗？',
          '消除（Eliminate）- 可以去掉什么？',
          '重排（Rearrange）- 可以重新排列吗？'
        ],
        isCustom: false
      },
      {
        id: 'six-hats',
        name: '六顶思考帽',
        description: '从不同角度思考问题',
        steps: [
          '白色思考帽 - 客观事实和数据',
          '红色思考帽 - 情感和直觉',
          '黑色思考帽 - 谨慎和风险评估',
          '黄色思考帽 - 乐观和积极思考',
          '绿色思考帽 - 创新和可能性',
          '蓝色思考帽 - 控制和组织思考过程'
        ],
        isCustom: false
      }
    ];
  },
  
  /**
   * 保存思维框架
   * @param {Array} frameworks - 框架数组
   */
  saveFrameworks: (frameworks) => {
    localStorage.setItem('thinkingFrameworks', JSON.stringify(frameworks));
  },
  
  /**
   * 删除自定义思维框架
   * @param {string} frameworkId - 框架ID
   */
  deleteFramework: (frameworkId) => {
    const frameworks = ThinkingFrameworks.getFrameworks();
    const filteredFrameworks = frameworks.filter(framework => 
      framework.id !== frameworkId || !framework.isCustom
    );
    ThinkingFrameworks.saveFrameworks(filteredFrameworks);
  },
  
  /**
   * 更新思维框架
   * @param {string} frameworkId - 框架ID
   * @param {Object} updates - 更新的内容
   */
  updateFramework: (frameworkId, updates) => {
    const frameworks = ThinkingFrameworks.getFrameworks();
    const frameworkIndex = frameworks.findIndex(f => f.id === frameworkId && f.isCustom);
    
    if (frameworkIndex !== -1) {
      frameworks[frameworkIndex] = { ...frameworks[frameworkIndex], ...updates };
      ThinkingFrameworks.saveFrameworks(frameworks);
      return true;
    }
    
    return false;
  },
  
  /**
   * 导出思维框架
   * @param {string} frameworkId - 框架ID
   */
  exportFramework: (frameworkId) => {
    const frameworks = ThinkingFrameworks.getFrameworks();
    const framework = frameworks.find(f => f.id === frameworkId);
    
    if (!framework) return;
    
    let content = `${framework.name}\n`;
    content += '='.repeat(framework.name.length) + '\n\n';
    
    if (framework.description) {
      content += `描述: ${framework.description}\n\n`;
    }
    
    if (framework.steps && framework.steps.length > 0) {
      content += '步骤:\n';
      framework.steps.forEach((step, index) => {
        content += `${index + 1}. ${step}\n`;
      });
    }
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${framework.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
// 商业模式模块

import { saveFormData, loadFormData, generateReportContent, downloadTextFile } from '../utils/dataManager.js';
import { $ } from '../utils/dom.js';

/**
 * 商业模式画布功能
 */
export const BusinessModelCanvas = {
  /**
   * 保存商业模式画布数据
   */
  saveData: () => {
    const sections = [
      'keyPartners', 'keyActivities', 'keyResources', 'valuePropositions', 
      'customerRelationships', 'channels', 'customerSegments', 'costStructure', 'revenueStreams'
    ];
    
    return saveFormData('businessModelCanvasData', sections, 'canvas-');
  },
  
  /**
   * 从本地存储加载商业模式画布数据
   */
  loadData: () => {
    return loadFormData('businessModelCanvasData', 'canvas-');
  },
  
  /**
   * 导出商业模式画布报告
   */
  exportReport: () => {
    const sections = {
      keyPartners: '关键合作伙伴',
      keyActivities: '关键业务',
      keyResources: '核心资源',
      valuePropositions: '价值主张',
      customerRelationships: '客户关系',
      channels: '渠道通路',
      customerSegments: '客户细分',
      costStructure: '成本结构',
      revenueStreams: '收入来源'
    };
    
    const getContentCallback = (key) => {
      const element = $(`canvas-${key}`);
      return element && element.value.trim() ? element.value : '暂无内容';
    };
    
    const reportContent = generateReportContent(sections, '商业模式画布分析报告', getContentCallback);
    
    downloadTextFile(reportContent, '商业模式画布分析报告.txt');
  }
};

/**
 * 价值主张画布功能
 */
export const ValuePropositionCanvas = {
  /**
   * 保存价值主张画布数据
   */
  saveData: () => {
    const customerSections = ['jobs', 'pains', 'gains'];
    const productSections = ['products', 'painRelievers', 'gainCreators'];
    
    const data = {};
    
    // 保存客户部分
    customerSections.forEach(section => {
      const element = document.getElementById(`vp-customer-${section}`);
      if (element) {
        data[`customer${section.charAt(0).toUpperCase() + section.slice(1)}`] = element.value;
      }
    });
    
    // 保存产品服务部分
    productSections.forEach(section => {
      const element = document.getElementById(`vp-product-${section}`);
      if (element) {
        data[`product${section.charAt(0).toUpperCase() + section.slice(1)}`] = element.value;
      }
    });
    
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('valuePropositionCanvasData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载价值主张画布数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('valuePropositionCanvasData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'lastUpdated') {
        let elementId = '';
        
        if (key.startsWith('customer')) {
          const section = key.replace('customer', '');
          elementId = `vp-customer-${section.charAt(0).toLowerCase() + section.slice(1)}`;
        } else if (key.startsWith('product')) {
          const section = key.replace('product', '');
          elementId = `vp-product-${section.charAt(0).toLowerCase() + section.slice(1)}`;
        }
        
        const element = document.getElementById(elementId);
        if (element) {
          element.value = value;
        }
      }
    });
  },
  
  /**
   * 导出价值主张画布报告
   */
  exportReport: () => {
    const customerSections = {
      jobs: '客户任务',
      pains: '客户痛点',
      gains: '客户收益'
    };
    
    const productSections = {
      products: '产品与服务',
      painRelievers: '痛点缓解方案',
      gainCreators: '收益创造方案'
    };
    
    let reportContent = '价值主张画布分析报告\n';
    reportContent += '=====================\n\n';
    
    // 客户部分
    reportContent += '【客户概况】\n';
    reportContent += '------------\n';
    Object.entries(customerSections).forEach(([key, label]) => {
      reportContent += `* ${label}:\n`;
      const element = document.getElementById(`vp-customer-${key}`);
      if (element && element.value.trim()) {
        reportContent += element.value + '\n\n';
      } else {
        reportContent += '  暂无内容\n\n';
      }
    });
    
    // 产品服务部分
    reportContent += '【产品与服务】\n';
    reportContent += '------------\n';
    Object.entries(productSections).forEach(([key, label]) => {
      reportContent += `* ${label}:\n`;
      const element = document.getElementById(`vp-product-${key}`);
      if (element && element.value.trim()) {
        reportContent += element.value + '\n\n';
      } else {
        reportContent += '  暂无内容\n\n';
      }
    });
    
    // 生成日期
    reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
    
    // 创建下载链接
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '价值主张画布分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * 精益画布功能
 */
export const LeanCanvas = {
  /**
   * 保存精益画布数据
   */
  saveData: () => {
    const sections = [
      'problem', 'solution', 'keyMetrics', 'uniqueValueProposition', 
      'unfairAdvantage', 'channels', 'customerSegments', 'costStructure', 'revenueStreams'
    ];
    
    const data = {};
    sections.forEach(section => {
      const element = document.getElementById(`lean-${section}`);
      if (element) {
        data[section] = element.value;
      }
    });
    
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('leanCanvasData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载精益画布数据
   */
  loadData: () => {
    const data = JSON.parse(localStorage.getItem('leanCanvasData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'lastUpdated') {
        const element = document.getElementById(`lean-${key}`);
        if (element) {
          element.value = value;
        }
      }
    });
  },
  
  /**
   * 导出精益画布报告
   */
  exportReport: () => {
    const sections = {
      problem: '问题',
      solution: '解决方案',
      keyMetrics: '关键指标',
      uniqueValueProposition: '独特价值主张',
      unfairAdvantage: '竞争优势',
      channels: '渠道',
      customerSegments: '客户细分',
      costStructure: '成本结构',
      revenueStreams: '收入来源'
    };
    
    let reportContent = '精益画布分析报告\n';
    reportContent += '=============\n\n';
    
    Object.entries(sections).forEach(([key, label]) => {
      reportContent += `【${label}】\n`;
      const element = document.getElementById(`lean-${key}`);
      if (element && element.value.trim()) {
        reportContent += element.value + '\n\n';
      } else {
        reportContent += '暂无内容\n\n';
      }
    });
    
    // 生成日期
    reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
    
    // 创建下载链接
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '精益画布分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * 商业模式评估功能
 */
export const BusinessModelEvaluation = {
  /**
   * 保存评估数据
   */
  saveEvaluationData: () => {
    const criteria = [
      'valuePropositionClarity', 'customerSegmentFit', 'revenuePotential',
      'costStructureFeasibility', 'competitiveAdvantage'
    ];
    
    const data = {};
    criteria.forEach(criterion => {
      const element = document.getElementById(`${criterion}-rating`);
      if (element) {
        data[criterion] = parseInt(element.value) || 0;
      }
    });
    
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('businessModelEvaluationData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载评估数据
   */
  loadEvaluationData: () => {
    const data = JSON.parse(localStorage.getItem('businessModelEvaluationData') || '{}');
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'lastUpdated') {
        const element = document.getElementById(`${key}-rating`);
        if (element) {
          element.value = value;
          // 更新星星显示
          BusinessModelEvaluation.updateStars(key, value);
        }
      }
    });
  },
  
  /**
   * 更新星星显示
   * @param {string} criterion - 评估标准
   * @param {number} rating - 评分
   */
  updateStars: (criterion, rating) => {
    const starsContainer = document.getElementById(`${criterion}-stars`);
    if (!starsContainer) return;
    
    // 清空现有星星
    starsContainer.innerHTML = '';
    
    // 创建星星
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = `star ${i <= rating ? 'filled' : 'empty'}`;
      star.textContent = '★';
      star.addEventListener('click', () => {
        // 更新选择框值
        const selectElement = document.getElementById(`${criterion}-rating`);
        if (selectElement) {
          selectElement.value = i;
          // 保存数据
          BusinessModelEvaluation.saveEvaluationData();
          // 更新星星显示
          BusinessModelEvaluation.updateStars(criterion, i);
        }
      });
      starsContainer.appendChild(star);
    }
  },
  
  /**
   * 生成评估报告
   */
  generateReport: () => {
    const criteria = {
      valuePropositionClarity: {
        label: '价值主张清晰度',
        description: '评估商业模式的核心价值主张是否清晰、明确且有吸引力'
      },
      customerSegmentFit: {
        label: '客户细分匹配度',
        description: '评估产品或服务与目标客户需求的匹配程度'
      },
      revenuePotential: {
        label: '收入潜力',
        description: '评估商业模式的收入规模和增长潜力'
      },
      costStructureFeasibility: {
        label: '成本结构可行性',
        description: '评估商业模式的成本结构是否合理且可持续'
      },
      competitiveAdvantage: {
        label: '竞争优势',
        description: '评估商业模式相对于竞争对手的独特优势和壁垒'
      }
    };
    
    let totalScore = 0;
    let criteriaCount = 0;
    
    let reportContent = '商业模式评估报告\n';
    reportContent += '=============\n\n';
    
    Object.entries(criteria).forEach(([key, info]) => {
      const element = document.getElementById(`${key}-rating`);
      const score = element ? parseInt(element.value) || 0 : 0;
      
      reportContent += `【${info.label}】\n`;
      reportContent += `描述: ${info.description}\n`;
      reportContent += `评分: ${score}/5 分\n`;
      reportContent += `评价: ${BusinessModelEvaluation.getRatingText(score)}\n\n`;
      
      totalScore += score;
      criteriaCount++;
    });
    
    // 计算平均得分
    const averageScore = criteriaCount > 0 ? totalScore / criteriaCount : 0;
    
    reportContent += `总体评分: ${averageScore.toFixed(1)}/5 分\n`;
    reportContent += `总体评价: ${BusinessModelEvaluation.getOverallRatingText(averageScore)}\n\n`;
    
    // 生成日期
    reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
    
    return {
      success: true,
      content: reportContent
    };
  },
  
  /**
   * 获取评分文本
   * @param {number} score - 评分（1-5）
   * @returns {string} 评分文本
   */
  getRatingText: (score) => {
    const ratings = {
      0: '未评估',
      1: '很差',
      2: '较差',
      3: '一般',
      4: '良好',
      5: '优秀'
    };
    return ratings[score] || '未评估';
  },
  
  /**
   * 获取总体评分文本
   * @param {number} score - 总体评分
   * @returns {string} 总体评分文本
   */
  getOverallRatingText: (score) => {
    if (score >= 4.5) return '优秀商业模式，具有很强的市场潜力';
    if (score >= 3.5) return '良好商业模式，但仍有改进空间';
    if (score >= 2.5) return '一般商业模式，需要显著改进';
    if (score >= 1.5) return '较差商业模式，需要全面重新审视';
    return '很差商业模式，建议重新设计';
  },
  
  /**
   * 导出评估报告
   */
  exportReport: () => {
    const report = BusinessModelEvaluation.generateReport();
    
    // 创建下载链接
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '商业模式评估报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/**
 * 便利贴功能
 */
export const StickyNotes = {
  /**
   * 添加便利贴
   * @param {string} content - 便利贴内容
   * @param {string} color - 便利贴颜色
   * @param {string} areaId - 区域ID
   */
  addNote: (content, color, areaId) => {
    if (!content.trim() || !areaId) return false;
    
    const noteId = `note-${Date.now()}`;
    const notes = StickyNotes.getNotes(areaId);
    
    const newNote = {
      id: noteId,
      content: content.trim(),
      color: color || '#FFEAA7',
      createdAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    StickyNotes.saveNotes(areaId, notes);
    return newNote;
  },
  
  /**
   * 获取指定区域的便利贴
   * @param {string} areaId - 区域ID
   * @returns {Array} 便利贴数组
   */
  getNotes: (areaId) => {
    const key = `stickyNotes_${areaId}`;
    const notes = localStorage.getItem(key);
    return notes ? JSON.parse(notes) : [];
  },
  
  /**
   * 保存指定区域的便利贴
   * @param {string} areaId - 区域ID
   * @param {Array} notes - 便利贴数组
   */
  saveNotes: (areaId, notes) => {
    const key = `stickyNotes_${areaId}`;
    localStorage.setItem(key, JSON.stringify(notes));
  },
  
  /**
   * 删除便利贴
   * @param {string} noteId - 便利贴ID
   * @param {string} areaId - 区域ID
   */
  deleteNote: (noteId, areaId) => {
    const notes = StickyNotes.getNotes(areaId);
    const filteredNotes = notes.filter(note => note.id !== noteId);
    StickyNotes.saveNotes(areaId, filteredNotes);
  },
  
  /**
   * 更新便利贴
   * @param {string} noteId - 便利贴ID
   * @param {string} areaId - 区域ID
   * @param {Object} updates - 更新内容
   */
  updateNote: (noteId, areaId, updates) => {
    const notes = StickyNotes.getNotes(areaId);
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex !== -1) {
      notes[noteIndex] = { ...notes[noteIndex], ...updates };
      StickyNotes.saveNotes(areaId, notes);
      return true;
    }
    
    return false;
  },
  
  /**
   * 导出便利贴
   * @param {string} areaId - 区域ID
   */
  exportNotes: (areaId) => {
    const notes = StickyNotes.getNotes(areaId);
    
    if (notes.length === 0) return false;
    
    let content = `便利贴导出 - 区域: ${areaId}\n`;
    content += '=====================\n\n';
    
    notes.forEach((note, index) => {
      content += `【便利贴 ${index + 1}】\n`;
      content += `内容: ${note.content}\n`;
      content += `创建时间: ${new Date(note.createdAt).toLocaleString()}\n\n`;
    });
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `便利贴_${areaId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  }
};
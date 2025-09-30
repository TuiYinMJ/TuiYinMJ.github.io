// 应用入口文件

// 导入工具模块
import { getItem, setItem, removeItem } from './utils/storage.js';
import { showMessage, showModal, $, $$ } from './utils/dom.js';

// 导入功能模块
import { SWOT, PorterFiveForces, PESTAnalysis, BCGMatrix, ThinkingFrameworks } from './modules/models.js';
import { MarketAnalysis, CompetitiveAnalysis } from './modules/market.js';
import { BusinessModelCanvas, ValuePropositionCanvas, LeanCanvas, BusinessModelEvaluation, StickyNotes } from './modules/business.js';
import { BusinessPlan } from './modules/businessPlan.js';
import { FinancialPlanning } from './modules/finance.js';

// 导入应用主类
import { BusinessAnalysisApp } from './app.js';

/**
 * 初始化应用
 * 在DOM加载完成后执行
 */
document.addEventListener('DOMContentLoaded', function() {
  // 初始化应用实例
  window.app = new BusinessAnalysisApp();
  
  // 为页面中的元素添加事件监听
  initEventListeners();
  
  // 显示欢迎消息
  showMessage('商业模式分析工具已加载成功', 'success', 3000);
});

/**
 * 初始化所有事件监听器
 */
function initEventListeners() {
  // 页面导航事件
  setupNavigationListeners();
  
  // 商业模式画布事件
  setupBusinessModelCanvasListeners();
  
  // SWOT分析事件
  setupSWOTAnalysisListeners();
  
  // 价值主张画布事件
  setupValuePropositionCanvasListeners();
  
  // 精益画布事件
  setupLeanCanvasListeners();
  
  // 战略框架事件
  setupStrategicFrameworksListeners();
  
  // 思维框架事件
  setupThinkingFrameworksListeners();
  
  // 市场分析事件
  setupMarketAnalysisListeners();
  
  // 竞争分析事件
  setupCompetitiveAnalysisListeners();
  
  // 财务规划事件
  setupFinancialPlanningListeners();
  
  // 商业计划书事件
  setupBusinessPlanListeners();
  
  // 商业模式评估事件
  setupBusinessModelEvaluationListeners();
  
  // 便利贴事件
  setupStickyNotesListeners();
  
  // 全局快捷键事件
  setupGlobalKeyboardShortcuts();
}

/**
 * 设置页面导航事件监听器
 */
function setupNavigationListeners() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      if (window.app) {
        window.app.navigateTo(pageId);
      }
    });
  });
  
  // 移动端菜单按钮
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('mobile-active');
    });
  }
}

/**
 * 设置商业模式画布事件监听器
 */
function setupBusinessModelCanvasListeners() {
  const saveBtn = document.getElementById('save-canvas');
  const exportBtn = document.getElementById('export-canvas');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      BusinessModelCanvas.saveData();
      showMessage('商业模式画布已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      BusinessModelCanvas.exportReport();
    });
  }
  
  // 设置自动保存
  const canvasElements = document.querySelectorAll('[id^="canvas-"]');
  canvasElements.forEach(element => {
    element.addEventListener('input', debounce(function() {
      BusinessModelCanvas.saveData();
    }, 1000));
  });
}

/**
 * 设置SWOT分析事件监听器
 */
function setupSWOTAnalysisListeners() {
  const addButtons = document.querySelectorAll('.add-swot-item');
  const exportBtn = document.getElementById('export-swot');
  
  addButtons.forEach(button => {
    button.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      addSWOTItem(type);
    });
  });
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      exportSWOT();
    });
  }
}

/**
 * 设置价值主张画布事件监听器
 */
function setupValuePropositionCanvasListeners() {
  const saveBtn = document.getElementById('save-vp-canvas');
  const exportBtn = document.getElementById('export-vp-canvas');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      ValuePropositionCanvas.saveData();
      showMessage('价值主张画布已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      ValuePropositionCanvas.exportReport();
    });
  }
  
  // 设置自动保存
  const vpElements = document.querySelectorAll('[id^="vp-"]');
  vpElements.forEach(element => {
    element.addEventListener('input', debounce(function() {
      ValuePropositionCanvas.saveData();
    }, 1000));
  });
}

/**
 * 设置精益画布事件监听器
 */
function setupLeanCanvasListeners() {
  const saveBtn = document.getElementById('save-lean-canvas');
  const exportBtn = document.getElementById('export-lean-canvas');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      LeanCanvas.saveData();
      showMessage('精益画布已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      LeanCanvas.exportReport();
    });
  }
  
  // 设置自动保存
  const leanElements = document.querySelectorAll('[id^="lean-"]');
  leanElements.forEach(element => {
    element.addEventListener('input', debounce(function() {
      LeanCanvas.saveData();
    }, 1000));
  });
}

/**
 * 设置战略框架事件监听器
 */
function setupStrategicFrameworksListeners() {
  // 波特五力模型
  const savePorterBtn = document.getElementById('save-porter');
  const exportPorterBtn = document.getElementById('export-porter');
  
  if (savePorterBtn) {
    savePorterBtn.addEventListener('click', function() {
      PorterFiveForces.saveData();
      showMessage('波特五力分析已保存', 'success');
    });
  }
  
  if (exportPorterBtn) {
    exportPorterBtn.addEventListener('click', function() {
      PorterFiveForces.exportData();
    });
  }
  
  // PEST分析
  const savePestBtn = document.getElementById('save-pest');
  const exportPestBtn = document.getElementById('export-pest');
  
  if (savePestBtn) {
    savePestBtn.addEventListener('click', function() {
      PESTAnalysis.saveData();
      showMessage('PEST分析已保存', 'success');
    });
  }
  
  if (exportPestBtn) {
    exportPestBtn.addEventListener('click', function() {
      PESTAnalysis.exportData();
    });
  }
  
  // BCG矩阵
  const saveBcgBtn = document.getElementById('save-bcg');
  const exportBcgBtn = document.getElementById('export-bcg');
  
  if (saveBcgBtn) {
    saveBcgBtn.addEventListener('click', function() {
      BCGMatrix.saveData();
      showMessage('BCG矩阵分析已保存', 'success');
    });
  }
  
  if (exportBcgBtn) {
    exportBcgBtn.addEventListener('click', function() {
      BCGMatrix.exportData();
    });
  }
}

/**
 * 设置思维框架事件监听器
 */
function setupThinkingFrameworksListeners() {
  const frameworkButtons = document.querySelectorAll('[data-framework]');
  
  frameworkButtons.forEach(button => {
    button.addEventListener('click', function() {
      const frameworkId = this.getAttribute('data-framework');
      const frameworks = ThinkingFrameworks.getFrameworks();
      const framework = frameworks.find(f => f.id === frameworkId);
      
      if (framework && window.app) {
        window.app.showFrameworkDetails(framework);
      }
    });
  });
}

/**
 * 设置市场分析事件监听器
 */
function setupMarketAnalysisListeners() {
  const calculateBtn = document.getElementById('calculate-market-size');
  const saveBtn = document.getElementById('save-market-data');
  const exportBtn = document.getElementById('export-market-analysis');
  
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function() {
      calculateMarketSize();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      MarketAnalysis.saveMarketSizeData();
      MarketAnalysis.saveMarketTrendsData();
      showMessage('市场分析数据已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      generateMarketAnalysisReport();
    });
  }
}

/**
 * 设置竞争分析事件监听器
 */
function setupCompetitiveAnalysisListeners() {
  const addBtn = document.getElementById('add-competitor');
  const exportBtn = document.getElementById('export-competitors');
  
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      if (window.app) {
        window.app.addCompetitor();
      }
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      CompetitiveAnalysis.exportReport();
    });
  }
}

/**
 * 设置财务规划事件监听器
 */
function setupFinancialPlanningListeners() {
  const saveBtn = document.getElementById('save-finance-data');
  const exportBtn = document.getElementById('export-finance-plan');
  const templateBtn = document.getElementById('apply-finance-template');
  const calculateBtn = document.getElementById('calculate-financial-metrics');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      FinancialPlanning.saveData();
      showMessage('财务规划数据已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      FinancialPlanning.exportReport();
    });
  }
  
  if (templateBtn) {
    templateBtn.addEventListener('click', function() {
      FinancialPlanning.applyTemplate();
      showMessage('已应用财务预测模板', 'success');
    });
  }
  
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function() {
      if (window.app) {
        window.app.calculateFinancialMetrics();
      }
    });
  }
}

/**
 * 设置商业计划书事件监听器
 */
function setupBusinessPlanListeners() {
  const saveBtn = document.getElementById('save-business-plan');
  const exportBtn = document.getElementById('export-business-plan');
  const templateBtn = document.getElementById('apply-plan-template');
  const clearBtn = document.getElementById('clear-business-plan');
  const checkBtn = document.getElementById('check-plan-completeness');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      saveBusinessPlan();
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      exportBusinessPlan();
    });
  }
  
  if (templateBtn) {
    templateBtn.addEventListener('click', function() {
      generateBusinessPlanTemplate();
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (confirm('确定要清空所有商业计划书内容吗？此操作不可恢复。')) {
        BusinessPlan.clearData();
        showMessage('商业计划书已清空', 'info');
      }
    });
  }
  
  if (checkBtn) {
    checkBtn.addEventListener('click', function() {
      const result = BusinessPlan.checkCompleteness();
      showModal('商业计划书完整性检查', 
        `<div style="font-size: 14px; line-height: 1.6;">\n\
          <p><strong>完成率: </strong>${result.completionRate}% (${result.completedCount}/${result.totalSections})</p>\n\
          <div style="margin-top: 10px;">\n\
            <p><strong>已完成部分:</strong></p>\n\
            <ul style="margin-left: 20px; margin-top: 5px;">\n\
              ${result.completedSections.map(section => `<li>${section}</li>`).join('') || '<li>无</li>'}\n\
            </ul>\n\
          </div>\n\
          <div style="margin-top: 10px;">\n\
            <p><strong>未完成部分:</strong></p>\n\
            <ul style="margin-left: 20px; margin-top: 5px;">\n\
              ${result.incompleteSections.map(section => `<li>${section}</li>`).join('') || '<li>无</li>'}\n\
            </ul>\n\
          </div>\n\
        </div>`
      );
    });
  }
}

/**
 * 设置商业模式评估事件监听器
 */
function setupBusinessModelEvaluationListeners() {
  const saveBtn = document.getElementById('save-evaluation');
  const exportBtn = document.getElementById('export-evaluation');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      BusinessModelEvaluation.saveEvaluationData();
      showMessage('商业模式评估已保存', 'success');
    });
  }
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      BusinessModelEvaluation.exportReport();
    });
  }
  
  // 初始化星星评分
  const criteria = [
    'valuePropositionClarity', 'customerSegmentFit', 'revenuePotential',
    'costStructureFeasibility', 'competitiveAdvantage'
  ];
  
  criteria.forEach(criterion => {
    const selectElement = document.getElementById(`${criterion}-rating`);
    if (selectElement) {
      selectElement.addEventListener('change', function() {
        BusinessModelEvaluation.updateStars(criterion, parseInt(this.value));
      });
    }
  });
}

/**
 * 设置便利贴事件监听器
 */
function setupStickyNotesListeners() {
  const addNoteBtn = document.getElementById('add-note-btn');
  const noteModal = document.getElementById('note-modal');
  const closeNoteModal = document.getElementById('close-note-modal');
  const saveNoteBtn = document.getElementById('save-note-btn');
  
  if (addNoteBtn && noteModal) {
    addNoteBtn.addEventListener('click', function() {
      noteModal.style.display = 'flex';
    });
  }
  
  if (closeNoteModal && noteModal) {
    closeNoteModal.addEventListener('click', function() {
      noteModal.style.display = 'none';
    });
  }
  
  if (saveNoteBtn && noteModal) {
    saveNoteBtn.addEventListener('click', function() {
      const content = document.getElementById('noteContent').value;
          const color = document.getElementById('noteColor').value;
          const area = document.getElementById('note-area').value;
      
      if (content.trim()) {
        const newNote = StickyNotes.addNote(content, color, area);
        if (newNote && window.app) {
          window.app.renderNote(newNote, area);
          noteModal.style.display = 'none';
          document.getElementById('noteContent').value = '';
        }
      }
    });
  }
}

/**
 * 设置全局快捷键
 */
function setupGlobalKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S 保存当前页面
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (window.app) {
        window.app.saveCurrentPage();
      }
    }
    
    // Ctrl/Cmd + E 导出当前页面
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      if (window.app) {
        window.app.exportCurrentPage();
      }
    }
    
    // Ctrl/Cmd + N 添加便利贴
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const noteModal = document.getElementById('note-modal');
      if (noteModal) {
        noteModal.style.display = 'flex';
      }
    }
  });
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 添加SWOT分析项
 * @param {string} type - SWOT类型
 */
function addSWOTItem(type) {
  const input = document.getElementById(`${type}-input`);
  if (input && input.value.trim()) {
    SWOT.addItem(type, input.value);
    input.value = '';
  }
}

/**
 * 移除SWOT分析项
 * @param {string} itemId - 分析项ID
 */
function removeSWOTItem(itemId) {
  SWOT.removeItem(itemId);
}

/**
 * 导出SWOT分析
 */
function exportSWOT() {
  SWOT.exportData();
}

/**
 * 删除竞争对手
 * @param {string} competitorId - 竞争对手ID
 */
function deleteCompetitor(competitorId) {
  CompetitiveAnalysis.deleteCompetitor(competitorId);
  const competitorElement = document.getElementById(`competitor-${competitorId}`);
  if (competitorElement) {
    competitorElement.remove();
  }
}

/**
 * 删除便利贴
 * @param {string} noteId - 便利贴ID
 * @param {string} areaId - 区域ID
 */
function deleteNote(noteId, areaId) {
  StickyNotes.deleteNote(noteId, areaId);
  const noteElement = document.getElementById(noteId);
  if (noteElement) {
    noteElement.remove();
  }
}

/**
 * 计算市场规模
 */
function calculateMarketSize() {
  if (window.app) {
    window.app.calculateMarketSize();
  }
}

/**
 * 生成市场分析报告
 */
function generateMarketAnalysisReport() {
  MarketAnalysis.exportReport();
}

/**
 * 保存商业计划书
 */
function saveBusinessPlan() {
  BusinessPlan.saveData();
  showMessage('商业计划书已保存', 'success');
}

/**
 * 加载商业计划书
 */
function loadBusinessPlan() {
  BusinessPlan.loadData();
  showMessage('商业计划书已加载', 'success');
}

/**
 * 生成商业计划书模板
 */
function generateBusinessPlanTemplate() {
  BusinessPlan.applyTemplate();
  showMessage('已应用商业计划书模板', 'success');
}

/**
 * 导出商业计划书
 */
function exportBusinessPlan() {
  const result = BusinessPlan.exportReport();
  if (!result.success) {
    showMessage(result.error, 'error');
  }
}

/**
 * 全局函数定义，供HTML直接调用
 */
window.addSWOTItem = addSWOTItem;
window.removeSWOTItem = removeSWOTItem;
window.exportSWOT = exportSWOT;
window.deleteCompetitor = deleteCompetitor;
window.deleteNote = deleteNote;
window.calculateMarketSize = calculateMarketSize;
window.generateMarketAnalysisReport = generateMarketAnalysisReport;
window.saveBusinessPlan = saveBusinessPlan;
window.loadBusinessPlan = loadBusinessPlan;
window.generateBusinessPlanTemplate = generateBusinessPlanTemplate;
window.exportBusinessPlan = exportBusinessPlan;
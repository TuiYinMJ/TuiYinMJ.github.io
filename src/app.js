// 应用主模块 - 整合所有功能模块

// 导入工具模块
import { getItem, setItem, removeItem } from './utils/storage.js';
import { showMessage, showModal, $, $$ } from './utils/dom.js';

// 导入功能模块
import { SWOT, PorterFiveForces, PESTAnalysis, BCGMatrix, ThinkingFrameworks } from './modules/models.js';
import { MarketAnalysis, CompetitiveAnalysis } from './modules/market.js';
import { BusinessModelCanvas, ValuePropositionCanvas, LeanCanvas, BusinessModelEvaluation, StickyNotes } from './modules/business.js';
import { BusinessPlan } from './modules/businessPlan.js';
import { FinancialPlanning } from './modules/finance.js';
import { RFMModel } from './modules/rfm.js';

/**
 * 应用主类
 */
export class BusinessAnalysisApp {
  constructor() {
    // 当前活动页面
    this.activePage = null;
    // 自动保存定时器
    this.autoSaveTimer = null;
    // 初始化应用
    this.init();
  }
  
  /**
   * 初始化应用
   */
  init() {
    // 设置页面导航
    this.setupNavigation();
    
    // 初始化各个模块
    this.initModules();
    
    // 设置全局事件监听
    this.setupEventListeners();
    
    // 加载保存的数据
    this.loadData();
    
    // 显示欢迎消息
    showMessage('欢迎使用商业模式分析工具', 'success', 3000);
  }
  
  /**
   * 设置页面导航
   */
  setupNavigation() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // 从href属性中提取页面ID（去掉#前缀）
        const href = link.getAttribute('href');
        const pageId = href.substring(1); // 移除#符号
        this.navigateTo(pageId);
      });
    });
    
    // 设置移动端菜单
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
      });
    }
  }
  
  /**
   * 导航到指定页面
   * @param {string} pageId - 页面ID
   */
  navigateTo(pageId) {
    // 隐藏所有页面
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.style.display = 'none';
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.style.display = 'block';
      this.activePage = pageId;
      
      // 更新活动导航链接样式
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        link.classList.remove('active');
        // 检查链接的href属性是否匹配当前页面ID（去掉#前缀）
        const href = link.getAttribute('href');
        const linkPageId = href.substring(1); // 移除#符号
        if (linkPageId === pageId) {
          link.classList.add('active');
        }
      });
      
      // 隐藏移动端菜单
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('mobile-active');
      }
      
      // 保存当前页面状态
      setItem('lastActivePage', pageId);
    }
  }
  
  /**
   * 初始化各个模块
   */
  initModules() {
    // 商业模式画布
    this.initBusinessModelCanvas();
    
    // SWOT分析
    this.initSWOTAnalysis();
    
    // 价值主张画布
    this.initValuePropositionCanvas();
    
    // 精益画布
    this.initLeanCanvas();
    
    // 战略框架
    this.initStrategicFrameworks();
    
    // 思维框架
    this.initThinkingFrameworks();
    
    // 市场分析
    this.initMarketAnalysis();
    
    // 竞争分析
    this.initCompetitiveAnalysis();
    
    // 财务规划
    this.initFinancialPlanning();
    
    // 商业计划书
    this.initBusinessPlan();
    
    // 商业模式评估
    this.initBusinessModelEvaluation();
    
    // 便利贴功能
    this.initStickyNotes();
    
    // RFM模型
    this.initRFMModel();
  }
  
  /**
   * 初始化商业模式画布模块
   */
  initBusinessModelCanvas() {
    const saveBtn = document.getElementById('save-canvas');
    const exportBtn = document.getElementById('export-canvas');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        BusinessModelCanvas.saveData();
        showMessage('商业模式画布已保存', 'success');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        BusinessModelCanvas.exportReport();
      });
    }
    
    // 设置自动保存
    const canvasElements = document.querySelectorAll('[id^="canvas-"]');
    canvasElements.forEach(element => {
      element.addEventListener('input', this.debounce(() => {
        BusinessModelCanvas.saveData();
      }, 1000));
    });
  }
  
  /**
   * 初始化SWOT分析模块
   */
  initSWOTAnalysis() {
    const addButtons = document.querySelectorAll('.add-swot-item');
    const exportBtn = document.getElementById('export-swot');
    
    addButtons.forEach(button => {
      button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');
        const input = document.getElementById(`${type}-input`);
        if (input && input.value.trim()) {
          SWOT.addItem(type, input.value);
          input.value = '';
        }
      });
    });
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        SWOT.exportData();
      });
    }
  }
  
  /**
   * 初始化价值主张画布模块
   */
  initValuePropositionCanvas() {
    const saveBtn = document.getElementById('save-vp-canvas');
    const exportBtn = document.getElementById('export-vp-canvas');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        ValuePropositionCanvas.saveData();
        showMessage('价值主张画布已保存', 'success');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        ValuePropositionCanvas.exportReport();
      });
    }
    
    // 设置自动保存 - 选择所有价值主张画布相关的元素
    const vpElements = document.querySelectorAll('#customer-jobs, #pains, #gains, #products-services, #pain-relievers, #gain-creators');
    vpElements.forEach(element => {
      element.addEventListener('input', this.debounce(() => {
        ValuePropositionCanvas.saveData();
      }, 1000));
    });
  }
  
  /**
   * 初始化精益画布模块
   */
  initLeanCanvas() {
    const saveBtn = document.getElementById('save-lean-canvas');
    const exportBtn = document.getElementById('export-lean-canvas');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        LeanCanvas.saveData();
        showMessage('精益画布已保存', 'success');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        LeanCanvas.exportReport();
      });
    }
    
    // 为每个精益画布部分添加点击编辑功能
    const leanSections = document.querySelectorAll('.lean-section');
    leanSections.forEach(section => {
      section.style.cursor = 'pointer';
      section.addEventListener('click', () => {
        const contentElement = section.querySelector('.section-content');
        if (contentElement) {
          const sectionId = contentElement.id;
          const currentContent = contentElement.textContent;
          
          // 创建编辑模态框
          const modal = document.createElement('div');
          modal.className = 'modal';
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          `;
          
          const modalContent = document.createElement('div');
          modalContent.className = 'modal-content';
          modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
          `;
          
          const title = document.createElement('h3');
          title.textContent = section.querySelector('h4').textContent;
          
          const textarea = document.createElement('textarea');
          textarea.value = currentContent;
          textarea.style.width = '100%';
          textarea.style.height = '200px';
          textarea.style.margin = '10px 0';
          
          const buttonContainer = document.createElement('div');
          buttonContainer.style.textAlign = 'right';
          
          const saveButton = document.createElement('button');
          saveButton.className = 'btn';
          saveButton.textContent = '保存';
          saveButton.addEventListener('click', () => {
            contentElement.textContent = textarea.value;
            LeanCanvas.saveData();
            document.body.removeChild(modal);
            showMessage('内容已更新', 'success');
          });
          
          const cancelButton = document.createElement('button');
          cancelButton.className = 'btn';
          cancelButton.textContent = '取消';
          cancelButton.style.marginLeft = '10px';
          cancelButton.addEventListener('click', () => {
            document.body.removeChild(modal);
          });
          
          buttonContainer.appendChild(saveButton);
          buttonContainer.appendChild(cancelButton);
          modalContent.appendChild(title);
          modalContent.appendChild(textarea);
          modalContent.appendChild(buttonContainer);
          modal.appendChild(modalContent);
          
          document.body.appendChild(modal);
          
          // 点击模态框外部关闭模态框
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              document.body.removeChild(modal);
            }
          });
        }
      });
    });
    
    // 设置自动保存
    const leanElements = document.querySelectorAll('[id^="lean-"]');
    leanElements.forEach(element => {
      element.addEventListener('input', this.debounce(() => {
        LeanCanvas.saveData();
      }, 1000));
    });
  }
  
  /**
   * 初始化战略框架模块
   */
  initStrategicFrameworks() {
    // 波特五力模型
    const savePorterBtn = document.getElementById('save-porter');
    const exportPorterBtn = document.getElementById('export-porter');
    
    if (savePorterBtn) {
      savePorterBtn.addEventListener('click', () => {
        PorterFiveForces.saveData();
        showMessage('波特五力分析已保存', 'success');
      });
    }
    
    if (exportPorterBtn) {
      exportPorterBtn.addEventListener('click', () => {
        PorterFiveForces.exportData();
      });
    }
    
    // PEST分析
    const savePestBtn = document.getElementById('save-pest');
    const exportPestBtn = document.getElementById('export-pest');
    
    if (savePestBtn) {
      savePestBtn.addEventListener('click', () => {
        PESTAnalysis.saveData();
        showMessage('PEST分析已保存', 'success');
      });
    }
    
    if (exportPestBtn) {
      exportPestBtn.addEventListener('click', () => {
        PESTAnalysis.exportData();
      });
    }
    
    // BCG矩阵
    const saveBcgBtn = document.getElementById('save-bcg');
    const exportBcgBtn = document.getElementById('export-bcg');
    
    if (saveBcgBtn) {
      saveBcgBtn.addEventListener('click', () => {
        BCGMatrix.saveData();
        showMessage('BCG矩阵分析已保存', 'success');
      });
    }
    
    if (exportBcgBtn) {
      exportBcgBtn.addEventListener('click', () => {
        BCGMatrix.exportData();
      });
    }
  }
  
  /**
   * 初始化思维框架模块
   */
  initThinkingFrameworks() {
    const frameworkButtons = document.querySelectorAll('[data-framework]');
    
    frameworkButtons.forEach(button => {
      button.addEventListener('click', () => {
        const frameworkId = button.getAttribute('data-framework');
        const frameworks = ThinkingFrameworks.getFrameworks();
        const framework = frameworks.find(f => f.id === frameworkId);
        
        if (framework) {
          this.showFrameworkDetails(framework);
        }
      });
    });
  }
  
  /**
   * 初始化市场分析模块
   */
  initMarketAnalysis() {
    const calculateMarketSizeBtn = document.getElementById('calculate-market-size');
    const saveMarketBtn = document.getElementById('save-market-data');
    const exportMarketBtn = document.getElementById('export-market-analysis');
    
    if (calculateMarketSizeBtn) {
      calculateMarketSizeBtn.addEventListener('click', () => {
        this.calculateMarketSize();
      });
    }
    
    if (saveMarketBtn) {
      saveMarketBtn.addEventListener('click', () => {
        MarketAnalysis.saveMarketSizeData();
        MarketAnalysis.saveMarketTrendsData();
        showMessage('市场分析数据已保存', 'success');
      });
    }
    
    if (exportMarketBtn) {
      exportMarketBtn.addEventListener('click', () => {
        MarketAnalysis.exportReport();
      });
    }
  }
  
  /**
   * 初始化竞争分析模块
   */
  initCompetitiveAnalysis() {
    const addCompetitorBtn = document.getElementById('add-competitor');
    const exportCompetitorBtn = document.getElementById('export-competitors');
    
    if (addCompetitorBtn) {
      addCompetitorBtn.addEventListener('click', () => {
        this.addCompetitor();
      });
    }
    
    if (exportCompetitorBtn) {
      exportCompetitorBtn.addEventListener('click', () => {
        CompetitiveAnalysis.exportReport();
      });
    }
  }
  
  /**
   * 初始化财务规划模块
   */
  initFinancialPlanning() {
    const saveFinanceBtn = document.getElementById('save-finance-data');
    const exportFinanceBtn = document.getElementById('export-finance-plan');
    const applyTemplateBtn = document.getElementById('apply-finance-template');
    const calculateMetricsBtn = document.getElementById('calculate-financial-metrics');
    
    if (saveFinanceBtn) {
      saveFinanceBtn.addEventListener('click', () => {
        FinancialPlanning.saveData();
        showMessage('财务规划数据已保存', 'success');
      });
    }
    
    if (exportFinanceBtn) {
      exportFinanceBtn.addEventListener('click', () => {
        FinancialPlanning.exportReport();
      });
    }
    
    if (applyTemplateBtn) {
      applyTemplateBtn.addEventListener('click', () => {
        FinancialPlanning.applyTemplate();
        showMessage('已应用财务预测模板', 'success');
      });
    }
    
    if (calculateMetricsBtn) {
      calculateMetricsBtn.addEventListener('click', () => {
        this.calculateFinancialMetrics();
      });
    }
  }
  
  /**
   * 初始化商业计划书模块
   */
  initBusinessPlan() {
    const savePlanBtn = document.getElementById('save-business-plan');
    const exportPlanBtn = document.getElementById('export-business-plan');
    const applyTemplateBtn = document.getElementById('apply-plan-template');
    const clearPlanBtn = document.getElementById('clear-business-plan');
    const checkCompletenessBtn = document.getElementById('check-plan-completeness');
    
    if (savePlanBtn) {
      savePlanBtn.addEventListener('click', () => {
        BusinessPlan.saveData();
        showMessage('商业计划书已保存', 'success');
      });
    }
    
    if (exportPlanBtn) {
      exportPlanBtn.addEventListener('click', () => {
        const result = BusinessPlan.exportReport();
        if (!result.success) {
          showMessage(result.error, 'error');
        }
      });
    }
    
    if (applyTemplateBtn) {
      applyTemplateBtn.addEventListener('click', () => {
        BusinessPlan.applyTemplate();
        showMessage('已应用商业计划书模板', 'success');
      });
    }
    
    if (clearPlanBtn) {
      clearPlanBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有商业计划书内容吗？此操作不可恢复。')) {
          BusinessPlan.clearData();
          showMessage('商业计划书已清空', 'info');
        }
      });
    }
    
    if (checkCompletenessBtn) {
      checkCompletenessBtn.addEventListener('click', () => {
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
    
    // 设置自动保存
    BusinessPlan.setupAutoSave();
  }
  
  /**
   * 初始化商业模式评估模块
   */
  initBusinessModelEvaluation() {
    const saveEvalBtn = document.getElementById('save-evaluation');
    const exportEvalBtn = document.getElementById('export-evaluation');
    
    if (saveEvalBtn) {
      saveEvalBtn.addEventListener('click', () => {
        BusinessModelEvaluation.saveEvaluationData();
        showMessage('商业模式评估已保存', 'success');
      });
    }
    
    if (exportEvalBtn) {
      exportEvalBtn.addEventListener('click', () => {
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
        selectElement.addEventListener('change', () => {
          BusinessModelEvaluation.updateStars(criterion, parseInt(selectElement.value));
          BusinessModelEvaluation.saveEvaluationData();
        });
      }
    });
  }
  
  /**
   * 初始化便利贴功能
   */
  initStickyNotes() {
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const closeNoteModal = document.getElementById('close-note-modal');
    const saveNoteBtn = document.getElementById('save-note-btn');
    
    if (addNoteBtn && noteModal) {
      addNoteBtn.addEventListener('click', () => {
        noteModal.style.display = 'flex';
      });
    }
    
    if (closeNoteModal && noteModal) {
      closeNoteModal.addEventListener('click', () => {
        noteModal.style.display = 'none';
      });
    }
    
    if (saveNoteBtn && noteModal) {
        saveNoteBtn.addEventListener('click', () => {
          const content = document.getElementById('noteContent').value;
          const color = document.getElementById('noteColor').value;
          const area = document.getElementById('note-area').value;
        
        if (content.trim()) {
          const newNote = StickyNotes.addNote(content, color, area);
          if (newNote) {
            this.renderNote(newNote, area);
            noteModal.style.display = 'none';
            document.getElementById('noteContent').value = '';
          }
        }
      });
    }
  }
  
  /**
   * 初始化RFM模型
   */
  initRFMModel() {
    const saveBtn = document.getElementById('save-rfm');
    const exportBtn = document.getElementById('export-rfm');
    const clearBtn = document.getElementById('clear-rfm');
    const resetCriteriaBtn = document.getElementById('reset-rfm-criteria');
    const calculateBtn = document.getElementById('calculate-rfm');
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        RFMModel.saveData();
        showMessage('RFM模型数据已保存', 'success');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        RFMModel.exportReport();
      });
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        RFMModel.clearData();
        showMessage('RFM模型数据已清除', 'info');
      });
    }
    
    if (resetCriteriaBtn) {
      resetCriteriaBtn.addEventListener('click', () => {
        RFMModel.resetCriteria();
        showMessage('RFM评分标准已重置为默认值', 'info');
      });
    }
    
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => {
        // 这里可以根据实际情况获取客户数据并进行计算
        const customerData = {
          // 这里使用示例数据，实际应用中应从表单获取
          recencyScore: 4,
          frequencyScore: 5,
          monetaryScore: 5
        };
        
        const result = RFMModel.calculateRFMScores(customerData);
        if (result) {
          // 显示计算结果
          showModal('RFM计算结果', 
            `<div style="text-align: left;">\n` +
            `<p><strong>RFM得分:</strong> ${result.recencyScore}-${result.frequencyScore}-${result.monetaryScore}</p>\n` +
            `<p><strong>加权总分:</strong> ${result.weightedScore}</p>\n` +
            `<p><strong>客户细分:</strong> ${result.segment}</p>\n` +
            `<p><strong>细分描述:</strong> ${result.segmentDescription}</p>\n` +
            `</div>`
          );
        } else {
          showMessage('计算失败，请检查输入数据', 'error');
        }
      });
    }
    
    // 设置自动保存
    const rfmElements = document.querySelectorAll('[id^="rfm-"]');
    rfmElements.forEach(element => {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.addEventListener('input', this.debounce(() => {
          RFMModel.saveData();
        }, 2000));
      }
    });
  }
  
  /**
   * 设置全局事件监听
   */
  setupEventListeners() {
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + S 保存当前页面
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveCurrentPage();
      }
      
      // Ctrl/Cmd + E 导出当前页面
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.exportCurrentPage();
      }
    });
    
    // 页面加载完成时
    window.addEventListener('DOMContentLoaded', () => {
      // 恢复最后访问的页面
      const lastPage = getItem('lastActivePage');
      if (lastPage) {
        this.navigateTo(lastPage);
      } else {
        // 默认显示商业模式画布页面
        this.navigateTo('business-model-canvas');
      }
    });
    
    // 页面关闭前保存数据
    window.addEventListener('beforeunload', () => {
      this.saveCurrentPage();
    });
  }
  
  /**
   * 加载保存的数据
   */
  loadData() {
    // 加载商业模式画布数据
    BusinessModelCanvas.loadData();
    
    // 加载SWOT分析数据
    SWOT.loadData();
    
    // 加载价值主张画布数据
    ValuePropositionCanvas.loadData();
    
    // 加载精益画布数据
    LeanCanvas.loadData();
    
    // 加载波特五力模型数据
    PorterFiveForces.loadData();
    
    // 加载PEST分析数据
    PESTAnalysis.loadData();
    
    // 加载BCG矩阵数据
    BCGMatrix.loadData();
    
    // 加载市场分析数据
    MarketAnalysis.loadMarketSizeData();
    MarketAnalysis.loadMarketTrendsData();
    
    // 加载财务规划数据
    FinancialPlanning.loadData();
    
    // 加载商业计划书数据
    BusinessPlan.loadData();
    
    // 加载商业模式评估数据
    BusinessModelEvaluation.loadEvaluationData();
    
    // 加载RFM模型数据
    RFMModel.loadData();
    
    // 加载便利贴
    this.loadStickyNotes();
  }
  
  /**
   * 保存当前页面数据
   */
  saveCurrentPage() {
    switch (this.activePage) {
      case 'business-model-canvas':
        BusinessModelCanvas.saveData();
        break;
      case 'swot-analysis':
        SWOT.saveData();
        break;
      case 'value-proposition-canvas':
        ValuePropositionCanvas.saveData();
        break;
      case 'lean-canvas':
        LeanCanvas.saveData();
        break;
      case 'strategic-frameworks':
        PorterFiveForces.saveData();
        PESTAnalysis.saveData();
        BCGMatrix.saveData();
        break;
      case 'market-analysis':
        MarketAnalysis.saveMarketSizeData();
        MarketAnalysis.saveMarketTrendsData();
        break;
      case 'competitive-analysis':
        // 竞争分析数据已实时保存
        break;
      case 'financial-planning':
        FinancialPlanning.saveData();
        break;
      case 'business-plan':
        BusinessPlan.saveData();
        break;
      case 'business-model-evaluation':
        BusinessModelEvaluation.saveEvaluationData();
        break;
      case 'rfm-analysis':
        RFMModel.saveData();
        break;
    }
    
    showMessage('数据已保存', 'success');
  }
  
  /**
   * 导出当前页面数据
   */
  exportCurrentPage() {
    switch (this.activePage) {
      case 'business-model-canvas':
        BusinessModelCanvas.exportReport();
        break;
      case 'swot-analysis':
        SWOT.exportData();
        break;
      case 'value-proposition-canvas':
        ValuePropositionCanvas.exportReport();
        break;
      case 'lean-canvas':
        LeanCanvas.exportReport();
        break;
      case 'strategic-frameworks':
        // 显示导出选项
        this.showFrameworkExportOptions();
        break;
      case 'market-analysis':
        MarketAnalysis.exportReport();
        break;
      case 'competitive-analysis':
        CompetitiveAnalysis.exportReport();
        break;
      case 'financial-planning':
        FinancialPlanning.exportReport();
        break;
      case 'business-plan':
        BusinessPlan.exportReport();
        break;
      case 'business-model-evaluation':
        BusinessModelEvaluation.exportReport();
        break;
      case 'rfm-analysis':
        RFMModel.exportReport();
        break;
    }
  }
  
  /**
   * 计算市场规模
   */
  calculateMarketSize() {
    const totalMarketSize = parseFloat(document.getElementById('total-market-size')?.value || 0);
    const targetSegmentPercentage = parseFloat(document.getElementById('target-segment-percentage')?.value || 0);
    const marketSharePercentage = parseFloat(document.getElementById('market-share-percentage')?.value || 0);
    
    const result = MarketAnalysis.calculateMarketSize({
      totalMarketSize,
      targetSegmentPercentage,
      marketSharePercentage
    });
    
    if (result.success) {
      // 显示结果
      const { TAM, SAM, SOM, TAMPercentage, SAMPercentage, SOMPercentage } = result.data;
      
      // 显示结果
      const tamResult = document.getElementById('tam-result');
      if (tamResult) tamResult.textContent = TAM.toLocaleString() + ' 元';
      
      const samResult = document.getElementById('sam-result');
      if (samResult) samResult.textContent = SAM.toLocaleString() + ' 元';
      
      const somResult = document.getElementById('som-result');
      if (somResult) somResult.textContent = SOM.toLocaleString() + ' 元';
      
      // 更新进度条
      const tamProgress = document.getElementById('tam-progress');
      if (tamProgress) tamProgress.style.width = TAMPercentage + '%';
      
      const samProgress = document.getElementById('sam-progress');
      if (samProgress) samProgress.style.width = SAMPercentage + '%';
      
      const somProgress = document.getElementById('som-progress');
      if (somProgress) somProgress.style.width = SOMPercentage + '%';
      
      // 保存结果
      MarketAnalysis.saveMarketSizeData();
    } else {
      showMessage(result.error, 'error');
    }
  }
  
  /**
   * 计算财务指标
   */
  calculateFinancialMetrics() {
    const revenue = parseFloat(document.getElementById('finance-revenue')?.value || 0);
    const costOfGoodsSold = parseFloat(document.getElementById('finance-costOfGoodsSold')?.value || 0);
    const operatingExpenses = parseFloat(document.getElementById('finance-operatingExpenses')?.value || 0);
    
    const result = FinancialPlanning.calculateFinancialMetrics({
      revenue,
      costOfGoodsSold,
      operatingExpenses
    });
    
    if (result.success) {
      // 显示结果
      const { grossProfit, grossMargin, netIncome, netMargin, operatingIncome, operatingMargin, breakEvenPoint } = result.data;
      
      // 更新结果显示区域
      const metricsResultArea = document.getElementById('financial-metrics-result');
      if (metricsResultArea) {
        metricsResultArea.innerHTML = `
          <div class="metric-item">
            <span class="metric-label">毛利润:</span>
            <span class="metric-value">${grossProfit.toLocaleString()} 元</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">毛利率:</span>
            <span class="metric-value">${grossMargin}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">营业利润:</span>
            <span class="metric-value">${operatingIncome.toLocaleString()} 元</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">营业利润率:</span>
            <span class="metric-value">${operatingMargin}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">净利润:</span>
            <span class="metric-value">${netIncome.toLocaleString()} 元</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">净利率:</span>
            <span class="metric-value">${netMargin}%</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">盈亏平衡点:</span>
            <span class="metric-value">${breakEvenPoint.toLocaleString()} 元</span>
          </div>
        `;
      }
      
      // 进行财务健康分析
      const healthAnalysis = FinancialPlanning.analyzeFinancialHealth();
      if (healthAnalysis.success) {
        const analysisResultArea = document.getElementById('financial-health-analysis');
        if (analysisResultArea) {
          analysisResultArea.innerHTML = `
            <div class="analysis-section">
              <h4>财务健康评估</h4>
              <p>${healthAnalysis.assessment}</p>
            </div>
            ${healthAnalysis.recommendations.length > 0 ? `
              <div class="analysis-section">
                <h4>改进建议</h4>
                <ul>
                  ${healthAnalysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          `;
        }
      }
    } else {
      showMessage(result.error, 'error');
    }
  }
  
  /**
   * 添加竞争对手
   */
  addCompetitor() {
    showModal('添加竞争对手', 
      `<div style="font-size: 14px;">\n\
        <div style="margin-bottom: 15px;">\n\
          <label for="competitor-name" style="display: block; margin-bottom: 5px;">竞争对手名称:</label>\n\
          <input type="text" id="competitor-name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">\n\
        </div>\n\
        <div style="margin-bottom: 15px;">\n\
          <label for="competitor-strengths" style="display: block; margin-bottom: 5px;">优势:</label>\n\
          <textarea id="competitor-strengths" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>\n\
        </div>\n\
        <div style="margin-bottom: 15px;">\n\
          <label for="competitor-weaknesses" style="display: block; margin-bottom: 5px;">劣势:</label>\n\
          <textarea id="competitor-weaknesses" rows="3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>\n\
        </div>\n\
        <div style="margin-bottom: 15px;">\n\
          <label for="competitor-position" style="display: block; margin-bottom: 5px;">市场地位:</label>\n\
          <textarea id="competitor-position" rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>\n\
        </div>\n\
        <div style="margin-bottom: 15px;">\n\
          <label for="competitor-strategies" style="display: block; margin-bottom: 5px;">战略:</label>\n\
          <textarea id="competitor-strategies" rows="2" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>\n\
        </div>\n\
        <div style="text-align: right;">\n\
          <button id="save-competitor-btn" style="background-color: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">保存</button>\n\
        </div>\n\
      </div>`
    );
    
    // 添加保存按钮事件监听
    setTimeout(() => {
      const saveBtn = document.getElementById('save-competitor-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const name = document.getElementById('competitor-name').value;
          const strengths = document.getElementById('competitor-strengths').value;
          const weaknesses = document.getElementById('competitor-weaknesses').value;
          const marketPosition = document.getElementById('competitor-position').value;
          const strategies = document.getElementById('competitor-strategies').value;
          
          if (name.trim()) {
            const newCompetitor = CompetitiveAnalysis.addCompetitor({
              name,
              strengths,
              weaknesses,
              marketPosition,
              strategies
            });
            
            if (newCompetitor) {
              this.renderCompetitor(newCompetitor);
              // 关闭模态框
              document.querySelector('.modal-overlay').remove();
            }
          }
        });
      }
    }, 100);
  }
  
  /**
   * 显示思维框架详情
   * @param {Object} framework - 思维框架数据
   */
  showFrameworkDetails(framework) {
    let content = `
      <div style="font-size: 14px; line-height: 1.6;">
        <h4 style="margin-top: 0; color: var(--primary-color);">${framework.name}</h4>
        <p style="margin-bottom: 15px;">${framework.description}</p>
        
        <h5 style="margin-top: 20px;">应用步骤:</h5>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
    `;
    
    if (framework.steps && framework.steps.length > 0) {
      framework.steps.forEach(step => {
        content += `<li style="margin-bottom: 8px;">${step}</li>`;
      });
    }
    
    content += `
        </ol>
        
        ${framework.isCustom ? `
        <div style="text-align: right; margin-top: 20px;">
          <button id="delete-framework-btn" style="background-color: var(--error-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 10px;">删除</button>
          <button id="update-framework-btn" style="background-color: var(--secondary-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">编辑</button>
        </div>
        ` : ''}
        
        <div style="text-align: right; margin-top: 20px;">
          <button id="export-framework-btn" style="background-color: var(--primary-color); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">导出</button>
        </div>
      </div>
    `;
    
    const modal = showModal(framework.name, content);
    
    // 添加导出按钮事件监听
    setTimeout(() => {
      const exportBtn = document.getElementById('export-framework-btn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          ThinkingFrameworks.exportFramework(framework.id);
          modal.close();
        });
      }
      
      // 添加删除按钮事件监听（仅自定义框架）
      const deleteBtn = document.getElementById('delete-framework-btn');
      if (deleteBtn && framework.isCustom) {
        deleteBtn.addEventListener('click', () => {
          if (confirm(`确定要删除"${framework.name}"吗？`)) {
            ThinkingFrameworks.deleteFramework(framework.id);
            modal.close();
            // 刷新框架列表
            this.refreshThinkingFrameworks();
          }
        });
      }
      
      // 添加编辑按钮事件监听（仅自定义框架）
      const updateBtn = document.getElementById('update-framework-btn');
      if (updateBtn && framework.isCustom) {
        updateBtn.addEventListener('click', () => {
          // 显示编辑模态框
          this.showEditFrameworkModal(framework);
          modal.close();
        });
      }
    }, 100);
  }
  
  /**
   * 显示编辑框架模态框
   * @param {Object} framework - 思维框架数据
   */
  showEditFrameworkModal(framework) {
    // 实现编辑框架功能
    // ...
  }
  
  /**
   * 显示框架导出选项
   */
  showFrameworkExportOptions() {
    showModal('选择要导出的框架', 
      `<div style="font-size: 14px;">\n\
        <div style="margin-bottom: 15px;">\n\
          <button id="export-porter-btn" style="display: block; width: 100%; text-align: left; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">波特五力模型</button>\n\
          <button id="export-pest-btn" style="display: block; width: 100%; text-align: left; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">PEST分析</button>\n\
          <button id="export-bcg-btn" style="display: block; width: 100%; text-align: left; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">BCG矩阵</button>\n\
        </div>\n\
      </div>`
    );
    
    // 添加按钮事件监听
    setTimeout(() => {
      const exportPorterBtn = document.getElementById('export-porter-btn');
      if (exportPorterBtn) {
        exportPorterBtn.addEventListener('click', () => {
          PorterFiveForces.exportData();
          document.querySelector('.modal-overlay').remove();
        });
      }
      
      const exportPestBtn = document.getElementById('export-pest-btn');
      if (exportPestBtn) {
        exportPestBtn.addEventListener('click', () => {
          PESTAnalysis.exportData();
          document.querySelector('.modal-overlay').remove();
        });
      }
      
      const exportBcgBtn = document.getElementById('export-bcg-btn');
      if (exportBcgBtn) {
        exportBcgBtn.addEventListener('click', () => {
          BCGMatrix.exportData();
          document.querySelector('.modal-overlay').remove();
        });
      }
    }, 100);
  }
  
  /**
   * 渲染竞争对手卡片
   * @param {Object} competitor - 竞争对手数据
   */
  renderCompetitor(competitor) {
    const container = document.getElementById('competitors-container');
    if (!container) return;
    
    const competitorCard = document.createElement('div');
    competitorCard.className = 'competitor-card';
    competitorCard.innerHTML = `
      <div class="competitor-header">
        <h4>${competitor.name}</h4>
        <button class="delete-btn" onclick="deleteCompetitor('${competitor.id}')">删除</button>
      </div>
      ${competitor.strengths ? `<div class="competitor-section"><strong>优势:</strong> ${competitor.strengths}</div>` : ''}
      ${competitor.weaknesses ? `<div class="competitor-section"><strong>劣势:</strong> ${competitor.weaknesses}</div>` : ''}
      ${competitor.marketPosition ? `<div class="competitor-section"><strong>市场地位:</strong> ${competitor.marketPosition}</div>` : ''}
      ${competitor.strategies ? `<div class="competitor-section"><strong>战略:</strong> ${competitor.strategies}</div>` : ''}
    `;
    
    container.appendChild(competitorCard);
  }
  
  /**
   * 渲染便利贴
   * @param {Object} note - 便利贴数据
   * @param {string} areaId - 区域ID
   */
  renderNote(note, areaId) {
    const container = document.getElementById(`${areaId}-notes`);
    if (!container) return;
    
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.id = note.id;
    noteElement.style.backgroundColor = note.color;
    noteElement.innerHTML = `
      <div class="note-content">${note.content}</div>
      <button class="delete-note-btn" onclick="deleteNote('${note.id}', '${areaId}')">×</button>
    `;
    
    container.appendChild(noteElement);
  }
  
  /**
   * 加载便利贴
   */
  loadStickyNotes() {
    const areas = ['business-model-canvas', 'swot-analysis', 'value-proposition-canvas', 'lean-canvas'];
    
    areas.forEach(area => {
      const notes = StickyNotes.getNotes(area);
      notes.forEach(note => {
        this.renderNote(note, area);
      });
    });
  }
  
  /**
   * 刷新思维框架列表
   */
  refreshThinkingFrameworks() {
    // 实现刷新框架列表功能
    // ...
  }
  
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce(func, wait) {
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
}

/**
 * 创建全局应用实例
 */
window.app = new BusinessAnalysisApp();

/**
 * 全局函数定义
 */

/**
 * 添加SWOT分析项
 * @param {string} type - SWOT类型
 */
window.addSWOTItem = function(type) {
  const input = document.getElementById(`${type}-input`);
  if (input && input.value.trim()) {
    SWOT.addItem(type, input.value);
    input.value = '';
  }
};

/**
 * 移除SWOT分析项
 * @param {string} itemId - 分析项ID
 */
window.removeSWOTItem = function(itemId) {
  SWOT.removeItem(itemId);
};

/**
 * 导出SWOT分析
 */
window.exportSWOT = function() {
  SWOT.exportData();
};

/**
 * 删除竞争对手
 * @param {string} competitorId - 竞争对手ID
 */
window.deleteCompetitor = function(competitorId) {
  CompetitiveAnalysis.deleteCompetitor(competitorId);
  const competitorElement = document.getElementById(`competitor-${competitorId}`);
  if (competitorElement) {
    competitorElement.remove();
  }
};

/**
 * 删除便利贴
 * @param {string} noteId - 便利贴ID
 * @param {string} areaId - 区域ID
 */
window.deleteNote = function(noteId, areaId) {
  StickyNotes.deleteNote(noteId, areaId);
  const noteElement = document.getElementById(noteId);
  if (noteElement) {
    noteElement.remove();
  }
};

/**
 * 计算市场规模
 */
window.calculateMarketSize = function() {
  app.calculateMarketSize();
};

/**
 * 生成市场分析报告
 */
window.generateMarketAnalysisReport = function() {
  MarketAnalysis.exportReport();
};

/**
 * 保存商业计划书
 */
window.saveBusinessPlan = function() {
  BusinessPlan.saveData();
  showMessage('商业计划书已保存', 'success');
};

/**
 * 加载商业计划书
 */
window.loadBusinessPlan = function() {
  BusinessPlan.loadData();
  showMessage('商业计划书已加载', 'success');
};

/**
 * 生成商业计划书模板
 */
window.generateBusinessPlanTemplate = function() {
  BusinessPlan.applyTemplate();
  showMessage('已应用商业计划书模板', 'success');
};

/**
 * 导出商业计划书
 */
window.exportBusinessPlan = function() {
  const result = BusinessPlan.exportReport();
  if (!result.success) {
    showMessage(result.error, 'error');
  }
};
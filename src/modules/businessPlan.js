// 商业计划书模块

import { saveFormData, loadFormData, generateReportContent, downloadTextFile, clearFormData } from '../utils/dataManager.js';
import { $ } from '../utils/dom.js';
import { eventManager, ErrorUtils } from '../utils/advancedUtils.js';

/**
 * 商业计划书功能
 */
export const BusinessPlan = {
  /**
   * 自动保存计时器
   */
  autoSaveTimer: null,
  
  /**
   * 保存商业计划书数据
   */
  saveData: () => {
    return ErrorUtils.safeExecute(() => {
      const sections = [
        'executiveSummary', 'companyDescription', 'marketAnalysis',
        'organizationManagement', 'serviceProductLine', 'marketingSalesStrategy',
        'fundingRequest', 'financialProjections', 'appendix'
      ];
      
      const result = saveFormData('businessPlanData', sections, 'business-plan-');
      
      // 触发事件
      eventManager.emit('businessPlan:dataSaved', result);
      
      return result;
    });
  },
  
  /**
   * 从本地存储加载商业计划书数据
   */
  loadData: () => {
    return ErrorUtils.safeExecute(() => {
      const result = loadFormData('businessPlanData', 'business-plan-');
      
      // 触发事件
      eventManager.emit('businessPlan:dataLoaded', result);
      
      return result;
    });
  },
  
  /**
   * 生成商业计划书模板
   * @returns {Object} 模板数据
   */
  generateTemplate: () => {
    return {
      executiveSummary: '在此输入执行摘要，简明扼要地介绍您的商业理念、产品/服务、目标市场、竞争优势以及财务需求等核心内容。\n\n执行摘要应能吸引读者继续阅读完整的商业计划，建议控制在1-2页。',
      companyDescription: '在此输入公司描述，包括：\n1. 公司名称和定位\n2. 公司使命和愿景\n3. 公司历史和发展阶段\n4. 核心价值观\n5. 法律结构（独资、合伙、有限公司等）',
      marketAnalysis: '在此输入市场分析，包括：\n1. 行业概览和趋势\n2. 目标市场规模（TAM、SAM、SOM）\n3. 目标客户特征和需求\n4. 竞争格局分析\n5. 市场机会和挑战',
      organizationManagement: '在此输入组织与管理结构，包括：\n1. 核心管理团队介绍（背景、经验）\n2. 组织架构图\n3. 关键顾问和董事会成员\n4. 人员招聘计划\n5. 员工培训和发展政策',
      serviceProductLine: '在此输入产品与服务介绍，包括：\n1. 核心产品/服务描述\n2. 产品/服务的独特价值\n3. 产品开发阶段和时间表\n4. 知识产权保护\n5. 未来产品/服务规划',
      marketingSalesStrategy: '在此输入市场营销与销售策略，包括：\n1. 品牌定位\n2. 定价策略\n3. 销售渠道\n4. 促销和广告计划\n5. 客户获取和 retention 策略',
      fundingRequest: '在此输入资金需求，包括：\n1. 所需资金总额\n2. 资金用途明细\n3. 投资回报预测\n4. 退出策略\n5. 资金使用时间表',
      financialProjections: '在此输入财务预测，包括：\n1. 损益表预测（至少3年）\n2. 现金流预测\n3. 资产负债表\n4. 关键财务指标分析\n5. 盈亏平衡分析',
      appendix: '在此输入附录内容，包括：\n1. 市场调研数据\n2. 产品原型或样品图片\n3. 法律文件\n4. 详细的财务模型\n5. 其他支持性材料'
    };
  },
  
  /**
   * 应用商业计划书模板
   */
  applyTemplate: () => {
    return ErrorUtils.safeExecute(() => {
      const template = BusinessPlan.generateTemplate();
      
      Object.entries(template).forEach(([key, value]) => {
        const element = $(`business-plan-${key}`);
        if (element) {
          element.value = value;
        }
      });
      
      // 保存模板数据
      BusinessPlan.saveData();
      
      // 触发事件
      eventManager.emit('businessPlan:templateApplied', template);
      
      return true;
    }, false);
  },
  
  /**
   * 清空商业计划书内容
   */
  clearData: () => {
    return ErrorUtils.safeExecute(() => {
      const sections = [
        'executiveSummary', 'companyDescription', 'marketAnalysis',
        'organizationManagement', 'serviceProductLine', 'marketingSalesStrategy',
        'fundingRequest', 'financialProjections', 'appendix'
      ];
      
      clearFormData(sections, 'business-plan-');
      
      // 清除本地存储
      localStorage.removeItem('businessPlanData');
      
      // 触发事件
      eventManager.emit('businessPlan:dataCleared');
      
      return true;
    }, false);
  },
  
  /**
   * 生成商业计划书报告
   * @returns {Object} 报告结果
   */
  generateReport: () => {
    return ErrorUtils.safeExecute(() => {
      const sections = {
        executiveSummary: '执行摘要',
        companyDescription: '公司描述',
        marketAnalysis: '市场分析',
        organizationManagement: '组织与管理',
        serviceProductLine: '产品与服务',
        marketingSalesStrategy: '市场营销与销售策略',
        fundingRequest: '资金需求',
        financialProjections: '财务预测',
        appendix: '附录'
      };
      
      // 检查是否有内容
      let hasContent = false;
      
      Object.entries(sections).forEach(([key, label]) => {
        const element = $(`business-plan-${key}`);
        const content = element ? element.value.trim() : '';
        
        if (content) {
          hasContent = true;
        }
      });
      
      if (!hasContent) {
        return {
          success: false,
          error: '商业计划书内容为空，请先填写内容后再导出'
        };
      }
      
      const getContentCallback = (key) => {
        const element = $(`business-plan-${key}`);
        const content = element ? element.value.trim() : '';
        if (content) {
          const index = Object.keys(sections).indexOf(key) + 1;
          const header = `第 ${index} 章 ${sections[key]}\n` + '='.repeat(sections[key].length + 8) + '\n\n';
          return header + content + '\n\n\n';
        }
        return '';
      };
      
      const reportContent = generateReportContent(sections, '商业计划书', getContentCallback);
      
      // 触发事件
      eventManager.emit('businessPlan:reportGenerated', reportContent);
      
      return {
        success: true,
        content: reportContent
      };
    }, {
      success: false,
      error: '生成报告时发生错误'
    });
  },
  
  /**
   * 导出商业计划书
   * @returns {Object} 导出结果
   */
  exportReport: () => {
    return ErrorUtils.safeExecute(() => {
      const report = BusinessPlan.generateReport();
      
      if (!report.success) {
        return report;
      }
      
      downloadTextFile(report.content, '商业计划书.txt');
      
      // 触发事件
      eventManager.emit('businessPlan:reportExported', report.content);
      
      return report;
    }, {
      success: false,
      error: '导出报告时发生错误'
    });
  },
  
  /**
   * 检查商业计划书完整性
   * @returns {Object} 完整性检查结果
   */
  checkCompleteness: () => {
    return ErrorUtils.safeExecute(() => {
      const sections = {
        executiveSummary: '执行摘要',
        companyDescription: '公司描述',
        marketAnalysis: '市场分析',
        organizationManagement: '组织与管理',
        serviceProductLine: '产品与服务',
        marketingSalesStrategy: '市场营销与销售策略',
        fundingRequest: '资金需求',
        financialProjections: '财务预测',
        appendix: '附录'
      };
      
      const completedSections = [];
      const incompleteSections = [];
      
      Object.entries(sections).forEach(([key, label]) => {
        const element = $(`business-plan-${key}`);
        const content = element ? element.value.trim() : '';
        
        if (content && content.length > 50) { // 假设内容超过50个字符才算完成
          completedSections.push(label);
        } else {
          incompleteSections.push(label);
        }
      });
      
      const completionRate = (completedSections.length / Object.keys(sections).length) * 100;
      
      const result = {
        completionRate: Math.round(completionRate),
        completedSections,
        incompleteSections,
        totalSections: Object.keys(sections).length,
        completedCount: completedSections.length
      };
      
      // 触发事件
      eventManager.emit('businessPlan:completenessChecked', result);
      
      return result;
    }, {
      completionRate: 0,
      completedSections: [],
      incompleteSections: [],
      totalSections: 9,
      completedCount: 0
    });
  },
  
  /**
   * 获取商业计划书指南
   * @param {string} section - 部分名称
   * @returns {string} 指南内容
   */
  getGuide: (section) => {
    return ErrorUtils.safeExecute(() => {
      const guides = {
        executiveSummary: '执行摘要指南：\n\n- 简明扼要地介绍您的商业理念\n- 概括产品/服务的核心价值\n- 简要描述目标市场和竞争优势\n- 提及财务需求和预期成果\n- 保持在1-2页内，突出重点',
        companyDescription: '公司描述指南：\n\n- 说明公司的定位和使命\n- 描述公司的历史和发展阶段\n- 解释核心价值观和文化\n- 说明公司的法律结构\n- 提及公司的长期愿景',
        marketAnalysis: '市场分析指南：\n\n- 分析行业趋势和市场规模\n- 定义目标客户群体和需求\n- 评估竞争格局和市场机会\n- 使用数据支持您的分析\n- 识别潜在风险和挑战',
        organizationManagement: '组织与管理指南：\n\n- 介绍核心管理团队成员及其背景\n- 描述公司的组织架构\n- 提及关键顾问和外部支持\n- 说明人员招聘和培训计划\n- 解释团队的核心竞争力',
        serviceProductLine: '产品与服务指南：\n\n- 详细描述您的产品或服务\n- 解释其独特价值和创新点\n- 说明产品开发阶段和时间表\n- 提及知识产权保护措施\n- 描述未来产品扩展计划',
        marketingSalesStrategy: '市场营销与销售策略指南：\n\n- 定义品牌定位和营销策略\n- 说明定价策略的依据\n- 描述销售渠道和合作伙伴\n- 解释促销和客户获取计划\n- 提及客户 retention 策略',
        fundingRequest: '资金需求指南：\n\n- 明确所需资金总额\n- 详细列出资金用途\n- 说明资金使用时间表\n- 提供投资回报预测\n- 解释可能的退出策略',
        financialProjections: '财务预测指南：\n\n- 提供至少3年的损益表预测\n- 包含现金流预测和资产负债表\n- 分析关键财务指标\n- 进行盈亏平衡分析\n- 说明预测的假设基础',
        appendix: '附录指南：\n\n- 包含支持性市场调研数据\n- 添加产品原型或样品图片\n- 附上相关法律文件\n- 提供详细的财务模型\n- 添加其他有助于理解商业计划的材料'
      };
      
      return guides[section] || '暂无指南内容';
    }, '暂无指南内容');
  },
  
  /**
   * 设置自动保存
   * @param {number} interval - 自动保存间隔（毫秒）
   */
  setupAutoSave: (interval = 30000) => {
    return ErrorUtils.safeExecute(() => {
      // 清除之前的自动保存
      if (BusinessPlan.autoSaveTimer) {
        clearInterval(BusinessPlan.autoSaveTimer);
      }
      
      // 设置新的自动保存
      BusinessPlan.autoSaveTimer = setInterval(() => {
        BusinessPlan.saveData();
      }, interval);
      
      // 触发事件
      eventManager.emit('businessPlan:autoSaveSet', interval);
      
      return BusinessPlan.autoSaveTimer;
    }, null);
  },
  
  /**
   * 停止自动保存
   */
  stopAutoSave: () => {
    ErrorUtils.safeExecute(() => {
      if (BusinessPlan.autoSaveTimer) {
        clearInterval(BusinessPlan.autoSaveTimer);
        BusinessPlan.autoSaveTimer = null;
      }
      
      // 触发事件
      eventManager.emit('businessPlan:autoSaveStopped');
    });
  }
};
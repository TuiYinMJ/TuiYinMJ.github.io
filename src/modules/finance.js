// 财务规划模块

import { saveFormData, loadFormData, downloadTextFile } from '../utils/dataManager.js';
import { $ } from '../utils/dom.js';

/**
 * 财务预测功能
 */
export const FinancialPlanning = {
  /**
   * 保存财务预测数据
   */
  saveData: () => {
    const sections = [
      'revenue', 'costOfGoodsSold', 'grossProfit', 'operatingExpenses', 
      'netIncome', 'cashFlow', 'balanceSheet'
    ];
    
    return saveFormData('financialPlanningData', sections, 'finance-');
  },
  
  /**
   * 从本地存储加载财务预测数据
   */
  loadData: () => {
    return loadFormData('financialPlanningData', 'finance-');
  },
  
  /**
   * 计算财务指标
   * @param {Object} financialData - 财务数据
   * @returns {Object} 计算结果
   */
  calculateFinancialMetrics: (financialData) => {
    try {
      const { revenue, costOfGoodsSold, operatingExpenses } = financialData;
      
      // 确保数据有效
      if (!revenue || revenue <= 0) {
        throw new Error('请输入有效的收入数据');
      }
      
      // 计算毛利润
      const grossProfit = revenue - (costOfGoodsSold || 0);
      
      // 计算毛利率
      const grossMargin = (grossProfit / revenue) * 100;
      
      // 计算净利润
      const netIncome = grossProfit - (operatingExpenses || 0);
      
      // 计算净利率
      const netMargin = (netIncome / revenue) * 100;
      
      // 计算营业利润率
      const operatingIncome = grossProfit - (operatingExpenses || 0);
      const operatingMargin = (operatingIncome / revenue) * 100;
      
      // 简单的盈亏平衡点计算
      const breakEvenPoint = costOfGoodsSold && operatingExpenses 
        ? (operatingExpenses / (1 - (costOfGoodsSold / revenue))) 
        : 0;
      
      return {
        success: true,
        data: {
          grossProfit: Math.round(grossProfit * 100) / 100,
          grossMargin: Math.round(grossMargin * 100) / 100,
          netIncome: Math.round(netIncome * 100) / 100,
          netMargin: Math.round(netMargin * 100) / 100,
          operatingIncome: Math.round(operatingIncome * 100) / 100,
          operatingMargin: Math.round(operatingMargin * 100) / 100,
          breakEvenPoint: Math.round(breakEvenPoint * 100) / 100
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 生成财务预测报告
   */
  generateReport: () => {
    const sections = {
      revenue: '收入预测',
      costOfGoodsSold: '产品成本',
      grossProfit: '毛利润',
      operatingExpenses: '运营费用',
      netIncome: '净利润',
      cashFlow: '现金流预测',
      balanceSheet: '资产负债表'
    };
    
    let reportContent = '财务规划报告\n';
    reportContent += '=============\n\n';
    
    // 收集基本财务数据
    const revenue = parseFloat(document.getElementById('finance-revenue')?.value || 0);
    const costOfGoodsSold = parseFloat(document.getElementById('finance-costOfGoodsSold')?.value || 0);
    const operatingExpenses = parseFloat(document.getElementById('finance-operatingExpenses')?.value || 0);
    
    // 计算财务指标
    const metricsResult = FinancialPlanning.calculateFinancialMetrics({
      revenue,
      costOfGoodsSold,
      operatingExpenses
    });
    
    // 添加财务指标部分
    if (metricsResult.success) {
      reportContent += '【关键财务指标】\n';
      reportContent += '-----------------\n';
      reportContent += `收入: ${revenue.toLocaleString()} 元\n`;
      reportContent += `产品成本: ${costOfGoodsSold.toLocaleString()} 元\n`;
      reportContent += `毛利润: ${metricsResult.data.grossProfit.toLocaleString()} 元 (毛利率: ${metricsResult.data.grossMargin}%)\n`;
      reportContent += `运营费用: ${operatingExpenses.toLocaleString()} 元\n`;
      reportContent += `营业利润: ${metricsResult.data.operatingIncome.toLocaleString()} 元 (营业利润率: ${metricsResult.data.operatingMargin}%)\n`;
      reportContent += `净利润: ${metricsResult.data.netIncome.toLocaleString()} 元 (净利率: ${metricsResult.data.netMargin}%)\n`;
      reportContent += `盈亏平衡点: ${metricsResult.data.breakEvenPoint.toLocaleString()} 元\n\n`;
    }
    
    // 添加详细财务规划部分
    reportContent += '【详细财务规划】\n';
    reportContent += '-----------------\n';
    
    Object.entries(sections).forEach(([key, label]) => {
      const element = document.getElementById(`finance-${key}`);
      const content = element ? element.value.trim() : '';
      
      if (content) {
        reportContent += `【${label}】\n`;
        reportContent += content + '\n\n';
      }
    });
    
    // 生成日期
    reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
    
    return {
      success: true,
      content: reportContent
    };
  },
  
  /**
   * 导出财务规划报告
   */
  exportReport: () => {
    const report = FinancialPlanning.generateReport();
    
    if (!report.success) {
      return report;
    }
    
    // 创建下载链接
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '财务规划报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return report;
  },
  
  /**
   * 生成财务预测模板
   * @returns {Object} 模板数据
   */
  generateTemplate: () => {
    return {
      revenue: '收入预测\n\n第一年:\n- 产品A销售: 200,000元\n- 产品B销售: 150,000元\n- 服务收入: 50,000元\n总计: 400,000元\n\n第二年:\n- 产品A销售: 350,000元\n- 产品B销售: 250,000元\n- 服务收入: 100,000元\n总计: 700,000元\n\n第三年:\n- 产品A销售: 500,000元\n- 产品B销售: 400,000元\n- 服务收入: 200,000元\n总计: 1,100,000元',
      costOfGoodsSold: '产品成本\n\n第一年:\n- 原材料成本: 80,000元\n- 生产成本: 60,000元\n- 物流成本: 20,000元\n总计: 160,000元\n\n第二年:\n- 原材料成本: 140,000元\n- 生产成本: 100,000元\n- 物流成本: 35,000元\n总计: 275,000元\n\n第三年:\n- 原材料成本: 200,000元\n- 生产成本: 150,000元\n- 物流成本: 50,000元\n总计: 400,000元',
      grossProfit: '毛利润计算\n\n第一年: 400,000 - 160,000 = 240,000元 (毛利率: 60%)\n第二年: 700,000 - 275,000 = 425,000元 (毛利率: 60.7%)\n第三年: 1,100,000 - 400,000 = 700,000元 (毛利率: 63.6%)',
      operatingExpenses: '运营费用\n\n第一年:\n- 工资薪金: 120,000元\n- 租金: 48,000元\n- 营销费用: 30,000元\n- 研发费用: 20,000元\n- 其他费用: 10,000元\n总计: 228,000元\n\n第二年:\n- 工资薪金: 180,000元\n- 租金: 54,000元\n- 营销费用: 60,000元\n- 研发费用: 40,000元\n- 其他费用: 15,000元\n总计: 349,000元\n\n第三年:\n- 工资薪金: 240,000元\n- 租金: 60,000元\n- 营销费用: 90,000元\n- 研发费用: 70,000元\n- 其他费用: 20,000元\n总计: 480,000元',
      netIncome: '净利润计算\n\n第一年: 240,000 - 228,000 = 12,000元 (净利率: 3%)\n第二年: 425,000 - 349,000 = 76,000元 (净利率: 10.9%)\n第三年: 700,000 - 480,000 = 220,000元 (净利率: 20%)',
      cashFlow: '现金流预测\n\n第一年:\n- 经营活动现金流: 15,000元\n- 投资活动现金流: -50,000元\n- 融资活动现金流: 100,000元\n净现金流: 65,000元\n\n第二年:\n- 经营活动现金流: 80,000元\n- 投资活动现金流: -30,000元\n- 融资活动现金流: 0元\n净现金流: 50,000元\n\n第三年:\n- 经营活动现金流: 230,000元\n- 投资活动现金流: -80,000元\n- 融资活动现金流: 0元\n净现金流: 150,000元',
      balanceSheet: '资产负债表\n\n第一年期末:\n资产:\n- 流动资产: 100,000元\n- 固定资产: 50,000元\n总资产: 150,000元\n\n负债:\n- 短期负债: 30,000元\n- 长期负债: 0元\n总负债: 30,000元\n\n所有者权益: 120,000元\n\n第二年期末:\n资产:\n- 流动资产: 180,000元\n- 固定资产: 70,000元\n总资产: 250,000元\n\n负债:\n- 短期负债: 20,000元\n- 长期负债: 0元\n总负债: 20,000元\n\n所有者权益: 230,000元\n\n第三年期末:\n资产:\n- 流动资产: 300,000元\n- 固定资产: 100,000元\n总资产: 400,000元\n\n负债:\n- 短期负债: 0元\n- 长期负债: 50,000元\n总负债: 50,000元\n\n所有者权益: 350,000元'
    };
  },
  
  /**
   * 应用财务预测模板
   */
  applyTemplate: () => {
    const template = FinancialPlanning.generateTemplate();
    
    Object.entries(template).forEach(([key, value]) => {
      const element = document.getElementById(`finance-${key}`);
      if (element) {
        element.value = value;
      }
    });
    
    // 保存模板数据
    FinancialPlanning.saveData();
  },
  
  /**
   * 清空财务预测数据
   */
  clearData: () => {
    const sections = [
      'revenue', 'costOfGoodsSold', 'grossProfit', 'operatingExpenses', 
      'netIncome', 'cashFlow', 'balanceSheet'
    ];
    
    sections.forEach(section => {
      const element = document.getElementById(`finance-${section}`);
      if (element) {
        element.value = '';
      }
    });
    
    // 清除本地存储
    localStorage.removeItem('financialPlanningData');
  },
  
  /**
   * 分析财务健康状况
   * @returns {Object} 分析结果
   */
  analyzeFinancialHealth: () => {
    const revenue = parseFloat(document.getElementById('finance-revenue')?.value || 0);
    const costOfGoodsSold = parseFloat(document.getElementById('finance-costOfGoodsSold')?.value || 0);
    const operatingExpenses = parseFloat(document.getElementById('finance-operatingExpenses')?.value || 0);
    
    // 计算财务指标
    const metricsResult = FinancialPlanning.calculateFinancialMetrics({
      revenue,
      costOfGoodsSold,
      operatingExpenses
    });
    
    if (!metricsResult.success) {
      return metricsResult;
    }
    
    const { grossMargin, netMargin, operatingMargin } = metricsResult.data;
    
    // 评估财务健康状况
    let healthAssessment = '';
    let recommendations = [];
    
    // 评估毛利率
    if (grossMargin >= 50) {
      healthAssessment += '毛利率良好 (≥50%)，表明产品/服务具有较强的盈利能力。\n';
    } else if (grossMargin >= 30) {
      healthAssessment += '毛利率一般 (30%-49%)，仍有提升空间。\n';
    } else {
      healthAssessment += '毛利率较低 (<30%)，需要关注成本控制或定价策略。\n';
      recommendations.push('审视并优化产品成本结构');
      recommendations.push('评估定价策略是否合理');
    }
    
    // 评估净利率
    if (netMargin >= 15) {
      healthAssessment += '净利率良好 (≥15%)，整体盈利能力较强。\n';
    } else if (netMargin >= 5) {
      healthAssessment += '净利率一般 (5%-14%)，需要控制运营成本。\n';
    } else if (netMargin >= 0) {
      healthAssessment += '净利率较低 (0%-4%)，盈利能力较弱。\n';
      recommendations.push('严格控制运营费用');
      recommendations.push('寻找提高收入的途径');
    } else {
      healthAssessment += '处于亏损状态，需要立即采取措施改善财务状况。\n';
      recommendations.push('紧急评估并减少所有非必要支出');
      recommendations.push('考虑短期融资或收入增长策略');
      recommendations.push('重新审视商业模式的可行性');
    }
    
    // 评估运营利润率
    if (operatingMargin >= 10) {
      healthAssessment += '运营利润率良好 (≥10%)，核心业务运营效率较高。\n';
    } else if (operatingMargin >= 0) {
      healthAssessment += '运营利润率一般 (0%-9%)，需要提高运营效率。\n';
      recommendations.push('优化内部流程，提高运营效率');
    } else {
      healthAssessment += '运营亏损，核心业务模式可能存在问题。\n';
      recommendations.push('重新评估核心业务模式');
      recommendations.push('考虑业务转型或收缩策略');
    }
    
    return {
      success: true,
      assessment: healthAssessment,
      recommendations: recommendations.filter((item, index) => recommendations.indexOf(item) === index) // 去重
    };
  }
};
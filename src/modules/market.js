// 市场分析模块
import { $ } from '../utils/dom.js';
import { eventManager, ErrorUtils } from '../utils/advancedUtils.js';
import { downloadTextFile } from '../utils/dataManager.js';

/**
 * 市场规模分析功能
 */
export const MarketAnalysis = {
  /**
   * 计算TAM、SAM和SOM
   * @param {Object} data - 市场数据
   * @returns {Object} 计算结果
   */
  calculateMarketSize: (data) => {
    return ErrorUtils.safeExecute(() => {
      // 确保数据有效
      const { totalMarketSize, targetSegmentPercentage, marketSharePercentage } = data;
      
      if (!totalMarketSize || totalMarketSize <= 0) {
        throw new Error('请输入有效的整体市场规模');
      }
      
      if (!targetSegmentPercentage || targetSegmentPercentage < 0 || targetSegmentPercentage > 100) {
        throw new Error('目标细分市场占比应在0-100之间');
      }
      
      if (!marketSharePercentage || marketSharePercentage < 0 || marketSharePercentage > 100) {
        throw new Error('预期市场份额应在0-100之间');
      }
      
      // 计算TAM (Total Addressable Market)
      const TAM = totalMarketSize;
      
      // 计算SAM (Serviceable Addressable Market)
      const SAM = TAM * (targetSegmentPercentage / 100);
      
      // 计算SOM (Serviceable Obtainable Market)
      const SOM = SAM * (marketSharePercentage / 100);
      
      return {
        success: true,
        data: {
          TAM: Math.round(TAM * 100) / 100,
          SAM: Math.round(SAM * 100) / 100,
          SOM: Math.round(SOM * 100) / 100,
          TAMPercentage: 100,
          SAMPercentage: targetSegmentPercentage,
          SOMPercentage: marketSharePercentage
        }
      };
    }, { success: false, error: '计算市场规模时发生错误' });
  },
  
  /**
   * 保存市场规模分析数据
   */
  saveMarketSizeData: () => {
    ErrorUtils.safeExecute(() => {
      const totalMarketSize = $('#total-market-size')?.value;
      const targetSegmentPercentage = $('#target-segment-percentage')?.value;
      const marketSharePercentage = $('#market-share-percentage')?.value;
      
      const data = {
        totalMarketSize: parseFloat(totalMarketSize) || 0,
        targetSegmentPercentage: parseFloat(targetSegmentPercentage) || 0,
        marketSharePercentage: parseFloat(marketSharePercentage) || 0,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('marketSizeData', JSON.stringify(data));
      
      // 触发事件
      eventManager.emit('marketAnalysis:marketSizeDataSaved', data);
    });
  },
  
  /**
   * 从本地存储加载市场规模分析数据
   */
  loadMarketSizeData: () => {
    ErrorUtils.safeExecute(() => {
      const data = JSON.parse(localStorage.getItem('marketSizeData') || '{}');
      
      if (data.totalMarketSize !== undefined) {
        const totalMarketSizeEl = $('#total-market-size');
        if (totalMarketSizeEl) totalMarketSizeEl.value = data.totalMarketSize;
      }
      
      if (data.targetSegmentPercentage !== undefined) {
        const targetSegmentPercentageEl = $('#target-segment-percentage');
        if (targetSegmentPercentageEl) targetSegmentPercentageEl.value = data.targetSegmentPercentage;
      }
      
      if (data.marketSharePercentage !== undefined) {
        const marketSharePercentageEl = $('#market-share-percentage');
        if (marketSharePercentageEl) marketSharePercentageEl.value = data.marketSharePercentage;
      }
      
      // 触发事件
      eventManager.emit('marketAnalysis:marketSizeDataLoaded', data);
    });
  },
  
  /**
   * 保存市场趋势分析数据
   */
  saveMarketTrendsData: () => {
    ErrorUtils.safeExecute(() => {
      const marketTrends = $('#market-trends')?.value || '';
      const competitiveLandscape = $('#competitive-landscape')?.value || '';
      
      const data = {
        marketTrends,
        competitiveLandscape,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('marketTrendsData', JSON.stringify(data));
      
      // 触发事件
      eventManager.emit('marketAnalysis:marketTrendsDataSaved', data);
    });
  },
  
  /**
   * 从本地存储加载市场趋势分析数据
   */
  loadMarketTrendsData: () => {
    ErrorUtils.safeExecute(() => {
      const data = JSON.parse(localStorage.getItem('marketTrendsData') || '{}');
      
      if (data.marketTrends !== undefined) {
        const marketTrendsEl = $('#market-trends');
        if (marketTrendsEl) marketTrendsEl.value = data.marketTrends;
      }
      
      if (data.competitiveLandscape !== undefined) {
        const competitiveLandscapeEl = $('#competitive-landscape');
        if (competitiveLandscapeEl) competitiveLandscapeEl.value = data.competitiveLandscape;
      }
      
      // 触发事件
      eventManager.emit('marketAnalysis:marketTrendsDataLoaded', data);
    });
  },
  
  /**
   * 生成市场分析报告
   */
  generateReport: () => {
    return ErrorUtils.safeExecute(() => {
      // 收集市场规模数据
      const totalMarketSize = parseFloat($('#total-market-size')?.value || 0);
      const targetSegmentPercentage = parseFloat($('#target-segment-percentage')?.value || 0);
      const marketSharePercentage = parseFloat($('#market-share-percentage')?.value || 0);
      
      // 收集市场趋势数据
      const marketTrends = $('#market-trends')?.value || '';
      const competitiveLandscape = $('#competitive-landscape')?.value || '';
      
      // 计算TAM, SAM, SOM
      const TAM = totalMarketSize;
      const SAM = TAM * (targetSegmentPercentage / 100);
      const SOM = SAM * (marketSharePercentage / 100);
      
      // 构建报告内容
      let reportContent = '市场分析报告\n';
      reportContent += '=============\n\n';
      
      // 市场规模分析部分
      reportContent += '一、市场规模分析\n';
      reportContent += '-----------------\n';
      reportContent += `整体市场规模 (TAM): ${TAM.toLocaleString()} 元\n`;
      reportContent += `目标细分市场规模 (SAM): ${SAM.toLocaleString()} 元 (${targetSegmentPercentage}% 的整体市场)\n`;
      reportContent += `可获得市场规模 (SOM): ${SOM.toLocaleString()} 元 (${marketSharePercentage}% 的目标细分市场)\n\n`;
      
      // 市场趋势分析部分
      reportContent += '二、市场趋势分析\n';
      reportContent += '-----------------\n';
      if (marketTrends.trim()) {
        reportContent += marketTrends + '\n\n';
      } else {
        reportContent += '暂无市场趋势分析内容\n\n';
      }
      
      // 竞争格局分析部分
      reportContent += '三、竞争格局分析\n';
      reportContent += '-----------------\n';
      if (competitiveLandscape.trim()) {
        reportContent += competitiveLandscape + '\n\n';
      } else {
        reportContent += '暂无竞争格局分析内容\n\n';
      }
      
      // 生成日期
      reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
      
      // 触发事件
      eventManager.emit('marketAnalysis:reportGenerated', reportContent);
      
      return {
        success: true,
        content: reportContent
      };
    }, { success: false, error: '生成市场分析报告时发生错误' });
  },
  
  /**
   * 导出市场分析报告
   */
  exportReport: () => {
    return ErrorUtils.safeExecute(() => {
      const report = MarketAnalysis.generateReport();
      
      if (!report.success) {
        return report;
      }
      
      downloadTextFile(report.content, '市场分析报告.txt');
      
      // 触发事件
      eventManager.emit('marketAnalysis:reportExported');
      
      return report;
    }, { success: false, error: '导出市场分析报告时发生错误' });
  }
};

/**
 * 竞争分析功能
 */
export const CompetitiveAnalysis = {
  /**
   * 添加竞争对手
   * @param {Object} competitorData - 竞争对手数据
   */
  addCompetitor: (competitorData) => {
    return ErrorUtils.safeExecute(() => {
      const { name, strengths, weaknesses, marketPosition, strategies } = competitorData;
      
      if (!name.trim()) return false;
      
      const competitors = CompetitiveAnalysis.getCompetitors();
      const newCompetitor = {
        id: `competitor-${Date.now()}`,
        name: name.trim(),
        strengths: strengths || '',
        weaknesses: weaknesses || '',
        marketPosition: marketPosition || '',
        strategies: strategies || '',
        createdAt: new Date().toISOString()
      };
      
      competitors.push(newCompetitor);
      CompetitiveAnalysis.saveCompetitors(competitors);
      
      // 触发事件
      eventManager.emit('competitiveAnalysis:competitorAdded', newCompetitor);
      
      return newCompetitor;
    }, false);
  },
  
  /**
   * 获取所有竞争对手
   * @returns {Array} 竞争对手数组
   */
  getCompetitors: () => {
    const competitors = localStorage.getItem('competitors');
    return competitors ? JSON.parse(competitors) : [];
  },
  
  /**
   * 保存竞争对手数据
   * @param {Array} competitors - 竞争对手数组
   */
  saveCompetitors: (competitors) => {
    ErrorUtils.safeExecute(() => {
      localStorage.setItem('competitors', JSON.stringify(competitors));
      
      // 触发事件
      eventManager.emit('competitiveAnalysis:competitorsSaved', competitors);
    });
  },
  
  /**
   * 删除竞争对手
   * @param {string} competitorId - 竞争对手ID
   */
  deleteCompetitor: (competitorId) => {
    ErrorUtils.safeExecute(() => {
      const competitors = CompetitiveAnalysis.getCompetitors();
      const filteredCompetitors = competitors.filter(c => c.id !== competitorId);
      CompetitiveAnalysis.saveCompetitors(filteredCompetitors);
      
      // 触发事件
      eventManager.emit('competitiveAnalysis:competitorDeleted', competitorId);
    });
  },
  
  /**
   * 更新竞争对手
   * @param {string} competitorId - 竞争对手ID
   * @param {Object} updates - 更新的数据
   */
  updateCompetitor: (competitorId, updates) => {
    return ErrorUtils.safeExecute(() => {
      const competitors = CompetitiveAnalysis.getCompetitors();
      const competitorIndex = competitors.findIndex(c => c.id === competitorId);
      
      if (competitorIndex !== -1) {
        competitors[competitorIndex] = { 
          ...competitors[competitorIndex], 
          ...updates,
          updatedAt: new Date().toISOString()
        };
        CompetitiveAnalysis.saveCompetitors(competitors);
        
        // 触发事件
        eventManager.emit('competitiveAnalysis:competitorUpdated', competitors[competitorIndex]);
        
        return true;
      }
      
      return false;
    }, false);
  },
  
  /**
   * 生成竞争分析报告
   */
  generateReport: () => {
    return ErrorUtils.safeExecute(() => {
      const competitors = CompetitiveAnalysis.getCompetitors();
      
      let reportContent = '竞争分析报告\n';
      reportContent += '=============\n\n';
      
      if (competitors.length > 0) {
        competitors.forEach((competitor, index) => {
          reportContent += `${index + 1}. ${competitor.name}\n`;
          reportContent += '   ' + '-'.repeat(competitor.name.length) + '\n';
          
          if (competitor.strengths) {
            reportContent += `   优势: ${competitor.strengths}\n`;
          }
          
          if (competitor.weaknesses) {
            reportContent += `   劣势: ${competitor.weaknesses}\n`;
          }
          
          if (competitor.marketPosition) {
            reportContent += `   市场地位: ${competitor.marketPosition}\n`;
          }
          
          if (competitor.strategies) {
            reportContent += `   战略: ${competitor.strategies}\n`;
          }
          
          reportContent += '\n';
        });
      } else {
        reportContent += '暂无竞争对手数据\n\n';
      }
      
      // 生成日期
      reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
      
      // 触发事件
      eventManager.emit('competitiveAnalysis:reportGenerated', reportContent);
      
      return {
        success: true,
        content: reportContent
      };
    }, { success: false, error: '生成竞争分析报告时发生错误' });
  },
  
  /**
   * 导出竞争分析报告
   */
  exportReport: () => {
    return ErrorUtils.safeExecute(() => {
      const report = CompetitiveAnalysis.generateReport();
      
      if (!report.success) {
        return report;
      }
      
      downloadTextFile(report.content, '竞争分析报告.txt');
      
      // 触发事件
      eventManager.emit('competitiveAnalysis:reportExported');
      
      return report;
    }, { success: false, error: '导出竞争分析报告时发生错误' });
  }
};
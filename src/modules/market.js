// 市场分析模块

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
    try {
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
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 保存市场规模分析数据
   */
  saveMarketSizeData: () => {
    const totalMarketSize = document.getElementById('total-market-size')?.value;
    const targetSegmentPercentage = document.getElementById('target-segment-percentage')?.value;
    const marketSharePercentage = document.getElementById('market-share-percentage')?.value;
    
    const data = {
      totalMarketSize: parseFloat(totalMarketSize) || 0,
      targetSegmentPercentage: parseFloat(targetSegmentPercentage) || 0,
      marketSharePercentage: parseFloat(marketSharePercentage) || 0,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('marketSizeData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载市场规模分析数据
   */
  loadMarketSizeData: () => {
    const data = JSON.parse(localStorage.getItem('marketSizeData') || '{}');
    
    if (data.totalMarketSize !== undefined) {
      const totalMarketSizeEl = document.getElementById('total-market-size');
      if (totalMarketSizeEl) totalMarketSizeEl.value = data.totalMarketSize;
    }
    
    if (data.targetSegmentPercentage !== undefined) {
      const targetSegmentPercentageEl = document.getElementById('target-segment-percentage');
      if (targetSegmentPercentageEl) targetSegmentPercentageEl.value = data.targetSegmentPercentage;
    }
    
    if (data.marketSharePercentage !== undefined) {
      const marketSharePercentageEl = document.getElementById('market-share-percentage');
      if (marketSharePercentageEl) marketSharePercentageEl.value = data.marketSharePercentage;
    }
  },
  
  /**
   * 保存市场趋势分析数据
   */
  saveMarketTrendsData: () => {
    const marketTrends = document.getElementById('market-trends')?.value || '';
    const competitiveLandscape = document.getElementById('competitive-landscape')?.value || '';
    
    const data = {
      marketTrends,
      competitiveLandscape,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('marketTrendsData', JSON.stringify(data));
  },
  
  /**
   * 从本地存储加载市场趋势分析数据
   */
  loadMarketTrendsData: () => {
    const data = JSON.parse(localStorage.getItem('marketTrendsData') || '{}');
    
    if (data.marketTrends !== undefined) {
      const marketTrendsEl = document.getElementById('market-trends');
      if (marketTrendsEl) marketTrendsEl.value = data.marketTrends;
    }
    
    if (data.competitiveLandscape !== undefined) {
      const competitiveLandscapeEl = document.getElementById('competitive-landscape');
      if (competitiveLandscapeEl) competitiveLandscapeEl.value = data.competitiveLandscape;
    }
  },
  
  /**
   * 生成市场分析报告
   */
  generateReport: () => {
    try {
      // 收集市场规模数据
      const totalMarketSize = parseFloat(document.getElementById('total-market-size')?.value || 0);
      const targetSegmentPercentage = parseFloat(document.getElementById('target-segment-percentage')?.value || 0);
      const marketSharePercentage = parseFloat(document.getElementById('market-share-percentage')?.value || 0);
      
      // 收集市场趋势数据
      const marketTrends = document.getElementById('market-trends')?.value || '';
      const competitiveLandscape = document.getElementById('competitive-landscape')?.value || '';
      
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
      
      return {
        success: true,
        content: reportContent
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * 导出市场分析报告
   */
  exportReport: () => {
    const report = MarketAnalysis.generateReport();
    
    if (!report.success) {
      return report;
    }
    
    // 创建下载链接
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '市场分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return report;
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
    return newCompetitor;
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
    localStorage.setItem('competitors', JSON.stringify(competitors));
  },
  
  /**
   * 删除竞争对手
   * @param {string} competitorId - 竞争对手ID
   */
  deleteCompetitor: (competitorId) => {
    const competitors = CompetitiveAnalysis.getCompetitors();
    const filteredCompetitors = competitors.filter(c => c.id !== competitorId);
    CompetitiveAnalysis.saveCompetitors(filteredCompetitors);
  },
  
  /**
   * 更新竞争对手
   * @param {string} competitorId - 竞争对手ID
   * @param {Object} updates - 更新的数据
   */
  updateCompetitor: (competitorId, updates) => {
    const competitors = CompetitiveAnalysis.getCompetitors();
    const competitorIndex = competitors.findIndex(c => c.id === competitorId);
    
    if (competitorIndex !== -1) {
      competitors[competitorIndex] = { ...competitors[competitorIndex], ...updates };
      CompetitiveAnalysis.saveCompetitors(competitors);
      return true;
    }
    
    return false;
  },
  
  /**
   * 生成竞争分析报告
   */
  generateReport: () => {
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
    
    return {
      success: true,
      content: reportContent
    };
  },
  
  /**
   * 导出竞争分析报告
   */
  exportReport: () => {
    const report = CompetitiveAnalysis.generateReport();
    
    // 创建下载链接
    const blob = new Blob([report.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '竞争分析报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return report;
  }
};
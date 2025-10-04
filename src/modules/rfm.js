import { $ } from '../utils/dom.js';
import { ErrorUtils, eventManager } from '../utils/advancedUtils.js';
import { saveFormData, loadFormData, generateReportContent, downloadTextFile } from '../utils/dataManager.js';

/**
 * RFM模型分析
 * RFM是一种客户细分技术，基于客户的最近购买时间(Recency)、购买频率(Frequency)和消费金额(Monetary)
 */
export const RFMModel = {
  /**
   * 保存RFM分析数据
   */
  saveData: () => {
    ErrorUtils.safeExecute(() => {
      const fields = ['customerCount', 'recencyWeight', 'frequencyWeight', 'monetaryWeight', 'analysisNotes'];
      saveFormData('rfmModelData', fields, 'rfm-');
      
      // 保存RFM评分标准
      const rfmCriteria = {
        recency: {
          score1: $(`rfm-recency-score1`).value,
          score2: $(`rfm-recency-score2`).value,
          score3: $(`rfm-recency-score3`).value,
          score4: $(`rfm-recency-score4`).value,
          score5: $(`rfm-recency-score5`).value
        },
        frequency: {
          score1: $(`rfm-frequency-score1`).value,
          score2: $(`rfm-frequency-score2`).value,
          score3: $(`rfm-frequency-score3`).value,
          score4: $(`rfm-frequency-score4`).value,
          score5: $(`rfm-frequency-score5`).value
        },
        monetary: {
          score1: $(`rfm-monetary-score1`).value,
          score2: $(`rfm-monetary-score2`).value,
          score3: $(`rfm-monetary-score3`).value,
          score4: $(`rfm-monetary-score4`).value,
          score5: $(`rfm-monetary-score5`).value
        }
      };
      
      localStorage.setItem('rfmCriteriaData', JSON.stringify(rfmCriteria));
      
      // 触发事件
      eventManager.emit('rfmModel:dataSaved');
    });
  },
  
  /**
   * 从本地存储加载RFM分析数据
   */
  loadData: () => {
    ErrorUtils.safeExecute(() => {
      loadFormData('rfmModelData', 'rfm-');
      
      // 加载RFM评分标准
      const rfmCriteria = JSON.parse(localStorage.getItem('rfmCriteriaData') || '{}');
      
      if (rfmCriteria.recency) {
        $(`rfm-recency-score1`).value = rfmCriteria.recency.score1 || '';
        $(`rfm-recency-score2`).value = rfmCriteria.recency.score2 || '';
        $(`rfm-recency-score3`).value = rfmCriteria.recency.score3 || '';
        $(`rfm-recency-score4`).value = rfmCriteria.recency.score4 || '';
        $(`rfm-recency-score5`).value = rfmCriteria.recency.score5 || '';
      }
      
      if (rfmCriteria.frequency) {
        $(`rfm-frequency-score1`).value = rfmCriteria.frequency.score1 || '';
        $(`rfm-frequency-score2`).value = rfmCriteria.frequency.score2 || '';
        $(`rfm-frequency-score3`).value = rfmCriteria.frequency.score3 || '';
        $(`rfm-frequency-score4`).value = rfmCriteria.frequency.score4 || '';
        $(`rfm-frequency-score5`).value = rfmCriteria.frequency.score5 || '';
      }
      
      if (rfmCriteria.monetary) {
        $(`rfm-monetary-score1`).value = rfmCriteria.monetary.score1 || '';
        $(`rfm-monetary-score2`).value = rfmCriteria.monetary.score2 || '';
        $(`rfm-monetary-score3`).value = rfmCriteria.monetary.score3 || '';
        $(`rfm-monetary-score4`).value = rfmCriteria.monetary.score4 || '';
        $(`rfm-monetary-score5`).value = rfmCriteria.monetary.score5 || '';
      }
      
      // 触发事件
      eventManager.emit('rfmModel:dataLoaded');
    });
  },
  
  /**
   * 计算RFM得分
   * @param {Object} customerData - 客户数据对象
   * @returns {Object} RFM得分和细分结果
   */
  calculateRFMScores: (customerData) => {
    return ErrorUtils.safeExecute(() => {
      if (!customerData || typeof customerData !== 'object') {
        return null;
      }
      
      // 获取RFM评分标准
      const rfmCriteria = JSON.parse(localStorage.getItem('rfmCriteriaData') || '{}');
      
      // 默认评分标准
      const defaultCriteria = {
        recency: {
          score5: '30天内',
          score4: '31-60天',
          score3: '61-90天',
          score2: '91-180天',
          score1: '180天以上'
        },
        frequency: {
          score5: '10次以上',
          score4: '5-9次',
          score3: '3-4次',
          score2: '2次',
          score1: '1次'
        },
        monetary: {
          score5: '10000元以上',
          score4: '5000-9999元',
          score3: '2000-4999元',
          score2: '500-1999元',
          score1: '500元以下'
        }
      };
      
      // 使用加载的评分标准或默认标准
      const criteria = {
        recency: rfmCriteria.recency || defaultCriteria.recency,
        frequency: rfmCriteria.frequency || defaultCriteria.frequency,
        monetary: rfmCriteria.monetary || defaultCriteria.monetary
      };
      
      // 计算得分（这里简化了实际计算逻辑，实际应用中需要根据具体数据格式调整）
      const recencyScore = customerData.recencyScore || 3;
      const frequencyScore = customerData.frequencyScore || 3;
      const monetaryScore = customerData.monetaryScore || 3;
      
      // 获取权重
      const recencyWeight = parseFloat($('rfm-recencyWeight').value || 1);
      const frequencyWeight = parseFloat($('rfm-frequencyWeight').value || 1);
      const monetaryWeight = parseFloat($('rfm-monetaryWeight').value || 1);
      
      // 计算加权总分
      const weightedScore = 
        (recencyScore * recencyWeight + 
         frequencyScore * frequencyWeight + 
         monetaryScore * monetaryWeight) / 
        (recencyWeight + frequencyWeight + monetaryWeight);
      
      // 确定客户细分
      let segment = '';
      let segmentDescription = '';
      
      if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore >= 4) {
        segment = '重要价值客户';
        segmentDescription = '最近购买、频繁购买且消费金额高的客户，是企业的核心客户群体';
      } else if (recencyScore >= 4 && frequencyScore < 4 && monetaryScore >= 4) {
        segment = '重要发展客户';
        segmentDescription = '最近购买且消费金额高，但购买频率低的客户，有潜力成为重要价值客户';
      } else if (recencyScore < 4 && frequencyScore >= 4 && monetaryScore >= 4) {
        segment = '重要保持客户';
        segmentDescription = '消费金额高且购买频率高，但最近没有购买的客户，需要重新激活';
      } else if (recencyScore >= 4 && frequencyScore >= 4 && monetaryScore < 4) {
        segment = '一般价值客户';
        segmentDescription = '最近购买且购买频率高，但消费金额较低的客户';
      } else if (recencyScore >= 4 && frequencyScore < 4 && monetaryScore < 4) {
        segment = '新客户';
        segmentDescription = '最近有购买记录，但购买频率和消费金额都较低的客户';
      } else if (recencyScore < 4 && frequencyScore >= 4 && monetaryScore < 4) {
        segment = '一般保持客户';
        segmentDescription = '购买频率高，但最近没有购买且消费金额较低的客户';
      } else if (recencyScore < 4 && frequencyScore < 4 && monetaryScore >= 4) {
        segment = '重要挽留客户';
        segmentDescription = '消费金额高，但最近没有购买且购买频率低的客户，需要重点挽留';
      } else {
        segment = '其他客户';
        segmentDescription = '最近没有购买、购买频率低且消费金额低的客户';
      }
      
      return {
        recencyScore,
        frequencyScore,
        monetaryScore,
        weightedScore: Math.round(weightedScore * 10) / 10,
        segment,
        segmentDescription,
        criteria
      };
    }, null);
  },
  
  /**
   * 导出RFM分析报告
   */
  exportReport: () => {
    ErrorUtils.safeExecute(() => {
      const sections = {
        basicInfo: '基本信息',
        rfmCriteria: 'RFM评分标准',
        analysisResult: '分析结果',
        recommendations: '建议策略',
        notes: '分析备注'
      };
      
      const getContent = (key) => {
        switch (key) {
          case 'basicInfo':
            return `客户总数: ${$('rfm-customerCount').value || '未填写'}\n` +
                   `最近购买权重: ${$('rfm-recencyWeight').value || '1'}\n` +
                   `购买频率权重: ${$('rfm-frequencyWeight').value || '1'}\n` +
                   `消费金额权重: ${$('rfm-monetaryWeight').value || '1'}`;
          
          case 'rfmCriteria':
            const rfmCriteria = JSON.parse(localStorage.getItem('rfmCriteriaData') || '{}');
            let criteriaContent = '\n最近购买时间(Recency):\n';
            criteriaContent += `  5分: ${rfmCriteria.recency?.score5 || '30天内'}\n`;
            criteriaContent += `  4分: ${rfmCriteria.recency?.score4 || '31-60天'}\n`;
            criteriaContent += `  3分: ${rfmCriteria.recency?.score3 || '61-90天'}\n`;
            criteriaContent += `  2分: ${rfmCriteria.recency?.score2 || '91-180天'}\n`;
            criteriaContent += `  1分: ${rfmCriteria.recency?.score1 || '180天以上'}\n\n`;
            
            criteriaContent += '购买频率(Frequency):\n';
            criteriaContent += `  5分: ${rfmCriteria.frequency?.score5 || '10次以上'}\n`;
            criteriaContent += `  4分: ${rfmCriteria.frequency?.score4 || '5-9次'}\n`;
            criteriaContent += `  3分: ${rfmCriteria.frequency?.score3 || '3-4次'}\n`;
            criteriaContent += `  2分: ${rfmCriteria.frequency?.score2 || '2次'}\n`;
            criteriaContent += `  1分: ${rfmCriteria.frequency?.score1 || '1次'}\n\n`;
            
            criteriaContent += '消费金额(Monetary):\n';
            criteriaContent += `  5分: ${rfmCriteria.monetary?.score5 || '10000元以上'}\n`;
            criteriaContent += `  4分: ${rfmCriteria.monetary?.score4 || '5000-9999元'}\n`;
            criteriaContent += `  3分: ${rfmCriteria.monetary?.score3 || '2000-4999元'}\n`;
            criteriaContent += `  2分: ${rfmCriteria.monetary?.score2 || '500-1999元'}\n`;
            criteriaContent += `  1分: ${rfmCriteria.monetary?.score1 || '500元以下'}`;
            
            return criteriaContent;
          
          case 'analysisResult':
            // 这里可以根据实际分析结果生成内容
            const sampleResult = RFMModel.calculateRFMScores({ 
              recencyScore: 4, 
              frequencyScore: 5, 
              monetaryScore: 5 
            });
            
            if (sampleResult) {
              return `RFM得分: ${sampleResult.recencyScore}-${sampleResult.frequencyScore}-${sampleResult.monetaryScore}\n` +
                     `加权总分: ${sampleResult.weightedScore}\n` +
                     `客户细分: ${sampleResult.segment}\n` +
                     `细分描述: ${sampleResult.segmentDescription}`;
            }
            return '暂无分析结果，请先进行RFM计算';
          
          case 'recommendations':
            // 基于不同客户细分的建议策略
            return '重要价值客户:\n- 提供VIP服务和专属优惠\n- 邀请参与产品测试和反馈\n- 建立长期关系管理\n\n' +
                   '重要发展客户:\n- 提供购买频率激励计划\n- 个性化推荐相关产品\n- 定期发送新产品信息\n\n' +
                   '重要保持客户:\n- 发送重新激活优惠\n- 调查流失原因\n- 提供独家回归福利\n\n' +
                   '重要挽留客户:\n- 发送高额优惠券\n- 个性化沟通了解需求\n- 提供定制化产品或服务';
          
          case 'notes':
            return $(`rfm-analysisNotes`).value || '暂无备注';
          
          default:
            return '暂无内容';
        }
      };
      
      const reportContent = generateReportContent(
        sections,
        'RFM模型分析报告',
        getContent
      );
      
      downloadTextFile(reportContent, 'RFM模型分析报告.txt');
      
      // 触发事件
      eventManager.emit('rfmModel:reportExported');
    });
  },
  
  /**
   * 清除RFM分析数据
   */
  clearData: () => {
    ErrorUtils.safeExecute(() => {
      const fields = ['customerCount', 'recencyWeight', 'frequencyWeight', 'monetaryWeight', 'analysisNotes'];
      fields.forEach(field => {
        const element = $(`rfm-${field}`);
        if (element) {
          element.value = '';
        }
      });
      
      // 清除RFM评分标准
      const scoreFields = ['score1', 'score2', 'score3', 'score4', 'score5'];
      ['recency', 'frequency', 'monetary'].forEach(type => {
        scoreFields.forEach(field => {
          const element = $(`rfm-${type}-${field}`);
          if (element) {
            element.value = '';
          }
        });
      });
      
      // 从本地存储中删除数据
      localStorage.removeItem('rfmModelData');
      localStorage.removeItem('rfmCriteriaData');
      
      // 触发事件
      eventManager.emit('rfmModel:dataCleared');
    });
  },
  
  /**
   * 重置RFM评分标准为默认值
   */
  resetCriteria: () => {
    ErrorUtils.safeExecute(() => {
      const defaultCriteria = {
        recency: {
          score5: '30天内',
          score4: '31-60天',
          score3: '61-90天',
          score2: '91-180天',
          score1: '180天以上'
        },
        frequency: {
          score5: '10次以上',
          score4: '5-9次',
          score3: '3-4次',
          score2: '2次',
          score1: '1次'
        },
        monetary: {
          score5: '10000元以上',
          score4: '5000-9999元',
          score3: '2000-4999元',
          score2: '500-1999元',
          score1: '500元以下'
        }
      };
      
      // 设置默认值到表单
      ['recency', 'frequency', 'monetary'].forEach(type => {
        Object.entries(defaultCriteria[type]).forEach(([score, value]) => {
          const element = $(`rfm-${type}-${score}`);
          if (element) {
            element.value = value;
          }
        });
      });
      
      // 保存默认标准
      localStorage.setItem('rfmCriteriaData', JSON.stringify(defaultCriteria));
      
      // 触发事件
      eventManager.emit('rfmModel:criteriaReset');
    });
  }
};

// 导出全局变量供HTML中直接使用
window.RFMModel = RFMModel;
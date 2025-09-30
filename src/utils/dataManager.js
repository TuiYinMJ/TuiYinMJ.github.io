/**
 * 高级数据管理工具
 * 用于简化各模块的保存和加载数据逻辑
 */
import { getItem, setItem } from './storage.js';
import { $ } from './dom.js';

/**
 * 保存表单数据到本地存储
 * @param {string} storageKey - 存储键名
 * @param {string[]} fields - 字段数组
 * @param {string} prefix - 元素ID前缀
 * @returns {boolean} 操作是否成功
 */
export const saveFormData = (storageKey, fields, prefix = '') => {
  try {
    const data = {};
    
    fields.forEach(field => {
      const element = $(`${prefix}${field}`);
      if (element) {
        data[field] = element.value;
      }
    });
    
    data.lastUpdated = new Date().toISOString();
    return setItem(storageKey, data);
  } catch (error) {
    console.error(`Error saving form data for key ${storageKey}:`, error);
    return false;
  }
};

/**
 * 从本地存储加载表单数据
 * @param {string} storageKey - 存储键名
 * @param {string} prefix - 元素ID前缀
 */
export const loadFormData = (storageKey, prefix = '') => {
  try {
    const data = getItem(storageKey, {});
    
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'lastUpdated') {
        const element = $(`${prefix}${key}`);
        if (element) {
          element.value = value;
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Error loading form data for key ${storageKey}:`, error);
    return false;
  }
};

/**
 * 保存列表数据到本地存储
 * @param {string} storageKey - 存储键名
 * @param {string[]} types - 类型数组
 * @param {string} listSuffix - 列表容器的后缀
 */
export const saveListData = (storageKey, types, listSuffix = '-list') => {
  try {
    const data = {};
    
    types.forEach(type => {
      const container = $(`${type}${listSuffix}`);
      if (container) {
        const items = Array.from(container.querySelectorAll('.swot-item')).map(item => {
          return item.querySelector('.swot-text').textContent;
        });
        data[type] = items;
      }
    });
    
    data.lastUpdated = new Date().toISOString();
    return setItem(storageKey, data);
  } catch (error) {
    console.error(`Error saving list data for key ${storageKey}:`, error);
    return false;
  }
};

/**
 * 生成报告内容
 * @param {Object} sections - 报告章节配置
 * @param {string} title - 报告标题
 * @param {Function} getContentCallback - 获取内容的回调函数
 * @returns {string} 报告内容
 */
export const generateReportContent = (sections, title, getContentCallback) => {
  let reportContent = `${title}\n`;
  reportContent += '='.repeat(title.length) + '\n\n';
  
  Object.entries(sections).forEach(([key, label]) => {
    reportContent += `【${label}】\n`;
    const content = getContentCallback(key);
    reportContent += content || '暂无内容';
    reportContent += '\n\n';
  });
  
  // 生成日期
  reportContent += `报告生成日期: ${new Date().toLocaleString()}\n`;
  
  return reportContent;
};

/**
 * 下载文本文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 */
export const downloadTextFile = (content, filename) => {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error(`Error downloading file ${filename}:`, error);
    return false;
  }
};

/**
 * 清除表单数据
 * @param {string[]} fields - 字段数组
 * @param {string} prefix - 元素ID前缀
 */
export const clearFormData = (fields, prefix = '') => {
  try {
    fields.forEach(field => {
      const element = $(`${prefix}${field}`);
      if (element) {
        element.value = '';
      }
    });
    return true;
  } catch (error) {
    console.error(`Error clearing form data:`, error);
    return false;
  }
};
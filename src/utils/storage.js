// 本地存储工具函数

/**
 * 从localStorage获取数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 存储的数据或默认值
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * 保存数据到localStorage
 * @param {string} key - 存储键名
 * @param {any} value - 要存储的数据
 * @returns {boolean} 操作是否成功
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
    return false;
  }
};

/**
 * 从localStorage删除数据
 * @param {string} key - 存储键名
 * @returns {boolean} 操作是否成功
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage for key ${key}:`, error);
    return false;
  }
};

/**
 * 清空localStorage
 * @returns {boolean} 操作是否成功
 */
export const clearAll = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

/**
 * 检查是否已存在存储项
 * @param {string} key - 存储键名
 * @returns {boolean} 存储项是否存在
 */
export const hasItem = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage for key ${key}:`, error);
    return false;
  }
};

/**
 * 获取所有存储键名
 * @returns {string[]} 所有键名数组
 */
export const getAllKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  } catch (error) {
    console.error('Error getting all localStorage keys:', error);
    return [];
  }
};

/**
 * 导出localStorage数据
 * @param {string} filename - 导出文件名
 */
export const exportStorage = (filename = 'localStorageBackup.json') => {
  try {
    const data = {};
    getAllKeys().forEach(key => {
      data[key] = getItem(key);
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
    console.error('Error exporting localStorage:', error);
    return false;
  }
};

/**
 * 导入localStorage数据
 * @param {File} file - 要导入的文件
 * @returns {Promise<boolean>} 操作是否成功
 */
export const importStorage = (file) => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          Object.entries(data).forEach(([key, value]) => {
            setItem(key, value);
          });
          resolve(true);
        } catch (error) {
          console.error('Error parsing imported data:', error);
          resolve(false);
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        resolve(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing localStorage:', error);
      resolve(false);
    }
  });
};
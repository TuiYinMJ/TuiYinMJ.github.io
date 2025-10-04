/**
 * 高级工具模块
 * 提供事件管理、状态管理和性能优化工具
 */

/**
 * 事件管理器
 * 用于统一管理应用中的事件监听
 */
export class EventManager {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * 添加事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} context - 上下文对象
   */
  on(event, callback, context = null) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event).push({ callback, context });
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.findIndex(item => item.callback === callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  emit(event, data = null) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(({ callback, context }) => {
      try {
        callback.call(context, data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * 清除所有事件监听
   */
  clear() {
    this.listeners.clear();
  }
}

/**
 * 状态管理器
 * 用于管理应用的全局状态
 */
export class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Map();
  }

  /**
   * 获取状态
   * @param {string} key - 状态键
   * @returns {*} 状态值
   */
  getState(key = null) {
    return key ? this.state[key] : { ...this.state };
  }

  /**
   * 设置状态
   * @param {string|Object} key - 状态键或状态对象
   * @param {*} value - 状态值
   */
  setState(key, value = null) {
    const prevState = { ...this.state };
    
    if (typeof key === 'object') {
      this.state = { ...this.state, ...key };
    } else {
      this.state[key] = value;
    }
    
    // 通知监听器
    this.notifyListeners(prevState, this.state);
  }

  /**
   * 订阅状态变化
   * @param {Function} listener - 监听器函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(listener) {
    const id = Date.now().toString();
    this.listeners.set(id, listener);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.delete(id);
    };
  }

  /**
   * 通知所有监听器
   * @param {Object} prevState - 前一个状态
   * @param {Object} nextState - 当前状态
   */
  notifyListeners(prevState, nextState) {
    this.listeners.forEach(listener => {
      try {
        listener(nextState, prevState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }
}

/**
 * 性能优化工具
 */
export const PerformanceUtils = {
  /**
   * 防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间（毫秒）
   * @returns {Function} 防抖后的函数
   */
  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * 节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 限制时间（毫秒）
   * @returns {Function} 节流后的函数
   */
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 懒加载图片
   * @param {string} selector - 图片选择器
   */
  lazyLoadImages: (selector = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  },

  /**
   * 批量DOM操作
   * @param {Function} callback - 包含DOM操作的回调函数
   */
  batchDOMUpdates: (callback) => {
    // 使用DocumentFragment减少重排
    const fragment = document.createDocumentFragment();
    callback(fragment);
    
    // 一次性添加到DOM
    if (fragment.children.length > 0) {
      document.body.appendChild(fragment);
    }
  },

  /**
   * 测量函数执行时间
   * @param {Function} func - 要测量的函数
   * @param {...any} args - 函数参数
   * @returns {Object} 包含结果和执行时间的对象
   */
  measureTime: (func, ...args) => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    return {
      result,
      executionTime: end - start
    };
  }
};

/**
 * 错误处理工具
 */
export const ErrorUtils = {
  /**
   * 安全执行函数
   * @param {Function} func - 要执行的函数
   * @param {*} fallback - 出错时的返回值
   * @param {Function} onError - 错误处理函数
   * @returns {*} 函数结果或fallback值
   */
  safeExecute: (func, fallback = null, onError = null) => {
    try {
      return func();
    } catch (error) {
      console.error('Error in safeExecute:', error);
      if (onError) onError(error);
      return fallback;
    }
  },

  /**
   * 创建错误边界
   * @param {Function} callback - 错误回调
   * @returns {Function} 错误处理函数
   */
  createErrorBoundary: (callback) => {
    return (error) => {
      console.error('Error caught by boundary:', error);
      if (callback) callback(error);
    };
  }
};

/**
 * 数据验证工具
 */
export const ValidationUtils = {
  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * 验证手机号
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isValidPhone: (phone) => {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone);
  },

  /**
   * 验证数字范围
   * @param {number} value - 数值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {boolean} 是否在范围内
   */
  isInRange: (value, min, max) => {
    return typeof value === 'number' && value >= min && value <= max;
  },

  /**
   * 验证必填字段
   * @param {Object} data - 数据对象
   * @param {string[]} requiredFields - 必填字段数组
   * @returns {Object} 验证结果
   */
  validateRequired: (data, requiredFields) => {
    const errors = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field} 是必填字段`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * 格式化工具
 */
export const FormatUtils = {
  /**
   * 格式化货币
   * @param {number} amount - 金额
   * @param {string} currency - 货币符号
   * @returns {string} 格式化后的货币
   */
  formatCurrency: (amount, currency = '¥') => {
    return `${currency}${amount.toLocaleString()}`;
  },

  /**
   * 格式化百分比
   * @param {number} value - 数值
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的百分比
   */
  formatPercentage: (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * 格式化日期
   * @param {Date|string} date - 日期
   * @param {string} format - 格式
   * @returns {string} 格式化后的日期
   */
  formatDate: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的文件大小
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

/**
 * 创建全局实例
 */
export const eventManager = new EventManager();
export const stateManager = new StateManager({
  currentPage: 'business-model',
  isLoading: false,
  user: null,
  settings: {}
});
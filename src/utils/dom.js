// DOM操作工具函数

/**
 * 通过ID获取DOM元素
 * @param {string} id - 元素ID
 * @returns {HTMLElement|null} DOM元素或null
 */
export const $ = (id) => {
  return document.getElementById(id);
};

/**
 * 通过选择器获取DOM元素
 * @param {string} selector - CSS选择器
 * @param {Element} parent - 父元素
 * @returns {Element|null} DOM元素或null
 */
export const $$ = (selector, parent = document) => {
  return parent.querySelector(selector);
};

/**
 * 通过选择器获取多个DOM元素
 * @param {string} selector - CSS选择器
 * @param {Element} parent - 父元素
 * @returns {NodeList} DOM元素列表
 */
export const $$$ = (selector, parent = document) => {
  return parent.querySelectorAll(selector);
};

/**
 * 创建DOM元素
 * @param {string} tag - 标签名
 * @param {Object} options - 元素选项
 * @returns {HTMLElement} 创建的DOM元素
 */
export const createElement = (tag, options = {}) => {
  const element = document.createElement(tag);
  
  // 设置属性
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  
  // 设置类名
  if (options.className) {
    element.className = options.className;
  }
  
  // 设置样式
  if (options.style) {
    Object.entries(options.style).forEach(([key, value]) => {
      element.style[key] = value;
    });
  }
  
  // 设置文本内容
  if (options.textContent !== undefined) {
    element.textContent = options.textContent;
  }
  
  // 设置HTML内容
  if (options.innerHTML !== undefined) {
    element.innerHTML = options.innerHTML;
  }
  
  // 添加子元素
  if (options.children && Array.isArray(options.children)) {
    options.children.forEach(child => {
      if (child instanceof Node) {
        element.appendChild(child);
      }
    });
  }
  
  // 添加事件监听器
  if (options.events) {
    Object.entries(options.events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }
  
  return element;
};

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型：success, error, info, warning
 * @param {number} duration - 显示时长（毫秒）
 */
export const showMessage = (message, type = 'info', duration = 3000) => {
  // 创建消息容器
  const messageContainer = createElement('div', {
    className: `notification notification-${type}`,
    style: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: 'var(--radius)',
      color: 'white',
      fontWeight: '600',
      zIndex: '1001',
      transition: 'all 0.3s ease',
      transform: 'translateX(100%)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '14px',
      minWidth: '250px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  });

  // 设置不同类型消息的背景色
  const colors = {
    success: '#059669', // 成功 - 绿色
    error: '#dc2626',   // 错误 - 红色
    info: '#2563eb',    // 信息 - 蓝色
    warning: '#d97706'  // 警告 - 橙色
  };
  messageContainer.style.backgroundColor = colors[type] || colors.info;

  // 添加消息图标
  const icon = createElement('span', {
    style: {
      fontWeight: 'bold'
    }
  });
  
  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '!'
  };
  icon.textContent = icons[type] || icons.info;
  messageContainer.prepend(icon);

  // 设置消息文本
  const textSpan = createElement('span', {
    textContent: message
  });
  messageContainer.appendChild(textSpan);

  // 添加到页面
  document.body.appendChild(messageContainer);

  // 显示消息
  setTimeout(() => {
    messageContainer.style.transform = 'translateX(0)';
  }, 100);

  // 隐藏消息
  setTimeout(() => {
    messageContainer.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.parentNode.removeChild(messageContainer);
      }
    }, 300);
  }, duration);

  return messageContainer;
};

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {string} title - 对话框标题
 * @returns {Promise<boolean>} 用户的确认结果
 */
export const showConfirmDialog = (message, title = '确认操作') => {
  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = createElement('div', {
      className: 'modal-overlay',
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: '2000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    });

    // 创建对话框
    const dialog = createElement('div', {
      className: 'confirm-dialog',
      style: {
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-lg)'
      }
    });

    // 对话框标题
    const dialogTitle = createElement('h3', {
      textContent: title,
      style: {
        marginBottom: '16px',
        color: 'var(--primary-color)',
        fontSize: '18px',
        fontWeight: '600'
      }
    });

    // 对话框内容
    const dialogContent = createElement('p', {
      textContent: message,
      style: {
        marginBottom: '24px',
        color: 'var(--dark-text)',
        lineHeight: '1.6'
      }
    });

    // 按钮容器
    const buttonsContainer = createElement('div', {
      style: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }
    });

    // 取消按钮
    const cancelButton = createElement('button', {
      textContent: '取消',
      className: 'btn',
      style: {
        backgroundColor: 'var(--light-text)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontWeight: '500'
      },
      events: {
        click: () => {
          document.body.removeChild(overlay);
          resolve(false);
        }
      }
    });

    // 确认按钮
    const confirmButton = createElement('button', {
      textContent: '确认',
      className: 'btn',
      style: {
        backgroundColor: 'var(--secondary-color)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontWeight: '500'
      },
      events: {
        click: () => {
          document.body.removeChild(overlay);
          resolve(true);
        }
      }
    });

    // 组装对话框
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    dialog.appendChild(dialogTitle);
    dialog.appendChild(dialogContent);
    dialog.appendChild(buttonsContainer);
    overlay.appendChild(dialog);
    
    // 添加到页面
    document.body.appendChild(overlay);
  });
};

/**
 * 显示模态窗口
 * @param {string} title - 窗口标题
 * @param {HTMLElement|string} content - 窗口内容
 * @param {Object} options - 选项配置
 * @returns {Object} 模态窗口对象，包含关闭方法
 */
export const showModal = (title, content, options = {}) => {
  // 创建遮罩层
  const overlay = createElement('div', {
    className: 'modal-overlay',
    style: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: '2000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  });

  // 创建模态窗口
  const modal = createElement('div', {
    className: 'modal',
    style: {
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '32px',
      maxWidth: options.maxWidth || '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative'
    }
  });

  // 关闭按钮
  const closeButton = createElement('span', {
    className: 'close',
    textContent: '×',
    style: {
      position: 'absolute',
      top: '16px',
      right: '16px',
      fontSize: '24px',
      cursor: 'pointer',
      color: 'var(--light-text)',
      transition: 'color 0.2s ease'
    },
    events: {
      click: () => closeModal()
    }
  });

  // 标题
  const modalTitle = createElement('h3', {
    textContent: title,
    style: {
      marginBottom: '24px',
      color: 'var(--primary-color)',
      fontSize: '20px',
      fontWeight: '600'
    }
  });

  // 内容区域
  const contentContainer = createElement('div', {
    className: 'modal-content'
  });

  if (typeof content === 'string') {
    contentContainer.innerHTML = content;
  } else if (content instanceof Node) {
    contentContainer.appendChild(content);
  }

  // 组装模态窗口
  modal.appendChild(closeButton);
  modal.appendChild(modalTitle);
  modal.appendChild(contentContainer);
  overlay.appendChild(modal);
  
  // 添加到页面
  document.body.appendChild(overlay);

  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && options.closeOnClickOutside !== false) {
      closeModal();
    }
  });

  // 关闭模态窗口的方法
  function closeModal() {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (options.onClose) {
      options.onClose();
    }
  }

  // 阻止事件冒泡
  modal.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  return {
    close: closeModal,
    overlay,
    modal
  };
};

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
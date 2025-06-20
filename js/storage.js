export const saveData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error(`Error saving data for key: ${key}`, e);
        alert(`保存数据 "${key}" 时出错, 浏览器存储可能已满。`);
    }
};

export const loadData = (key, def = null) => {
    const data = localStorage.getItem(key);
    if (data === null) return def;
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error(`Error loading data for key: ${key}`, e);
        alert(`加载数据 "${key}" 时出错, 数据可能已损坏。将使用默认值。`);
        return def;
    }
};
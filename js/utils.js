export const getEl = (id) => document.getElementById(id);
export const query = (selector) => document.querySelector(selector);
export const queryAll = (selector) => document.querySelectorAll(selector);

/**
 * Handles image file selection and displays a preview.
 * @param {HTMLInputElement} fileInput - The file input element.
 * @param {HTMLImageElement} previewEl - The img element for preview.
 * @param {HTMLInputElement} storageEl - The hidden input to store the base64 string.
 */
export const handleImageUpload = (fileInput, previewEl, storageEl) => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        previewEl.src = e.target.result;
        previewEl.style.display = "block";
        if (storageEl) storageEl.value = e.target.result;
    };
    reader.readAsDataURL(file);
};

/**
 * Sets up a toggle between local file upload and URL input for images.
 * @param {string} radioName - The name attribute of the radio buttons.
 * @param {string} localDivId - The ID of the div for local upload.
 * @param {string} urlDivId - The ID of the div for URL input.
 */
export function setupImageSourceToggle(radioName, localDivId, urlDivId) {
    queryAll(`input[name="${radioName}"]`).forEach((r) =>
        r.addEventListener("change", (e) => {
            const isLocal = e.target.value === "local";
            getEl(localDivId).style.display = isLocal ? "block" : "none";
            getEl(urlDivId).style.display = isLocal ? "none" : "block";
        })
    );
}

// Dispatch a custom event to notify other modules of changes
export function notify(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}
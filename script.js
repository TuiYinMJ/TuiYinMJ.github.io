document.addEventListener('DOMContentLoaded', function () {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const uiModeToggle = document.getElementById('ui-mode-toggle');
    const syntaxHelper = document.getElementById('syntax-helper');
    const copyButton = document.getElementById('copy-button');

    // --- 【【【 Opus Theme - 终极设计主题 】】】 ---
    const opus = {
        // 用下面的代码块，完整替换掉旧的 opus 对象
        h1: `font-size: 28px; font-weight: bold; color: #ffffff; text-shadow: 0 1px 3px rgba(0,0,0,0.2); text-align: center; margin: 20px 0; padding: 25px 20px; border-radius: 8px; background-color: #2c3e50; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZHT0IjEwIj48Y2lyY2xlIGN4PSI1IiBjeT0iNSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg=='), linear-gradient(135deg, #4a69bd, #2c3e50); box-shadow: 0 4px 15px rgba(0,0,0,0.2);`,
        h2: `font-size: 24px; font-weight: bold; color: #4a69bd; margin: 45px 0 25px; padding-bottom: 12px; border-bottom: 3px solid #6a8ee6;`,
        h3: `font-size: 20px; font-weight: bold; color: #34495e; margin: 30px 0 15px; padding-left: 20px; border-left: 5px solid #bdc3c7;`,
        h4: `font-size: 18px; font-weight: bold; color: #7f8c8d; margin: 25px 0 10px;`,
        p: `font-size: 17px; line-height: 1.9; color: #34495e; margin: 20px 0; text-align: justify;`,
        blockquote: `margin: 25px 0; padding: 1px; border-radius: 10px; background: linear-gradient(135deg, #6a8ee6, #4a69bd); box-shadow: 0 5px 15px rgba(0,0,0,0.1);`,
        blockquote_inner: `background: #ffffff; color: #34495e; padding: 20px 25px; border-radius: 9px;`,
        pre: `<div style="background-color: #2d2d2d; border-radius: 8px; margin: 25px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"><div style="background-color:#3c3c3c; padding: 10px 15px; border-top-left-radius: 8px; border-top-right-radius: 8px; display: flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #ff5f56; margin-right: 6px;"></span><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #ffbd2e; margin-right: 6px;"></span><span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: #27c93f;"></span><span style="color: #a0a0a0; font-size: 12px; margin-left: auto;">__LANG__</span></div><pre style="background-color:transparent; color:#f8f8f2; padding: 0 20px 20px; margin: 0; font-size: 14px; overflow-x: auto; line-height: 1.6;">__CODE__</pre></div>`,
        table: `<div style="margin: 25px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden;"><table style="width:100%; border-collapse: collapse; text-align: left;">__TABLE_CONTENT__</table></div>`,
        th: `background-color: #4a69bd; color: white; padding: 14px 18px; font-weight: 600;`,
        td: `padding: 12px 18px; border-bottom: 1px solid #f0f0f0; color: #34495e;`,
        ul: `list-style-type: none; padding-left: 0;`,
        li: `position: relative; padding-left: 30px; margin-bottom: 12px; line-height: 1.8;`,
        li_icon: `<span style="position: absolute; left: 0; top: 6px; width: 18px; height: 18px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6a8ee6"/><stop offset="100%" stop-color="#4a69bd"/></linearGradient></defs><path d="M50,0L93.3,25v50L50,100L6.7,75v-50z" fill="url(#lg)"/></svg></span>`,
        strong: `color: #4a69bd; font-weight: bold;`,
        em: `font-style: normal; background-color: #f0f8ff; padding: 2px 5px; border-radius: 4px;`,
        del: `text-decoration: none; background-image: linear-gradient(transparent 60%, #ffc1c1 40%);`,
        a: `color: #4a69bd; text-decoration: none; font-weight: bold;`,
        hr: `border: none; margin: 50px 0; text-align: center;`,
        hr_icon: `<span style="display:inline-block; padding: 0 15px; background-color: #fff; color: #bdc3c7; position:relative; top:-12px;">✂︎</span><div style="border-top: 1px dashed #bdc3c7;"></div>`
    };

    const cardExtension = { name: 'card', level: 'block', start(src) { return src.match(/::: card\n/)?.index; }, tokenizer(src) { const rule = /^::: card\n([\s\S]+?)\n:::/; const match = rule.exec(src); if (match) { return { type: 'card', raw: match[0], text: match[1].trim(), }; } }, renderer(token) { const contentHtml = marked.parse(token.text); return `<div style="padding: 2px; border-radius: 10px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); margin: 25px 0; box-shadow: 0 4px 15px 0 rgba(220, 39, 67, 0.3);"><div style="background: #fff; border-radius: 8px; padding: 20px;">${contentHtml}</div></div>`; } };
    marked.use({ extensions: [cardExtension] });

    function createRenderer() {
        const renderer = new marked.Renderer();
        const T = opus;
        renderer.heading = (text, level) => `<h${level} style="${T['h' + level]}">${text}</h${level}>`;
        renderer.paragraph = (text) => `<p style="${T.p}">${text}</p>`;
        renderer.blockquote = (quote) => `<div style="${T.blockquote}"><div style="${T.blockquote_inner}">${quote}</div></div>`;
        renderer.code = (code, lang) => T.pre.replace('__CODE__', `<code>${code}</code>`).replace('__LANG__', (lang || '').toUpperCase());
        // 【FIXED】移除对 T.thead 的无效引用
        renderer.table = (header, body) => T.table.replace('__TABLE_CONTENT__', `<thead><tr>${header}</tr></thead><tbody>${body}</tbody>`);
        renderer.tablecell = (content, flags) => `<${flags.header ? 'th' : 'td'} style="${flags.header ? T.th : T.td}" align="${flags.align || 'left'}">${content}</${flags.header ? 'th' : 'td'}>`;
        renderer.list = (body, ordered) => `<ul style="${T.ul}">${body}</ul>`;
        renderer.listitem = (text) => `<li style="${T.li}">${T.li_icon}${text}</li>`;
        renderer.strong = (text) => `<strong style="${T.strong}">${text}</strong>`;
        renderer.em = (text) => `<em style="${T.em}">${text}</em>`;
        renderer.del = (text) => `<span style="${T.del}">${text}</span>`;
        renderer.link = (href, title, text) => `<a href="${href}" title="${title}" style="${T.a}">${text}</a>`;
        renderer.image = (href, title, text) => `<img src="${href}" alt="${text}" title="${title}" style="max-width:100%; border-radius: 8px; display:block; margin: 20px auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">`;
        renderer.hr = () => `<div style="${T.hr}"></div>`;
        renderer.html = (html) => html;
        return renderer;
    }

    function render() {
        try {
            const renderer = createRenderer();
            preview.innerHTML = marked.parse(editor.value, { renderer: renderer, breaks: true, gfm: true });
        } catch (error) {
            console.error("渲染错误:", error);
            preview.innerHTML = `<div style="padding:20px; background-color:#fff0f0; border:2px solid red; color:red;"><h3>渲染引擎崩溃！</h3><p><strong>错误详情:</strong> ${error.message}</p></div>`;
        }
    }

    function insertSyntax(syntax, placeholder) {
        const start = editor.selectionStart;
        const text = editor.value;
        editor.value = text.slice(0, start) + syntax + text.slice(start);
        if (placeholder) {
            const selectionStart = editor.value.indexOf(placeholder, start);
            if (selectionStart !== -1) {
                 editor.setSelectionRange(selectionStart, selectionStart + placeholder.length);
            }
        } else {
            editor.setSelectionRange(start + syntax.length, start + syntax.length);
        }
        editor.focus();
        render();
    }
    
    // 【FIXED】重写复制功能以支持富文本
    function copyRichText() {
        const content = preview.innerHTML;

        // 优先使用 Clipboard API
        if (navigator.clipboard && navigator.clipboard.write) {
            const blob = new Blob([content], { type: 'text/html' });
            const item = new ClipboardItem({ 'text/html': blob });
            navigator.clipboard.write([item]).then(() => {
                alert('已复制渲染后的内容！');
            }).catch(err => {
                console.error('使用 Clipboard API 复制失败:', err);
                copyFallback(); // 如果失败，则尝试后备方法
            });
        } else {
            copyFallback(); // 如果不支持 Clipboard API，直接使用后备方法
        }
    }

    // 后备复制方法 (兼容旧版浏览器)
    function copyFallback() {
        const tempEl = document.createElement('div');
        tempEl.style.position = 'absolute';
        tempEl.style.left = '-9999px';
        tempEl.innerHTML = preview.innerHTML;
        document.body.appendChild(tempEl);

        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(tempEl);
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            const success = document.execCommand('copy');
            if (success) {
                alert('已复制渲染后的内容！(兼容模式)');
            } else {
                alert('复制失败，请手动复制。');
            }
        } catch (err) {
            console.error('后备复制方法失败:', err);
            alert('复制出错了，请手动复制。');
        } finally {
            document.body.removeChild(tempEl);
        }
    }

    editor.addEventListener('input', render);
    uiModeToggle.addEventListener('change', (e) => { document.body.className = `theme-${e.target.value}`; });
    copyButton.addEventListener('click', copyRichText); // 修改了事件监听调用的函数
    syntaxHelper.addEventListener('click', (e) => { if (e.target.tagName === 'LI' && e.target.dataset.syntax) { const syntax = e.target.dataset.syntax.replace(/\\n/g, '\n'); const placeholder = e.target.dataset.placeholder; insertSyntax(syntax, placeholder); } });

    editor.value = `# Opus 主题 - 极致美学\n\n这是为满足您对独有、美观、极致装饰性的最终要求而设计的唯一主题。\n\n## 列表的新篇章\n\n- 每个列表项都由精心设计的“宝石”SVG引领。\n- 行间距、颜色、边距都经过了重新考量。\n\n> 引用块采用了渐变色背景，营造出高级感和深度。\n\n---\n\n\`\`\`javascript\nfunction opus() {\n  // 代码块拥有精致的macOS窗口标题栏\n  // 和优雅的边框阴影\n  return "A Masterpiece";\n}\n\`\`\`\n\n| 表头经过重新设计 | 更具视觉吸引力 |\n|:---|:---|\n| 拥有了更专业的背景和字体颜色 | 单元格的分割线也更清晰 | \n\n希望这份倾尽心力的设计，能够成为您创作路上的“杰作”。`;
    render();
});
// 编码转换核心函数
function encodeString(str) {
    const results = [];

    // 1. 八进制转义编码（\74\163...）
    let octal = '';
    for (let i = 0; i < str.length; i++) {
        octal += '\\' + str.charCodeAt(i).toString(8);
    }
    results.push({ name: '1. 八进制转义编码', value: octal });

    // 2. URL编码（%3c%73...）
    let urlEncoded = '';
    for (let i = 0; i < str.length; i++) {
        const hex = str.charCodeAt(i).toString(16);
        urlEncoded += '%' + hex;
    }
    results.push({ name: '2. URL编码', value: urlEncoded });

    // 3. HTML十六进制实体编码（&#x3c;&#x73;...）
    let htmlHexEntity = '';
    for (let i = 0; i < str.length; i++) {
        htmlHexEntity += '&#x' + str.charCodeAt(i).toString(16) + ';';
    }
    results.push({ name: '3. HTML十六进制实体', value: htmlHexEntity });

    // 4. HTML十进制实体编码（&#60;&#115;...）
    let htmlDecEntity = '';
    for (let i = 0; i < str.length; i++) {
        htmlDecEntity += '&#' + str.charCodeAt(i) + ';';
    }
    results.push({ name: '4. HTML十进制实体', value: htmlDecEntity });

    // 5. Unicode转义编码（\u003c\u0073...）
    let unicode = '';
    for (let i = 0; i < str.length; i++) {
        const hex = str.charCodeAt(i).toString(16).padStart(4, '0');
        unicode += '\\u' + hex;
    }
    results.push({ name: '5. Unicode转义编码', value: unicode });

    // 6. String.fromCharCode形式
    const charCodes = [];
    for (let i = 0; i < str.length; i++) {
        charCodes.push(str.charCodeAt(i));
    }
    const fromCharCode = `String.fromCharCode(${charCodes.join(',')})`;
    results.push({ name: '6. String.fromCharCode', value: fromCharCode });

    // 7. 十六进制转义编码（\x3c\x73...）
    let hexEscape = '';
    for (let i = 0; i < str.length; i++) {
        hexEscape += '\\x' + str.charCodeAt(i).toString(16);
    }
    results.push({ name: '7. 十六进制转义编码', value: hexEscape });

    // 8. 十六进制整数表示（0x3c 0x73...）
    let hexInt = '';
    for (let i = 0; i < str.length; i++) {
        hexInt += '0x' + str.charCodeAt(i).toString(16) + ' ';
    }
    results.push({ name: '8. 十六进制整数表示', value: hexInt.trim() });

    return results;
}

// HTML转义函数，防止浏览器解析HTML实体
function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
    try {
        // 使用 Clipboard API
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('复制失败:', err);
        // 降级方案：使用 textarea
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (err2) {
            console.error('降级复制方案也失败:', err2);
            return false;
        }
    }
}

// 显示复制成功提示
function showCopySuccess(message) {
    // 移除已存在的提示
    const existingTip = document.querySelector('.copy-success-tip');
    if (existingTip) {
        existingTip.remove();
    }

    // 创建新提示
    const tip = document.createElement('div');
    tip.className = 'copy-success-tip';
    tip.textContent = message || '复制成功!';
    document.body.appendChild(tip);

    // 2秒后自动移除
    setTimeout(() => {
        if (tip.parentNode) {
            tip.parentNode.removeChild(tip);
        }
    }, 1500);
}

// 渲染结果到页面
function renderResults(results) {
    const container = document.getElementById('resultContainer');
    container.innerHTML = ''; // 清空之前的结果

    results.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';

        // 对值进行HTML转义，确保显示原始代码
        const escapedValue = escapeHTML(item.value);

        div.innerHTML = `
            <h4>${item.name}</h4>
            <pre class="copyable" data-content="${escapeHTML(item.value)}">${escapedValue}</pre>
        `;
        container.appendChild(div);

        // 为每个可复制区域添加点击事件
        const preElement = div.querySelector('pre');
        preElement.addEventListener('click', async () => {
            const content = preElement.getAttribute('data-content');
            const success = await copyToClipboard(content);

            if (success) {
                showCopySuccess(`已复制: ${item.name}`);
                // 添加短暂的视觉反馈
                preElement.style.backgroundColor = '#e8f5e8';
                setTimeout(() => {
                    preElement.style.backgroundColor = '';
                }, 300);
            } else {
                showCopySuccess('复制失败，请手动复制');
            }
        });
    });
}

// 绑定按钮点击事件
document.getElementById('convertBtn').addEventListener('click', () => {
    const input = document.getElementById('inputStr').value.trim();
    if (!input) {
        alert('请输入需要转换的字符串');
        return;
    }
    const results = encodeString(input);
    renderResults(results);
});
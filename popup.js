(function() {
  'use strict';

  const DEFAULT_LIMIT = 5;
  const STORAGE_KEY = 'smartCopyLimit';

  const PATH_ICON = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>`;

  const NAME_ICON = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>`;

  const elements = {
    limitSelect: document.getElementById('limit'),
    downloadsList: document.getElementById('downloads-list'),
    emptyState: document.getElementById('empty-state'),
    emptyMessage: document.getElementById('empty-message'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
  };

  let toastTimer = null;
  const copiedTimers = new WeakMap();

  function formatFileSize(bytes) {
    if (!bytes) return '未知大小';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  function formatDate(dateString) {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getFileExtension(filename) {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex <= 0 || dotIndex === filename.length - 1) return '';
    const ext = filename.slice(dotIndex + 1).toLowerCase();
    return ext.length <= 5 ? ext : '';
  }

  function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    const iconMap = {
      pdf: '📄',
      doc: '📝', docx: '📝',
      xls: '📊', xlsx: '📊',
      ppt: '📽️', pptx: '📽️',
      zip: '📦', rar: '📦', '7z': '📦',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
      mp3: '🎵', wav: '🎵', flac: '🎵',
      mp4: '🎬', avi: '🎬', mkv: '🎬', mov: '🎬',
      exe: '⚙️', msi: '⚙️',
      js: '💻', ts: '💻', py: '💻', java: '💻', cpp: '💻',
      html: '🌐', css: '🎨',
      txt: '📃', md: '📃'
    };
    return iconMap[ext] || '📁';
  }

  function extractFileName(fullPath) {
    if (!fullPath) return '未知文件';
    return fullPath.split(/[/\\]/).pop();
  }

  function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toast.classList.remove('show');
      toastTimer = null;
    }, 2000);
  }

  async function copyToClipboard(text, button, type) {
    try {
      await navigator.clipboard.writeText(text);
      button.classList.add('copied');
      showToast(type === 'path' ? '已复制完整路径' : '已复制文件名');

      const prev = copiedTimers.get(button);
      if (prev) clearTimeout(prev);
      copiedTimers.set(button, setTimeout(() => {
        button.classList.remove('copied');
        copiedTimers.delete(button);
      }, 1500));
    } catch (err) {
      console.error('复制失败:', err);
      showToast('复制失败，请重试');
    }
  }

  function createActionButton(className, label, iconSvg) {
    const button = document.createElement('button');
    button.className = `btn ${className}`;
    button.title = label;
    button.innerHTML = iconSvg;
    button.appendChild(document.createTextNode(label));
    return button;
  }

  function createDownloadItem(item) {
    const fileName = extractFileName(item.filename);

    const div = document.createElement('div');
    div.className = 'download-item';

    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';

    const icon = document.createElement('div');
    icon.className = 'file-icon';
    icon.textContent = getFileIcon(fileName);

    const details = document.createElement('div');
    details.className = 'file-details';

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = fileName;
    name.title = fileName;

    const path = document.createElement('div');
    path.className = 'file-path';
    path.textContent = item.filename;
    path.title = item.filename;

    const meta = document.createElement('div');
    meta.className = 'file-meta';

    const size = document.createElement('span');
    size.textContent = formatFileSize(item.fileSize);

    const date = document.createElement('span');
    date.textContent = formatDate(item.startTime);

    meta.append(size, date);
    details.append(name, path, meta);
    fileInfo.append(icon, details);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const btnPath = createActionButton('btn-path', '复制路径', PATH_ICON);
    const btnName = createActionButton('btn-name', '复制文件名', NAME_ICON);

    actions.append(btnPath, btnName);
    div.append(fileInfo, actions);

    btnPath.addEventListener('click', () => {
      copyToClipboard(item.filename, btnPath, 'path');
    });
    btnName.addEventListener('click', () => {
      copyToClipboard(fileName, btnName, 'name');
    });

    return div;
  }

  function showEmptyState(message) {
    elements.downloadsList.style.display = 'none';
    elements.emptyState.style.display = 'flex';
    elements.emptyMessage.textContent = message;
  }

  function renderDownloads(downloads, maxItems) {
    elements.downloadsList.innerHTML = '';

    const complete = (downloads || []).filter(
      item => item.filename && item.state === 'complete'
    );

    if (complete.length === 0) {
      showEmptyState('暂无下载记录');
      return;
    }

    elements.downloadsList.style.display = 'flex';
    elements.emptyState.style.display = 'none';

    complete.slice(0, maxItems).forEach(item => {
      elements.downloadsList.appendChild(createDownloadItem(item));
    });
  }

  function loadDownloads(limit) {
    elements.downloadsList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    elements.emptyState.style.display = 'none';

    chrome.downloads.search({
      // 拉取更大的窗口再过滤"已完成"项，保证可见数量接近用户选择的 limit
      limit: Math.min(Math.max(limit * 5, 50), 500),
      orderBy: ['-startTime']
    }, (downloads) => {
      if (chrome.runtime.lastError) {
        console.error('读取下载记录失败:', chrome.runtime.lastError.message);
        showEmptyState('读取下载记录失败');
        return;
      }
      renderDownloads(downloads, limit);
    });
  }

  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const limit = result[STORAGE_KEY] || DEFAULT_LIMIT;
      elements.limitSelect.value = limit;
      return limit;
    } catch (err) {
      console.error('加载设置失败:', err);
      return DEFAULT_LIMIT;
    }
  }

  async function saveSettings(limit) {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: limit });
    } catch (err) {
      console.error('保存设置失败:', err);
    }
  }

  function init() {
    loadSettings().then(limit => {
      loadDownloads(limit);
    });

    elements.limitSelect.addEventListener('change', (e) => {
      const limit = parseInt(e.target.value, 10);
      saveSettings(limit);
      loadDownloads(limit);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

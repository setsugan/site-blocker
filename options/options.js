document.addEventListener('DOMContentLoaded', () => {
  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');
  const whitelistTextarea = document.getElementById('whitelist');
  const saveTimeButton = document.getElementById('saveTimeSettings');
  const saveWhitelistButton = document.getElementById('saveWhitelistSettings');

  // 初期値をロード
  chrome.storage.sync.get(['blockStartTime', 'blockEndTime', 'whitelist'], (data) => {
    startTimeInput.value = data.blockStartTime || '';
    endTimeInput.value = data.blockEndTime || '';
    whitelistTextarea.value = (data.whitelist || []).join('\n');
  });

  // 時間設定を保存
  saveTimeButton.addEventListener('click', () => {
    const blockStartTime = startTimeInput.value;
    const blockEndTime = endTimeInput.value;
    chrome.storage.sync.set({ blockStartTime, blockEndTime }, () => {
      alert('時間設定が保存されました！');
    });
  });

  // ホワイトリストを保存
  saveWhitelistButton.addEventListener('click', () => {
    const whitelist = whitelistTextarea.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url);
    chrome.storage.sync.set({ whitelist }, () => {
      alert('ホワイトリストが保存されました！');
    });
  });
});

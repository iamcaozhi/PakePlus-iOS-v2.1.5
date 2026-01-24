window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// 保存唤醒锁引用，方便后续释放
let wakeLock = null;

// 初始化/获取屏幕唤醒锁的函数
const requestWakeLock = async () => {
  try {
    // 检查浏览器是否支持 Wake Lock API
    if ('wakeLock' in navigator) {
      // 请求屏幕唤醒锁（仅支持 screen 类型，阻止屏幕熄灭）
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('屏幕常亮已开启，唤醒锁创建成功');
      
      // 监听唤醒锁意外释放（比如用户切换应用、浏览器后台运行）
      wakeLock.addEventListener('release', () => {
        console.log('屏幕常亮已关闭，唤醒锁被释放');
        wakeLock = null;
      });
    } else {
      console.warn('当前浏览器不支持屏幕常亮功能');
    }
  } catch (err) {
    // 捕获异常（比如权限不足、非HTTPS环境）
    console.error('开启屏幕常亮失败：', err.message);
  }
};

// 释放屏幕唤醒锁的函数（可选，按需调用）
const releaseWakeLock = async () => {
  if (wakeLock) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log('手动释放屏幕常亮唤醒锁');
    } catch (err) {
      console.error('释放屏幕唤醒锁失败：', err.message);
    }
  }
};

// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    // 关键：用户点击时初始化屏幕常亮（满足浏览器交互触发要求）
    requestWakeLock();
    
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// 可选：页面卸载时自动释放唤醒锁，优化资源占用
window.addEventListener('beforeunload', releaseWakeLock);
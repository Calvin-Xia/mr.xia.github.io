// 定义一个函数来更新时间  
function updateTime() {  
    const now = new Date(); // 获取当前时间  
    const hours = now.getHours(); // 获取小时  
    const minutes = now.getMinutes(); // 获取分钟  
    const seconds = now.getSeconds(); // 获取秒  
  
    // 确保时间总是两位数  
    const formattedHours = hours.toString().padStart(2, '0');  
    const formattedMinutes = minutes.toString().padStart(2, '0');  
    const formattedSeconds = seconds.toString().padStart(2, '0');  
  
    // 格式化时间字符串  
    const timeString = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;  
  
    // 更新页面上的时间显示  
    document.getElementById('currentTime').textContent = "现在是北京时间 " + timeString + '。祝您使用愉快！';
}  
  
// 页面加载完成后立即更新时间，并每秒更新一次  
document.addEventListener('DOMContentLoaded', function() {  
    updateTime(); // 初始更新时间  
    setInterval(updateTime, 1000); // 每秒更新时间  
});

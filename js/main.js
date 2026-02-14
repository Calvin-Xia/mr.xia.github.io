/**
 * Mr.Xia 个人网站 - 主脚本文件
 * 包含时间显示、动画效果和功能模块
 */

// ===== 时间显示模块 =====
const TimeDisplay = {
    intervalId: null,

    /**
     * 初始化时间显示
     */
    init() {
        this.updateTime();
        this.intervalId = setInterval(() => this.updateTime(), 1000);
        
        window.addEventListener('beforeunload', () => {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        });
    },

    /**
     * 更新时间显示
     */
    updateTime() {
        const now = new Date();
        const timeString = this.formatTime(now);
        const dateString = this.formatDate(now);
        
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            timeElement.innerHTML = `
                <span style="font-size: 0.9em; opacity: 0.8;">📅 ${dateString}</span>
                <span style="font-weight: 700;">⏰ ${timeString}</span>
            `;
        }
    },

    /**
     * 格式化时间
     */
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[date.getDay()];
        return `${year}-${month}-${day} ${weekday}`;
    }
};

// ===== 计时器模块 =====
const Timer = {
    startTime: null, // 计时器开始时间戳
    elapsedTime: 0, // 已经经过的时间（毫秒）
    targetTime: 0, // 目标时间（毫秒）
    intervalId: null,
    isRunning: false, // 计时器是否正在运行

    /**
     * 初始化计时器
     */
    init() {
        const startBtn = document.getElementById('start');
        const pauseBtn = document.getElementById('pause');
        const resetBtn = document.getElementById('reset');
        const setTimeBtn = document.getElementById('set-time');

        // 初始化显示
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = this.formatTime(0);
        }

        // 初始化进度条
        this.updateProgress();

        // 为每个按钮单独添加事件监听器，而不是一次性检查所有按钮
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
            // 初始状态
            pauseBtn.disabled = true;
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // 绑定设置时间按钮事件
        if (setTimeBtn) {
            setTimeBtn.addEventListener('click', () => this.setTimeFromInputs());
        }

        // 绑定输入框变化事件
        const timeInputs = ['hours', 'minutes', 'seconds'];
        timeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.validateTimeInput(input));
            }
        });
    },

    /**
     * 验证时间输入
     */
    validateTimeInput(input) {
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        let value = parseInt(input.value) || 0;
        
        // 确保值在有效范围内
        value = Math.max(min, Math.min(max, value));
        input.value = value;
    },

    /**
     * 从输入框设置时间
     */
    setTimeFromInputs() {
        const hours = parseInt(document.getElementById('hours').value) || 0;
        const minutes = parseInt(document.getElementById('minutes').value) || 0;
        const seconds = parseInt(document.getElementById('seconds').value) || 0;
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        this.targetTime = totalSeconds * 1000;
        this.elapsedTime = 0;
        this.isRunning = false;
        
        // 更新显示
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = this.formatTime(totalSeconds);
        }
        
        // 更新进度条
        this.updateProgress();
        
        // 更新按钮状态，单独检查每个按钮
        const startBtn = document.getElementById('start');
        const pauseBtn = document.getElementById('pause');
        if (startBtn) {
            startBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.disabled = true;
        }
    },

    /**
     * 格式化时间（将总秒数转换为 HH:MM:SS 格式）
     */
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },

    /**
     * 更新计时器显示
     */
    update() {
        if (!this.startTime) return;
        
        const now = Date.now();
        let totalElapsed = this.elapsedTime + (now - this.startTime);
        
        // 如果达到或超过目标时间，停止计时
        if (this.targetTime > 0 && totalElapsed >= this.targetTime) {
            totalElapsed = this.targetTime;
            this.pause();
            // 可以在这里添加完成提示，如播放声音或显示提示
        }
        
        // 转换为总秒数
        const totalSeconds = Math.floor(totalElapsed / 1000);
        
        // 只使用正确的计时器显示元素ID
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = this.formatTime(totalSeconds);
        }
        
        // 更新进度条
        this.updateProgress(totalElapsed);
    },

    /**
     * 更新进度条
     */
    updateProgress(elapsedTime = this.elapsedTime) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (!progressBar || !progressText) return;
        
        if (this.targetTime <= 0) {
            // 如果没有设置目标时间，显示已用时间
            progressBar.style.width = '0%';
            progressText.textContent = `已用时间: ${this.formatTime(Math.floor(elapsedTime / 1000))}`;
        } else {
            // 计算进度百分比
            const progress = Math.min(100, Math.floor((elapsedTime / this.targetTime) * 100));
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}% 已完成`;
        }
    },

    /**
     * 开始计时
     */
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            this.isRunning = true;
            
            // 提高更新频率，使显示更流畅
            this.intervalId = setInterval(() => this.update(), 100);
            
            // 更新按钮状态，单独检查每个按钮
            const startBtn = document.getElementById('start');
            const pauseBtn = document.getElementById('pause');
            if (startBtn) {
                startBtn.disabled = true;
            }
            if (pauseBtn) {
                pauseBtn.disabled = false;
            }
        }
    },

    /**
     * 暂停计时
     */
    pause() {
        if (this.isRunning) {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            if (this.startTime) {
                const now = Date.now();
                this.elapsedTime += (now - this.startTime);
                this.startTime = null;
            }
            
            this.isRunning = false;
            
            // 更新按钮状态，单独检查每个按钮
            const startBtn = document.getElementById('start');
            const pauseBtn = document.getElementById('pause');
            if (startBtn) {
                startBtn.disabled = false;
            }
            if (pauseBtn) {
                pauseBtn.disabled = true;
            }
        }
    },

    /**
     * 重置计时器
     */
    reset() {
        this.pause();
        this.elapsedTime = 0;
        
        // 更新显示
        const timerElement = document.getElementById('timer-display');
        if (timerElement) {
            timerElement.textContent = this.formatTime(Math.floor(this.targetTime / 1000));
        }
        
        // 更新进度条
        this.updateProgress();
        
        // 更新按钮状态，单独检查每个按钮
        const startBtn = document.getElementById('start');
        const pauseBtn = document.getElementById('pause');
        if (startBtn) {
            startBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.disabled = true;
        }
    }
};

// ===== 页面动画模块 =====
const PageAnimations = {
    /**
     * 初始化页面动画
     */
    init() {
        this.addFadeInAnimations();
        this.addScrollAnimations();
        this.initMouseFollower();
        this.initFloatingElements();
    },

    /**
     * 添加淡入动画
     */
    addFadeInAnimations() {
        // 避免设置inline opacity: 0，使用CSS类代替
        const elements = document.querySelectorAll('main > section');
        elements.forEach((element, index) => {
            // 先确保元素可见，再添加动画类
            element.style.opacity = '';
            element.style.animation = '';
            // 延迟添加动画，确保元素已渲染
            setTimeout(() => {
                element.classList.add('fade-in-up');
            }, index * 100);
        });
    },

    /**
     * 添加滚动动画
     */
    addScrollAnimations() {
        // 只对shadowbox元素应用动画，排除markdown-container
        // 避免与Markdown渲染产生冲突
        document.querySelectorAll('.shadowbox:not(.markdown-container)').forEach((element, index) => {
            // 延迟添加动画，确保元素已渲染
            setTimeout(() => {
                element.classList.add('fade-in-up');
            }, index * 150 + 500);
        });
    },

    /**
     * 初始化鼠标跟随效果
     */
    initMouseFollower() {
        const follower = document.createElement('div');
        follower.className = 'mouse-follower';
        follower.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent);
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease-out, opacity 0.3s ease;
            opacity: 0;
        `;
        document.body.appendChild(follower);

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            follower.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            follower.style.opacity = '0';
        });

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            follower.style.transform = `translate(${followerX - 10}px, ${followerY - 10}px)`;
            requestAnimationFrame(animateFollower);
        };

        animateFollower();
    },

    /**
     * 初始化漂浮元素动画
     */
    initFloatingElements() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
};

// ===== 导航模块 =====
const Navigation = {
    /**
     * 初始化导航
     */
    init() {
        this.highlightCurrentPage();
    },

    /**
     * 高亮当前页面
     */
    highlightCurrentPage() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath === currentPath) {
                link.style.color = 'var(--primary-color)';
                link.style.background = 'rgba(249, 115, 22, 0.1)';
            }
        });
    }
};

// ===== 工具函数 =====
const Utils = {
    /**
     * 创建波纹效果
     */
    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    },

    /**
     * 平滑滚动到顶部
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ===== 页面加载初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    TimeDisplay.init();
    Timer.init();
    PageAnimations.init();
    Navigation.init();

    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', Utils.createRipple);
    });
});

// 暴露模块供外部使用
window.MrXiaApp = {
    TimeDisplay,
    Timer,
    PageAnimations,
    Navigation,
    Utils
};

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

let intervalId: number | undefined;

function formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = weekdays[date.getDay()];
    return `${year}-${month}-${day} ${weekday}`;
}

function updateTime(): void {
    const now = new Date();
    const timeElement = document.querySelector<HTMLElement>('.current-time');

    if (!timeElement) {
        return;
    }

    timeElement.innerHTML = `
        <span class="current-time__label">当前时间</span>
        <span class="current-time__clock">${formatTime(now)}</span>
        <span class="current-time__date">${formatDate(now)}</span>
    `;
}

export function initTimeDisplay(): void {
    if (intervalId) {
        window.clearInterval(intervalId);
    }

    updateTime();
    intervalId = window.setInterval(updateTime, 1000);

    window.addEventListener(
        'beforeunload',
        () => {
            if (intervalId) {
                window.clearInterval(intervalId);
                intervalId = undefined;
            }
        },
        { once: true },
    );
}

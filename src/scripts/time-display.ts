const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

let intervalId: number | undefined;

function pad2(value: number): string {
    return String(value).padStart(2, '0');
}

function formatTime(date: Date): string {
    const hours = pad2(date.getHours());
    const minutes = pad2(date.getMinutes());
    const seconds = pad2(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}

function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
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

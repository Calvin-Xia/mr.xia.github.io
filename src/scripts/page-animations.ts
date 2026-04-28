export function initPageAnimations(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    document.querySelectorAll<HTMLElement>('main > section').forEach((element, index) => {
        element.style.opacity = '';
        element.style.animation = '';
        window.setTimeout(() => {
            element.classList.add('fade-in-up');
        }, index * 100);
    });

    document.querySelectorAll<HTMLElement>('.shadowbox:not(.markdown-container)').forEach((element, index) => {
        window.setTimeout(() => {
            element.classList.add('fade-in-up');
        }, index * 150 + 500);
    });

    document.querySelectorAll<HTMLElement>('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

export function initButtonRipples(): void {
    document.querySelectorAll<HTMLElement>('.btn').forEach((button) => {
        button.addEventListener('click', (event) => {
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            const pointerEvent = event as MouseEvent;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${pointerEvent.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${pointerEvent.clientY - rect.top - size / 2}px`;
            ripple.classList.add('ripple');

            button.appendChild(ripple);
            window.setTimeout(() => ripple.remove(), 600);
        });
    });
}

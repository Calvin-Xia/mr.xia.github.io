const SECTION_STAGGER_MS = 100;
const SHADOWBOX_STAGGER_MS = 150;
const SHADOWBOX_OFFSET_MS = 500;
const CARD_STAGGER_S = 0.1;

export function initPageAnimations(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    document.querySelectorAll<HTMLElement>('main > section').forEach((element, index) => {
        element.style.opacity = '';
        element.style.animation = '';
        window.setTimeout(() => {
            element.classList.add('fade-in-up');
        }, index * SECTION_STAGGER_MS);
    });

    document.querySelectorAll<HTMLElement>('.shadowbox:not(.markdown-container)').forEach((element, index) => {
        window.setTimeout(() => {
            element.classList.add('fade-in-up');
        }, index * SHADOWBOX_STAGGER_MS + SHADOWBOX_OFFSET_MS);
    });

    document.querySelectorAll<HTMLElement>('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * CARD_STAGGER_S}s`;
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

// Visual obfuscation only, not a security boundary against crawlers.
const encodedEmail = 'cGVyc29uYWxwYWdlZmVlZGJhY2tAY2FsdmluLXhpYS5jb20=';

function decode(): string {
    return window.atob(encodedEmail);
}

export const EmailProtection = {
    decode,

    init(): void {
        document.querySelectorAll<HTMLElement>('[data-email-placeholder]').forEach((container) => {
            if (container.querySelector('.email-link')) {
                return;
            }

            const email = decode();
            const link = document.createElement('a');

            link.href = `mailto:${email}`;
            link.textContent = '点击这里';
            link.className = 'email-link';
            container.appendChild(link);
        });
    },
};

export function initEmailProtection(): void {
    EmailProtection.init();
}

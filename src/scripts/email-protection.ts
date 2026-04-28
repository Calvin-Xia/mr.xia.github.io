const encodedEmail = 'cGVyc29uYWxwYWdlZmVlZGJhY2tAY2FsdmluLXhpYS5jb20=';

export function initEmailProtection(): void {
    document.querySelectorAll<HTMLElement>('[data-email-placeholder]').forEach((container) => {
        if (container.querySelector('.email-link')) {
            return;
        }

        const email = window.atob(encodedEmail);
        const link = document.createElement('a');

        link.href = `mailto:${email}`;
        link.textContent = '点击这里';
        link.className = 'email-link';
        container.appendChild(link);
    });
}

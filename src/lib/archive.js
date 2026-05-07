import { compareContentItems } from './shared-content.js';

function toArchiveItem(entry) {
    return {
        id: entry.id,
        type: 'article',
        title: entry.data.title,
        date: entry.data.date,
        monthDay: entry.data.date.slice(5, 10),
        href: `/articles/${entry.id}/`,
        category: entry.data.category,
        tags: entry.data.tags || [],
    };
}

export function createArchiveGroups(entries = []) {
    const groups = new Map();
    const archiveItems = entries
        .filter((entry) => entry?.data?.status !== 'draft')
        .filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry?.data?.date || ''))
        .map(toArchiveItem)
        .sort(compareContentItems);

    for (const item of archiveItems) {
        const year = item.date.slice(0, 4);
        const items = groups.get(year) || [];
        items.push(item);
        groups.set(year, items);
    }

    return [...groups.entries()]
        .sort(([leftYear], [rightYear]) => rightYear.localeCompare(leftYear))
        .map(([year, items]) => ({ year, items }));
}

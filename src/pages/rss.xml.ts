import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
    const posts = await getCollection('blog', ({ data }) => data.status !== 'draft');

    return rss({
        title: 'Mr.Xia - 个人小站',
        description: 'Mr.Xia的个人网站 - 记录生活、技术与思考',
        site: context.site,
        items: posts
            .sort((a, b) => b.data.date.localeCompare(a.data.date))
            .map((post) => ({
                title: post.data.title,
                description: post.data.excerpt,
                pubDate: new Date(post.data.date),
                link: `/articles/${post.id}/`,
            })),
        customData: '<language>zh-CN</language>',
    });
}

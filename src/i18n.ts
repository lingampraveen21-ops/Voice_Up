import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';

export const locales = ['en', 'hi', 'es', 'pt', 'fr'];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});

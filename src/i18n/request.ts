console.log('Loading next-intl request config...');
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'hi', 'es', 'pt', 'fr'];

export default getRequestConfig(async ({ locale }) => {
    if (!locales.includes(locale as typeof locales[number])) notFound();

    return {
        locale: locale as string,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});

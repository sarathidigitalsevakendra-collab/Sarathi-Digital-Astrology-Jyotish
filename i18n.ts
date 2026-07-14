
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['hi', 'mr', 'en'];
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = 'hi';
  }
 
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

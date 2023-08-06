import enTranslations from '@shopify/polaris/locales/en.json';
import {Link as RemixLink} from '@remix-run/react';
import {AppProvider} from '@shopify/polaris';
import type {HTMLProps} from 'react';

export function ThemeProvider({children}: {children: React.ReactNode}) {
  return (
    <AppProvider i18n={enTranslations} linkComponent={Link}>
      {children}
    </AppProvider>
  );
}

interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  url: string;
}

function Link({ref, url, ...rest}: LinkProps) {
  return <RemixLink to={url} {...rest} />;
}

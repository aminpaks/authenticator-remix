import polaris from '@shopify/polaris/build/esm/styles.css';
import {cssBundleHref} from '@remix-run/css-bundle';
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react';
import type {LinksFunction} from '@remix-run/node';

import {ThemeProvider} from './components/ThemeProvider';

export const links: LinksFunction = () => [
  {rel: 'stylesheet', href: polaris},
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
];

export function meta() {
  return [
    {charset: 'utf-8'},
    {title: 'Authenticator'},
    {viewport: 'width=device-width,initial-scale=1'},
  ];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

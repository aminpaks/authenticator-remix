import {cssBundleHref} from '@remix-run/css-bundle';
import polaris from '@shopify/polaris/build/esm/styles.css';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type HtmlLinkDescriptor,
} from '@remix-run/react';
import type {LinksFunction} from '@remix-run/node';

import {ThemeProvider} from '~/components/ThemeProvider';
import {globalTitle, viewPort} from '~/constant';

const linkDefinitions: HtmlLinkDescriptor[] = [
  {rel: 'stylesheet', href: polaris},
  {rel: 'manifest', href: '/manifest.json'},
  {rel: 'icon', href: '/favicon.ico'},
  {rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180'},
  {rel: 'icon', type: 'image/png', href: '/icon-16x16.png', sizes: '16x16'},
  {rel: 'icon', type: 'image/png', href: '/icon-32x32.png', sizes: '32x32'},
];
export const links: LinksFunction = () =>
  linkDefinitions.concat(...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []));

export function meta() {
  return [{charset: 'utf-8'}, {title: globalTitle}, viewPort];
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

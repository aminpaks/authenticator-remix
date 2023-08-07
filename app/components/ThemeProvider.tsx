import enTranslations from '@shopify/polaris/locales/en.json';
import {Link as RemixLink, useLocation} from '@remix-run/react';
import {AppProvider, Frame, Navigation, TopBar} from '@shopify/polaris';
import {ShopcodesMajor, ReferralCodeMajor, CircleInformationMajor} from '@shopify/polaris-icons';

import type {HTMLProps} from 'react';

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const location = useLocation();
  const logo = {
    width: 260,
    topBarSource: '/logo.svg',
    url: '/',
    accessibilityLabel: 'Authenticator app',
  };

  const topBarMarkup = <TopBar showNavigationToggle />;
  const navigationMarkup = (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={[
          {
            url: '/',
            label: 'QRCode Decoder',
            icon: ShopcodesMajor,
            matches: location.pathname === '/',
          },
          {
            url: '/otp-code',
            label: 'OTP Code Generator',
            icon: ReferralCodeMajor,
            matches: location.pathname === '/otp-code',
          },
          {
            url: '/about',
            label: 'About',
            icon: CircleInformationMajor,
            matches: location.pathname === '/about',
          },
        ]}
      />
    </Navigation>
  );

  return (
    <AppProvider i18n={enTranslations} linkComponent={Link}>
      <Frame logo={logo} topBar={topBarMarkup} navigation={navigationMarkup}>
        {children}
      </Frame>
    </AppProvider>
  );
}

interface LinkProps extends HTMLProps<HTMLAnchorElement> {
  url: string;
}

function Link({ref, url, ...rest}: LinkProps) {
  return <RemixLink to={url} {...rest} />;
}

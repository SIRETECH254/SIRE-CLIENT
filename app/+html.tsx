import { ScrollViewStyleReset } from 'expo-router/html';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="SIRE TECH - Innovative technology solutions for your business" />
        <title>SIRE TECH - Client Portal</title>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}


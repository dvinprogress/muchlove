// This root layout is required by Next.js but all page rendering
// happens in [locale]/layout.tsx which handles i18n and locale-specific metadata
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

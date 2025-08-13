import TanStackProvider from '@/components/TanStackProvider';

export default function TanStackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TanStackProvider>
      {children}
    </TanStackProvider>
  );
}
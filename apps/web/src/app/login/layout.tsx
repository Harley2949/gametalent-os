import { ReactNode } from 'react';

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // 完全独立的 layout，不包含任何 Navbar
    // 只渲染 children，绕过根 layout 的 Navbar
    <>{children}</>
  );
}

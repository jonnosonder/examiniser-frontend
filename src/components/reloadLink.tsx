'use client';

import Link from 'next/link';

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ReloadLink({ href, children, className }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();           // Prevent Next.js client routing
    window.location.href = href;  // Force full page reload
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

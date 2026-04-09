// SPDX-License-Identifier: GPL-3.0-only
// Copyright © 2025 Jonathan Kwok

'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';

interface Props {
  href: string;
  children: React.ReactNode;
  router: AppRouterInstance;
  className?: string;
  reload: boolean;
}

export function ReloadLink({ href, children, router, className, reload }: Props) {

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (reload) {
      window.location.href = href;
    } else {
      router.push(href);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

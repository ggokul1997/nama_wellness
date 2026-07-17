'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  navItems: NavItem[];
}

export function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  // On mobile, limit to max 5 items for the bottom bar
  const visibleItems = navItems.slice(0, 5);

  return (
    <nav className="bottom-nav hide-desktop">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="icon" style={{ 
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease',
              marginBottom: '2px'
            }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

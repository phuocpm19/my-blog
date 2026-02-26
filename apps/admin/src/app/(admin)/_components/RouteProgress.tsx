'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

// Config NProgress
NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.2 });

export default function RouteProgress() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('/') && href !== pathname) {
        NProgress.start();
      }
    };

    // Bắt cả menu click (Ant Design Menu dùng onClick, không phải <a>)
    const handleMenuClick = () => {
      NProgress.start();
    };

    document.addEventListener('click', handleClick);

    // Lắng nghe navigation từ router.push
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
      NProgress.start();
      return originalPushState(...args);
    };

    return () => {
      document.removeEventListener('click', handleClick);
      history.pushState = originalPushState;
    };
  }, [pathname]);

  return (
    <style jsx global>{`
      #nprogress {
        pointer-events: none;
      }
      #nprogress .bar {
        background: #1677ff;
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px #1677ff, 0 0 5px #1677ff;
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  );
}

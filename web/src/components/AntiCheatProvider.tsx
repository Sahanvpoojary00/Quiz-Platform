"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function AntiCheatProvider({ children }: { children: React.ReactNode }) {
  const [warnings, setWarnings] = useState(0);
  const pathname = usePathname();

  // Only run anti-cheat on quiz and coding paths
  const isProtectedPath = pathname?.startsWith('/quiz') || pathname?.startsWith('/coding');

  useEffect(() => {
    if (!isProtectedPath) return;

    const logCheat = async (event: string, severity: 'LOW' | 'MEDIUM' | 'HIGH') => {
      try {
        await fetch('/api/log-cheat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, severity })
        });
      } catch (err) {
        console.error(err);
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        logCheat('TAB_SWITCH', 'HIGH');
        setWarnings(w => w + 1);
        alert('Warning: Tab switching is strictly prohibited! Activity logged.');
      }
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logCheat('COPY_PASTE', 'MEDIUM');
      setWarnings(w => w + 1);
      alert('Warning: Copy/Paste is disabled!');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logCheat('RIGHT_CLICK', 'LOW');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        logCheat('DEVTOOLS', 'HIGH');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProtectedPath]);

  return (
    <>
      {children}
      {warnings > 0 && isProtectedPath && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded shadow-2xl z-50 border border-red-400 animate-bounce">
          <p className="font-bold text-lg">⚠️ Anti-Cheat Warning</p>
          <p>You have {warnings} violations.</p>
          <p className="text-xs mt-1 text-red-100">Administrators have been notified.</p>
        </div>
      )}
    </>
  );
}

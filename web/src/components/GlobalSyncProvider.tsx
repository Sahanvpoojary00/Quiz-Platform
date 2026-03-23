"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const GlobalSyncContext = createContext<any>(null);

export function GlobalSyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ status: 'LOBBY', currentRound: 1 });
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/system-state');
        if (!res.ok) return;
        const data = await res.json();
        
        const prevState = state;
        const nextState = data.state;
        
        setState(nextState);
        setIsBlocked(data.isBlocked);

        // Handle Blocked Users
        if (data.isBlocked && pathname !== '/login' && pathname !== '/dashboard') {
          router.push('/dashboard?kicked=true');
          return;
        }

        // Only redirect non-admins
        const userRole = document.cookie.split('; ').find(row => row.startsWith('user_role='))?.split('=')[1];
        if (userRole === 'ADMIN') return;

        // Redirection Logic
        if (nextState.status === 'LOBBY' && pathname !== '/lobby' && pathname !== '/login' && pathname !== '/dashboard') {
          router.push('/lobby');
        } else if (nextState.status === 'ACTIVE') {
          const targetPath = `/quiz/${nextState.currentRound}`;
          if (pathname !== targetPath && pathname !== '/dashboard' && pathname !== '/login' && !pathname.startsWith('/admin')) {
             router.push(targetPath);
          }
        } else if (nextState.status === 'FINISHED' && pathname !== '/dashboard' && pathname !== '/login') {
           router.push('/dashboard');
        }

      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(poll, 2500); // 2.5 second polling
    poll(); // Initial check
    
    return () => clearInterval(interval);
  }, [pathname, router, state]);

  return (
    <GlobalSyncContext.Provider value={{ state, isBlocked }}>
       {children}
    </GlobalSyncContext.Provider>
  );
}

export const useGlobalSync = () => useContext(GlobalSyncContext);

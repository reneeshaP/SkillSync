import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DashboardStatsProvider } from '../../contexts/DashboardStatsContext';
import Sidebar from './Sidebar';
import MobileTopBar from './MobileTopBar';
import MobileBottomBar from './MobileBottomBar';

const MotionDiv = motion.div;

export default function AppShell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <DashboardStatsProvider>
      <div className="flex min-h-screen bg-bg text-text">
        <Sidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          <MobileTopBar />

          <main id="main-content" className="flex-1 pb-20 lg:pb-0">
            <AnimatePresence mode="wait" initial={false}>
              <MotionDiv
                key={location.pathname}
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </MotionDiv>
            </AnimatePresence>
          </main>

          <MobileBottomBar />
        </div>
      </div>
    </DashboardStatsProvider>
  );
}

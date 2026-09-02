import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Find scrollable layout containers and scroll them to top
    const scrollContainers = document.querySelectorAll('main, .overflow-y-auto');
    scrollContainers.forEach(container => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}

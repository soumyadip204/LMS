import { useState, useEffect } from 'react';
import { Routes, useLocation } from 'react-router-dom';
import './AnimatedRoutes.css';

const AnimatedRoutes = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    // When the location changes, start the fadeOut animation
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    // When fadeOut finishes, switch the location and trigger fadeIn
    if (transitionStage === 'fadeOut') {
      setTransitionStage('fadeIn');
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`animated-page ${transitionStage}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <Routes location={displayLocation}>
        {children}
      </Routes>
    </div>
  );
};

export default AnimatedRoutes;

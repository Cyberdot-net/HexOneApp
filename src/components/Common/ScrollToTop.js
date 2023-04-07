import React, { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [ visible, setVisible ] = useState(false);

  const toggleVisible = () => {
    if (window.scrollY > 150) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);

    return () => {
      window.removeEventListener('scroll', toggleVisible);
    }
  }, []);

  const goToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
  };

  return (
    visible && <div className="scroll-to-top">
      <div className="top" onClick={goToTop}>
        <svg width="28" height="28" fill="black" viewBox="0 0 256 256">
          <path d="M222.138,91.475l-89.6-89.6c-2.5-2.5-6.551-2.5-9.051,0l-89.6,89.6c-2.5,2.5-2.5,6.551,0,9.051s6.744,2.5,9.244,0L122,21.85  V249.6c0,3.535,2.466,6.4,6,6.4s6-2.865,6-6.4V21.85l78.881,78.676c1.25,1.25,2.992,1.875,4.629,1.875s3.326-0.625,4.576-1.875  C224.586,98.025,224.638,93.975,222.138,91.475z"></path>
        </svg>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";

export default function CustomSwitch({ checked, onChange, yesLabel, noLabel }) {

  const yesRef = useRef("");
  const noRef = useRef("");
  const coverRef = useRef("");

  useEffect(() => {
    if (checked) {
      coverRef.current.style.width = `${yesRef.current.offsetWidth}px`;
      coverRef.current.style.left = "0px";
    } else {
      coverRef.current.style.width = `${noRef.current.offsetWidth}px`;
      coverRef.current.style.left = `${yesRef.current.offsetWidth}px`;
    }
  }, [checked]);

  return (
    <div className="label-switch">
      <div
        ref={coverRef}
        className="cover"
      />
      <div 
        ref={yesRef}
        className="custom-switch-label"
        onClick={() => onChange(true)}>
        {yesLabel}
      </div>
      <div 
        ref={noRef}
        className="custom-switch-label"
        onClick={() => onChange(false)}
        >
        {noLabel}
      </div>
    </div>
  );
}

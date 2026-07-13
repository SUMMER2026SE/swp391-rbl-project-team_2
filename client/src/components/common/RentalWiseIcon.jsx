import React from 'react';

const RentalWiseIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Blue Building (Left) */}
    <g stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {/* Roof */}
      <path d="M 15 45 L 35 25 L 55 45" />
      {/* Body */}
      <path d="M 25 35 L 25 75 L 45 75 L 45 35" fill="#2563eb" />
      {/* Windows */}
      <rect x="29" y="45" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="37" y="45" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="29" y="55" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="37" y="55" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="29" y="65" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="37" y="65" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
    </g>

    {/* Purple Building (Right) */}
    <g stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      {/* Roof */}
      <path d="M 40 55 L 55 40 L 70 55" />
      {/* Body */}
      <path d="M 48 48 L 48 75 L 62 75 L 62 48" fill="#8b5cf6" />
      {/* Windows */}
      <rect x="51" y="56" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="57" y="56" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="51" y="65" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
      <rect x="57" y="65" width="4" height="4" fill="white" stroke="white" strokeWidth="2" />
    </g>

    {/* Curved Base Line */}
    <path
      d="M 15 82 C 35 92 65 92 85 82"
      stroke="#2563eb"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default RentalWiseIcon;

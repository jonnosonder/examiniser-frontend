import React from 'react';

type ArrowIconProps = React.SVGProps<SVGSVGElement>;

const ArrowIcon: React.FC<ArrowIconProps> = () => (
  <svg className='bg-background'  height="100%" style={{flexGrow: 0}} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="30" width="62" height="4" rx="2" fill="black"/>
    <rect x="0.300003" y="31.8" width="30.7173" height="4" rx="2" transform="rotate(-45 0.300003 31.8)" fill="black"/>
    <rect x="3.10001" y="29.3" width="30.7173" height="4" rx="2" transform="rotate(45 3.10001 29.3)" fill="black"/>
  </svg>
);

export default ArrowIcon;

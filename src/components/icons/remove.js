import React from 'react'

function RemoveIcon({ ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z"></path>
      <path d="M18 9L12 15"></path>
      <path d="M12 9L18 15"></path>
    </svg>
  )
}

export default RemoveIcon

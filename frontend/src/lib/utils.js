import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// roundPad utility function
export const roundPad = (value, decimalLength) => {
  // If only decimalLength is provided, return a function
  if (typeof value === 'number' && decimalLength === undefined) {
    return (val) => roundPad(val, value);
  }
  
  // If both parameters are provided, process the value
  if (value !== undefined && decimalLength !== undefined) {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.' + '0'.repeat(decimalLength);
    
    const rounded = num.toFixed(decimalLength);
    return rounded;
  }
  
  // If only value is provided, default to 2 decimal places
  if (value !== undefined) {
    return roundPad(value, 2);
  }
  
  // If no parameters, return the function itself
  return roundPad;
};
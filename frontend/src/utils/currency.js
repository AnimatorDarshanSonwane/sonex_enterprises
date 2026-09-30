/**
 * Currency Formatting Utility for Indian Rupee (INR)
 * Formats numbers into Indian Numbering System: e.g. ₹24,999 or ₹1,49,999.00
 */

export const formatINR = (amount, includeDecimals = false) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  
  const num = Number(amount);
  
  if (includeDecimals) {
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

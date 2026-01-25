/**
 * Helper Utilities
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique booking number
 * Format: CB-YYYYMMDD-XXXXXX
 */
const generateBookingNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CB-${dateStr}-${random}`;
};

/**
 * Generate slug from string
 */
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Calculate booking expiry time
 */
const getBookingExpiryTime = (minutes = 10) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Parse time slot from datetime
 */
const getTimeSlot = (dateTime) => {
  const hour = new Date(dateTime).getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Generate seat layout for a screen
 * @param {number} rows - Number of rows
 * @param {number} cols - Seats per row
 * @returns {Array} Seat layout
 */
const generateSeatLayout = (rows, cols) => {
  const layout = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      layout.push({
        row: rowLabels[r],
        number: c,
        seatType: r < 2 ? 'REGULAR' : r >= rows - 2 ? 'PREMIUM' : 'REGULAR',
      });
    }
  }
  
  return layout;
};

/**
 * Calculate price based on seat type and screen type
 */
const calculateSeatPrice = (basePrice, seatType, screenType, isWeekend = false) => {
  let price = parseFloat(basePrice);
  
  // Seat type multipliers
  const seatMultipliers = {
    REGULAR: 1.0,
    PREMIUM: 1.5,
    RECLINER: 2.0,
    VIP: 2.5,
    WHEELCHAIR: 1.0,
  };
  
  // Screen type multipliers
  const screenMultipliers = {
    STANDARD: 1.0,
    IMAX: 1.8,
    DOLBY: 1.6,
    FOUR_DX: 2.0,
    PREMIUM: 1.5,
  };
  
  price *= seatMultipliers[seatType] || 1.0;
  price *= screenMultipliers[screenType] || 1.0;
  
  // Weekend surcharge
  if (isWeekend) {
    price *= 1.2;
  }
  
  return Math.round(price * 100) / 100;
};

module.exports = {
  generateBookingNumber,
  generateSlug,
  getBookingExpiryTime,
  getTimeSlot,
  formatCurrency,
  generateSeatLayout,
  calculateSeatPrice,
};

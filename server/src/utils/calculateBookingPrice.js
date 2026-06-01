const calculateBookingPrice = (startDate, endDate, pricePerDay) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const numberOfDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = numberOfDays * pricePerDay;
  const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
  const totalPrice = Math.round((subtotal + serviceFee) * 100) / 100;
  return { numberOfDays, pricePerDay, serviceFee, totalPrice };
};

module.exports = calculateBookingPrice;

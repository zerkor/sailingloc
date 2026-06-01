export const calculatePrice = (startDate, endDate, pricePerDay) => {
  if (!startDate || !endDate || !pricePerDay) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start >= end) return null;
  const diffTime = Math.abs(end - start);
  const numberOfDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const subtotal = numberOfDays * pricePerDay;
  const serviceFee = Math.round(subtotal * 0.1 * 100) / 100;
  const totalPrice = Math.round((subtotal + serviceFee) * 100) / 100;
  return { numberOfDays, subtotal, serviceFee, totalPrice };
};

export const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

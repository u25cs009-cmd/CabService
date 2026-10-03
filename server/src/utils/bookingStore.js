import mongoose from 'mongoose';
import Booking from '../models/Booking.js';

export const inMemoryBookings = new Map();

/**
 * Helper to find a booking by reference code (DB or in-memory fallback)
 */
export async function findBookingByRef(referenceCode) {
  const refUpper = String(referenceCode).toUpperCase();
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const booking = await Booking.findOne({ referenceCode: refUpper });
    if (booking) return booking;
  }
  
  return inMemoryBookings.get(refUpper) || null;
}

/**
 * Helper to update booking fields (DB or in-memory fallback)
 */
export async function updateBookingByRef(referenceCode, updateFields) {
  const refUpper = String(referenceCode).toUpperCase();
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    const updatedDoc = await Booking.findOneAndUpdate(
      { referenceCode: refUpper },
      { $set: updateFields },
      { new: true }
    );
    if (updatedDoc) return updatedDoc;
  }

  const existing = inMemoryBookings.get(refUpper);
  if (existing) {
    const updated = { ...existing, ...updateFields, updatedAt: new Date() };
    inMemoryBookings.set(refUpper, updated);
    return updated;
  }

  return null;
}

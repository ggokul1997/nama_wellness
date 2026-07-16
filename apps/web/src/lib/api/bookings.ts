import { apiFetch } from './client';
import {
  UpdateAvailabilityInput,
  IndividualPricingInput,
  CreateBookingInput,
  TeacherAvailability,
  IndividualSessionPricing,
  IndividualSessionBooking,
} from '@nama/shared';

// --- Availability ---
export const getTeacherAvailability = async (teacherId: string) => {
  return apiFetch<{ availability: TeacherAvailability[] }>(`/bookings/availability/${teacherId}`);
};

export const updateTeacherAvailability = async (input: UpdateAvailabilityInput) => {
  return apiFetch<{ availability: TeacherAvailability[] }>('/bookings/availability', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
};

// --- Pricing ---
export const getTeacherPricing = async (teacherId: string) => {
  return apiFetch<{ pricing: IndividualSessionPricing[] }>(`/bookings/pricing/${teacherId}`);
};

export const createTeacherPricing = async (input: IndividualPricingInput) => {
  return apiFetch<{ pricing: IndividualSessionPricing }>('/bookings/pricing', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateTeacherPricing = async (pricingId: string, input: Partial<IndividualPricingInput>) => {
  return apiFetch<{ pricing: IndividualSessionPricing }>(`/bookings/pricing/${pricingId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
};

// --- Bookings ---
export const getMyBookings = async () => {
  return apiFetch<{ bookings: IndividualSessionBooking[] }>('/bookings/my-bookings');
};

export const createBooking = async (input: CreateBookingInput) => {
  return apiFetch<{ booking: IndividualSessionBooking }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  meetingUrl?: string,
  cancellationReason?: string
) => {
  return apiFetch<{ booking: IndividualSessionBooking }>(`/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, meetingUrl, cancellationReason }),
  });
};

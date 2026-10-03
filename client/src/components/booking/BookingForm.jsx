import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Calendar, Clock, Car, Users, FileText, Send, CheckCircle, AlertCircle, Compass, Ticket, MessageCircle } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import FareEstimate from './FareEstimate';
import { vehiclesData as localVehicles } from '../../data/vehicles';
import { servicesData } from '../../data/services';
import { submitBooking, fetchVehicles, openWhatsAppFallback } from '../../services/api';
import { calculateFare } from '../../utils/fare';

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const initialVehicleId = searchParams.get('vehicle') || 'hatchback';
  const initialServiceId = searchParams.get('service') || servicesData[0].id;

  const [vehicles, setVehicles] = useState(localVehicles);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pickup: '',
    drop: '',
    date: getTodayString(),
    time: '10:00',
    serviceType: initialServiceId,
    vehicleType: initialVehicleId,
    passengers: '1',
    distanceKm: '15',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedReferenceCode, setSavedReferenceCode] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Fetch dynamic vehicles on mount
  useEffect(() => {
    fetchVehicles().then((data) => {
      if (data && data.length > 0) {
        setVehicles(data);
      }
    });
  }, []);

  // Selected vehicle object
  const selectedVehicle = vehicles.find((v) => v.id === formData.vehicleType || v.vehicleId === formData.vehicleType || v.type === formData.vehicleType) || vehicles[0] || localVehicles[0];

  // Validate form state
  const validate = (data = formData) => {
    const errs = {};

    if (!data.name.trim()) {
      errs.name = 'Full name is required';
    } else if (data.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!data.phone.trim()) {
      errs.phone = '10-digit phone number is required';
    } else if (cleanPhone.length < 10 || cleanPhone.length > 12) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!data.pickup.trim()) {
      errs.pickup = 'Pickup address/location is required';
    }
    if (!data.drop.trim()) {
      errs.drop = 'Drop-off location is required';
    }

    if (!data.date) {
      errs.date = 'Pickup date is required';
    } else {
      const selected = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.date = 'Pickup date cannot be in the past';
      }
    }

    if (!data.time) {
      errs.time = 'Pickup time is required';
    }

    if (!data.vehicleType) {
      errs.vehicleType = 'Please select a vehicle type';
    } else if (selectedVehicle) {
      const passengerCount = parseInt(data.passengers, 10) || 0;
      if (passengerCount < 1) {
        errs.passengers = 'At least 1 passenger is required';
      } else if (passengerCount > (selectedVehicle.seats || selectedVehicle.passengerCapacity)) {
        errs.passengers = `Selected vehicle max capacity is ${selectedVehicle.seats || selectedVehicle.passengerCapacity} passengers`;
      }
    }

    if (data.distanceKm && (isNaN(data.distanceKm) || parseFloat(data.distanceKm) < 0)) {
      errs.distanceKm = 'Enter a valid positive distance in KM';
    }

    return errs;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData, vehicles]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id || e.target.name;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const fareInfo = calculateFare(formData.distanceKm, selectedVehicle);

    const bookingPayload = {
      ...formData,
      vehicleType: selectedVehicle.vehicleId || selectedVehicle.type || selectedVehicle.name,
      serviceType: servicesData.find((s) => s.id === formData.serviceType)?.name || formData.serviceType,
      estimatedFare: fareInfo.estimatedFare
    };

    const result = await submitBooking(bookingPayload);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      setSavedReferenceCode(result.referenceCode);
      setIsFallbackMode(!!result.isFallback);
    }
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Booking Form Column */}
      <div className="lg:col-span-7">
        <Card className="shadow-md border border-slate-200/90 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cab Ride Reservation</h3>
              <p className="text-xs text-slate-500 font-medium">Fill in your trip details for instant server booking & notification.</p>
            </div>
          </div>

          {submitSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-emerald-950">Booking Request Confirmed!</h4>
                {savedReferenceCode ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 font-extrabold text-base my-2">
                    <Ticket className="w-5 h-5 text-amber-700" />
                    <span>Booking Reference Code: #{savedReferenceCode}</span>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-amber-800 bg-amber-100 p-2 rounded-lg inline-block">
                    Sent via WhatsApp Fallback Flow
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                {savedReferenceCode
                  ? 'Your booking has been saved in our system and dispatched to our dispatch desk. You can check status anytime using your reference code.'
                  : 'Your booking request details have been prepared for instant WhatsApp dispatch.'}
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="emerald"
                  onClick={() => {
                    const fareInfo = calculateFare(formData.distanceKm, selectedVehicle);
                    openWhatsAppFallback({
                      ...formData,
                      vehicleType: selectedVehicle.name,
                      serviceType: servicesData.find((s) => s.id === formData.serviceType)?.name || formData.serviceType,
                      estimatedFare: fareInfo.estimatedFare
                    }, savedReferenceCode);
                  }}
                  icon={MessageCircle}
                >
                  Send Details on WhatsApp
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setSavedReferenceCode(null);
                    setIsFallbackMode(false);
                    setFormData((prev) => ({ ...prev, pickup: '', drop: '', notes: '' }));
                    setTouched({});
                  }}
                >
                  Book Another Ride
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  1. Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    error={touched.name && errors.name}
                    required
                    icon={User}
                  />

                  <Input
                    id="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    error={touched.phone && errors.phone}
                    helperText="10-digit mobile number"
                    required
                    icon={Phone}
                  />
                </div>

                <Input
                  id="email"
                  type="email"
                  label="Email Address (Optional)"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && errors.email}
                  icon={Mail}
                />
              </div>

              {/* Ride Details */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  2. Trip Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    id="serviceType"
                    label="Service Type"
                    value={formData.serviceType}
                    onChange={handleChange}
                    onBlur={() => handleBlur('serviceType')}
                    options={servicesData.map((s) => ({ value: s.id, label: `${s.name} (${s.tagline})` }))}
                    required
                    icon={Compass}
                  />

                  <Select
                    id="vehicleType"
                    label="Vehicle Type"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    onBlur={() => handleBlur('vehicleType')}
                    options={vehicles.map((v) => ({
                      value: v.vehicleId || v.id || v.type,
                      label: `${v.name} (${v.seats} Seats • ₹${v.ratePerKm}/km)`
                    }))}
                    required
                    icon={Car}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="pickup"
                    label="Pickup Location"
                    placeholder="Area, Street address or Airport"
                    value={formData.pickup}
                    onChange={handleChange}
                    onBlur={() => handleBlur('pickup')}
                    error={touched.pickup && errors.pickup}
                    required
                    icon={MapPin}
                  />

                  <Input
                    id="drop"
                    label="Drop-off Destination"
                    placeholder="Drop address or destination city"
                    value={formData.drop}
                    onChange={handleChange}
                    onBlur={() => handleBlur('drop')}
                    error={touched.drop && errors.drop}
                    required
                    icon={MapPin}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    id="date"
                    type="date"
                    label="Pickup Date"
                    min={getTodayString()}
                    value={formData.date}
                    onChange={handleChange}
                    onBlur={() => handleBlur('date')}
                    error={touched.date && errors.date}
                    required
                    icon={Calendar}
                  />

                  <Input
                    id="time"
                    type="time"
                    label="Pickup Time"
                    value={formData.time}
                    onChange={handleChange}
                    onBlur={() => handleBlur('time')}
                    error={touched.time && errors.time}
                    required
                    icon={Clock}
                  />

                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max={selectedVehicle.seats || 12}
                    label={`Passengers (Max ${selectedVehicle.seats || 12})`}
                    value={formData.passengers}
                    onChange={handleChange}
                    onBlur={() => handleBlur('passengers')}
                    error={touched.passengers && errors.passengers}
                    required
                    icon={Users}
                  />
                </div>

                <Input
                  id="distanceKm"
                  type="number"
                  min="1"
                  label="Approximate Trip Distance (in KM)"
                  placeholder="e.g. 25"
                  value={formData.distanceKm}
                  onChange={handleChange}
                  onBlur={() => handleBlur('distanceKm')}
                  error={touched.distanceKm && errors.distanceKm}
                  helperText="Used to compute instant fare estimate on the right sidebar"
                />

                <Input
                  id="notes"
                  label="Special Instructions / Notes (Optional)"
                  placeholder="e.g. Flight number, extra luggage space needed, child seat"
                  value={formData.notes}
                  onChange={handleChange}
                  icon={FileText}
                />
              </div>

              {/* Submit Error Summary */}
              {Object.keys(touched).length > 0 && !isFormValid && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Please correct highlighted fields before submitting your booking.</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || (Object.keys(touched).length > 0 && !isFormValid)}
                  icon={Send}
                  iconPosition="right"
                >
                  {isSubmitting ? 'Saving Booking Request...' : 'Confirm & Request Booking'}
                </Button>
                <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
                  🔒 No advance payment required for initial request. Server calculated fare.
                </p>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Live Fare Estimator Sidebar Column */}
      <div className="lg:col-span-5 space-y-6">
        <FareEstimate distanceKm={formData.distanceKm} vehicle={selectedVehicle} />

        {/* Selected Vehicle Quick Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Vehicle Info</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              AC Available
            </span>
          </div>

          <h4 className="text-lg font-bold text-slate-900">{selectedVehicle.name}</h4>
          <p className="text-xs text-slate-500 font-medium">{selectedVehicle.models}</p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-700 font-medium">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase">Passenger Seats</span>
              <span className="font-bold text-slate-900 text-sm">Up to {selectedVehicle.seats} Persons</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase">Luggage Capacity</span>
              <span className="font-bold text-slate-900 text-sm">{selectedVehicle.luggageCapacity || selectedVehicle.luggage} Medium Bags</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

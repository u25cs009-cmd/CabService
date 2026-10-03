import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Car,
  Users,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Compass,
  Ticket,
  MessageCircle,
  Repeat,
  Package
} from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import FareEstimate from './FareEstimate';
import MapPreview from './MapPreview';
import LocationAutocomplete from './LocationAutocomplete';
import { vehiclesData as localVehicles } from '../../data/vehicles';
import { servicesData } from '../../data/services';
import { submitBooking, fetchVehicles, openWhatsAppFallback } from '../../services/api';

const HOURLY_PACKAGES = [
  { value: '4hr_40km', label: '4 Hours / 40 KM Package' },
  { value: '8hr_80km', label: '8 Hours / 80 KM Package' },
  { value: '12hr_120km', label: '12 Hours / 120 KM Package' }
];

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const initialVehicleId = searchParams.get('vehicle') || 'hatchback';
  const initialServiceId = searchParams.get('service') || 'local';

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
    pickupCoords: null,
    dropCoords: null,
    date: getTodayString(),
    time: '10:00',
    tripType: initialServiceId,
    packageId: '4hr_40km',
    isRoundTrip: false,
    vehicleType: initialVehicleId,
    passengers: '1',
    distanceKm: '15',
    notes: ''
  });

  const [fareData, setFareData] = useState({
    distanceKm: 15,
    durationMins: 35,
    estimatedFare: 400,
    breakdown: null
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedReferenceCode, setSavedReferenceCode] = useState(null);

  useEffect(() => {
    fetchVehicles().then((data) => {
      if (data && data.length > 0) {
        setVehicles(data);
      }
    });
  }, []);

  const selectedVehicle =
    vehicles.find(
      (v) =>
        v.id === formData.vehicleType ||
        v.vehicleId === formData.vehicleType ||
        v.type === formData.vehicleType
    ) ||
    vehicles[0] ||
    localVehicles[0];

  // Fetch live fare calculation from server API
  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const timer = setTimeout(() => {
      fetch(`${API_BASE_URL}/fare/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup: formData.pickup,
          drop: formData.drop,
          pickupCoords: formData.pickupCoords,
          dropCoords: formData.dropCoords,
          vehicleType: selectedVehicle.type || selectedVehicle.vehicleId || formData.vehicleType,
          tripType: formData.tripType,
          dateTime: `${formData.date}T${formData.time}:00`,
          packageId: formData.packageId,
          isRoundTrip: formData.isRoundTrip,
          distanceKm: formData.distanceKm
        })
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setFareData({
              distanceKm: json.data.distanceKm,
              durationMins: json.data.durationMins,
              estimatedFare: json.data.estimatedFare,
              breakdown: json.data.breakdown
            });
          }
        })
        .catch(() => {});
    }, 400);

    return () => clearTimeout(timer);
  }, [
    formData.pickup,
    formData.drop,
    formData.pickupCoords,
    formData.dropCoords,
    formData.vehicleType,
    formData.tripType,
    formData.date,
    formData.time,
    formData.packageId,
    formData.isRoundTrip,
    formData.distanceKm,
    selectedVehicle
  ]);

  const validate = (data = formData) => {
    const errs = {};

    if (!data.name.trim()) errs.name = 'Full name is required';
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!data.phone.trim() || cleanPhone.length < 10) errs.phone = 'Valid 10-digit phone number is required';
    if (!data.pickup.trim()) errs.pickup = 'Pickup location is required';
    if (!data.drop.trim()) errs.drop = 'Drop location is required';
    if (!data.date) errs.date = 'Pickup date is required';
    if (!data.time) errs.time = 'Pickup time is required';

    const maxSeats = selectedVehicle.seats || selectedVehicle.passengerCapacity || 4;
    if (parseInt(data.passengers, 10) > maxSeats) {
      errs.passengers = `Selected vehicle max capacity is ${maxSeats} seats`;
    }

    return errs;
  };

  useEffect(() => {
    setErrors(validate(formData));
  }, [formData, vehicles]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const fieldName = id || e.target.name;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
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

    const bookingPayload = {
      ...formData,
      vehicleType: selectedVehicle.vehicleId || selectedVehicle.type || selectedVehicle.name,
      serviceType: servicesData.find((s) => s.id === formData.tripType)?.name || formData.tripType,
      estimatedFare: fareData.estimatedFare,
      fareBreakdown: fareData.breakdown
    };

    const result = await submitBooking(bookingPayload);
    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      setSavedReferenceCode(result.referenceCode);
    }
  };

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
              <p className="text-xs text-slate-500 font-medium">Maps Places Autocomplete & Server Calculated Fare</p>
            </div>
          </div>

          {submitSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-emerald-950">Booking Request Confirmed!</h4>
                {savedReferenceCode && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 font-extrabold text-base my-2">
                    <Ticket className="w-5 h-5 text-amber-700" />
                    <span>Booking Reference Code: #{savedReferenceCode}</span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
                Your booking request has been saved and dispatched to our 24/7 dispatch desk.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="emerald"
                  onClick={() => openWhatsAppFallback(formData, savedReferenceCode)}
                  icon={MessageCircle}
                >
                  Send Details on WhatsApp
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitSuccess(false);
                    setSavedReferenceCode(null);
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
              {/* Trip Type Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Select Trip Service Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  {[
                    { id: 'local', label: 'Local City' },
                    { id: 'outstation', label: 'Outstation' },
                    { id: 'airport', label: 'Airport' },
                    { id: 'hourly', label: 'Hourly Rental' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, tripType: t.id }))}
                      className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                        formData.tripType === t.id
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4 pt-2">
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
                    error={touched.phone && errors.phone}
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
                  icon={Mail}
                />
              </div>

              {/* Ride Details */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  2. Trip & Location Details
                </h4>

                {/* Autocomplete Pickup & Drop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <LocationAutocomplete
                    id="pickup"
                    label="Pickup Location"
                    placeholder="Search pickup address or airport"
                    value={formData.pickup}
                    onChange={handleChange}
                    onSelectPlace={(place) =>
                      setFormData((prev) => ({
                        ...prev,
                        pickup: place.address,
                        pickupCoords: { lat: place.lat, lng: place.lng }
                      }))
                    }
                    error={touched.pickup && errors.pickup}
                    required
                  />

                  <LocationAutocomplete
                    id="drop"
                    label="Drop-off Destination"
                    placeholder="Search drop location"
                    value={formData.drop}
                    onChange={handleChange}
                    onSelectPlace={(place) =>
                      setFormData((prev) => ({
                        ...prev,
                        drop: place.address,
                        dropCoords: { lat: place.lat, lng: place.lng }
                      }))
                    }
                    error={touched.drop && errors.drop}
                    required
                  />
                </div>

                {/* Outstation Round-Trip Toggle */}
                {formData.tripType === 'outstation' && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <input
                      id="isRoundTrip"
                      type="checkbox"
                      checked={formData.isRoundTrip}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="isRoundTrip" className="text-xs font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                      <Repeat className="w-4 h-4 text-amber-700" />
                      <span>Round Trip (Discount applied for return journeys)</span>
                    </label>
                  </div>
                )}

                {/* Hourly Package Selector */}
                {formData.tripType === 'hourly' && (
                  <Select
                    id="packageId"
                    label="Hourly Rental Package"
                    value={formData.packageId}
                    onChange={handleChange}
                    options={HOURLY_PACKAGES}
                    required
                    icon={Package}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    id="vehicleType"
                    label="Vehicle Type"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    options={vehicles.map((v) => ({
                      value: v.vehicleId || v.id || v.type,
                      label: `${v.name} (${v.seats} Seats • ₹${v.ratePerKm}/km)`
                    }))}
                    required
                    icon={Car}
                  />

                  <Input
                    id="passengers"
                    type="number"
                    min="1"
                    max={selectedVehicle.seats || 12}
                    label={`Passengers (Max ${selectedVehicle.seats || 12})`}
                    value={formData.passengers}
                    onChange={handleChange}
                    error={touched.passengers && errors.passengers}
                    required
                    icon={Users}
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
                    error={touched.time && errors.time}
                    required
                    icon={Clock}
                  />

                  <Input
                    id="distanceKm"
                    type="number"
                    min="1"
                    label="Distance (KM)"
                    placeholder="e.g. 25"
                    value={formData.distanceKm}
                    onChange={handleChange}
                    helperText="Auto-computed or manual"
                  />
                </div>

                <Input
                  id="notes"
                  label="Special Notes (Optional)"
                  placeholder="e.g. Flight number, extra luggage space"
                  value={formData.notes}
                  onChange={handleChange}
                  icon={FileText}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting || (Object.keys(touched).length > 0 && !Object.keys(errors).length === 0)}
                  icon={Send}
                  iconPosition="right"
                >
                  {isSubmitting ? 'Confirming Booking...' : 'Confirm & Request Booking'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Live Fare & Map Preview Sidebar Column */}
      <div className="lg:col-span-5 space-y-6">
        <FareEstimate
          distanceKm={fareData.distanceKm}
          durationMins={fareData.durationMins}
          vehicle={selectedVehicle}
          breakdown={fareData.breakdown}
          tripType={formData.tripType}
        />

        <MapPreview
          pickup={formData.pickup}
          drop={formData.drop}
          distanceKm={fareData.distanceKm}
          durationMins={fareData.durationMins}
        />
      </div>
    </div>
  );
}

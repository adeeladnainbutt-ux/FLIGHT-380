import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plane, 
  Clock, 
  User, 
  Users,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  PlaneTakeoff,
  PlaneLanding,
  AlertCircle,
  Copy,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const BookingFlow = ({ 
  flight, 
  searchParams,
  onBack,
  onComplete 
}) => {
  const [step, setStep] = useState(1); // 1: Itinerary, 2: Passengers, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Passenger data
  const [passengers, setPassengers] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: ''
  });

  // Get passenger counts from searchParams
  const passengerCounts = {
    adults: searchParams?.adults || 1,
    youth: searchParams?.youth || 0,
    children: searchParams?.children || 0,
    infants: searchParams?.infants || 0
  };

  const totalPassengers = passengerCounts.adults + passengerCounts.youth + passengerCounts.children + passengerCounts.infants;

  // Initialize passengers array when component mounts
  React.useEffect(() => {
    const initialPassengers = [];
    
    for (let i = 0; i < passengerCounts.adults; i++) {
      initialPassengers.push({
        type: 'ADULT',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        passport_number: '',
        passport_expiry: '',
        email: '',
        phone: ''
      });
    }
    for (let i = 0; i < passengerCounts.youth; i++) {
      initialPassengers.push({
        type: 'YOUTH',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: '',
        passport_number: '',
        passport_expiry: ''
      });
    }
    for (let i = 0; i < passengerCounts.children; i++) {
      initialPassengers.push({
        type: 'CHILD',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: ''
      });
    }
    for (let i = 0; i < passengerCounts.infants; i++) {
      initialPassengers.push({
        type: 'INFANT',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        nationality: ''
      });
    }
    
    setPassengers(initialPassengers);
  }, [passengerCounts.adults, passengerCounts.youth, passengerCounts.children, passengerCounts.infants]);

  // Price breakdown calculation
  const calculatePriceBreakdown = () => {
    const basePrice = flight.price;
    const isRoundTrip = !!flight.return_departure_time;
    
    // Typical pricing ratios
    const adultPrice = basePrice / totalPassengers;
    const youthPrice = adultPrice * 0.9; // 10% discount for youth
    const childPrice = adultPrice * 0.75; // 25% discount for children
    const infantPrice = adultPrice * 0.1; // 90% discount for infants
    
    return {
      adult: {
        count: passengerCounts.adults,
        unitPrice: adultPrice,
        total: adultPrice * passengerCounts.adults
      },
      youth: {
        count: passengerCounts.youth,
        unitPrice: youthPrice,
        total: youthPrice * passengerCounts.youth
      },
      child: {
        count: passengerCounts.children,
        unitPrice: childPrice,
        total: childPrice * passengerCounts.children
      },
      infant: {
        count: passengerCounts.infants,
        unitPrice: infantPrice,
        total: infantPrice * passengerCounts.infants
      },
      grandTotal: basePrice
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.title || !p.first_name || !p.last_name || !p.date_of_birth || !p.gender || !p.nationality) {
        setError(`Please fill in all required fields for Passenger ${i + 1}`);
        return false;
      }
    }
    if (!contactInfo.email || !contactInfo.phone) {
      setError('Please provide contact email and phone number');
      return false;
    }
    setError(null);
    return true;
  };

  const handleBooking = async () => {
    if (!validatePassengers()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/bookings/create`, {
        flight_id: flight.id || 'manual-booking',
        flight_data: flight,
        passengers: passengers,
        contact: contactInfo,
        passenger_counts: passengerCounts,
        total_price: priceBreakdown.grandTotal,
        currency: 'GBP'
      });
      
      if (response.data.success) {
        setBookingResult(response.data);
        setStep(3);
      } else {
        setError(response.data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('An error occurred while processing your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Step 1: Itinerary & Price Breakdown
  const ItineraryStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Review Your Itinerary</h2>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
      </div>

      {/* Flight Itinerary */}
      <Card>
        <CardHeader className="bg-brand-50">
          <CardTitle className="flex items-center gap-2 text-brand-700">
            <Plane className="h-5 w-5" />
            Flight Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Outbound Flight */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <PlaneTakeoff className="h-5 w-5 text-brand-600" />
              <span className="font-semibold text-lg">Outbound Flight</span>
              <Badge className="ml-2 bg-brand-100 text-brand-700">{formatDate(flight.departure_time)}</Badge>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                  <div className="text-lg font-semibold text-brand-600">{flight.from}</div>
                  <div className="text-sm text-slate-500">{formatDate(flight.departure_time)}</div>
                </div>
                
                <div className="flex-1 px-8">
                  <div className="text-center text-sm text-slate-500 mb-2">{formatDuration(flight.duration)}</div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                    <div className="flex-1 h-0.5 bg-slate-300 relative mx-2">
                      {flight.stops > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400"></div>
                      )}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                  </div>
                  <div className="text-center text-sm font-medium text-brand-600 mt-2">
                    {flight.is_direct ? 'Direct' : `${flight.stops} Stop(s)`}
                    {flight.layover_display && (
                      <span className="text-orange-600 ml-2">• Layover: {flight.layover_display}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                  <div className="text-lg font-semibold text-brand-600">{flight.to}</div>
                  <div className="text-sm text-slate-500">{formatDate(flight.arrival_time)}</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-100 rounded flex items-center justify-center">
                    <span className="font-bold text-brand-700">{flight.airline_code}</span>
                  </div>
                  <div>
                    <div className="font-medium">{flight.airline}</div>
                    <div className="text-slate-500">Flight {flight.airline_code}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Return Flight */}
          {flight.return_departure_time && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PlaneLanding className="h-5 w-5 text-brand-600" />
                <span className="font-semibold text-lg">Return Flight</span>
                <Badge className="ml-2 bg-brand-100 text-brand-700">{formatDate(flight.return_departure_time)}</Badge>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{formatTime(flight.return_departure_time)}</div>
                    <div className="text-lg font-semibold text-brand-600">{flight.to}</div>
                    <div className="text-sm text-slate-500">{formatDate(flight.return_departure_time)}</div>
                  </div>
                  
                  <div className="flex-1 px-8">
                    <div className="text-center text-sm text-slate-500 mb-2">{formatDuration(flight.return_duration)}</div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                      <div className="flex-1 h-0.5 bg-slate-300 relative mx-2">
                        {flight.return_stops > 0 && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400"></div>
                        )}
                      </div>
                      <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                    </div>
                    <div className="text-center text-sm font-medium text-brand-600 mt-2">
                      {flight.return_is_direct ? 'Direct' : `${flight.return_stops} Stop(s)`}
                      {flight.return_layover_display && (
                        <span className="text-orange-600 ml-2">• Layover: {flight.return_layover_display}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{formatTime(flight.return_arrival_time)}</div>
                    <div className="text-lg font-semibold text-brand-600">{flight.from}</div>
                    <div className="text-sm text-slate-500">{formatDate(flight.return_arrival_time)}</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-100 rounded flex items-center justify-center">
                      <span className="font-bold text-brand-700">{flight.return_airline_code || flight.airline_code}</span>
                    </div>
                    <div>
                      <div className="font-medium">{flight.return_airline || flight.airline}</div>
                      <div className="text-slate-500">Flight {flight.return_airline_code || flight.airline_code}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Users className="h-5 w-5" />
            Passenger Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {priceBreakdown.adult.count > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-500" />
                  <div>
                    <div className="font-medium">Adult (18+)</div>
                    <div className="text-sm text-slate-500">
                      {priceBreakdown.adult.count} × £{priceBreakdown.adult.unitPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold">£{priceBreakdown.adult.total.toFixed(2)}</div>
              </div>
            )}
            
            {priceBreakdown.youth.count > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Youth (12-17)</div>
                    <div className="text-sm text-slate-500">
                      {priceBreakdown.youth.count} × £{priceBreakdown.youth.unitPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold">£{priceBreakdown.youth.total.toFixed(2)}</div>
              </div>
            )}
            
            {priceBreakdown.child.count > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">Child (2-11)</div>
                    <div className="text-sm text-slate-500">
                      {priceBreakdown.child.count} × £{priceBreakdown.child.unitPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold">£{priceBreakdown.child.total.toFixed(2)}</div>
              </div>
            )}
            
            {priceBreakdown.infant.count > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-pink-500" />
                  <div>
                    <div className="font-medium">Infant (0-2)</div>
                    <div className="text-sm text-slate-500">
                      {priceBreakdown.infant.count} × £{priceBreakdown.infant.unitPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold">£{priceBreakdown.infant.total.toFixed(2)}</div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 bg-brand-50 -mx-6 px-6 py-4 -mb-6 rounded-b-lg">
              <div className="text-lg font-bold text-brand-700">Total Price</div>
              <div className="text-3xl font-bold text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)} 
          className="bg-brand-600 hover:bg-brand-700 px-8 py-6 text-lg"
        >
          Continue to Passenger Details
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Step 2: Passenger Details
  const PassengerDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Passenger Details</h2>
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Itinerary
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-email">Email Address *</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Phone Number *</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                placeholder="+44 7XXX XXXXXX"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-address">Address</Label>
              <Input
                id="contact-address"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                placeholder="Street address"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-city">City</Label>
              <Input
                id="contact-city"
                value={contactInfo.city}
                onChange={(e) => setContactInfo({...contactInfo, city: e.target.value})}
                placeholder="City"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-country">Country</Label>
              <Input
                id="contact-country"
                value={contactInfo.country}
                onChange={(e) => setContactInfo({...contactInfo, country: e.target.value})}
                placeholder="Country"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contact-postal">Postal Code</Label>
              <Input
                id="contact-postal"
                value={contactInfo.postal_code}
                onChange={(e) => setContactInfo({...contactInfo, postal_code: e.target.value})}
                placeholder="Postal code"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passenger Forms */}
      {passengers.map((passenger, index) => (
        <Card key={index}>
          <CardHeader className="bg-slate-50">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-600" />
              Passenger {index + 1} - {passenger.type}
              <Badge className={`ml-2 ${
                passenger.type === 'ADULT' ? 'bg-slate-100' :
                passenger.type === 'YOUTH' ? 'bg-blue-100 text-blue-700' :
                passenger.type === 'CHILD' ? 'bg-orange-100 text-orange-700' :
                'bg-pink-100 text-pink-700'
              }`}>
                {passenger.type === 'ADULT' ? '18+' :
                 passenger.type === 'YOUTH' ? '12-17' :
                 passenger.type === 'CHILD' ? '2-11' : '0-2'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Title *</Label>
                <Select
                  value={passenger.title}
                  onValueChange={(value) => updatePassenger(index, 'title', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>First Name *</Label>
                <Input
                  value={passenger.first_name}
                  onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                  placeholder="First name (as on passport)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={passenger.last_name}
                  onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                  placeholder="Last name (as on passport)"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={passenger.date_of_birth}
                  onChange={(e) => updatePassenger(index, 'date_of_birth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={passenger.gender}
                  onValueChange={(value) => updatePassenger(index, 'gender', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nationality *</Label>
                <Input
                  value={passenger.nationality}
                  onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                  placeholder="e.g., British"
                  className="mt-1"
                />
              </div>
              {(passenger.type === 'ADULT' || passenger.type === 'YOUTH') && (
                <>
                  <div>
                    <Label>Passport Number</Label>
                    <Input
                      value={passenger.passport_number}
                      onChange={(e) => updatePassenger(index, 'passport_number', e.target.value)}
                      placeholder="Passport number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Passport Expiry</Label>
                    <Input
                      type="date"
                      value={passenger.passport_expiry}
                      onChange={(e) => updatePassenger(index, 'passport_expiry', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Price Summary */}
      <Card className="bg-brand-50 border-brand-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-brand-700">Total Price</div>
              <div className="text-sm text-brand-600">{totalPassengers} passenger(s)</div>
            </div>
            <div className="text-3xl font-bold text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleBooking}
          disabled={isSubmitting}
          className="bg-brand-600 hover:bg-brand-700 px-8 py-6 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Complete Booking
              <CheckCircle className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Step 3: Confirmation
  const ConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-lg text-slate-600">Your flight has been successfully booked.</p>
      </div>

      {/* PNR Display */}
      <Card className="bg-brand-50 border-brand-200">
        <CardContent className="p-8 text-center">
          <div className="text-sm text-brand-600 mb-2">Your Booking Reference (PNR)</div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-5xl font-bold text-brand-700 tracking-widest">{bookingResult?.pnr}</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(bookingResult?.pnr)}
              className="border-brand-300 text-brand-600"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-4">Please save this reference number for your records</p>
        </CardContent>
      </Card>

      {/* Booking Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Route</div>
              <div className="font-medium">{flight.from} → {flight.to}</div>
            </div>
            <div>
              <div className="text-slate-500">Departure</div>
              <div className="font-medium">{formatDate(flight.departure_time)}</div>
            </div>
            {flight.return_departure_time && (
              <div>
                <div className="text-slate-500">Return</div>
                <div className="font-medium">{formatDate(flight.return_departure_time)}</div>
              </div>
            )}
            <div>
              <div className="text-slate-500">Passengers</div>
              <div className="font-medium">{totalPassengers} traveller(s)</div>
            </div>
            <div>
              <div className="text-slate-500">Total Paid</div>
              <div className="font-bold text-lg text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-slate-500">Status</div>
              <Badge className="bg-green-100 text-green-700">CONFIRMED</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Confirmations (Mock) */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Mail className="h-5 w-5" />
            Email Confirmations Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="customer">
            <TabsList className="mb-4">
              <TabsTrigger value="customer">Customer Email</TabsTrigger>
              <TabsTrigger value="agent">Agent Email</TabsTrigger>
            </TabsList>
            
            {bookingResult?.emails_sent?.map((email, index) => (
              <TabsContent key={index} value={index === 0 ? 'customer' : 'agent'}>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4" />
                      <span>To: {email.to}</span>
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{email.subject}</div>
                  </div>
                  <Separator className="my-4" />
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    {email.body}
                  </pre>
                  <div className="mt-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Email sent successfully (Mock)</span>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => window.print()}
          className="px-8"
        >
          Print Confirmation
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-brand-600 hover:bg-brand-700 px-8"
        >
          Search New Flight
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>1</div>
            <span className="font-medium">Itinerary</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>2</div>
            <span className="font-medium">Passengers</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-brand-600' : 'bg-slate-200'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>3</div>
            <span className="font-medium">Confirmation</span>
          </div>
        </div>
      </div>

      {step === 1 && <ItineraryStep />}
      {step === 2 && <PassengerDetailsStep />}
      {step === 3 && <ConfirmationStep />}
    </div>
  );
};

import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  Loader2,
  Printer,
  Download,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import jsPDF from 'jspdf';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const BookingFlow = ({ 
  flight, 
  searchParams,
  onBack,
  onComplete 
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const itineraryRef = useRef(null);
  const confirmationRef = useRef(null);
  
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactCity, setContactCity] = useState('');
  const [contactCountry, setContactCountry] = useState('');
  const [contactPostalCode, setContactPostalCode] = useState('');

  const passengerCounts = {
    adults: searchParams?.adults || 1,
    youth: searchParams?.youth || 0,
    children: searchParams?.children || 0,
    infants: searchParams?.infants || 0
  };

  const totalPassengers = passengerCounts.adults + passengerCounts.youth + passengerCounts.children + passengerCounts.infants;

  React.useEffect(() => {
    const initialPassengers = [];
    
    for (let i = 0; i < passengerCounts.adults; i++) {
      initialPassengers.push({
        type: 'ADULT',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: ''
      });
    }
    for (let i = 0; i < passengerCounts.youth; i++) {
      initialPassengers.push({
        type: 'YOUTH',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: ''
      });
    }
    for (let i = 0; i < passengerCounts.children; i++) {
      initialPassengers.push({
        type: 'CHILD',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: ''
      });
    }
    for (let i = 0; i < passengerCounts.infants; i++) {
      initialPassengers.push({
        type: 'INFANT',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: ''
      });
    }
    
    setPassengers(initialPassengers);
  }, [passengerCounts.adults, passengerCounts.youth, passengerCounts.children, passengerCounts.infants]);

  const calculatePriceBreakdown = () => {
    const basePrice = flight.price;
    const adultPrice = basePrice / totalPassengers;
    const youthPrice = adultPrice * 0.9;
    const childPrice = adultPrice * 0.75;
    const infantPrice = adultPrice * 0.1;
    
    return {
      adult: { count: passengerCounts.adults, unitPrice: adultPrice, total: adultPrice * passengerCounts.adults },
      youth: { count: passengerCounts.youth, unitPrice: youthPrice, total: youthPrice * passengerCounts.youth },
      child: { count: passengerCounts.children, unitPrice: childPrice, total: childPrice * passengerCounts.children },
      infant: { count: passengerCounts.infants, unitPrice: infantPrice, total: infantPrice * passengerCounts.infants },
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
    if (!duration) return '';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const updatePassengerField = useCallback((index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.title || !p.first_name || !p.last_name || !p.date_of_birth || !p.gender) {
        setError(`Please fill in all required fields for Passenger ${i + 1}`);
        return false;
      }
    }
    if (!contactEmail || !contactPhone) {
      setError('Please provide contact email and phone number');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmitBooking = async () => {
    if (!validatePassengers()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format passengers for backend API
      const formattedPassengers = passengers.map(p => ({
        type: p.type || 'ADULT',
        title: p.title,
        first_name: p.first_name,
        last_name: p.last_name,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        nationality: p.nationality || 'UK',
        passport_number: p.passport_number || null,
        passport_expiry: p.passport_expiry || null,
        email: contactEmail,
        phone: contactPhone
      }));

      const response = await axios.post(`${API_URL}/api/bookings/create`, {
        flight_id: flight.id || `flight_${Date.now()}`,
        flight_data: {
          from: flight.from,
          to: flight.to,
          departure_time: flight.departure_time,
          arrival_time: flight.arrival_time,
          duration: flight.duration,
          airline: flight.airline,
          airline_code: flight.airline_code,
          is_direct: flight.is_direct,
          stops: flight.stops,
          price: flight.price,
          return_departure_time: flight.return_departure_time,
          return_arrival_time: flight.return_arrival_time,
          return_duration: flight.return_duration,
          return_is_direct: flight.return_is_direct,
          return_stops: flight.return_stops
        },
        passengers: formattedPassengers,
        contact: {
          email: contactEmail,
          phone: contactPhone,
          address: contactAddress || null,
          city: contactCity || null,
          country: contactCountry || null,
          postal_code: contactPostalCode || null
        },
        passenger_counts: passengerCounts,
        total_price: priceBreakdown.grandTotal,
        currency: 'GBP'
      });
      
      setBookingResult(response.data);
      setStep(3);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handlePrintItinerary = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flight Itinerary - Flight380</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #E73121; padding-bottom: 20px; }
          .logo { color: #E73121; font-size: 28px; font-weight: bold; }
          .flight-details { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #E73121; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .price { font-size: 24px; font-weight: bold; color: #E73121; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">✈ Flight380</div>
          <div>Flight Itinerary</div>
        </div>
        <div class="flight-details">
          <div class="section-title">Outbound Flight</div>
          <div class="detail-row"><span>Route:</span><span>${flight.from} → ${flight.to}</span></div>
          <div class="detail-row"><span>Date:</span><span>${formatDate(flight.departure_time)}</span></div>
          <div class="detail-row"><span>Departure:</span><span>${formatTime(flight.departure_time)}</span></div>
          <div class="detail-row"><span>Arrival:</span><span>${formatTime(flight.arrival_time)}</span></div>
          <div class="detail-row"><span>Duration:</span><span>${formatDuration(flight.duration)}</span></div>
          <div class="detail-row"><span>Airline:</span><span>${flight.airline} (${flight.airline_code})</span></div>
        </div>
        ${flight.return_departure_time ? `
        <div class="flight-details">
          <div class="section-title">Return Flight</div>
          <div class="detail-row"><span>Route:</span><span>${flight.to} → ${flight.from}</span></div>
          <div class="detail-row"><span>Date:</span><span>${formatDate(flight.return_departure_time)}</span></div>
          <div class="detail-row"><span>Departure:</span><span>${formatTime(flight.return_departure_time)}</span></div>
          <div class="detail-row"><span>Arrival:</span><span>${formatTime(flight.return_arrival_time)}</span></div>
          <div class="detail-row"><span>Duration:</span><span>${formatDuration(flight.return_duration)}</span></div>
        </div>
        ` : ''}
        <div class="price">Total: £${priceBreakdown.grandTotal.toFixed(2)}</div>
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          Generated by Flight380 | www.flight380.co.uk
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(231, 49, 33);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Flight380', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Flight Itinerary', 105, 30, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      let yPos = 55;
      
      doc.setFontSize(16);
      doc.setTextColor(231, 49, 33);
      doc.text('Outbound Flight', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Route: ${flight.from} → ${flight.to}`, 20, yPos); yPos += 7;
      doc.text(`Date: ${formatDate(flight.departure_time)}`, 20, yPos); yPos += 7;
      doc.text(`Departure: ${formatTime(flight.departure_time)}`, 20, yPos); yPos += 7;
      doc.text(`Arrival: ${formatTime(flight.arrival_time)}`, 20, yPos); yPos += 7;
      doc.text(`Duration: ${formatDuration(flight.duration)}`, 20, yPos); yPos += 7;
      doc.text(`Airline: ${flight.airline} (${flight.airline_code})`, 20, yPos); yPos += 15;
      
      if (flight.return_departure_time) {
        doc.setFontSize(16);
        doc.setTextColor(231, 49, 33);
        doc.text('Return Flight', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Route: ${flight.to} → ${flight.from}`, 20, yPos); yPos += 7;
        doc.text(`Date: ${formatDate(flight.return_departure_time)}`, 20, yPos); yPos += 7;
        doc.text(`Departure: ${formatTime(flight.return_departure_time)}`, 20, yPos); yPos += 7;
        doc.text(`Arrival: ${formatTime(flight.return_arrival_time)}`, 20, yPos); yPos += 7;
        doc.text(`Duration: ${formatDuration(flight.return_duration)}`, 20, yPos); yPos += 15;
      }
      
      doc.setFontSize(18);
      doc.setTextColor(231, 49, 33);
      doc.text(`Total: £${priceBreakdown.grandTotal.toFixed(2)}`, 20, yPos);
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Flight380 | www.flight380.co.uk', 105, 280, { align: 'center' });
      
      doc.save(`Flight380_Itinerary_${flight.from}_${flight.to}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintConfirmation = () => {
    window.print();
  };

  // Render Step 1: Itinerary
  if (step === 1) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">1</div>
              <span className="font-medium hidden sm:inline">Itinerary</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200">2</div>
              <span className="font-medium hidden sm:inline">Passengers</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200">3</div>
              <span className="font-medium hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="space-y-6" ref={itineraryRef}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Review Your Itinerary</h1>
              <p className="text-slate-600">Please review your flight details before proceeding</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrintItinerary} className="border-brand-600 text-brand-600">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isGeneratingPDF} className="border-brand-600 text-brand-600">
                {isGeneratingPDF ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Download PDF
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>

          {/* Outbound Flight Card */}
          <Card>
            <CardHeader className="bg-brand-50">
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <PlaneTakeoff className="h-5 w-5" />
                Outbound Flight
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm sm:text-lg font-bold text-brand-700">{flight.airline_code}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{flight.airline}</div>
                    <div className="text-sm text-slate-500">Flight {flight.airline_code}</div>
                  </div>
                </div>
                <Badge className={flight.is_direct ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                  {flight.is_direct ? 'Direct' : `${flight.stops} Stop(s)`}
                </Badge>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                  <div className="text-lg font-medium text-brand-600">{flight.from}</div>
                  <div className="text-sm text-slate-500">{formatDate(flight.departure_time)}</div>
                </div>
                <div className="flex-1 px-4 sm:px-8 w-full sm:w-auto">
                  <div className="text-center text-sm text-slate-500 mb-2">{formatDuration(flight.duration)}</div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                    <div className="flex-1 h-0.5 bg-brand-300 mx-2"></div>
                    <Plane className="h-5 w-5 text-brand-500 transform rotate-90" />
                    <div className="flex-1 h-0.5 bg-brand-300 mx-2"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                  <div className="text-lg font-medium text-brand-600">{flight.to}</div>
                  <div className="text-sm text-slate-500">{formatDate(flight.arrival_time)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Flight Card */}
          {flight.return_departure_time && (
            <Card>
              <CardHeader className="bg-slate-100">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <PlaneLanding className="h-5 w-5" />
                  Return Flight
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm sm:text-lg font-bold text-slate-700">{flight.airline_code}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{flight.airline}</div>
                      <div className="text-sm text-slate-500">Flight {flight.airline_code}</div>
                    </div>
                  </div>
                  <Badge className={flight.return_is_direct ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                    {flight.return_is_direct ? 'Direct' : `${flight.return_stops} Stop(s)`}
                  </Badge>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatTime(flight.return_departure_time)}</div>
                    <div className="text-lg font-medium text-slate-600">{flight.to}</div>
                    <div className="text-sm text-slate-500">{formatDate(flight.return_departure_time)}</div>
                  </div>
                  <div className="flex-1 px-4 sm:px-8 w-full sm:w-auto">
                    <div className="text-center text-sm text-slate-500 mb-2">{formatDuration(flight.return_duration)}</div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      <div className="flex-1 h-0.5 bg-slate-300 mx-2"></div>
                      <Plane className="h-5 w-5 text-slate-400 transform -rotate-90" />
                      <div className="flex-1 h-0.5 bg-slate-300 mx-2"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">{formatTime(flight.return_arrival_time)}</div>
                    <div className="text-lg font-medium text-slate-600">{flight.from}</div>
                    <div className="text-sm text-slate-500">{formatDate(flight.return_arrival_time)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-600" />
                Fare Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                {priceBreakdown.adult.count > 0 && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Adult (18+)</div>
                        <div className="text-sm text-slate-500">{priceBreakdown.adult.count} × £{priceBreakdown.adult.unitPrice.toFixed(2)}</div>
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
                        <div className="text-sm text-slate-500">{priceBreakdown.youth.count} × £{priceBreakdown.youth.unitPrice.toFixed(2)}</div>
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
                        <div className="text-sm text-slate-500">{priceBreakdown.child.count} × £{priceBreakdown.child.unitPrice.toFixed(2)}</div>
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
                        <div className="text-sm text-slate-500">{priceBreakdown.infant.count} × £{priceBreakdown.infant.unitPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold">£{priceBreakdown.infant.total.toFixed(2)}</div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 bg-brand-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 -mb-4 sm:-mb-6 rounded-b-lg">
                  <div className="text-lg font-bold text-brand-700">Total Fare</div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} className="bg-brand-600 hover:bg-brand-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg">
              Continue to Passenger Details
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 2: Passenger Details
  if (step === 2) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">1</div>
              <span className="font-medium hidden sm:inline">Itinerary</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-brand-600"></div>
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">2</div>
              <span className="font-medium hidden sm:inline">Passengers</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-200">3</div>
              <span className="font-medium hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Passenger Details</h1>
              <p className="text-slate-600">Enter passenger information for your booking</p>
            </div>
          </div>

          <Button variant="outline" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Itinerary
          </Button>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader className="bg-slate-50 p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-brand-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+44 7XXX XXXXXX"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="Street address"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={contactCity}
                    onChange={(e) => setContactCity(e.target.value)}
                    placeholder="City"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={contactCountry}
                    onChange={(e) => setContactCountry(e.target.value)}
                    placeholder="Country"
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    value={contactPostalCode}
                    onChange={(e) => setContactPostalCode(e.target.value)}
                    placeholder="Postal code"
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Forms */}
          {passengers.map((passenger, index) => {
            let typeCount = 0;
            for (let i = 0; i <= index; i++) {
              if (passengers[i].type === passenger.type) {
                typeCount++;
              }
            }
            
            return (
              <Card key={`passenger-${index}`}>
                <CardHeader className="bg-slate-50 p-4 sm:p-6">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
                    <span>Passenger {index + 1} - {passenger.type} {typeCount > 1 ? `(${typeCount})` : ''}</span>
                    <Badge className={`text-xs ${
                      passenger.type === 'ADULT' ? 'bg-slate-100' :
                      passenger.type === 'YOUTH' ? 'bg-blue-100 text-blue-700' :
                      passenger.type === 'CHILD' ? 'bg-orange-100 text-orange-700' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {passenger.type === 'ADULT' ? '18+' :
                       passenger.type === 'YOUTH' ? '12-17' :
                       passenger.type === 'CHILD' ? '2-11' : '0-2'} years
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Select
                        value={passenger.title}
                        onValueChange={(value) => updatePassengerField(index, 'title', value)}
                      >
                        <SelectTrigger className="mt-1 h-11">
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
                      <Label htmlFor={`firstname-${index}`}>First Name *</Label>
                      <Input
                        id={`firstname-${index}`}
                        value={passenger.first_name}
                        onChange={(e) => updatePassengerField(index, 'first_name', e.target.value)}
                        placeholder="First name (as on passport)"
                        className="mt-1 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lastname-${index}`}>Last Name *</Label>
                      <Input
                        id={`lastname-${index}`}
                        value={passenger.last_name}
                        onChange={(e) => updatePassengerField(index, 'last_name', e.target.value)}
                        placeholder="Last name (as on passport)"
                        className="mt-1 h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dob-${index}`}>
                        Date of Birth *
                        <span className="text-xs text-slate-500 ml-1">
                          ({passenger.type === 'ADULT' ? '18+' : passenger.type === 'YOUTH' ? '12-17' : passenger.type === 'CHILD' ? '2-11' : '0-2'} years)
                        </span>
                      </Label>
                      <Input
                        id={`dob-${index}`}
                        type="date"
                        value={passenger.date_of_birth}
                        onChange={(e) => updatePassengerField(index, 'date_of_birth', e.target.value)}
                        className="mt-1 h-11 text-base"
                        max={passenger.type === 'INFANT' ? new Date().toISOString().split('T')[0] : undefined}
                      />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select
                        value={passenger.gender}
                        onValueChange={(value) => updatePassengerField(index, 'gender', value)}
                      >
                        <SelectTrigger className="mt-1 h-11">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Price Summary */}
          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-brand-700">Total Fare</div>
                  <div className="text-sm text-brand-600">{totalPassengers} passenger(s)</div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 3: Confirmation
  if (step === 3) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">1</div>
              <span className="font-medium hidden sm:inline">Itinerary</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-brand-600"></div>
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">2</div>
              <span className="font-medium hidden sm:inline">Passengers</span>
            </div>
            <div className="w-8 sm:w-16 h-0.5 bg-brand-600"></div>
            <div className="flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-600 text-white">3</div>
              <span className="font-medium hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="space-y-6" ref={confirmationRef}>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
            <p className="text-lg text-slate-600">Your flight has been successfully booked.</p>
          </div>

          {/* PNR Display */}
          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="text-sm text-brand-600 mb-2">Your Booking Reference (PNR)</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-3xl sm:text-5xl font-bold text-brand-700 tracking-widest">{bookingResult?.pnr}</div>
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
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                  <div className="font-medium">{totalPassengers}</div>
                </div>
                <div>
                  <div className="text-slate-500">Total Price</div>
                  <div className="font-medium text-brand-600">£{priceBreakdown.grandTotal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <Badge className="bg-green-100 text-green-700">CONFIRMED</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmations */}
          {bookingResult?.emails && bookingResult.emails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Confirmation Emails
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs defaultValue={bookingResult.emails[0]?.to}>
                  <TabsList className="w-full flex-wrap h-auto gap-1">
                    {bookingResult.emails.map((email, idx) => (
                      <TabsTrigger key={idx} value={email.to} className="text-xs sm:text-sm">
                        {email.to.includes('customer') || email.to === contactEmail ? 'Customer' : 'Agent'}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {bookingResult.emails.map((email, idx) => (
                    <TabsContent key={idx} value={email.to}>
                      <div className="mt-4 bg-slate-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span>To: {email.to}</span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1">{email.subject}</div>
                        <Separator className="my-4" />
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border max-h-64 sm:max-h-96 overflow-y-auto">
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
          )}

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={handlePrintConfirmation} className="px-6 sm:px-8">
              <Printer className="h-4 w-4 mr-2" />
              Print Itinerary
            </Button>
            <Button onClick={onComplete} className="bg-brand-600 hover:bg-brand-700 px-6 sm:px-8">
              Search New Flight
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

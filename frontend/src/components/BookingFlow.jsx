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
import html2canvas from 'html2canvas';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Memoized Passenger Form Component to prevent re-renders and focus loss
const PassengerForm = React.memo(({ passenger, index, typeCount, onUpdate }) => {
  const handleInputChange = useCallback((field) => (e) => {
    onUpdate(index, field, e.target.value);
  }, [index, onUpdate]);

  const handleSelectChange = useCallback((field) => (value) => {
    onUpdate(index, field, value);
  }, [index, onUpdate]);

  return (
    <Card>
      <CardHeader className="bg-slate-50 p-4 md:p-6">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base md:text-lg">
          <User className="h-4 w-4 md:h-5 md:w-5 text-brand-600" />
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
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Title *</Label>
            <Select
              value={passenger.title}
              onValueChange={handleSelectChange('title')}
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
            <Label className="text-sm font-medium">First Name *</Label>
            <Input
              value={passenger.first_name}
              onChange={handleInputChange('first_name')}
              placeholder="First name (as on passport)"
              className="mt-1 h-11"
              autoComplete="given-name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Last Name *</Label>
            <Input
              value={passenger.last_name}
              onChange={handleInputChange('last_name')}
              placeholder="Last name (as on passport)"
              className="mt-1 h-11"
              autoComplete="family-name"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">
              Date of Birth * 
              <span className="text-xs text-slate-500 ml-1">
                ({passenger.type === 'ADULT' ? '18+' : passenger.type === 'YOUTH' ? '12-17' : passenger.type === 'CHILD' ? '2-11' : '0-2'} years)
              </span>
            </Label>
            <Input
              type="date"
              value={passenger.date_of_birth}
              onChange={handleInputChange('date_of_birth')}
              className="mt-1 h-11 text-base"
              max={passenger.type === 'INFANT' ? new Date().toISOString().split('T')[0] : undefined}
              autoComplete="bday"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Gender *</Label>
            <Select
              value={passenger.gender}
              onValueChange={handleSelectChange('gender')}
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
});

PassengerForm.displayName = 'PassengerForm';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Refs for printing
  const itineraryRef = useRef(null);
  const confirmationRef = useRef(null);
  
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
    
    // Adults first
    for (let i = 0; i < passengerCounts.adults; i++) {
      initialPassengers.push({
        type: 'ADULT',
        title: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        phone: ''
      });
    }
    // Then Youth
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
    // Then Children
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
    // Finally Infants
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

  // Price breakdown calculation
  const calculatePriceBreakdown = () => {
    const basePrice = flight.price;
    
    // Calculate per-passenger prices
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

  const formatDateShort = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const updatePassenger = useCallback((index, field, value) => {
    setPassengers(prev => {
      const newPassengers = [...prev];
      newPassengers[index] = { ...newPassengers[index], [field]: value };
      return newPassengers;
    });
  }, []);

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.title || !p.first_name || !p.last_name || !p.date_of_birth || !p.gender) {
        setError(`Please fill in all required fields for Passenger ${i + 1}`);
        return false;
      }
      
      // Validate date of birth based on passenger type
      const dob = new Date(p.date_of_birth);
      const today = new Date();
      const age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (p.type === 'ADULT' && age < 18) {
        setError(`Passenger ${i + 1}: Adult must be 18 years or older`);
        return false;
      }
      if (p.type === 'YOUTH' && (age < 12 || age > 17)) {
        setError(`Passenger ${i + 1}: Youth must be between 12-17 years old`);
        return false;
      }
      if (p.type === 'CHILD' && (age < 2 || age > 11)) {
        setError(`Passenger ${i + 1}: Child must be between 2-11 years old`);
        return false;
      }
      if (p.type === 'INFANT' && age >= 2) {
        setError(`Passenger ${i + 1}: Infant must be under 2 years old`);
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

  // Print Itinerary function
  const handlePrintItinerary = () => {
    const printContent = document.getElementById('printable-itinerary');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Flight Itinerary - Flight380</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #E73121; padding-bottom: 20px; margin-bottom: 20px; }
              .header h1 { color: #E73121; margin: 0; }
              .header p { color: #666; margin: 5px 0; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; color: #E73121; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; }
              .flight-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
              .flight-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
              .flight-route { display: flex; align-items: center; justify-content: space-between; }
              .airport { text-align: center; }
              .airport .time { font-size: 24px; font-weight: bold; }
              .airport .code { font-size: 18px; color: #E73121; font-weight: bold; }
              .airport .date { font-size: 12px; color: #666; }
              .flight-line { flex: 1; text-align: center; padding: 0 20px; }
              .flight-line .duration { font-size: 12px; color: #666; }
              .flight-line .line { height: 2px; background: #ddd; margin: 5px 0; position: relative; }
              .flight-line .stops { font-size: 12px; color: #E73121; }
              .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              .table th { background: #f5f5f5; font-weight: bold; }
              .price-row { background: #E73121; color: white; }
              .price-row td { font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
              @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Flight380</h1>
              <p>Your Flight Itinerary</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="section">
              <div class="section-title">✈ Outbound Flight</div>
              <div class="flight-box">
                <div class="flight-header">
                  <span><strong>${flight.airline}</strong> (${flight.airline_code})</span>
                  <span>${formatDate(flight.departure_time)}</span>
                </div>
                <div class="flight-route">
                  <div class="airport">
                    <div class="time">${formatTime(flight.departure_time)}</div>
                    <div class="code">${flight.from}</div>
                    <div class="date">${formatDateShort(flight.departure_time)}</div>
                  </div>
                  <div class="flight-line">
                    <div class="duration">${formatDuration(flight.duration)}</div>
                    <div class="line"></div>
                    <div class="stops">${flight.is_direct ? 'Direct' : flight.stops + ' Stop(s)'}</div>
                    ${flight.layover_display ? `<div class="stops">Layover: ${flight.layover_display}</div>` : ''}
                  </div>
                  <div class="airport">
                    <div class="time">${formatTime(flight.arrival_time)}</div>
                    <div class="code">${flight.to}</div>
                    <div class="date">${formatDateShort(flight.arrival_time)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            ${flight.return_departure_time ? `
            <div class="section">
              <div class="section-title">✈ Return Flight</div>
              <div class="flight-box">
                <div class="flight-header">
                  <span><strong>${flight.return_airline || flight.airline}</strong> (${flight.return_airline_code || flight.airline_code})</span>
                  <span>${formatDate(flight.return_departure_time)}</span>
                </div>
                <div class="flight-route">
                  <div class="airport">
                    <div class="time">${formatTime(flight.return_departure_time)}</div>
                    <div class="code">${flight.to}</div>
                    <div class="date">${formatDateShort(flight.return_departure_time)}</div>
                  </div>
                  <div class="flight-line">
                    <div class="duration">${formatDuration(flight.return_duration)}</div>
                    <div class="line"></div>
                    <div class="stops">${flight.return_is_direct ? 'Direct' : flight.return_stops + ' Stop(s)'}</div>
                    ${flight.return_layover_display ? `<div class="stops">Layover: ${flight.return_layover_display}</div>` : ''}
                  </div>
                  <div class="airport">
                    <div class="time">${formatTime(flight.return_arrival_time)}</div>
                    <div class="code">${flight.from}</div>
                    <div class="date">${formatDateShort(flight.return_arrival_time)}</div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}
            
            <div class="section">
              <div class="section-title">👥 Passengers</div>
              <table class="table">
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Age Range</th>
                </tr>
                ${passengerCounts.adults > 0 ? `<tr><td>1-${passengerCounts.adults}</td><td>Adult</td><td>18+ years</td></tr>` : ''}
                ${passengerCounts.youth > 0 ? `<tr><td>${passengerCounts.adults + 1}-${passengerCounts.adults + passengerCounts.youth}</td><td>Youth</td><td>12-17 years</td></tr>` : ''}
                ${passengerCounts.children > 0 ? `<tr><td>${passengerCounts.adults + passengerCounts.youth + 1}-${passengerCounts.adults + passengerCounts.youth + passengerCounts.children}</td><td>Child</td><td>2-11 years</td></tr>` : ''}
                ${passengerCounts.infants > 0 ? `<tr><td>${totalPassengers - passengerCounts.infants + 1}-${totalPassengers}</td><td>Infant</td><td>0-2 years</td></tr>` : ''}
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">💰 Fare Breakdown</div>
              <table class="table">
                <tr>
                  <th>Passenger Type</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
                ${priceBreakdown.adult.count > 0 ? `<tr><td>Adult (18+)</td><td>${priceBreakdown.adult.count}</td><td>£${priceBreakdown.adult.unitPrice.toFixed(2)}</td><td>£${priceBreakdown.adult.total.toFixed(2)}</td></tr>` : ''}
                ${priceBreakdown.youth.count > 0 ? `<tr><td>Youth (12-17)</td><td>${priceBreakdown.youth.count}</td><td>£${priceBreakdown.youth.unitPrice.toFixed(2)}</td><td>£${priceBreakdown.youth.total.toFixed(2)}</td></tr>` : ''}
                ${priceBreakdown.child.count > 0 ? `<tr><td>Child (2-11)</td><td>${priceBreakdown.child.count}</td><td>£${priceBreakdown.child.unitPrice.toFixed(2)}</td><td>£${priceBreakdown.child.total.toFixed(2)}</td></tr>` : ''}
                ${priceBreakdown.infant.count > 0 ? `<tr><td>Infant (0-2)</td><td>${priceBreakdown.infant.count}</td><td>£${priceBreakdown.infant.unitPrice.toFixed(2)}</td><td>£${priceBreakdown.infant.total.toFixed(2)}</td></tr>` : ''}
                <tr class="price-row">
                  <td colspan="3">TOTAL FARE</td>
                  <td>£${priceBreakdown.grandTotal.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div class="footer">
              <p>Flight380 - www.flight380.co.uk</p>
              <p>For queries: info@flight380.co.uk</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  // Download PDF function
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;
      
      // Header
      pdf.setFillColor(231, 49, 33); // Brand red
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Flight380', pageWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Flight Itinerary', pageWidth / 2, 23, { align: 'center' });
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
      
      yPos = 45;
      pdf.setTextColor(0, 0, 0);
      
      // Outbound Flight Section
      pdf.setFillColor(231, 49, 33);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OUTBOUND FLIGHT', margin + 3, yPos + 5.5);
      yPos += 12;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Flight details box
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 35, 'S');
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${flight.airline} (${flight.airline_code})`, margin + 5, yPos + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(flight.departure_time), pageWidth - margin - 5, yPos + 8, { align: 'right' });
      
      // Departure
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatTime(flight.departure_time), margin + 15, yPos + 20);
      pdf.setFontSize(12);
      pdf.setTextColor(231, 49, 33);
      pdf.text(flight.from, margin + 15, yPos + 27);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDateShort(flight.departure_time), margin + 15, yPos + 32);
      
      // Duration line
      pdf.setFontSize(9);
      pdf.text(formatDuration(flight.duration), pageWidth / 2, yPos + 16, { align: 'center' });
      pdf.setDrawColor(150, 150, 150);
      pdf.line(margin + 45, yPos + 22, pageWidth - margin - 45, yPos + 22);
      pdf.text(flight.is_direct ? 'Direct' : `${flight.stops} Stop(s)`, pageWidth / 2, yPos + 28, { align: 'center' });
      if (flight.layover_display) {
        pdf.text(`Layover: ${flight.layover_display}`, pageWidth / 2, yPos + 33, { align: 'center' });
      }
      
      // Arrival
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatTime(flight.arrival_time), pageWidth - margin - 15, yPos + 20, { align: 'right' });
      pdf.setFontSize(12);
      pdf.setTextColor(231, 49, 33);
      pdf.text(flight.to, pageWidth - margin - 15, yPos + 27, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDateShort(flight.arrival_time), pageWidth - margin - 15, yPos + 32, { align: 'right' });
      
      yPos += 42;
      
      // Return Flight if exists
      if (flight.return_departure_time) {
        pdf.setFillColor(231, 49, 33);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RETURN FLIGHT', margin + 3, yPos + 5.5);
        yPos += 12;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 35, 'S');
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${flight.return_airline || flight.airline} (${flight.return_airline_code || flight.airline_code})`, margin + 5, yPos + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatDate(flight.return_departure_time), pageWidth - margin - 5, yPos + 8, { align: 'right' });
        
        // Departure
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatTime(flight.return_departure_time), margin + 15, yPos + 20);
        pdf.setFontSize(12);
        pdf.setTextColor(231, 49, 33);
        pdf.text(flight.to, margin + 15, yPos + 27);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatDateShort(flight.return_departure_time), margin + 15, yPos + 32);
        
        // Duration
        pdf.setFontSize(9);
        pdf.text(formatDuration(flight.return_duration), pageWidth / 2, yPos + 16, { align: 'center' });
        pdf.line(margin + 45, yPos + 22, pageWidth - margin - 45, yPos + 22);
        pdf.text(flight.return_is_direct ? 'Direct' : `${flight.return_stops} Stop(s)`, pageWidth / 2, yPos + 28, { align: 'center' });
        if (flight.return_layover_display) {
          pdf.text(`Layover: ${flight.return_layover_display}`, pageWidth / 2, yPos + 33, { align: 'center' });
        }
        
        // Arrival
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formatTime(flight.return_arrival_time), pageWidth - margin - 15, yPos + 20, { align: 'right' });
        pdf.setFontSize(12);
        pdf.setTextColor(231, 49, 33);
        pdf.text(flight.from, pageWidth - margin - 15, yPos + 27, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(formatDateShort(flight.return_arrival_time), pageWidth - margin - 15, yPos + 32, { align: 'right' });
        
        yPos += 42;
      }
      
      // Passengers Section
      pdf.setFillColor(231, 49, 33);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PASSENGERS', margin + 3, yPos + 5.5);
      yPos += 12;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      // Passenger table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('#', margin + 5, yPos + 5);
      pdf.text('Type', margin + 25, yPos + 5);
      pdf.text('Age Range', margin + 80, yPos + 5);
      yPos += 9;
      
      pdf.setFont('helvetica', 'normal');
      let passengerNum = 1;
      if (passengerCounts.adults > 0) {
        pdf.text(`${passengerNum}-${passengerNum + passengerCounts.adults - 1}`, margin + 5, yPos + 5);
        pdf.text('Adult', margin + 25, yPos + 5);
        pdf.text('18+ years', margin + 80, yPos + 5);
        passengerNum += passengerCounts.adults;
        yPos += 7;
      }
      if (passengerCounts.youth > 0) {
        pdf.text(`${passengerNum}-${passengerNum + passengerCounts.youth - 1}`, margin + 5, yPos + 5);
        pdf.text('Youth', margin + 25, yPos + 5);
        pdf.text('12-17 years', margin + 80, yPos + 5);
        passengerNum += passengerCounts.youth;
        yPos += 7;
      }
      if (passengerCounts.children > 0) {
        pdf.text(`${passengerNum}-${passengerNum + passengerCounts.children - 1}`, margin + 5, yPos + 5);
        pdf.text('Child', margin + 25, yPos + 5);
        pdf.text('2-11 years', margin + 80, yPos + 5);
        passengerNum += passengerCounts.children;
        yPos += 7;
      }
      if (passengerCounts.infants > 0) {
        pdf.text(`${passengerNum}-${passengerNum + passengerCounts.infants - 1}`, margin + 5, yPos + 5);
        pdf.text('Infant', margin + 25, yPos + 5);
        pdf.text('0-2 years', margin + 80, yPos + 5);
        yPos += 7;
      }
      
      yPos += 8;
      
      // Fare Breakdown Section
      pdf.setFillColor(231, 49, 33);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FARE BREAKDOWN', margin + 3, yPos + 5.5);
      yPos += 12;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      // Fare table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.text('Passenger Type', margin + 5, yPos + 5);
      pdf.text('Qty', margin + 70, yPos + 5);
      pdf.text('Unit Price', margin + 95, yPos + 5);
      pdf.text('Total', margin + 135, yPos + 5);
      yPos += 9;
      
      pdf.setFont('helvetica', 'normal');
      if (priceBreakdown.adult.count > 0) {
        pdf.text('Adult (18+)', margin + 5, yPos + 5);
        pdf.text(priceBreakdown.adult.count.toString(), margin + 70, yPos + 5);
        pdf.text(`£${priceBreakdown.adult.unitPrice.toFixed(2)}`, margin + 95, yPos + 5);
        pdf.text(`£${priceBreakdown.adult.total.toFixed(2)}`, margin + 135, yPos + 5);
        yPos += 7;
      }
      if (priceBreakdown.youth.count > 0) {
        pdf.text('Youth (12-17)', margin + 5, yPos + 5);
        pdf.text(priceBreakdown.youth.count.toString(), margin + 70, yPos + 5);
        pdf.text(`£${priceBreakdown.youth.unitPrice.toFixed(2)}`, margin + 95, yPos + 5);
        pdf.text(`£${priceBreakdown.youth.total.toFixed(2)}`, margin + 135, yPos + 5);
        yPos += 7;
      }
      if (priceBreakdown.child.count > 0) {
        pdf.text('Child (2-11)', margin + 5, yPos + 5);
        pdf.text(priceBreakdown.child.count.toString(), margin + 70, yPos + 5);
        pdf.text(`£${priceBreakdown.child.unitPrice.toFixed(2)}`, margin + 95, yPos + 5);
        pdf.text(`£${priceBreakdown.child.total.toFixed(2)}`, margin + 135, yPos + 5);
        yPos += 7;
      }
      if (priceBreakdown.infant.count > 0) {
        pdf.text('Infant (0-2)', margin + 5, yPos + 5);
        pdf.text(priceBreakdown.infant.count.toString(), margin + 70, yPos + 5);
        pdf.text(`£${priceBreakdown.infant.unitPrice.toFixed(2)}`, margin + 95, yPos + 5);
        pdf.text(`£${priceBreakdown.infant.total.toFixed(2)}`, margin + 135, yPos + 5);
        yPos += 7;
      }
      
      // Total row
      yPos += 3;
      pdf.setFillColor(231, 49, 33);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('TOTAL FARE', margin + 5, yPos + 7);
      pdf.text(`£${priceBreakdown.grandTotal.toFixed(2)}`, margin + 135, yPos + 7);
      
      // Footer
      yPos = pageHeight - 20;
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Flight380 - www.flight380.co.uk', pageWidth / 2, yPos, { align: 'center' });
      pdf.text('For queries: info@flight380.co.uk', pageWidth / 2, yPos + 5, { align: 'center' });
      
      // Save PDF
      pdf.save(`Flight380_Itinerary_${flight.from}_${flight.to}_${formatDateShort(flight.departure_time).replace(/\//g, '-')}.pdf`);
      
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print Confirmation (itinerary only)
  const handlePrintConfirmation = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - Flight380</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #E73121; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #E73121; margin: 0; }
            .pnr-box { background: #E73121; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .pnr-box .label { font-size: 14px; }
            .pnr-box .code { font-size: 36px; font-weight: bold; letter-spacing: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: bold; color: #E73121; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; }
            .flight-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
            .flight-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .flight-route { display: flex; align-items: center; justify-content: space-between; }
            .airport { text-align: center; }
            .airport .time { font-size: 24px; font-weight: bold; }
            .airport .code { font-size: 18px; color: #E73121; font-weight: bold; }
            .flight-line { flex: 1; text-align: center; padding: 0 20px; }
            .flight-line .duration { font-size: 12px; color: #666; }
            .passenger-table { width: 100%; border-collapse: collapse; }
            .passenger-table th, .passenger-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .passenger-table th { background: #f5f5f5; }
            .total-box { background: #E73121; color: white; padding: 15px; text-align: center; border-radius: 8px; }
            .total-box .amount { font-size: 28px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            .status { display: inline-block; background: #22c55e; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Flight380</h1>
            <p>Booking Confirmation</p>
          </div>
          
          <div class="pnr-box">
            <div class="label">Your Booking Reference (PNR)</div>
            <div class="code">${bookingResult?.pnr}</div>
          </div>
          
          <p style="text-align: center;"><span class="status">CONFIRMED</span></p>
          
          <div class="section">
            <div class="section-title">✈ Outbound Flight</div>
            <div class="flight-box">
              <div class="flight-header">
                <span><strong>${flight.airline}</strong> (${flight.airline_code})</span>
                <span>${formatDate(flight.departure_time)}</span>
              </div>
              <div class="flight-route">
                <div class="airport">
                  <div class="time">${formatTime(flight.departure_time)}</div>
                  <div class="code">${flight.from}</div>
                </div>
                <div class="flight-line">
                  <div class="duration">${formatDuration(flight.duration)}</div>
                  <div>→</div>
                  <div>${flight.is_direct ? 'Direct' : flight.stops + ' Stop(s)'}</div>
                </div>
                <div class="airport">
                  <div class="time">${formatTime(flight.arrival_time)}</div>
                  <div class="code">${flight.to}</div>
                </div>
              </div>
            </div>
          </div>
          
          ${flight.return_departure_time ? `
          <div class="section">
            <div class="section-title">✈ Return Flight</div>
            <div class="flight-box">
              <div class="flight-header">
                <span><strong>${flight.return_airline || flight.airline}</strong> (${flight.return_airline_code || flight.airline_code})</span>
                <span>${formatDate(flight.return_departure_time)}</span>
              </div>
              <div class="flight-route">
                <div class="airport">
                  <div class="time">${formatTime(flight.return_departure_time)}</div>
                  <div class="code">${flight.to}</div>
                </div>
                <div class="flight-line">
                  <div class="duration">${formatDuration(flight.return_duration)}</div>
                  <div>→</div>
                  <div>${flight.return_is_direct ? 'Direct' : flight.return_stops + ' Stop(s)'}</div>
                </div>
                <div class="airport">
                  <div class="time">${formatTime(flight.return_arrival_time)}</div>
                  <div class="code">${flight.from}</div>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">👥 Passengers</div>
            <table class="passenger-table">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Date of Birth</th>
              </tr>
              ${passengers.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.title} ${p.first_name} ${p.last_name}</td>
                  <td>${p.type}</td>
                  <td>${p.date_of_birth}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="total-box">
            <div>Total Paid</div>
            <div class="amount">£${priceBreakdown.grandTotal.toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <p>Flight380 - www.flight380.co.uk</p>
            <p>For queries: info@flight380.co.uk</p>
            <p>Please arrive at the airport at least 2-3 hours before departure</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Step 1: Itinerary & Price Breakdown
  const ItineraryStep = () => (
    <div className="space-y-6" id="printable-itinerary" ref={itineraryRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Review Your Itinerary</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrintItinerary} className="border-brand-600 text-brand-600 hover:bg-brand-50">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="border-brand-600 text-brand-600 hover:bg-brand-50"
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        </div>
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

      {/* Passengers Summary */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Users className="h-5 w-5" />
            Passengers Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 font-semibold">#</th>
                  <th className="text-left py-2 px-4 font-semibold">Passenger Type</th>
                  <th className="text-left py-2 px-4 font-semibold">Age Range</th>
                  <th className="text-left py-2 px-4 font-semibold">Count</th>
                </tr>
              </thead>
              <tbody>
                {passengerCounts.adults > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-4">1{passengerCounts.adults > 1 ? `-${passengerCounts.adults}` : ''}</td>
                    <td className="py-2 px-4"><Badge className="bg-slate-100 text-slate-700">Adult</Badge></td>
                    <td className="py-2 px-4">18+ years</td>
                    <td className="py-2 px-4">{passengerCounts.adults}</td>
                  </tr>
                )}
                {passengerCounts.youth > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-4">{passengerCounts.adults + 1}{passengerCounts.youth > 1 ? `-${passengerCounts.adults + passengerCounts.youth}` : ''}</td>
                    <td className="py-2 px-4"><Badge className="bg-blue-100 text-blue-700">Youth</Badge></td>
                    <td className="py-2 px-4">12-17 years</td>
                    <td className="py-2 px-4">{passengerCounts.youth}</td>
                  </tr>
                )}
                {passengerCounts.children > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-4">{passengerCounts.adults + passengerCounts.youth + 1}{passengerCounts.children > 1 ? `-${passengerCounts.adults + passengerCounts.youth + passengerCounts.children}` : ''}</td>
                    <td className="py-2 px-4"><Badge className="bg-orange-100 text-orange-700">Child</Badge></td>
                    <td className="py-2 px-4">2-11 years</td>
                    <td className="py-2 px-4">{passengerCounts.children}</td>
                  </tr>
                )}
                {passengerCounts.infants > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-4">{totalPassengers - passengerCounts.infants + 1}{passengerCounts.infants > 1 ? `-${totalPassengers}` : ''}</td>
                    <td className="py-2 px-4"><Badge className="bg-pink-100 text-pink-700">Infant</Badge></td>
                    <td className="py-2 px-4">0-2 years</td>
                    <td className="py-2 px-4">{passengerCounts.infants}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <FileText className="h-5 w-5" />
            Passenger Fare Breakdown
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
              <div className="text-lg font-bold text-brand-700">Total Fare</div>
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

      {/* Passenger Forms - Now properly sequenced: Adults -> Youth -> Children -> Infants */}
      {passengers.map((passenger, index) => {
        // Calculate proper numbering within each type
        let typeCount = 0;
        for (let i = 0; i <= index; i++) {
          if (passengers[i].type === passenger.type) {
            typeCount++;
          }
        }
        
        return (
          <Card key={index}>
            <CardHeader className="bg-slate-50">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-600" />
                Passenger {index + 1} - {passenger.type} {typeCount > 1 ? `(${typeCount})` : ''}
                <Badge className={`ml-2 ${
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
                  <Label>Date of Birth * <span className="text-xs text-slate-500">({passenger.type === 'ADULT' ? '18+' : passenger.type === 'YOUTH' ? '12-17' : passenger.type === 'CHILD' ? '2-11' : '0-2'} years)</span></Label>
                  <Input
                    type="date"
                    value={passenger.date_of_birth}
                    onChange={(e) => updatePassenger(index, 'date_of_birth', e.target.value)}
                    className="mt-1 text-lg [&::-webkit-calendar-picker-indicator]:w-6 [&::-webkit-calendar-picker-indicator]:h-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    style={{ fontSize: '16px', padding: '12px' }}
                    max={passenger.type === 'INFANT' ? new Date().toISOString().split('T')[0] : undefined}
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
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Price Summary */}
      <Card className="bg-brand-50 border-brand-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-brand-700">Total Fare</div>
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
    <div className="space-y-6" ref={confirmationRef}>
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
          onClick={handlePrintConfirmation}
          className="px-8"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print Itinerary
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

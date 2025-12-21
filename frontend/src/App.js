import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FlightSearch } from './components/FlightSearch';
import { FlightResults } from './components/FlightResults';
import { BookingFlow } from './components/BookingFlow';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { 
  BadgePoundSterling, 
  Zap, 
  Headphones, 
  CalendarClock, 
  Shield, 
  Gift,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Globe,
  Award,
  Heart,
  MapPin,
  Phone,
  Mail,
  Clock,
  Plane
} from 'lucide-react';
import { popularDestinations, testimonials, features } from './mock';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [isFlexibleSearch, setIsFlexibleSearch] = useState(false);
  const [savedSearchData, setSavedSearchData] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const handleSearch = async (searchData) => {
    console.log('Search data:', searchData);
    setIsLoading(true);
    setSearchError(null);
    setSearchParams(searchData);
    setSavedSearchData(searchData);
    setIsFlexibleSearch(searchData.flexiDates || false);
    setShowBooking(false);
    setSelectedFlight(null);
    
    try {
      // Call real Amadeus API via backend
      const response = await axios.post(`${API}/flights/search`, {
        origin: searchData.origin,
        destination: searchData.destination,
        departure_date: searchData.departure_date,
        return_date: searchData.return_date,
        adults: searchData.adults,
        youth: searchData.youth,
        children: searchData.children,
        infants: searchData.infants,
        travel_class: searchData.travel_class,
        direct_flights: searchData.direct_flights,
        flexible_dates: searchData.flexiDates || false,
        airline: searchData.airline?.code || null
      });
      
      if (response.data.success) {
        setSearchResults(response.data.flights);
        setShowResults(true);
        const flexiMessage = searchData.flexiDates ? ' (including ±3 days)' : '';
        toast.success(`Found ${response.data.flights.length} flights for you${flexiMessage}!`);
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        toast.error('No flights found. Please try different dates or destinations.');
        setSearchError(response.data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Failed to search flights. Please try again.');
      setSearchError(error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFlight = (flight) => {
    toast.success(`Selected flight: ${flight.airline} - £${Math.round(flight.price)}`);
    console.log('Selected flight:', flight);
    setSelectedFlight(flight);
    setShowBooking(true);
    setShowResults(false);
    window.scrollTo(0, 0);
  };

  const handleBackToResults = () => {
    setShowBooking(false);
    setSelectedFlight(null);
    setShowResults(true);
  };

  const handleBookingComplete = () => {
    setShowBooking(false);
    setSelectedFlight(null);
    setShowResults(false);
    setSearchResults([]);
    setSavedSearchData(null);
    setSearchParams(null);
  };

  // Navigate to Home - resets all state and scrolls to home
  const handleNavigateHome = () => {
    setShowBooking(false);
    setSelectedFlight(null);
    setShowResults(false);
    setIsLoading(false);
    setSearchError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const iconMap = {
    BadgePoundSterling,
    Zap,
    Headphones,
    CalendarClock,
    Shield,
    Gift
  };

  // Handle modify search - scroll back to search form
  const handleModifySearch = () => {
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header onNavigateHome={handleNavigateHome} />

      {/* Booking Flow */}
      {showBooking && selectedFlight && (
        <section className="pt-24 pb-16 bg-slate-50 min-h-screen">
          <BookingFlow 
            flight={selectedFlight}
            searchParams={savedSearchData}
            onBack={handleBackToResults}
            onComplete={handleBookingComplete}
          />
        </section>
      )}

      {/* Hero Section - Hide when loading, showing results, or booking */}
      {!isLoading && !showResults && !showBooking && (
        <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-brand-50 to-slate-50 -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 space-y-4">
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 px-4 py-1.5 text-sm font-medium">
                Book with Confidence
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
                  Flight Deal
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                Compare prices from hundreds of airlines and travel agents. Save up to 40% on your next trip.
              </p>
            </div>

            {/* Flight Search Component - Pass saved data for modify */}
            <FlightSearch onSearch={handleSearch} initialData={savedSearchData} />

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
              <div className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">1M+</div>
                <div className="text-sm text-slate-600">Happy Travelers</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Airlines</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">180+</div>
                <div className="text-sm text-slate-600">Countries</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-sm text-slate-600">Support</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hidden Search Form for Modify - shows when results are visible */}
      {(showResults || isLoading) && (
        <section id="home" className="hidden">
          <FlightSearch onSearch={handleSearch} initialData={savedSearchData} />
        </section>
      )}

      {/* Loading State - Full Screen with Modify Button Only */}
      {isLoading && (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50">
          <div className="container mx-auto px-4">
            <Card className="max-w-lg mx-auto p-8 text-center shadow-lg">
              {/* Search Summary */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-center justify-center gap-3 text-lg font-semibold text-slate-800">
                  <span>{searchParams?.origin}</span>
                  <span className="text-brand-600">✈</span>
                  <span>{searchParams?.destination}</span>
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {searchParams?.departure_date} {searchParams?.return_date && `- ${searchParams?.return_date}`}
                </div>
                {isFlexibleSearch && (
                  <Badge className="mt-2 bg-brand-100 text-brand-700">±3 Days Flexible</Badge>
                )}
              </div>

              {/* Loading Animation */}
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-200 border-t-brand-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-brand-600 text-xl">✈</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-800">Flight is searching...</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {isFlexibleSearch 
                      ? 'Checking multiple date combinations for best prices' 
                      : 'Finding the best flights for you'}
                  </p>
                </div>
              </div>

              {/* Only Modify Button Visible During Loading */}
              <Button 
                onClick={() => {
                  setIsLoading(false);
                  setShowResults(false);
                  setTimeout(() => {
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                variant="outline"
                className="border-brand-600 text-brand-600 hover:bg-brand-50"
              >
                Modify Search
              </Button>
            </Card>
          </div>
        </section>
      )}
      
      {searchError && !isLoading && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
              <p className="text-brand-700">{searchError.message || 'Unable to search flights. Please try again.'}</p>
              <Button 
                onClick={() => {
                  setShowResults(false);
                  setSearchError(null);
                }}
                className="mt-4 bg-brand-600 hover:bg-brand-700"
              >
                Try Again
              </Button>
            </Card>
          </div>
        </section>
      )}
      
      {showResults && searchResults.length > 0 && !isLoading && (
        <section id="search-results" className="py-8 bg-slate-50 min-h-screen">
          <FlightResults 
            flights={searchResults} 
            isFlexible={isFlexibleSearch}
            onSelectFlight={handleSelectFlight}
            searchParams={searchParams}
            isLoading={isLoading}
            onModifySearch={() => {
              setShowResults(false);
              setTimeout(() => {
                document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Flight380?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We make flight booking simple, secure, and rewarding
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <Card key={feature.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-brand-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-brand-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Popular Destinations</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Explore the world's most amazing destinations at unbeatable prices
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination) => (
              <Card key={destination.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={destination.imageUrl} 
                    alt={destination.city}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-4 right-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold">
                    From £{destination.price}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{destination.city}</CardTitle>
                  <CardDescription className="text-slate-600">{destination.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{destination.description}</p>
                  <Button variant="ghost" className="group/btn w-full justify-between hover:bg-brand-50 hover:text-brand-700">
                    View Flights
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Trusted by Travelers</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our customers say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="deals" className="py-20 bg-gradient-to-br from-brand-600 to-brand-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-lg md:text-xl text-brand-50">
              Join over 1 million happy travelers and discover your next adventure with exclusive deals and offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-brand-600 hover:bg-slate-100 font-semibold text-lg px-8">
                Search Flights Now
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8">
                View All Deals
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
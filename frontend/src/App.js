import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FlightSearch } from './components/FlightSearch';
import { FlightResults } from './components/FlightResults';
import { BookingFlow } from './components/BookingFlow';
import { WhatsAppButton } from './components/WhatsAppButton';
import { AuthCallback } from './components/AuthCallback';
import { LoginPage } from './components/LoginPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';
import { ContactForm } from './components/ContactForm';
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
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  
  // App state - moved before conditional returns
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [isFlexibleSearch, setIsFlexibleSearch] = useState(false);
  const [savedSearchData, setSavedSearchData] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  
  // Restore state from sessionStorage on initial load
  useEffect(() => {
    const savedState = sessionStorage.getItem('flightSearchState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.searchResults) setSearchResults(state.searchResults);
        if (state.showResults) setShowResults(state.showResults);
        if (state.searchParams) setSearchParams(state.searchParams);
        if (state.savedSearchData) setSavedSearchData(state.savedSearchData);
        if (state.isFlexibleSearch) setIsFlexibleSearch(state.isFlexibleSearch);
        if (state.showBooking) setShowBooking(state.showBooking);
        if (state.selectedFlight) setSelectedFlight(state.selectedFlight);
      } catch (e) {
        console.error('Failed to restore state:', e);
      }
    }
  }, []);
  
  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (searchResults.length > 0 || showResults || showBooking) {
      const state = {
        searchResults,
        showResults,
        searchParams,
        savedSearchData,
        isFlexibleSearch,
        showBooking,
        selectedFlight
      };
      sessionStorage.setItem('flightSearchState', JSON.stringify(state));
    }
  }, [searchResults, showResults, searchParams, savedSearchData, isFlexibleSearch, showBooking, selectedFlight]);

  // Check for session_id in URL fragment (Google OAuth callback)
  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) {
      setIsProcessingAuth(true);
    } else {
      // Check existing session
      checkAuthSession();
    }
  }, []);

  const checkAuthSession = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (err) {
      // Not authenticated - that's fine
      setUser(null);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsProcessingAuth(false);
    toast.success(`Welcome, ${userData.name || userData.email}!`);
  };

  const handleAuthError = (error) => {
    setIsProcessingAuth(false);
    toast.error('Sign in failed. Please try again.');
  };

  const handleSignOut = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success('Signed out successfully');
    } catch (err) {
      setUser(null);
    }
  };

  // If processing OAuth callback, show AuthCallback
  if (isProcessingAuth) {
    return <AuthCallback onAuthSuccess={handleAuthSuccess} onAuthError={handleAuthError} />;
  }

  // If on reset-password page, show ResetPasswordPage
  if (location.pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }

  const handleSearch = async (searchData) => {
    console.log('Search data:', searchData);
    setIsLoading(true);
    setSearchError(null);
    setSearchParams(searchData);
    setSavedSearchData(searchData);
    setIsFlexibleSearch(searchData.flexiDates || false);
    setShowBooking(false);
    setSelectedFlight(null);
    
    // Scroll to top immediately on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    try {
      let response;
      
      // Handle multi-city search differently
      if (searchData.tripType === 'multi-city' && searchData.legs) {
        response = await axios.post(`${API}/flights/multi-city-search`, {
          legs: searchData.legs,
          adults: searchData.adults,
          youth: searchData.youth,
          children: searchData.children,
          infants: searchData.infants,
          travel_class: searchData.travel_class,
          direct_flights: searchData.direct_flights,
          airline: searchData.airline?.code || null
        });
      } else {
        // Regular one-way or round-trip search
        response = await axios.post(`${API}/flights/search`, {
          origin: searchData.origin,
          destination: searchData.destination,
          origin_airports: searchData.origin_airports || null,
          destination_airports: searchData.destination_airports || null,
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
      }
      
      if (response.data.success) {
        setSearchResults(response.data.flights);
        setShowResults(true);
        const flexiMessage = searchData.flexiDates ? ' (including ±3 days)' : '';
        toast.success(`Found ${response.data.flights.length} flights for you${flexiMessage}!`);
        
        // Scroll to top of results
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
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
    sessionStorage.removeItem('flightSearchState');
  };

  // Navigate to Home - resets all state and scrolls to home
  const handleNavigateHome = () => {
    setShowBooking(false);
    setSelectedFlight(null);
    setShowResults(false);
    setIsLoading(false);
    setSearchError(null);
    setSearchResults([]);
    setSavedSearchData(null);
    setSearchParams(null);
    sessionStorage.removeItem('flightSearchState');
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
      <Header 
        onNavigateHome={handleNavigateHome} 
        user={user}
        onSignIn={() => setShowLogin(true)}
        onSignOut={handleSignOut}
      />
      
      {/* WhatsApp Button */}
      <WhatsAppButton />
      
      {/* Login Modal */}
      {showLogin && (
        <LoginPage 
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(userData) => {
            setUser(userData);
            setShowLogin(false);
            toast.success(`Welcome, ${userData.name || userData.email}!`);
          }}
        />
      )}

      {/* Booking Flow */}
      {showBooking && selectedFlight && (
        <section className="pt-28 pb-16 bg-slate-50 min-h-screen">
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
        <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-brand-50 to-slate-50 -z-10"></div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12 space-y-4">
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 px-4 py-1.5 text-sm font-medium">
                Book with Confidence
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-brand-600 to-brand-600 bg-clip-text text-transparent">
                  Flight Deal
                </span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4 leading-snug">
                Compare prices from hundreds of airlines and travel agents. Save up to 40% on your next trip.
              </p>
            </div>

            {/* Flight Search Component - Pass saved data for modify */}
            <FlightSearch onSearch={handleSearch} initialData={savedSearchData} />

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 md:mt-12 max-w-4xl mx-auto">
              <div className="text-center p-3 md:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">1M+</div>
                <div className="text-xs sm:text-sm text-slate-600">Happy Travelers</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">500+</div>
                <div className="text-xs sm:text-sm text-slate-600">Airlines</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">180+</div>
                <div className="text-xs sm:text-sm text-slate-600">Countries</div>
              </div>
              <div className="text-center p-3 md:p-4">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">24/7</div>
                <div className="text-xs sm:text-sm text-slate-600">Support</div>
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

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 px-4 py-1.5 text-sm font-medium mb-4">
                About Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your Trusted Travel Partner</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Flight380 has been helping travelers find the best flight deals since 2015. We're passionate about making air travel accessible and affordable for everyone.
              </p>
            </div>

            {/* Company Story */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Story</h3>
                <p className="text-slate-600 mb-4">
                  Founded in London, Flight380 started with a simple mission: to make flight booking easier and more affordable. Our name comes from the iconic Airbus A380, symbolizing our commitment to connecting people across the globe.
                </p>
                <p className="text-slate-600 mb-4">
                  Today, we partner with over 500 airlines worldwide, offering our customers access to millions of flight options at competitive prices. Our advanced search technology compares fares across multiple providers to ensure you always get the best deal.
                </p>
                <p className="text-slate-600">
                  We believe everyone deserves to explore the world. That's why we're committed to transparency, with no hidden fees and clear pricing every step of the way.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6 bg-brand-50 border-brand-100">
                  <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand-600 mb-2">1M+</div>
                  <div className="text-slate-600">Happy Customers</div>
                </Card>
                <Card className="text-center p-6 bg-brand-50 border-brand-100">
                  <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand-600 mb-2">500+</div>
                  <div className="text-slate-600">Partner Airlines</div>
                </Card>
                <Card className="text-center p-6 bg-brand-50 border-brand-100">
                  <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand-600 mb-2">190+</div>
                  <div className="text-slate-600">Countries Served</div>
                </Card>
                <Card className="text-center p-6 bg-brand-50 border-brand-100">
                  <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-brand-600 mb-2">10+</div>
                  <div className="text-slate-600">Years Experience</div>
                </Card>
              </div>
            </div>

            {/* Our Values */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Our Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-brand-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Customer First</h4>
                  <p className="text-slate-600">
                    Your satisfaction is our priority. We're here to help you find the perfect flight at the best price.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-brand-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Trust & Transparency</h4>
                  <p className="text-slate-600">
                    No hidden fees, no surprises. What you see is what you pay. We believe in honest, upfront pricing.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-brand-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Innovation</h4>
                  <p className="text-slate-600">
                    We continuously improve our platform to provide you with the fastest, most efficient booking experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-200 px-4 py-1.5 text-sm font-medium mb-4">
                Contact Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Have questions about your booking or need assistance? Our friendly team is here to help you 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Head Office</h4>
                        <p className="text-slate-600">
                          Flight380 Ltd<br />
                          277 Dunstable Road<br />
                          Luton, Bedfordshire<br />
                          LU4 8BS
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Phone</h4>
                        <p className="text-slate-600">
                          <a href="tel:01908220000" className="text-brand-600 hover:underline font-semibold">01908 220000</a><br />
                          <span className="text-sm text-slate-500">Available 24/7</span>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                        <p className="text-slate-600">
                          General: info@flight380.co.uk<br />
                          Bookings: bookings@flight380.co.uk<br />
                          Support: support@flight380.co.uk
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow bg-green-50 border-green-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">WhatsApp Support</h4>
                        <p className="text-green-700">
                          <a href="https://wa.me/447404386262" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">+44 7404 386262</a><br />
                          <span className="text-sm text-green-600">08:00 AM - 11:59 PM (GMT)</span>
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-brand-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Customer Service Hours</h4>
                        <p className="text-slate-600">
                          Phone Support: 24 hours, 7 days a week<br />
                          Email Response: Within 24 hours<br />
                          Live Chat: 8:00 AM - 10:00 PM (GMT)
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h3>
                <ContactForm />
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
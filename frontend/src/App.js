import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FlightSearch } from './components/FlightSearch';
import { FlightResults } from './components/FlightResults';
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
  CheckCircle2
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

  const handleSearch = async (searchData) => {
    console.log('Search data:', searchData);
    setIsLoading(true);
    setSearchError(null);
    setSearchParams(searchData);
    setIsFlexibleSearch(searchData.flexiDates || false);
    
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
    // Here you would navigate to booking page or show booking modal
  };

  const iconMap = {
    BadgePoundSterling,
    Zap,
    Headphones,
    CalendarClock,
    Shield,
    Gift
  };

  return (
    <div className="App min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />
      <Header />

      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-red-50 to-slate-50 -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 space-y-4">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-1.5 text-sm font-medium">
              Book with Confidence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent">
                Flight Deal
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Compare prices from hundreds of airlines and travel agents. Save up to 40% on your next trip.
            </p>
          </div>

          {/* Flight Search Component */}
          <FlightSearch onSearch={handleSearch} />

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

      {/* Search Results Section */}
      {isLoading && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="text-lg text-slate-600">
                {isFlexibleSearch ? 'Searching flights across multiple dates...' : 'Searching for flights...'}
              </p>
              {isFlexibleSearch && (
                <p className="text-sm text-slate-500">This may take 20-30 seconds as we check 7 date combinations</p>
              )}
            </div>
          </div>
        </section>
      )}
      
      {searchError && !isLoading && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <Card className="p-6 bg-red-50 border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
              <p className="text-red-700">{searchError.message || 'Unable to search flights. Please try again.'}</p>
            </Card>
          </div>
        </section>
      )}
      
      {showResults && searchResults.length > 0 && !isLoading && (
        <section id="search-results" className="py-8 bg-slate-50">
          <FlightResults 
            flights={searchResults} 
            isFlexible={isFlexibleSearch}
            onSelectFlight={handleSelectFlight}
            searchParams={searchParams}
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
                <Card key={feature.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-red-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-red-600" />
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
                  <Badge className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold">
                    From £{destination.price}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{destination.city}</CardTitle>
                  <CardDescription className="text-slate-600">{destination.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{destination.description}</p>
                  <Button variant="ghost" className="group/btn w-full justify-between hover:bg-red-50 hover:text-red-700">
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
      <section id="deals" className="py-20 bg-gradient-to-br from-red-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-lg md:text-xl text-red-50">
              Join over 1 million happy travelers and discover your next adventure with exclusive deals and offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-red-600 hover:bg-slate-100 font-semibold text-lg px-8">
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
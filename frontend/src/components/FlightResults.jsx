import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  Plane, 
  Clock, 
  Luggage, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';

export const FlightResults = ({ flights, isFlexible, onSelectFlight, searchParams }) => {
  // Filter states
  const [filters, setFilters] = useState({
    stops: null,
    baggage: null,
    airlines: [],
    departureTime: null,
    arrivalTime: null,
    connectionLength: null,
    minPrice: '',
    maxPrice: ''
  });
  const [sortBy, setSortBy] = useState('price');
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    stops: true,
    baggage: true,
    airlines: true,
    departureTime: true,
    arrivalTime: true,
    price: true,
    connectionLength: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Extract unique values for filters
  const uniqueAirlines = useMemo(() => {
    const airlineMap = new Map();
    flights.forEach(f => {
      if (f.airline && !airlineMap.has(f.airline)) {
        const minPrice = flights
          .filter(flight => flight.airline === f.airline)
          .reduce((min, flight) => Math.min(min, flight.price), Infinity);
        airlineMap.set(f.airline, { name: f.airline, code: f.airline_code, minPrice });
      }
    });
    return Array.from(airlineMap.values()).sort((a, b) => a.minPrice - b.minPrice);
  }, [flights]);

  // Stop counts with prices
  const stopOptions = useMemo(() => {
    const direct = flights.filter(f => f.is_direct || f.stops === 0);
    const oneStop = flights.filter(f => f.stops === 1);
    const multiStop = flights.filter(f => f.stops >= 2);
    
    return [
      { 
        value: 'direct', 
        label: 'Direct', 
        count: direct.length,
        minPrice: direct.length > 0 ? Math.min(...direct.map(f => f.price)) : null
      },
      { 
        value: '1', 
        label: '1 Connection', 
        count: oneStop.length,
        minPrice: oneStop.length > 0 ? Math.min(...oneStop.map(f => f.price)) : null
      },
      { 
        value: '2+', 
        label: '2+ Connections', 
        count: multiStop.length,
        minPrice: multiStop.length > 0 ? Math.min(...multiStop.map(f => f.price)) : null
      }
    ];
  }, [flights]);

  // Time filter options
  const timeOptions = [
    { value: 'morning', label: 'Morning', time: '05:00 - 11:59', icon: Sun },
    { value: 'afternoon', label: 'Afternoon', time: '12:00 - 17:59', icon: Sunset },
    { value: 'evening', label: 'Evening', time: '18:00 - 23:59', icon: Moon }
  ];

  // Connection length options
  const connectionLengthOptions = [
    { value: 'none', label: 'No Connections' },
    { value: 'short', label: 'Short Connection', time: '0 - 2 hours' },
    { value: 'relaxed', label: 'Relaxed Connection', time: '2 - 4 hours' },
    { value: 'long', label: 'Long Connection', time: '4 - 8 hours' },
    { value: 'veryLong', label: 'Very Long Connection', time: '8+ hours' }
  ];

  // Baggage options
  const baggageOptions = [
    { value: '1hold', label: '1 x Hold Luggage' },
    { value: '2hold', label: '2 x Hold Luggage' },
    { value: 'nohold', label: 'No Hold Luggage' }
  ];

  // Parse time from datetime string
  const getHour = (dateTime) => {
    if (!dateTime) return 12;
    return new Date(dateTime).getHours();
  };

  // Filter flights
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Apply stops filter
    if (filters.stops) {
      result = result.filter(flight => {
        if (filters.stops === 'direct') return flight.is_direct || flight.stops === 0;
        if (filters.stops === '1') return flight.stops === 1;
        if (filters.stops === '2+') return flight.stops >= 2;
        return true;
      });
    }

    // Apply airline filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline));
    }

    // Apply departure time filter
    if (filters.departureTime) {
      result = result.filter(flight => {
        const hour = getHour(flight.departure_time);
        if (filters.departureTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.departureTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.departureTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply arrival time filter
    if (filters.arrivalTime) {
      result = result.filter(flight => {
        const hour = getHour(flight.arrival_time);
        if (filters.arrivalTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.arrivalTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.arrivalTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply price filter
    if (filters.minPrice !== '') {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        result = result.filter(flight => flight.price >= min);
      }
    }
    if (filters.maxPrice !== '') {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        result = result.filter(flight => flight.price <= max);
      }
    }

    // Sort
    if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'duration') {
      result.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
    } else if (sortBy === 'departure') {
      result.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
    }

    return result;
  }, [flights, filters, sortBy]);

  const parseDuration = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+)H(\d+)?M?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      return hours * 60 + minutes;
    }
    return 0;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const toggleAirlineFilter = (airlineName) => {
    setFilters(prev => {
      const airlines = prev.airlines.includes(airlineName)
        ? prev.airlines.filter(a => a !== airlineName)
        : [...prev.airlines, airlineName];
      return { ...prev, airlines };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      stops: null,
      baggage: null,
      airlines: [],
      departureTime: null,
      arrivalTime: null,
      connectionLength: null,
      minPrice: '',
      maxPrice: ''
    });
  };

  // If flexible dates, show matrix view
  if (isFlexible && flights.length > 0) {
    return <FlexibleDatesMatrix flights={flights} searchParams={searchParams} onSelectFlight={onSelectFlight} />;
  }

  // Filter Section Component
  const FilterSection = ({ title, name, children, defaultOpen = true }) => (
    <div className="mb-4">
      <button 
        onClick={() => toggleSection(name)}
        className="w-full flex items-center justify-between py-2 text-left font-semibold text-slate-800 hover:text-brand-600"
      >
        {title}
        {expandedSections[name] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expandedSections[name] && <div className="mt-2">{children}</div>}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-72 flex-shrink-0">
          <Card className="p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold text-lg text-slate-900">{filteredFlights.length} Flights Found</h3>
              </div>
              {(filters.stops || filters.airlines.length > 0 || filters.departureTime || filters.arrivalTime || filters.minPrice || filters.maxPrice) && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-brand-600 hover:text-brand-700">
                  Clear All
                </Button>
              )}
            </div>
            <Separator className="mb-4" />

            {/* Stops Filter */}
            <FilterSection title="Stops" name="stops">
              <RadioGroup 
                value={filters.stops || ''} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, stops: value || null }))}
              >
                {stopOptions.map(option => (
                  <div key={option.value} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`stop-${option.value}`} />
                      <Label htmlFor={`stop-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                    <div className="text-right">
                      {option.minPrice && (
                        <span className="text-sm font-medium text-brand-600">£{Math.round(option.minPrice)}</span>
                      )}
                      <span className="text-xs text-slate-400 ml-1">({option.count})</span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </FilterSection>

            <Separator className="my-3" />

            {/* Baggage Filter */}
            <FilterSection title="Baggage" name="baggage">
              <RadioGroup 
                value={filters.baggage || ''} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, baggage: value || null }))}
              >
                {baggageOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2 py-1.5">
                    <RadioGroupItem value={option.value} id={`baggage-${option.value}`} />
                    <Label htmlFor={`baggage-${option.value}`} className="text-sm cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FilterSection>

            <Separator className="my-3" />

            {/* Airline Filter */}
            <FilterSection title="Airline" name="airlines">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                {uniqueAirlines.map(airline => (
                  <div key={airline.name} className="flex items-center justify-between py-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`airline-${airline.name}`}
                        checked={filters.airlines.includes(airline.name)}
                        onCheckedChange={() => toggleAirlineFilter(airline.name)}
                      />
                      <Label htmlFor={`airline-${airline.name}`} className="text-sm cursor-pointer">
                        {airline.name}
                      </Label>
                    </div>
                    <span className="text-sm font-medium text-brand-600">£{Math.round(airline.minPrice)}</span>
                  </div>
                ))}
              </div>
            </FilterSection>

            <Separator className="my-3" />

            {/* Departure Time Filter */}
            <FilterSection title="Departure Time" name="departureTime">
              <RadioGroup 
                value={filters.departureTime || ''} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, departureTime: value || null }))}
              >
                {timeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={option.value} id={`dep-${option.value}`} />
                      <Icon className="h-4 w-4 text-slate-500" />
                      <Label htmlFor={`dep-${option.value}`} className="text-sm cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-slate-500 ml-1">({option.time})</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </FilterSection>

            <Separator className="my-3" />

            {/* Arrival Time Filter */}
            <FilterSection title="Arrival Time" name="arrivalTime">
              <RadioGroup 
                value={filters.arrivalTime || ''} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, arrivalTime: value || null }))}
              >
                {timeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={option.value} id={`arr-${option.value}`} />
                      <Icon className="h-4 w-4 text-slate-500" />
                      <Label htmlFor={`arr-${option.value}`} className="text-sm cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-slate-500 ml-1">({option.time})</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </FilterSection>

            <Separator className="my-3" />

            {/* Price Filter */}
            <FilterSection title="Total Price (£)" name="price">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-slate-500">From</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-slate-500">To</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </FilterSection>

            <Separator className="my-3" />

            {/* Connection Length Filter */}
            <FilterSection title="Connection Length" name="connectionLength" defaultOpen={false}>
              <RadioGroup 
                value={filters.connectionLength || ''} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, connectionLength: value || null }))}
              >
                {connectionLengthOptions.map(option => (
                  <div key={option.value} className="flex items-center space-x-2 py-1.5">
                    <RadioGroupItem value={option.value} id={`conn-${option.value}`} />
                    <Label htmlFor={`conn-${option.value}`} className="text-sm cursor-pointer">
                      <span className="font-medium">{option.label}</span>
                      {option.time && <span className="text-slate-500 ml-1">({option.time})</span>}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FilterSection>
          </Card>
        </div>

        {/* Right Side - Flight Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Available
            </h2>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
                className={sortBy === 'price' ? 'bg-brand-600 hover:bg-brand-700' : ''}
              >
                Lowest Price
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('duration')}
                className={sortBy === 'duration' ? 'bg-brand-600 hover:bg-brand-700' : ''}
              >
                Shortest
              </Button>
              <Button
                variant={sortBy === 'departure' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('departure')}
                className={sortBy === 'departure' ? 'bg-brand-600 hover:bg-brand-700' : ''}
              >
                Departure Time
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFlights.map((flight, index) => (
              <Card key={flight.id || index} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-600">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Airline Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-700">{flight.airline_code}</span>
                      </div>
                      <div className="text-xs text-center mt-1 text-slate-600">{flight.airline_code}</div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-8">
                          {/* Departure */}
                          <div>
                            <div className="text-2xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                            <div className="text-sm text-slate-600">{formatDate(flight.departure_time)}</div>
                            <div className="text-sm font-medium text-slate-700">{flight.from}</div>
                          </div>

                          {/* Duration & Stops */}
                          <div className="flex flex-col items-center px-4">
                            <div className="text-xs text-slate-500 mb-1">{formatDuration(flight.duration)}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                              <div className="w-20 h-px bg-slate-300 relative">
                                {!flight.is_direct && flight.stops > 0 && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400"></div>
                                )}
                              </div>
                              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                            </div>
                            <div className="text-xs text-brand-600 font-medium mt-1">
                              {flight.is_direct || flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </div>
                          </div>

                          {/* Arrival */}
                          <div>
                            <div className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                            <div className="text-sm text-slate-600">{formatDate(flight.arrival_time)}</div>
                            <div className="text-sm font-medium text-slate-700">{flight.to}</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-medium">{flight.airline}</span>
                        {flight.number_of_bookable_seats && flight.number_of_bookable_seats < 5 && (
                          <Badge variant="destructive" className="text-xs bg-brand-600">
                            Only {flight.number_of_bookable_seats} seats left!
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div className="text-right mb-4">
                        <div className="text-3xl font-bold text-brand-600">£{Math.round(flight.price)}</div>
                        <div className="text-xs text-slate-500">total price</div>
                        <div className="text-xs text-slate-500">inc. taxes and fees</div>
                      </div>
                      <Button
                        onClick={() => onSelectFlight(flight)}
                        className="bg-brand-600 hover:bg-brand-700 font-semibold px-8"
                      >
                        Continue →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredFlights.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-lg text-slate-600">No flights match your filters. Try adjusting your search criteria.</p>
                <Button variant="outline" onClick={clearAllFilters} className="mt-4 text-brand-600 border-brand-600 hover:bg-brand-50">
                  Clear All Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Flexible Dates Matrix Component
const FlexibleDatesMatrix = ({ flights, searchParams, onSelectFlight }) => {
  // Group flights by departure and return dates
  const priceMatrix = useMemo(() => {
    const matrix = {};
    
    flights.forEach(flight => {
      const depDate = flight.departure_time ? new Date(flight.departure_time).toISOString().split('T')[0] : '';
      const retDate = flight.return_departure_time ? new Date(flight.return_departure_time).toISOString().split('T')[0] : '';
      
      const key = `${depDate}_${retDate}`;
      
      if (!matrix[key] || matrix[key].price > flight.price) {
        matrix[key] = {
          ...flight,
          departureDate: depDate,
          returnDate: retDate
        };
      }
    });
    
    return matrix;
  }, [flights]);

  // Get unique sorted dates
  const departureDates = useMemo(() => {
    const dates = [...new Set(Object.values(priceMatrix).map(f => f.departureDate))].filter(Boolean);
    return dates.sort();
  }, [priceMatrix]);

  const returnDates = useMemo(() => {
    const dates = [...new Set(Object.values(priceMatrix).map(f => f.returnDate))].filter(Boolean);
    return dates.sort();
  }, [priceMatrix]);

  const getPrice = (depDate, retDate) => {
    const key = `${depDate}_${retDate}`;
    return priceMatrix[key];
  };

  const formatDateHeader = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'EEE\nMMM dd');
  };

  const getLowestPrice = () => {
    const prices = Object.values(priceMatrix).map(f => f.price);
    return Math.min(...prices);
  };

  const lowestPrice = getLowestPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Flexible Dates</h2>
          <p className="text-slate-600">Select your preferred dates to see available flights</p>
        </div>
        <Badge className="bg-brand-100 text-brand-700 px-4 py-2">
          Found {flights.length} flights (including ±3 days)!
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <Card className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-4 bg-brand-50 font-semibold sticky left-0 z-10">
                  <div className="text-sm text-brand-700">Depart ↓</div>
                  <div className="text-sm text-brand-700">Return →</div>
                </th>
                {returnDates.map(retDate => (
                  <th key={retDate} className="border p-2 bg-brand-50 min-w-[100px]">
                    <div className="text-sm whitespace-pre-line text-center text-brand-700">{formatDateHeader(retDate)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departureDates.map(depDate => (
                <tr key={depDate}>
                  <td className="border p-2 bg-brand-50 font-medium sticky left-0 z-10">
                    <div className="text-sm whitespace-pre-line text-brand-700">{formatDateHeader(depDate)}</div>
                  </td>
                  {returnDates.map(retDate => {
                    const flight = getPrice(depDate, retDate);
                    const isLowest = flight && flight.price === lowestPrice;
                    
                    return (
                      <td
                        key={`${depDate}_${retDate}`}
                        className={`border p-2 text-center cursor-pointer hover:bg-brand-50 transition-colors ${
                          isLowest ? 'bg-green-50' : ''
                        }`}
                        onClick={() => flight && onSelectFlight(flight)}
                      >
                        {flight ? (
                          <div>
                            <div className={`text-sm font-bold ${isLowest ? 'text-green-700' : 'text-slate-700'}`}>
                              £{Math.round(flight.price)}
                            </div>
                            <div className="text-xs text-slate-500">{flight.airline_code}</div>
                            {isLowest && (
                              <div className="text-xs text-green-700 font-semibold mt-1">Lowest</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-6 text-sm text-slate-600">
        <p>All prices in GBP • Click on a price to view flight details and book</p>
      </div>
    </div>
  );
};

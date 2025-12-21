import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plane, 
  Clock, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Sun,
  Sunset,
  Moon,
  Edit3,
  ArrowRight,
  Check,
  PlaneTakeoff,
  PlaneLanding
} from 'lucide-react';
import { format } from 'date-fns';

export const FlightResults = ({ 
  flights, 
  isFlexible, 
  onSelectFlight, 
  searchParams,
  isLoading,
  onModifySearch 
}) => {
  // Filter states
  const [filters, setFilters] = useState({
    fareType: null,
    stopsOutbound: null,
    stopsReturn: null,
    baggage: null,
    airlines: [],
    outboundDepartureTime: null,
    outboundArrivalTime: null,
    returnDepartureTime: null,
    returnArrivalTime: null,
    connectionLengthOutbound: null,
    connectionLengthReturn: null,
    minPrice: '',
    maxPrice: ''
  });
  const [sortBy, setSortBy] = useState('price');
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [viewMode, setViewMode] = useState('combined'); // 'combined' or 'separate'
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    fareType: false,
    stopsOutbound: true,
    stopsReturn: true,
    baggage: true,
    airlines: true,
    outboundDepartureTime: true,
    outboundArrivalTime: true,
    returnDepartureTime: true,
    returnArrivalTime: true,
    connectionLengthOutbound: true,
    connectionLengthReturn: true,
    price: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if this is a round-trip search
  const isRoundTrip = searchParams?.return_date && flights.some(f => f.return_departure_time);

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

  // Layover time filter options (actual layover/connection time)
  const layoverTimeOptions = [
    { value: 'none', label: 'Direct Only', minMinutes: 0, maxMinutes: 0 },
    { value: 'short', label: 'Short Layover', time: '< 2 hours', minMinutes: 1, maxMinutes: 120 },
    { value: 'medium', label: 'Medium Layover', time: '2 - 4 hours', minMinutes: 121, maxMinutes: 240 },
    { value: 'long', label: 'Long Layover', time: '4 - 8 hours', minMinutes: 241, maxMinutes: 480 },
    { value: 'overnight', label: 'Overnight Layover', time: '8+ hours', minMinutes: 481, maxMinutes: Infinity }
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

    // Apply layover time filter (actual connection/layover duration)
    if (filters.layoverTime) {
      const selectedOption = layoverTimeOptions.find(opt => opt.value === filters.layoverTime);
      if (selectedOption) {
        result = result.filter(flight => {
          const layoverMins = flight.total_layover_minutes || 0;
          
          if (selectedOption.value === 'none') {
            return flight.is_direct || flight.stops === 0;
          }
          
          return layoverMins >= selectedOption.minMinutes && layoverMins <= selectedOption.maxMinutes;
        });
      }
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
      layoverTime: null,
      minPrice: '',
      maxPrice: ''
    });
  };

  // Calculate combined price for mixed flights
  const getCombinedPrice = () => {
    if (selectedOutbound && selectedReturn) {
      // For mixed flights, we estimate by using half the price of each
      // since the API returns round-trip prices
      return Math.round((selectedOutbound.price + selectedReturn.price) / 2);
    }
    return null;
  };

  // Get cheapest combination
  const cheapestPrice = useMemo(() => {
    if (filteredFlights.length === 0) return null;
    return Math.min(...filteredFlights.map(f => f.price));
  }, [filteredFlights]);

  // If flexible dates, show matrix view
  if (isFlexible && flights.length > 0 && !isLoading) {
    return <FlexibleDatesMatrix flights={flights} searchParams={searchParams} onSelectFlight={onSelectFlight} onModifySearch={onModifySearch} />;
  }

  // Filter Section Component
  const FilterSection = ({ title, name, children }) => (
    <div className="mb-3">
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

  // Flight Card Component for single flight display
  const FlightCard = ({ flight, type = 'outbound', isSelected, onSelect }) => (
    <Card 
      className={`hover:shadow-lg transition-all cursor-pointer border-l-4 ${
        isSelected ? 'border-l-green-500 bg-green-50 ring-2 ring-green-200' : 'border-l-brand-600'
      }`}
      onClick={() => onSelect && onSelect(flight)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Airline Logo */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-brand-700">{flight.airline_code}</span>
            </div>
          </div>

          {/* Flight Details */}
          <div className="flex-1">
            <div className="flex items-center gap-6">
              {/* Departure */}
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{formatTime(type === 'return' ? flight.return_departure_time : flight.departure_time)}</div>
                <div className="text-xs text-slate-500">{type === 'return' ? flight.to : flight.from}</div>
              </div>

              {/* Duration & Stops */}
              <div className="flex flex-col items-center flex-1">
                <div className="text-xs text-slate-500">{formatDuration(type === 'return' ? flight.return_duration : flight.duration)}</div>
                <div className="flex items-center w-full">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-px bg-slate-300 relative mx-1">
                    {((type === 'return' ? flight.return_stops : flight.stops) > 0) && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400"></div>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                </div>
                <div className="text-xs text-brand-600 font-medium">
                  {(type === 'return' ? (flight.return_is_direct || flight.return_stops === 0) : (flight.is_direct || flight.stops === 0)) 
                    ? 'Direct' 
                    : `${type === 'return' ? flight.return_stops : flight.stops} stop`}
                </div>
                {/* Layover Time Display */}
                {((type === 'return' ? flight.return_layover_display : flight.layover_display)) && (
                  <div className="text-xs text-orange-600 mt-0.5">
                    Layover: {type === 'return' ? flight.return_layover_display : flight.layover_display}
                  </div>
                )}
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{formatTime(type === 'return' ? flight.return_arrival_time : flight.arrival_time)}</div>
                <div className="text-xs text-slate-500">{type === 'return' ? flight.from : flight.to}</div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-xl font-bold text-brand-600">£{Math.round(flight.price / (isRoundTrip ? 2 : 1))}</div>
            <div className="text-xs text-slate-500">{type === 'outbound' ? 'outbound' : 'return'}</div>
          </div>

          {/* Selection indicator */}
          {isSelected && (
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary Bar with Modify Button */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-brand-600" />
              <span className="font-semibold">{searchParams?.origin}</span>
              <span className="text-slate-400">→</span>
              <span className="font-semibold">{searchParams?.destination}</span>
            </div>
            <div className="text-sm text-slate-600">
              {searchParams?.departure_date && format(new Date(searchParams.departure_date), 'dd MMM yyyy')}
              {searchParams?.return_date && ` - ${format(new Date(searchParams.return_date), 'dd MMM yyyy')}`}
            </div>
            {isFlexible && (
              <Badge className="bg-brand-100 text-brand-700">±3 Days Flexible</Badge>
            )}
            {isRoundTrip && (
              <Badge className="bg-blue-100 text-blue-700">Round Trip</Badge>
            )}
          </div>
          <Button 
            onClick={onModifySearch}
            variant="outline"
            className="border-brand-600 text-brand-600 hover:bg-brand-50"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Modify Search
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Filters with VISIBLE Scrollbar */}
        <div className="w-72 flex-shrink-0">
          <Card className="sticky top-4 overflow-hidden">
            <div className="p-4 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-brand-600" />
                  <h3 className="font-bold text-lg text-slate-900">{filteredFlights.length} Flights</h3>
                </div>
                {(filters.stops || filters.airlines.length > 0 || filters.departureTime || filters.arrivalTime || filters.layoverTime || filters.minPrice || filters.maxPrice) && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-brand-600 hover:text-brand-700 text-xs">
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            
            {/* Scrollable Filter Content with VISIBLE scrollbar */}
            <div 
              className="overflow-y-auto p-4" 
              style={{ 
                maxHeight: 'calc(100vh - 200px)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#E73121 #f1f5f9'
              }}
            >
              <style>{`
                .filter-scroll::-webkit-scrollbar {
                  width: 8px;
                }
                .filter-scroll::-webkit-scrollbar-track {
                  background: #f1f5f9;
                  border-radius: 4px;
                }
                .filter-scroll::-webkit-scrollbar-thumb {
                  background: #E73121;
                  border-radius: 4px;
                }
                .filter-scroll::-webkit-scrollbar-thumb:hover {
                  background: #c72a1c;
                }
              `}</style>
              
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

              {/* Layover Time Filter */}
              <FilterSection title="Layover Time" name="layoverTime">
                <RadioGroup 
                  value={filters.layoverTime || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, layoverTime: value || null }))}
                >
                  {layoverTimeOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={option.value} id={`layover-${option.value}`} />
                      <Label htmlFor={`layover-${option.value}`} className="text-sm cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        {option.time && <span className="text-slate-500 text-xs ml-1">({option.time})</span>}
                      </Label>
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
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {uniqueAirlines.map(airline => (
                    <div key={airline.name} className="flex items-center justify-between py-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`airline-${airline.name}`}
                          checked={filters.airlines.includes(airline.name)}
                          onCheckedChange={() => toggleAirlineFilter(airline.name)}
                        />
                        <Label htmlFor={`airline-${airline.name}`} className="text-sm cursor-pointer truncate max-w-[120px]">
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
                          <span className="text-slate-500 text-xs ml-1">({option.time})</span>
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
                          <span className="text-slate-500 text-xs ml-1">({option.time})</span>
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
            </div>
          </Card>
        </div>

        {/* Right Side - Flight Results */}
        <div className="flex-1">
          {/* View Toggle for Round Trip */}
          {isRoundTrip && (
            <div className="mb-4 flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList>
                  <TabsTrigger value="combined">Combined View</TabsTrigger>
                  <TabsTrigger value="separate">Mix & Match</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {viewMode === 'separate' && selectedOutbound && selectedReturn && (
                <div className="flex items-center gap-4 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm">
                    <span className="font-medium">Your Selection:</span> £{getCombinedPrice()} total
                  </div>
                  <Button 
                    onClick={() => onSelectFlight({ outbound: selectedOutbound, return: selectedReturn, combinedPrice: getCombinedPrice() })}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Book This Combination
                  </Button>
                </div>
              )}
            </div>
          )}

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

          {/* Combined View - Shows full round-trip packages */}
          {(!isRoundTrip || viewMode === 'combined') && (
            <div className="space-y-4">
              {filteredFlights.map((flight, index) => (
                <Card key={flight.id || index} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-600">
                  <CardContent className="p-6">
                    {/* Outbound Flight */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <PlaneTakeoff className="h-4 w-4" />
                        <span className="font-medium">Outbound</span>
                        <span className="text-slate-400">•</span>
                        <span>{formatDate(flight.departure_time)}</span>
                      </div>
                    </div>
                    
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
                            {/* Layover Display */}
                            {flight.layover_display && (
                              <div className="text-xs text-orange-600 mt-0.5">
                                Layover: {flight.layover_display}
                              </div>
                            )}
                          </div>

                          {/* Arrival */}
                          <div>
                            <div className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                            <div className="text-sm text-slate-600">{formatDate(flight.arrival_time)}</div>
                            <div className="text-sm font-medium text-slate-700">{flight.to}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return Flight (if round-trip) */}
                    {isRoundTrip && flight.return_departure_time && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                          <PlaneLanding className="h-4 w-4" />
                          <span className="font-medium">Return</span>
                          <span className="text-slate-400">•</span>
                          <span>{formatDate(flight.return_departure_time)}</span>
                        </div>
                        
                        <div className="flex items-start gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-brand-700">{flight.return_airline_code || flight.airline_code}</span>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-8">
                              <div>
                                <div className="text-2xl font-bold text-slate-900">{formatTime(flight.return_departure_time)}</div>
                                <div className="text-sm text-slate-600">{formatDate(flight.return_departure_time)}</div>
                                <div className="text-sm font-medium text-slate-700">{flight.to}</div>
                              </div>

                              <div className="flex flex-col items-center px-4">
                                <div className="text-xs text-slate-500 mb-1">{formatDuration(flight.return_duration)}</div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                  <div className="w-20 h-px bg-slate-300 relative">
                                    {flight.return_stops > 0 && (
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400"></div>
                                    )}
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                </div>
                                <div className="text-xs text-brand-600 font-medium mt-1">
                                  {flight.return_is_direct || flight.return_stops === 0 ? 'Direct' : `${flight.return_stops} stop${flight.return_stops > 1 ? 's' : ''}`}
                                </div>
                                {flight.return_layover_display && (
                                  <div className="text-xs text-orange-600 mt-0.5">
                                    Layover: {flight.return_layover_display}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="text-2xl font-bold text-slate-900">{formatTime(flight.return_arrival_time)}</div>
                                <div className="text-sm text-slate-600">{formatDate(flight.return_arrival_time)}</div>
                                <div className="text-sm font-medium text-slate-700">{flight.from}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Price & Action */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-medium">{flight.airline}</span>
                        {flight.number_of_bookable_seats && flight.number_of_bookable_seats < 5 && (
                          <Badge variant="destructive" className="text-xs bg-brand-600">
                            Only {flight.number_of_bookable_seats} seats left!
                          </Badge>
                        )}
                        {flight.price === cheapestPrice && (
                          <Badge className="bg-green-100 text-green-700">Cheapest</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-3xl font-bold text-brand-600">£{Math.round(flight.price)}</div>
                          <div className="text-xs text-slate-500">{isRoundTrip ? 'total round trip' : 'total price'}</div>
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
            </div>
          )}

          {/* Separate View - Mix & Match for Round Trip */}
          {isRoundTrip && viewMode === 'separate' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Outbound Flights */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PlaneTakeoff className="h-5 w-5 text-brand-600" />
                  Outbound Flights
                </h3>
                <div className="space-y-3">
                  {filteredFlights.map((flight, index) => (
                    <FlightCard 
                      key={`out-${flight.id || index}`}
                      flight={flight}
                      type="outbound"
                      isSelected={selectedOutbound?.id === flight.id}
                      onSelect={setSelectedOutbound}
                    />
                  ))}
                </div>
              </div>

              {/* Return Flights */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PlaneLanding className="h-5 w-5 text-brand-600" />
                  Return Flights
                </h3>
                <div className="space-y-3">
                  {filteredFlights.filter(f => f.return_departure_time).map((flight, index) => (
                    <FlightCard 
                      key={`ret-${flight.id || index}`}
                      flight={flight}
                      type="return"
                      isSelected={selectedReturn?.id === flight.id}
                      onSelect={setSelectedReturn}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

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
  );
};

// Flexible Dates Matrix Component
const FlexibleDatesMatrix = ({ flights, searchParams, onSelectFlight, onModifySearch }) => {
  const [selectedDates, setSelectedDates] = useState(null); // { depDate, retDate }
  
  const priceMatrix = useMemo(() => {
    const matrix = {};
    
    flights.forEach(flight => {
      const depDate = flight.departure_time ? new Date(flight.departure_time).toISOString().split('T')[0] : '';
      const retDate = flight.return_departure_time ? new Date(flight.return_departure_time).toISOString().split('T')[0] : '';
      
      const key = `${depDate}_${retDate}`;
      
      if (!matrix[key]) {
        matrix[key] = {
          cheapestFlight: flight,
          departureDate: depDate,
          returnDate: retDate,
          allFlights: [flight]
        };
      } else {
        matrix[key].allFlights.push(flight);
        if (flight.price < matrix[key].cheapestFlight.price) {
          matrix[key].cheapestFlight = flight;
        }
      }
    });
    
    return matrix;
  }, [flights]);

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

  const formatDateLong = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMM dd, yyyy');
  };

  const getLowestPrice = () => {
    const prices = Object.values(priceMatrix).map(f => f.cheapestFlight.price);
    return Math.min(...prices);
  };

  const lowestPrice = getLowestPrice();

  // Get flights for selected date combination
  const selectedFlights = useMemo(() => {
    if (!selectedDates) return [];
    const key = `${selectedDates.depDate}_${selectedDates.retDate}`;
    return priceMatrix[key]?.allFlights || [];
  }, [selectedDates, priceMatrix]);

  const handleCellClick = (depDate, retDate, flight) => {
    if (!flight) return;
    setSelectedDates({ depDate, retDate });
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
  };

  // Count total unique date combinations (cells in matrix)
  const totalCombinations = Object.keys(priceMatrix).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary Bar */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-brand-600" />
              <span className="font-semibold">{searchParams?.origin}</span>
              <span className="text-slate-400">→</span>
              <span className="font-semibold">{searchParams?.destination}</span>
            </div>
            <Badge className="bg-brand-100 text-brand-700">±3 Days Flexible</Badge>
          </div>
          <Button 
            onClick={onModifySearch}
            variant="outline"
            className="border-brand-600 text-brand-600 hover:bg-brand-50"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Modify Search
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Flexible Dates Price Grid</h2>
          <p className="text-slate-600">Click on a date combination to see all available flights</p>
        </div>
        <Badge className="bg-brand-100 text-brand-700 px-4 py-2">
          {totalCombinations} date combinations • {flights.length} total flights
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
                    const cellData = getPrice(depDate, retDate);
                    const flight = cellData?.cheapestFlight;
                    const isLowest = flight && flight.price === lowestPrice;
                    const isSelected = selectedDates?.depDate === depDate && selectedDates?.retDate === retDate;
                    
                    return (
                      <td
                        key={`${depDate}_${retDate}`}
                        className={`border p-2 text-center cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-brand-600 text-white ring-2 ring-brand-600 ring-offset-1' 
                            : isLowest 
                              ? 'bg-green-50 hover:bg-green-100' 
                              : 'hover:bg-brand-50'
                        }`}
                        onClick={() => handleCellClick(depDate, retDate, cellData)}
                      >
                        {cellData ? (
                          <div>
                            <div className={`text-sm font-bold ${
                              isSelected 
                                ? 'text-white' 
                                : isLowest 
                                  ? 'text-green-700' 
                                  : 'text-slate-700'
                            }`}>
                              £{Math.round(flight.price)}
                            </div>
                            <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                              {flight.airline_code}
                            </div>
                            {cellData.allFlights.length > 1 && (
                              <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                                +{cellData.allFlights.length - 1} more
                              </div>
                            )}
                            {isLowest && !isSelected && (
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

      <div className="mt-4 text-sm text-slate-600">
        <p>All prices in GBP (£) • Click on a cell to view all flights for that date combination</p>
      </div>

      {/* Selected Date Flights */}
      {selectedDates && selectedFlights.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Flights for {formatDateLong(selectedDates.depDate)} → {formatDateLong(selectedDates.retDate)}
              </h3>
              <p className="text-slate-600">{selectedFlights.length} flight(s) available</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setSelectedDates(null)}
              className="text-slate-600"
            >
              Clear Selection
            </Button>
          </div>
          
          <div className="space-y-4">
            {selectedFlights
              .sort((a, b) => a.price - b.price)
              .map((flight, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 hover:border-brand-300"
                onClick={() => onSelectFlight(flight)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Airline Info */}
                    <div className="flex items-center gap-4 min-w-[150px]">
                      <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-brand-700">{flight.airline_code}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{flight.airline}</div>
                        <div className="text-sm text-slate-500">{flight.airline_code}</div>
                      </div>
                    </div>

                    {/* Outbound Flight */}
                    <div className="flex-1 px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                          <div className="text-sm font-medium text-brand-600">{flight.from}</div>
                        </div>
                        <div className="flex-1 px-4">
                          <div className="text-center text-xs text-slate-500 mb-1">{formatDuration(flight.duration)}</div>
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                            <div className="flex-1 h-px bg-slate-300 mx-2"></div>
                            <Plane className="h-4 w-4 text-brand-500 transform rotate-90" />
                            <div className="flex-1 h-px bg-slate-300 mx-2"></div>
                            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                          </div>
                          <div className="text-center text-xs font-medium text-brand-600 mt-1">
                            {flight.is_direct ? 'Direct' : `${flight.stops} stop(s)`}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                          <div className="text-sm font-medium text-brand-600">{flight.to}</div>
                        </div>
                      </div>
                    </div>

                    {/* Return Flight (if round-trip) */}
                    {flight.return_departure_time && (
                      <div className="flex-1 px-6 border-l">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{formatTime(flight.return_departure_time)}</div>
                            <div className="text-sm font-medium text-brand-600">{flight.to}</div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="text-center text-xs text-slate-500 mb-1">{formatDuration(flight.return_duration)}</div>
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                              <div className="flex-1 h-px bg-slate-300 mx-2"></div>
                              <Plane className="h-4 w-4 text-brand-500 transform -rotate-90" />
                              <div className="flex-1 h-px bg-slate-300 mx-2"></div>
                              <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                            </div>
                            <div className="text-center text-xs font-medium text-brand-600 mt-1">
                              {flight.return_is_direct ? 'Direct' : `${flight.return_stops} stop(s)`}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{formatTime(flight.return_arrival_time)}</div>
                            <div className="text-sm font-medium text-brand-600">{flight.from}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price & Book */}
                    <div className="text-right min-w-[140px] pl-6">
                      <div className="text-3xl font-bold text-brand-600">£{Math.round(flight.price)}</div>
                      <div className="text-sm text-slate-500 mb-2">per person</div>
                      <Button className="bg-brand-600 hover:bg-brand-700 w-full">
                        Select
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No selection prompt */}
      {!selectedDates && (
        <div className="mt-8 text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Plane className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Select dates from the grid above</h3>
          <p className="text-slate-500">Click on any price cell to view all available flights for that date combination</p>
        </div>
      )}
    </div>
  );
};

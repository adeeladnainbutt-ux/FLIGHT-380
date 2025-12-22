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
import { AirlineLogo } from '../utils/airlineLogos';
import { MobileFilterButton } from './MobileFilterButton';

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
  const [selectedMultiCityFlights, setSelectedMultiCityFlights] = useState({});
  
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
  
  // Check if this is a multi-city search
  const isMultiCity = searchParams?.tripType === 'multi-city' && flights.some(f => f.leg_index !== undefined);
  
  // Group flights by leg for multi-city
  const flightsByLeg = useMemo(() => {
    if (!isMultiCity) return null;
    const grouped = {};
    flights.forEach(flight => {
      const legIndex = flight.leg_index ?? 0;
      if (!grouped[legIndex]) {
        grouped[legIndex] = [];
      }
      grouped[legIndex].push(flight);
    });
    return grouped;
  }, [flights, isMultiCity]);

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

  // Connection length filter options
  const connectionLengthOptions = [
    { value: 'none', label: 'No Connections' },
    { value: 'short', label: 'Short Connection', time: '0 - 2 hours', minMinutes: 0, maxMinutes: 120 },
    { value: 'relaxed', label: 'Relaxed Connection', time: '2 - 4 hours', minMinutes: 121, maxMinutes: 240 },
    { value: 'long', label: 'Long Connection', time: '4 - 8 hours', minMinutes: 241, maxMinutes: 480 },
    { value: 'verylong', label: 'Very Long Connection', time: '8+ hours', minMinutes: 481, maxMinutes: Infinity }
  ];

  // Fare type options
  const fareTypeOptions = [
    { value: 'IT', label: 'IT' },
    { value: 'Net', label: 'Net' },
    { value: 'Pub', label: 'Pub' }
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

  // Filter flights
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Apply outbound stops filter
    if (filters.stopsOutbound) {
      result = result.filter(flight => {
        if (filters.stopsOutbound === 'direct') return flight.is_direct || flight.stops === 0;
        if (filters.stopsOutbound === '1') return flight.stops === 1;
        if (filters.stopsOutbound === '2+') return flight.stops >= 2;
        return true;
      });
    }

    // Apply return stops filter
    if (filters.stopsReturn && isRoundTrip) {
      result = result.filter(flight => {
        if (filters.stopsReturn === 'direct') return flight.return_is_direct || flight.return_stops === 0;
        if (filters.stopsReturn === '1') return flight.return_stops === 1;
        if (filters.stopsReturn === '2+') return flight.return_stops >= 2;
        return true;
      });
    }

    // Apply airline filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline));
    }

    // Apply outbound departure time filter
    if (filters.outboundDepartureTime) {
      result = result.filter(flight => {
        const hour = getHour(flight.departure_time);
        if (filters.outboundDepartureTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.outboundDepartureTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.outboundDepartureTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply outbound arrival time filter
    if (filters.outboundArrivalTime) {
      result = result.filter(flight => {
        const hour = getHour(flight.arrival_time);
        if (filters.outboundArrivalTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.outboundArrivalTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.outboundArrivalTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply return departure time filter
    if (filters.returnDepartureTime && isRoundTrip) {
      result = result.filter(flight => {
        const hour = getHour(flight.return_departure_time);
        if (filters.returnDepartureTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.returnDepartureTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.returnDepartureTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply return arrival time filter
    if (filters.returnArrivalTime && isRoundTrip) {
      result = result.filter(flight => {
        const hour = getHour(flight.return_arrival_time);
        if (filters.returnArrivalTime === 'morning') return hour >= 5 && hour < 12;
        if (filters.returnArrivalTime === 'afternoon') return hour >= 12 && hour < 18;
        if (filters.returnArrivalTime === 'evening') return hour >= 18 || hour < 5;
        return true;
      });
    }

    // Apply connection length outbound filter
    if (filters.connectionLengthOutbound) {
      const selectedOption = connectionLengthOptions.find(opt => opt.value === filters.connectionLengthOutbound);
      if (selectedOption) {
        result = result.filter(flight => {
          if (selectedOption.value === 'none') {
            return flight.is_direct || flight.stops === 0;
          }
          const layoverMins = flight.total_layover_minutes || 0;
          return layoverMins >= selectedOption.minMinutes && layoverMins <= selectedOption.maxMinutes;
        });
      }
    }

    // Apply connection length return filter
    if (filters.connectionLengthReturn && isRoundTrip) {
      const selectedOption = connectionLengthOptions.find(opt => opt.value === filters.connectionLengthReturn);
      if (selectedOption) {
        result = result.filter(flight => {
          if (selectedOption.value === 'none') {
            return flight.return_is_direct || flight.return_stops === 0;
          }
          const layoverMins = flight.return_total_layover_minutes || 0;
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

  // Calculate active filter count for mobile button
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fareType) count++;
    if (filters.stopsOutbound) count++;
    if (filters.stopsReturn) count++;
    if (filters.baggage) count++;
    if (filters.airlines.length > 0) count += filters.airlines.length;
    if (filters.outboundDepartureTime) count++;
    if (filters.outboundArrivalTime) count++;
    if (filters.returnDepartureTime) count++;
    if (filters.returnArrivalTime) count++;
    if (filters.connectionLengthOutbound) count++;
    if (filters.connectionLengthReturn) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

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
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {/* Airline Logo + Name - Mobile */}
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            <AirlineLogo code={flight.airline_code} className="w-8 h-8 sm:w-12 sm:h-12" />
            <span className="text-xs text-slate-600 sm:hidden">{flight.airline}</span>
          </div>

          {/* Flight Details */}
          <div className="flex-1">
            <div className="flex items-center justify-between sm:gap-6">
              {/* Departure */}
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-slate-900">{formatTime(type === 'return' ? flight.return_departure_time : flight.departure_time)}</div>
                <div className="text-xs text-slate-500">{type === 'return' ? flight.to : flight.from}</div>
              </div>

              {/* Duration & Stops */}
              <div className="flex flex-col items-center flex-1 px-1 sm:px-0">
                <div className="text-xs text-slate-500">{formatDuration(type === 'return' ? flight.return_duration : flight.duration)}</div>
                <div className="flex items-center w-full max-w-[80px] sm:max-w-none">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                  <div className="flex-1 h-px bg-slate-300 relative mx-1">
                    {((type === 'return' ? flight.return_stops : flight.stops) > 0) && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400"></div>
                    )}
                  </div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                </div>
                <div className="text-xs text-brand-600 font-medium">
                  {(type === 'return' ? (flight.return_is_direct || flight.return_stops === 0) : (flight.is_direct || flight.stops === 0)) 
                    ? 'Direct' 
                    : `${type === 'return' ? flight.return_stops : flight.stops} stop`}
                </div>
                {/* Layover Information for FlightCard */}
                {type === 'return' 
                  ? (flight.return_layovers && flight.return_layovers.length > 0 && (
                      <div className="text-xs text-orange-600 mt-0.5 text-center">
                        {flight.return_layovers.map((layover, idx) => (
                          <span key={idx}>
                            {layover.airport} ({layover.duration_display})
                            {idx < flight.return_layovers.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    ))
                  : (flight.layovers && flight.layovers.length > 0 && (
                      <div className="text-xs text-orange-600 mt-0.5 text-center">
                        {flight.layovers.map((layover, idx) => (
                          <span key={idx}>
                            {layover.airport} ({layover.duration_display})
                            {idx < flight.layovers.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    ))
                }
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-base sm:text-xl font-bold text-slate-900">{formatTime(type === 'return' ? flight.return_arrival_time : flight.arrival_time)}</div>
                <div className="text-xs text-slate-500">{type === 'return' ? flight.from : flight.to}</div>
              </div>
            </div>
          </div>

          {/* Price & Selection */}
          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0">
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl font-bold text-brand-600">£{Math.round(flight.price / (isRoundTrip ? 2 : 1))}</div>
              <div className="text-xs text-slate-500">{type === 'outbound' ? 'outbound' : 'return'}</div>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render filter content (used in both desktop sidebar and mobile sheet)
  const renderFilterContent = () => (
    <>
      {/* Fare Type Filter */}
      <FilterSection title="Fare Type" name="fareType">
        <RadioGroup 
          value={filters.fareType || ''} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, fareType: value || null }))}
        >
          {fareTypeOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2 py-1.5">
              <RadioGroupItem value={option.value} id={`m-fare-${option.value}`} />
              <Label htmlFor={`m-fare-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <Separator className="my-3" />

      {/* Stops from Origin Filter */}
      <FilterSection title={`Stops from ${searchParams?.origin || 'Origin'}`} name="stopsOutbound">
        <RadioGroup 
          value={filters.stopsOutbound || ''} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, stopsOutbound: value || null }))}
        >
          {stopOptions.map(option => (
            <div key={option.value} className="flex items-center justify-between py-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`m-stopOut-${option.value}`} />
                <Label htmlFor={`m-stopOut-${option.value}`} className="text-sm cursor-pointer">
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

      {isRoundTrip && (
        <>
          <Separator className="my-3" />
          <FilterSection title={`Stops from ${searchParams?.destination || 'Destination'}`} name="stopsReturn">
            <RadioGroup 
              value={filters.stopsReturn || ''} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, stopsReturn: value || null }))}
            >
              {stopOptions.map(option => (
                <div key={option.value} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`m-stopRet-${option.value}`} />
                    <Label htmlFor={`m-stopRet-${option.value}`} className="text-sm cursor-pointer">
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
        </>
      )}

      <Separator className="my-3" />

      {/* Baggage Filter */}
      <FilterSection title="Baggage" name="baggage">
        <RadioGroup 
          value={filters.baggage || ''} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, baggage: value || null }))}
        >
          {baggageOptions.map(option => (
            <div key={option.value} className="flex items-center space-x-2 py-1.5">
              <RadioGroupItem value={option.value} id={`m-bag-${option.value}`} />
              <Label htmlFor={`m-bag-${option.value}`} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterSection>

      <Separator className="my-3" />

      {/* Airline Filter */}
      <FilterSection title="Airline" name="airlines">
        <div className="space-y-2">
          {uniqueAirlines.slice(0, 10).map(airline => (
            <div key={airline.code} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`m-airline-${airline.code}`}
                  checked={filters.airlines.includes(airline.code)}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({
                      ...prev,
                      airlines: checked 
                        ? [...prev.airlines, airline.code]
                        : prev.airlines.filter(a => a !== airline.code)
                    }));
                  }}
                />
                <Label htmlFor={`m-airline-${airline.code}`} className="text-sm cursor-pointer flex items-center gap-2">
                  <AirlineLogo airlineCode={airline.code} size="sm" />
                  {airline.name}
                </Label>
              </div>
              <span className="text-sm font-medium text-brand-600">£{Math.round(airline.minPrice)}</span>
            </div>
          ))}
        </div>
      </FilterSection>

      <Separator className="my-3" />

      {/* Price Range Filter */}
      <FilterSection title="Total Price" name="price">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Label className="text-xs text-slate-500">Min (£)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              className="h-9"
            />
          </div>
          <div className="flex-1">
            <Label className="text-xs text-slate-500">Max (£)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              className="h-9"
            />
          </div>
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* MODIFY SEARCH BAR - PROMINENT POSITION */}
      <div className="bg-brand-600 text-white rounded-lg shadow-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Plane className="h-6 w-6" />
          {isMultiCity ? (
            <span className="font-semibold">Multi-City • {searchParams?.legs?.length || 0} Journeys</span>
          ) : (
            <>
              <span className="font-semibold text-lg">{searchParams?.origin || 'Origin'}</span>
              <ArrowRight className="h-5 w-5" />
              <span className="font-semibold text-lg">{searchParams?.destination || 'Destination'}</span>
              <span className="text-brand-100 text-sm">
                {searchParams?.departure_date && format(new Date(searchParams.departure_date), 'dd MMM yyyy')}
                {searchParams?.return_date && ` - ${format(new Date(searchParams.return_date), 'dd MMM yyyy')}`}
              </span>
            </>
          )}
          {isRoundTrip && <Badge className="bg-white text-brand-600">Round Trip</Badge>}
        </div>
        <Button 
          onClick={onModifySearch}
          variant="secondary"
          size="lg"
          className="bg-white text-brand-600 hover:bg-brand-50 font-semibold w-full sm:w-auto"
        >
          <Edit3 className="h-5 w-5 mr-2" />
          Modify Search
        </Button>
      </div>

      {/* Mobile Filter Button - Shows at bottom on mobile */}
      <MobileFilterButton filterCount={activeFilterCount} onClearAll={clearAllFilters}>
        {renderFilterContent()}
      </MobileFilterButton>

      {/* Mobile Filters - Collapsible section shown on mobile */}
      <div className="lg:hidden mb-4">
        {/* MODIFY SEARCH - Mobile */}
        <Button 
          onClick={onModifySearch}
          className="w-full mb-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Modify Search
        </Button>
        <Card className="overflow-hidden">
          <div className="p-3 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-brand-600" />
                <span className="font-semibold text-sm text-slate-900">{filteredFlights.length} Flights</span>
              </div>
              {(filters.stopsOutbound || filters.stopsReturn || filters.airlines.length > 0 || filters.minPrice || filters.maxPrice) && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-brand-600 hover:text-brand-700 text-xs h-7 px-2">
                  Clear
                </Button>
              )}
            </div>
          </div>
          {/* Scrollable filter content - increased height and visible scrollbar */}
          <div 
            className="p-3 overflow-y-auto" 
            style={{ 
              maxHeight: 'calc(100vh - 280px)',
              minHeight: '300px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#E73121 #f1f5f9'
            }}
          >
            {renderFilterContent()}
            {/* Scroll indicator */}
            <div className="text-center text-xs text-slate-400 pt-3 pb-1">
              ↑ Scroll for more filters ↑
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Sidebar - Filters with VISIBLE Scrollbar - Hidden on mobile */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <Card className="sticky top-4 overflow-hidden">
            {/* MODIFY SEARCH - Desktop Sidebar */}
            <div className="p-3 bg-brand-600 text-white">
              <Button 
                onClick={onModifySearch}
                variant="secondary"
                className="w-full bg-white text-brand-600 hover:bg-brand-50 font-semibold"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modify Search
              </Button>
            </div>
            <div className="p-4 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-brand-600" />
                  <h3 className="font-bold text-lg text-slate-900">{filteredFlights.length} Flights</h3>
                </div>
                {(filters.stopsOutbound || filters.stopsReturn || filters.airlines.length > 0 || filters.outboundDepartureTime || filters.outboundArrivalTime || filters.returnDepartureTime || filters.returnArrivalTime || filters.connectionLengthOutbound || filters.connectionLengthReturn || filters.baggage || filters.fareType || filters.minPrice || filters.maxPrice) && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-brand-600 hover:text-brand-700 text-xs">
                    Clear All
                  </Button>
                )}
              </div>
            </div>
            
            {/* Scrollable Filter Content with VISIBLE scrollbar */}
            <div 
              className="overflow-y-auto p-4 filter-scroll" 
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
              
              {/* Fare Type Filter */}
              <FilterSection title="Fare Type" name="fareType">
                <RadioGroup 
                  value={filters.fareType || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, fareType: value || null }))}
                >
                  {fareTypeOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={option.value} id={`fare-${option.value}`} />
                      <Label htmlFor={`fare-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FilterSection>

              <Separator className="my-3" />

              {/* Stops from Origin Filter */}
              <FilterSection title={`Stops from ${searchParams?.origin || 'Origin'}`} name="stopsOutbound">
                <RadioGroup 
                  value={filters.stopsOutbound || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, stopsOutbound: value || null }))}
                >
                  {stopOptions.map(option => (
                    <div key={option.value} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`stopOut-${option.value}`} />
                        <Label htmlFor={`stopOut-${option.value}`} className="text-sm cursor-pointer">
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

              {isRoundTrip && (
                <>
                  <Separator className="my-3" />
                  {/* Stops from Destination Filter */}
                  <FilterSection title={`Stops from ${searchParams?.destination || 'Destination'}`} name="stopsReturn">
                    <RadioGroup 
                      value={filters.stopsReturn || ''} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, stopsReturn: value || null }))}
                    >
                      {stopOptions.map(option => (
                        <div key={option.value} className="flex items-center justify-between py-1.5">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`stopRet-${option.value}`} />
                            <Label htmlFor={`stopRet-${option.value}`} className="text-sm cursor-pointer">
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
                </>
              )}

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
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
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

              {/* Outbound Departure Time Filter */}
              <FilterSection title="Outbound Departure Time" name="outboundDepartureTime">
                <RadioGroup 
                  value={filters.outboundDepartureTime || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, outboundDepartureTime: value || null }))}
                >
                  {timeOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2 py-1.5">
                        <RadioGroupItem value={option.value} id={`outDep-${option.value}`} />
                        <Icon className="h-4 w-4 text-slate-500" />
                        <Label htmlFor={`outDep-${option.value}`} className="text-sm cursor-pointer">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-slate-500 text-xs ml-1">({option.time})</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FilterSection>

              <Separator className="my-3" />

              {/* Outbound Arrival Time Filter */}
              <FilterSection title="Outbound Arrival Time" name="outboundArrivalTime">
                <RadioGroup 
                  value={filters.outboundArrivalTime || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, outboundArrivalTime: value || null }))}
                >
                  {timeOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2 py-1.5">
                        <RadioGroupItem value={option.value} id={`outArr-${option.value}`} />
                        <Icon className="h-4 w-4 text-slate-500" />
                        <Label htmlFor={`outArr-${option.value}`} className="text-sm cursor-pointer">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-slate-500 text-xs ml-1">({option.time})</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FilterSection>

              {isRoundTrip && (
                <>
                  <Separator className="my-3" />

                  {/* Return Departure Time Filter */}
                  <FilterSection title="Return Departure Time" name="returnDepartureTime">
                    <RadioGroup 
                      value={filters.returnDepartureTime || ''} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, returnDepartureTime: value || null }))}
                    >
                      {timeOptions.map(option => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-2 py-1.5">
                            <RadioGroupItem value={option.value} id={`retDep-${option.value}`} />
                            <Icon className="h-4 w-4 text-slate-500" />
                            <Label htmlFor={`retDep-${option.value}`} className="text-sm cursor-pointer">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-slate-500 text-xs ml-1">({option.time})</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FilterSection>

                  <Separator className="my-3" />

                  {/* Return Arrival Time Filter */}
                  <FilterSection title="Return Arrival Time" name="returnArrivalTime">
                    <RadioGroup 
                      value={filters.returnArrivalTime || ''} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, returnArrivalTime: value || null }))}
                    >
                      {timeOptions.map(option => {
                        const Icon = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-2 py-1.5">
                            <RadioGroupItem value={option.value} id={`retArr-${option.value}`} />
                            <Icon className="h-4 w-4 text-slate-500" />
                            <Label htmlFor={`retArr-${option.value}`} className="text-sm cursor-pointer">
                              <span className="font-medium">{option.label}</span>
                              <span className="text-slate-500 text-xs ml-1">({option.time})</span>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FilterSection>
                </>
              )}

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

              {/* Connection Length Outbound Filter */}
              <FilterSection title={`Connection Length (${searchParams?.origin || 'Origin'} - ${searchParams?.destination || 'Dest'})`} name="connectionLengthOutbound">
                <RadioGroup 
                  value={filters.connectionLengthOutbound || ''} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, connectionLengthOutbound: value || null }))}
                >
                  {connectionLengthOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={option.value} id={`connOut-${option.value}`} />
                      <Label htmlFor={`connOut-${option.value}`} className="text-sm cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        {option.time && <span className="text-slate-500 text-xs ml-1">({option.time})</span>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FilterSection>

              {isRoundTrip && (
                <>
                  <Separator className="my-3" />

                  {/* Connection Length Return Filter */}
                  <FilterSection title={`Connection Length (${searchParams?.destination || 'Dest'} - ${searchParams?.origin || 'Origin'})`} name="connectionLengthReturn">
                    <RadioGroup 
                      value={filters.connectionLengthReturn || ''} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, connectionLengthReturn: value || null }))}
                    >
                      {connectionLengthOptions.map(option => (
                        <div key={option.value} className="flex items-center space-x-2 py-1.5">
                          <RadioGroupItem value={option.value} id={`connRet-${option.value}`} />
                          <Label htmlFor={`connRet-${option.value}`} className="text-sm cursor-pointer">
                            <span className="font-medium">{option.label}</span>
                            {option.time && <span className="text-slate-500 text-xs ml-1">({option.time})</span>}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FilterSection>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side - Flight Results */}
        <div className="flex-1 min-w-0">
          {/* View Toggle for Round Trip - Mobile Responsive */}
          {isRoundTrip && (
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-full sm:w-auto">
                <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
                  <TabsTrigger value="combined" className="text-xs sm:text-sm">Combined</TabsTrigger>
                  <TabsTrigger value="separate" className="text-xs sm:text-sm">Mix & Match</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {viewMode === 'separate' && selectedOutbound && selectedReturn && (
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm">
                    <span className="font-medium">Your Selection:</span> £{getCombinedPrice()} total
                  </div>
                  <Button 
                    onClick={() => onSelectFlight({ outbound: selectedOutbound, return: selectedReturn, combinedPrice: getCombinedPrice() })}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    size="sm"
                  >
                    Book This Combination
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Flights Available Header with MODIFY SEARCH - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Available
              </h2>
              <Button
                onClick={onModifySearch}
                variant="outline"
                size="sm"
                className="border-brand-600 text-brand-600 hover:bg-brand-50 font-medium"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Modify
              </Button>
            </div>
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
                className={`text-xs sm:text-sm whitespace-nowrap ${sortBy === 'price' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
              >
                Price
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('duration')}
                className={`text-xs sm:text-sm whitespace-nowrap ${sortBy === 'duration' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
              >
                Duration
              </Button>
              <Button
                variant={sortBy === 'departure' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('departure')}
                className={`text-xs sm:text-sm whitespace-nowrap ${sortBy === 'departure' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
              >
                Departure
              </Button>
            </div>
          </div>

          {/* Multi-City View - Shows flights grouped by leg */}
          {isMultiCity && flightsByLeg && (
            <div className="space-y-6 pb-24 lg:pb-4">
              {Object.keys(flightsByLeg).sort((a, b) => Number(a) - Number(b)).map((legIndex) => {
                const legFlights = flightsByLeg[legIndex];
                const legNum = Number(legIndex) + 1;
                const firstFlight = legFlights[0];
                const selectedFlight = selectedMultiCityFlights[legIndex];
                
                return (
                  <div key={`leg-${legIndex}`} className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">
                      <Badge className="bg-brand-600 text-white">Journey {legNum}</Badge>
                      <span className="font-medium text-slate-700">
                        {firstFlight?.leg_origin || firstFlight?.from} → {firstFlight?.leg_destination || firstFlight?.to}
                      </span>
                      <span className="text-sm text-slate-500">
                        {firstFlight?.departure_time ? formatDate(firstFlight.departure_time) : ''}
                      </span>
                      <span className="text-sm text-slate-500 ml-auto">
                        {legFlights.length} option{legFlights.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {legFlights.slice(0, 5).map((flight, flightIndex) => {
                      // Create a unique flight key for selection comparison
                      const flightKey = `${flight.departure_time}_${flight.arrival_time}_${flight.airline_code}_${flight.price}`;
                      const selectedFlightKey = selectedFlight 
                        ? `${selectedFlight.departure_time}_${selectedFlight.arrival_time}_${selectedFlight.airline_code}_${selectedFlight.price}`
                        : null;
                      const isThisFlightSelected = selectedFlightKey === flightKey;
                      
                      return (
                        <Card 
                          key={`${legIndex}-${flightIndex}-${flightKey}`} 
                          className={`hover:shadow-lg transition-shadow cursor-pointer ${
                            isThisFlightSelected ? 'border-2 border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-l-4 border-l-brand-600'
                          }`}
                          onClick={() => {
                            setSelectedMultiCityFlights(prev => ({
                              ...prev,
                              [legIndex]: flight
                            }));
                          }}
                        >
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                              {/* Airline Logo */}
                              <div className="flex items-center gap-3 sm:flex-col sm:gap-1 sm:flex-shrink-0 sm:w-16">
                              <AirlineLogo code={flight.airline_code} className="w-8 h-8 sm:w-10 sm:h-10" />
                              <div className="text-xs text-slate-600 sm:text-center truncate">{flight.airline}</div>
                            </div>

                            {/* Flight Details */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between sm:justify-start sm:gap-6">
                                <div className="text-center sm:text-left">
                                  <div className="text-lg font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                                  <div className="text-xs font-semibold text-slate-700">{flight.from}</div>
                                </div>

                                <div className="flex flex-col items-center px-2">
                                  <div className="text-xs text-slate-500">{formatDuration(flight.duration)}</div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                    <div className="w-10 sm:w-16 h-px bg-slate-300 relative">
                                      {flight.stops > 0 && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                      )}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                                  </div>
                                  <div className="text-xs text-brand-600 font-medium">
                                    {flight.is_direct || flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}
                                  </div>
                                  {flight.layovers && flight.layovers.length > 0 && (
                                    <div className="text-xs text-orange-600 font-medium">
                                      {flight.layovers.map((l, i) => `${l.airport} (${l.duration_display})`).join(', ')}
                                    </div>
                                  )}
                                </div>

                                <div className="text-center sm:text-left">
                                  <div className="text-lg font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                                  <div className="text-xs font-semibold text-slate-700">{flight.to}</div>
                                </div>
                              </div>
                            </div>

                            {/* Price & Selection */}
                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0">
                              <div className="text-right">
                                <div className="text-lg font-bold text-brand-600">£{Math.round(flight.price)}</div>
                                <div className="text-xs text-slate-500">per person</div>
                              </div>
                              {isThisFlightSelected && (
                                <Badge className="bg-green-500 text-white">
                                  <Check className="w-3 h-3 mr-1" /> Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                    
                    {legFlights.length > 5 && (
                      <Button variant="outline" className="w-full text-sm">
                        Show {legFlights.length - 5} more options
                      </Button>
                    )}
                  </div>
                );
              })}
              
              {/* Book Multi-City Button */}
              {Object.keys(selectedMultiCityFlights).length === Object.keys(flightsByLeg).length && (
                <div className="sticky bottom-4 p-4 bg-white rounded-lg shadow-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-600">Total for all journeys</div>
                      <div className="text-2xl font-bold text-brand-600">
                        £{Math.round(Object.values(selectedMultiCityFlights).reduce((sum, f) => sum + (f?.price || 0), 0))}
                      </div>
                    </div>
                    <Button 
                      className="bg-brand-600 hover:bg-brand-700 text-white px-8"
                      onClick={() => onSelectFlight({
                        type: 'multi-city',
                        flights: Object.values(selectedMultiCityFlights),
                        totalPrice: Object.values(selectedMultiCityFlights).reduce((sum, f) => sum + (f?.price || 0), 0)
                      })}
                    >
                      Book Multi-City
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Combined View - Shows full round-trip packages */}
          {!isMultiCity && (!isRoundTrip || viewMode === 'combined') && (
            <div className="space-y-4 pb-24 lg:pb-4">
              {filteredFlights.map((flight, index) => (
                <Card key={flight.id || index} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-600">
                  <CardContent className="p-3 sm:p-6">
                    {/* Outbound Flight */}
                    <div className="flex items-center gap-2 sm:gap-6 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600">
                        <PlaneTakeoff className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="font-medium">Outbound</span>
                        <span className="text-slate-400 hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{formatDate(flight.departure_time)}</span>
                      </div>
                    </div>
                    
                    {/* Mobile: Stacked Layout | Desktop: Row Layout */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                      {/* Airline Logo */}
                      <div className="flex items-center gap-3 sm:flex-col sm:gap-1 sm:flex-shrink-0">
                        <AirlineLogo code={flight.airline_code} className="w-10 h-10 sm:w-14 sm:h-14" />
                        <div className="text-xs text-slate-600 sm:text-center">{flight.airline}</div>
                      </div>

                      {/* Flight Details - Mobile Responsive */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between sm:justify-start sm:gap-8">
                          {/* Departure */}
                          <div className="text-center sm:text-left">
                            <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(flight.departure_time)}</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700">{flight.from}</div>
                          </div>

                          {/* Duration & Stops */}
                          <div className="flex flex-col items-center px-2 sm:px-4">
                            <div className="text-xs text-slate-500 mb-1">{formatDuration(flight.duration)}</div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                              <div className="w-12 sm:w-20 h-px bg-slate-300 relative">
                                {!flight.is_direct && flight.stops > 0 && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400"></div>
                                )}
                              </div>
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                            </div>
                            <div className="text-xs text-brand-600 font-medium mt-1">
                              {flight.is_direct || flight.stops === 0 ? 'Direct' : `${flight.stops} connection`}
                            </div>
                            {/* Layover/Connection Information */}
                            {flight.layovers && flight.layovers.length > 0 && (
                              <div className="text-xs text-orange-600 font-medium mt-0.5">
                                {flight.layovers.map((layover, idx) => (
                                  <span key={idx}>
                                    {layover.airport} ({layover.duration_display})
                                    {idx < flight.layovers.length - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Arrival */}
                          <div className="text-center sm:text-left">
                            <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(flight.arrival_time)}</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700">{flight.to}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return Flight (if round-trip) */}
                    {isRoundTrip && flight.return_departure_time && (
                      <>
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                          <PlaneLanding className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-medium">Return</span>
                          <span className="text-slate-400 hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{formatDate(flight.return_departure_time)}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                          <div className="flex items-center gap-3 sm:flex-col sm:gap-1 sm:flex-shrink-0">
                            <AirlineLogo code={flight.return_airline_code || flight.airline_code} className="w-10 h-10 sm:w-14 sm:h-14" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between sm:justify-start sm:gap-8">
                              <div className="text-center sm:text-left">
                                <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(flight.return_departure_time)}</div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-700">{flight.to}</div>
                              </div>

                              <div className="flex flex-col items-center px-2 sm:px-4">
                                <div className="text-xs text-slate-500 mb-1">{formatDuration(flight.return_duration)}</div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                                  <div className="w-12 sm:w-20 h-px bg-slate-300 relative">
                                    {flight.return_stops > 0 && (
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-400"></div>
                                    )}
                                  </div>
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-500"></div>
                                </div>
                                <div className="text-xs text-brand-600 font-medium mt-1">
                                  {flight.return_is_direct || flight.return_stops === 0 ? 'Direct' : `${flight.return_stops} connection`}
                                </div>
                                {/* Return Layover/Connection Information */}
                                {flight.return_layovers && flight.return_layovers.length > 0 && (
                                  <div className="text-xs text-orange-600 font-medium mt-0.5">
                                    {flight.return_layovers.map((layover, idx) => (
                                      <span key={idx}>
                                        {layover.airport} ({layover.duration_display})
                                        {idx < flight.return_layovers.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="text-center sm:text-left">
                                <div className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(flight.return_arrival_time)}</div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-700">{flight.from}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Price & Action - Mobile Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600 flex-wrap">
                        {flight.number_of_bookable_seats && flight.number_of_bookable_seats < 5 && (
                          <Badge variant="destructive" className="text-xs bg-brand-600">
                            {flight.number_of_bookable_seats} seats left
                          </Badge>
                        )}
                        {flight.price === cheapestPrice && (
                          <Badge className="bg-green-100 text-green-700 text-xs">Cheapest</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:gap-4">
                        <div className="text-left sm:text-right">
                          <div className="text-2xl sm:text-3xl font-bold text-brand-600">£{Math.round(flight.price)}</div>
                          <div className="text-xs text-slate-500">{isRoundTrip ? 'round trip' : 'total'}</div>
                        </div>
                        <Button
                          onClick={() => onSelectFlight(flight)}
                          className="bg-brand-600 hover:bg-brand-700 font-semibold px-4 sm:px-8"
                          size="sm"
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

          {/* Separate View - Mix & Match for Round Trip - Mobile Responsive */}
          {isRoundTrip && viewMode === 'separate' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-24 lg:pb-4">
              {/* Outbound Flights */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <PlaneTakeoff className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
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
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <PlaneLanding className="h-4 w-4 sm:h-5 sm:w-5 text-brand-600" />
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
                      <AirlineLogo code={flight.airline_code} className="w-12 h-12" />
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

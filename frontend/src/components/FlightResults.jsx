import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Plane, Clock, Luggage, Filter } from 'lucide-react';
import { format } from 'date-fns';

export const FlightResults = ({ flights, isFlexible, onSelectFlight, searchParams }) => {
  const [filters, setFilters] = useState({
    stops: [],
    airlines: [],
    fareTypes: []
  });
  const [sortBy, setSortBy] = useState('price'); // price, duration, departure

  // Extract unique values for filters
  const uniqueAirlines = useMemo(() => {
    const airlines = [...new Set(flights.map(f => f.airline))];
    return airlines.filter(Boolean);
  }, [flights]);

  const stopOptions = [
    { value: 'direct', label: 'Direct', count: flights.filter(f => f.is_direct).length },
    { value: '1', label: '1 Connection', count: flights.filter(f => f.stops === 1).length },
    { value: '2+', label: '2+ Connections', count: flights.filter(f => f.stops >= 2).length }
  ];

  // Filter flights
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Apply stops filter
    if (filters.stops.length > 0) {
      result = result.filter(flight => {
        if (filters.stops.includes('direct') && flight.is_direct) return true;
        if (filters.stops.includes('1') && flight.stops === 1) return true;
        if (filters.stops.includes('2+') && flight.stops >= 2) return true;
        return false;
      });
    }

    // Apply airline filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.airline));
    }

    // Sort
    if (sortBy === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'duration') {
      result.sort((a, b) => {
        const durationA = parseDuration(a.duration);
        const durationB = parseDuration(b.duration);
        return durationA - durationB;
      });
    }

    return result;
  }, [flights, filters, sortBy]);

  const parseDuration = (duration) => {
    if (!duration) return 0;
    const match = duration.match(/PT(\d+)H(\d+)M/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
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

  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  // If flexible dates, show matrix view
  if (isFlexible && flights.length > 0) {
    return <FlexibleDatesMatrix flights={flights} searchParams={searchParams} onSelectFlight={onSelectFlight} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0 space-y-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-lg">Filters</h3>
            </div>
            <Separator className="mb-4" />

            {/* Stops Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Stops
              </h4>
              <div className="space-y-2">
                {stopOptions.map(option => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`stop-${option.value}`}
                        checked={filters.stops.includes(option.value)}
                        onCheckedChange={() => toggleFilter('stops', option.value)}
                      />
                      <label
                        htmlFor={`stop-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                    <span className="text-xs text-slate-500">{option.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Airline Filter */}
            <div>
              <h4 className="font-medium text-sm mb-3">Airline</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uniqueAirlines.slice(0, 10).map(airline => (
                  <div key={airline} className="flex items-center space-x-2">
                    <Checkbox
                      id={`airline-${airline}`}
                      checked={filters.airlines.includes(airline)}
                      onCheckedChange={() => toggleFilter('airlines', airline)}
                    />
                    <label
                      htmlFor={`airline-${airline}`}
                      className="text-sm cursor-pointer"
                    >
                      {airline}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side - Flight Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {filteredFlights.length} Flight{filteredFlights.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
                className="text-sm"
              >
                Lowest Price
              </Button>
              <Button
                variant={sortBy === 'duration' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('duration')}
                className="text-sm"
              >
                Shortest
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFlights.map((flight, index) => (
              <Card key={flight.id || index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Airline Logo Placeholder */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-700">{flight.airline_code}</span>
                      </div>
                      <div className="text-xs text-center mt-1 text-slate-600">{flight.airline_code}</div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-8">
                          {/* Departure */}
                          <div>
                            <div className="text-2xl font-bold">{formatTime(flight.departure_time)}</div>
                            <div className="text-sm text-slate-600">{formatDate(flight.departure_time)}</div>
                            <div className="text-sm font-medium">{flight.from}</div>
                          </div>

                          {/* Duration & Stops */}
                          <div className="flex flex-col items-center px-4">
                            <div className="text-xs text-slate-500 mb-1">{formatDuration(flight.duration)}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              <div className="w-16 h-px bg-slate-300 relative">
                                {!flight.is_direct && (
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400"></div>
                                )}
                              </div>
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            </div>
                            <div className="text-xs text-orange-600 mt-1">
                              {flight.is_direct ? 'Direct' : `${flight.stops} connection${flight.stops > 1 ? 's' : ''}`}
                            </div>
                          </div>

                          {/* Arrival */}
                          <div>
                            <div className="text-2xl font-bold">{formatTime(flight.arrival_time)}</div>
                            <div className="text-sm text-slate-600">{formatDate(flight.arrival_time)}</div>
                            <div className="text-sm font-medium">{flight.to}</div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{flight.airline}</span>
                        {flight.number_of_bookable_seats && flight.number_of_bookable_seats < 5 && (
                          <Badge variant="destructive" className="text-xs">
                            Only {flight.number_of_bookable_seats} seats left!
                          </Badge>
                        )}
                        {flight.date_offset && flight.date_offset !== 0 && (
                          <Badge className="bg-blue-100 text-blue-700">
                            {flight.date_offset > 0 ? '+' : ''}{flight.date_offset} day{Math.abs(flight.date_offset) > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <div className="text-right mb-4">
                        <div className="text-3xl font-bold text-teal-600">£{Math.round(flight.price)}</div>
                        <div className="text-xs text-slate-500">in total</div>
                        <div className="text-xs text-slate-500">inc. airport taxes and fees</div>
                      </div>
                      <Button
                        onClick={() => onSelectFlight(flight)}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 font-semibold px-8"
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
      <h2 className="text-2xl font-bold mb-2">Flexible Dates</h2>
      <p className="text-slate-600 mb-6">Select your preferred dates to see available flights</p>

      <div className="overflow-x-auto">
        <Card className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-4 bg-slate-50 font-semibold sticky left-0 z-10">
                  <div className="text-sm">Depart ↓</div>
                  <div className="text-sm">Return →</div>
                </th>
                {returnDates.map(retDate => (
                  <th key={retDate} className="border p-2 bg-slate-50 min-w-[100px]">
                    <div className="text-sm whitespace-pre-line text-center">{formatDateHeader(retDate)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departureDates.map(depDate => (
                <tr key={depDate}>
                  <td className="border p-2 bg-slate-50 font-medium sticky left-0 z-10">
                    <div className="text-sm whitespace-pre-line">{formatDateHeader(depDate)}</div>
                  </td>
                  {returnDates.map(retDate => {
                    const flight = getPrice(depDate, retDate);
                    const isLowest = flight && flight.price === lowestPrice;
                    
                    return (
                      <td
                        key={`${depDate}_${retDate}`}
                        className={`border p-2 text-center cursor-pointer hover:bg-teal-50 transition-colors ${
                          isLowest ? 'bg-green-50' : ''
                        }`}
                        onClick={() => flight && onSelectFlight(flight)}
                      >
                        {flight ? (
                          <div>
                            <div className="text-sm font-bold text-slate-700">
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

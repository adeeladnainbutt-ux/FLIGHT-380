import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Calendar } from './ui/calendar';
import { BigCalendar } from './ui/big-calendar';
import { Checkbox } from './ui/checkbox';
import { CalendarIcon, MapPin, Users, Plane, Plus, Minus, X } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { airports, airportGroups, airlines } from '../mock';
import { cn } from '../lib/utils';

export const FlightSearch = ({ onSearch, initialData }) => {
  const [tripType, setTripType] = useState('round-trip');
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [departDate, setDepartDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('economy');
  const [directFlights, setDirectFlights] = useState(false);
  const [flexiDates, setFlexiDates] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState(null);
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openAirline, setOpenAirline] = useState(false);
  const [fromSearchTerm, setFromSearchTerm] = useState('');
  const [toSearchTerm, setToSearchTerm] = useState('');
  const [multiCitySearchTerms, setMultiCitySearchTerms] = useState({});
  const [multiCityPopovers, setMultiCityPopovers] = useState({});
  const [multiCityLegs, setMultiCityLegs] = useState([
    { from: null, to: null, date: null },
    { from: null, to: null, date: null }
  ]);
  
  // Fare calendar state
  const [fares, setFares] = useState({});
  const [faresLoading, setFaresLoading] = useState(false);

  // Load initial data when modifying search
  useEffect(() => {
    if (initialData) {
      // Restore trip type
      if (initialData.return_date) {
        setTripType('round-trip');
      } else {
        setTripType('one-way');
      }
      
      // Find and set airports
      const allOptions = [...airportGroups.map(g => ({ ...g, isGroup: true })), ...airports];
      const fromApt = allOptions.find(a => a.code === initialData.origin);
      const toApt = allOptions.find(a => a.code === initialData.destination);
      if (fromApt) setFromAirport(fromApt);
      if (toApt) setToAirport(toApt);
      
      // Set dates
      if (initialData.departure_date) {
        setDepartDate(new Date(initialData.departure_date));
      }
      if (initialData.return_date) {
        setReturnDate(new Date(initialData.return_date));
      }
      
      // Set passengers
      if (initialData.adults) setAdults(initialData.adults);
      if (initialData.youth) setYouth(initialData.youth);
      if (initialData.children) setChildren(initialData.children);
      if (initialData.infants) setInfants(initialData.infants);
      
      // Set travel class
      if (initialData.travel_class) setTravelClass(initialData.travel_class);
      
      // Set options
      if (initialData.direct_flights !== undefined) setDirectFlights(initialData.direct_flights);
      if (initialData.flexiDates !== undefined) setFlexiDates(initialData.flexiDates);
      
      // Set airline if any
      if (initialData.airline) setSelectedAirline(initialData.airline);
    }
  }, [initialData]);

  // Generate mock fare data for 6 months (while Amadeus test API is too slow)
  const generateMockFares = React.useCallback(() => {
    const mockFares = {};
    const today = new Date();
    const baseFare = 150 + Math.random() * 100; // Base fare between £150-250
    
    // Generate fares for 6 months (180 days)
    for (let i = 0; i < 180; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = date.getDay();
      
      // Simulate realistic pricing patterns
      let fare = baseFare;
      
      // Weekends are more expensive
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        fare += 30 + Math.random() * 40;
      }
      
      // Some random variation
      fare += (Math.random() - 0.5) * 60;
      
      // Holiday periods are more expensive (December, July-August)
      const month = date.getMonth();
      if (month === 11 || month === 6 || month === 7) {
        fare += 50 + Math.random() * 50;
      }
      
      // Occasionally add very low "deal" prices
      if (Math.random() < 0.08) {
        fare = 80 + Math.random() * 50;
      }
      
      // Occasionally add premium prices
      if (Math.random() < 0.05) {
        fare = 350 + Math.random() * 100;
      }
      
      mockFares[dateStr] = Math.round(fare);
    }
    
    return mockFares;
  }, []);

  // Load mock fares when date picker opens (while real API is too slow)
  useEffect(() => {
    if (!fromAirport || !toAirport || !openDatePicker) return;
    if (tripType === 'multi-city') return;
    
    // Use mock data for now since Amadeus test API is too slow
    setFaresLoading(true);
    
    // Simulate a short loading time for UX
    const timer = setTimeout(() => {
      const mockData = generateMockFares();
      setFares(mockData);
      setFaresLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fromAirport, toAirport, openDatePicker, tripType, generateMockFares]);

  // Combine airport groups and individual airports for search
  const allAirportOptions = [
    ...airportGroups.map(group => ({ ...group, isGroup: true })),
    ...airports
  ];

  // Custom filter function for airport search
  const filterAirports = (options, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return options;
    
    const term = searchTerm.toLowerCase().trim();
    
    // First check for exact code match
    const exactMatch = options.filter(opt => 
      opt.code && opt.code.toLowerCase() === term
    );
    
    // If we have an exact code match, return only that
    if (exactMatch.length > 0) {
      return exactMatch;
    }
    
    // Otherwise, filter by code starting with term, or city/name containing term
    return options.filter(opt => {
      const code = opt.code ? opt.code.toLowerCase() : '';
      const city = opt.city ? opt.city.toLowerCase() : '';
      const name = opt.name ? opt.name.toLowerCase() : '';
      
      return code.startsWith(term) || 
             city.includes(term) || 
             name.includes(term);
    });
  };

  // Filtered airport lists
  const filteredFromAirports = filterAirports(allAirportOptions, fromSearchTerm);
  const filteredToAirports = filterAirports(allAirportOptions, toSearchTerm);
  
  // Function to get filtered airports for multi-city legs
  const getFilteredMultiCityAirports = (legIndex, field) => {
    const searchKey = `${legIndex}-${field}`;
    const searchTerm = multiCitySearchTerms[searchKey] || '';
    return filterAirports(allAirportOptions, searchTerm);
  };
  
  const updateMultiCitySearchTerm = (legIndex, field, value) => {
    const searchKey = `${legIndex}-${field}`;
    setMultiCitySearchTerms(prev => ({
      ...prev,
      [searchKey]: value
    }));
  };

  // Helper functions for multi-city popover state
  const isMultiCityPopoverOpen = (legIndex, field) => {
    return multiCityPopovers[`${legIndex}-${field}`] || false;
  };

  const setMultiCityPopoverOpen = (legIndex, field, isOpen) => {
    setMultiCityPopovers(prev => ({
      ...prev,
      [`${legIndex}-${field}`]: isOpen
    }));
  };

  const removeMultiCityLeg = (index) => {
    if (multiCityLegs.length > 2) {
      const newLegs = multiCityLegs.filter((_, i) => i !== index);
      // Re-chain: update the "from" of the leg after the removed one
      if (index > 0 && index < newLegs.length) {
        newLegs[index] = { ...newLegs[index], from: newLegs[index - 1]?.to || null };
      }
      setMultiCityLegs(newLegs);
    }
  };

  const updateMultiCityLeg = (index, field, value) => {
    setMultiCityLegs(prevLegs => {
      const newLegs = [...prevLegs];
      
      // Update the current field
      newLegs[index] = { ...newLegs[index], [field]: value };
      
      // Auto-chain: When "to" is set, auto-fill next leg's "from"
      if (field === 'to' && value && index < newLegs.length - 1) {
        newLegs[index + 1] = { ...newLegs[index + 1], from: value };
      }
      
      // Auto-chain: When "date" is set, ensure next leg's date is cleared if it's before this date
      if (field === 'date' && value && index < newLegs.length - 1) {
        const nextLegDate = newLegs[index + 1].date;
        if (nextLegDate && nextLegDate < value) {
          newLegs[index + 1] = { ...newLegs[index + 1], date: null };
        }
      }
      
      return newLegs;
    });
  };

  // Add a new leg with auto-chaining
  const addMultiCityLeg = () => {
    if (multiCityLegs.length < 5) {
      const lastLeg = multiCityLegs[multiCityLegs.length - 1];
      // Auto-fill the new leg's "from" with the previous leg's "to"
      setMultiCityLegs([
        ...multiCityLegs, 
        { 
          from: lastLeg?.to || null, 
          to: null, 
          date: null 
        }
      ]);
    }
  };

  const totalPassengers = adults + youth + children + infants;

  const handleDepartDateSelect = (date) => {
    setDepartDate(date);
  };

  const handleReturnDateSelect = (date) => {
    setReturnDate(date);
  };
  
  const handleDateSelectionComplete = () => {
    setOpenDatePicker(false);
  };

  const handleSearch = () => {
    if (tripType === 'multi-city') {
      const validLegs = multiCityLegs.filter(leg => leg.from && leg.to && leg.date);
      if (validLegs.length >= 2) {
        // Format legs for API
        const formattedLegs = validLegs.map(leg => ({
          origin: leg.from.isGroup ? leg.from.code : leg.from.code,
          origin_airports: leg.from.isGroup ? leg.from.airports : [leg.from.code],
          destination: leg.to.isGroup ? leg.to.code : leg.to.code,
          destination_airports: leg.to.isGroup ? leg.to.airports : [leg.to.code],
          departure_date: format(leg.date, 'yyyy-MM-dd'),
          from: leg.from,
          to: leg.to
        }));
        
        onSearch({
          tripType,
          legs: formattedLegs,
          adults,
          youth,
          children,
          infants,
          travelClass,
          travel_class: travelClass,
          directFlights,
          direct_flights: directFlights,
          flexiDates: false, // Multi-city doesn't support flexi dates
          airline: selectedAirline
        });
      }
    } else if (fromAirport && toAirport && departDate) {
      // Extract airport code(s) - handle both individual airports and groups
      // For groups, send all airports in the group
      const originCode = fromAirport.isGroup ? fromAirport.code : fromAirport.code;
      const originAirports = fromAirport.isGroup ? fromAirport.airports : [fromAirport.code];
      const destinationCode = toAirport.isGroup ? toAirport.code : toAirport.code;
      const destinationAirports = toAirport.isGroup ? toAirport.airports : [toAirport.code];
      
      onSearch({
        tripType,
        origin: originCode,
        destination: destinationCode,
        origin_airports: originAirports,
        destination_airports: destinationAirports,
        from: fromAirport,
        to: toAirport,
        departDate,
        departure_date: departDate ? format(departDate, 'yyyy-MM-dd') : null,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        return_date: tripType === 'round-trip' && returnDate ? format(returnDate, 'yyyy-MM-dd') : null,
        adults,
        youth,
        children,
        infants,
        travelClass,
        travel_class: travelClass,
        directFlights,
        direct_flights: directFlights,
        flexiDates,
        airline: selectedAirline
      });
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <Tabs value={tripType} onValueChange={setTripType} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="round-trip" className="text-xs sm:text-sm">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way" className="text-xs sm:text-sm">One Way</TabsTrigger>
          <TabsTrigger value="multi-city" className="text-xs sm:text-sm">Multi-City</TabsTrigger>
        </TabsList>
        
        {/* Round Trip and One Way */}
        {(tripType === 'round-trip' || tripType === 'one-way') && (
          <TabsContent value={tripType} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* From Airport */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">From</Label>
                <Popover open={openFrom} onOpenChange={setOpenFrom}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openFrom}
                      className="w-full justify-between h-12 text-left font-normal"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        {fromAirport ? (
                          <span className="truncate">
                            {fromAirport.isGroup ? fromAirport.name : `${fromAirport.code} - ${fromAirport.city}`}
                          </span>
                        ) : (
                          <span className="text-slate-500">Select departure airport</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[350px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search airport or code..." 
                        value={fromSearchTerm}
                        onValueChange={setFromSearchTerm}
                      />
                      <CommandEmpty>No airport found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredFromAirports.map((option) => (
                          <CommandItem
                            key={option.isGroup ? `group-${option.code}` : `airport-${option.code}`}
                            value={option.code}
                            onSelect={() => {
                              setFromAirport(option);
                              setFromSearchTerm('');
                              setOpenFrom(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {option.isGroup ? option.name : `${option.code} - ${option.city}`}
                              </span>
                              <span className="text-xs text-slate-500">{option.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Airport */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">To</Label>
                <Popover open={openTo} onOpenChange={setOpenTo}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTo}
                      className="w-full justify-between h-12 text-left font-normal"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Plane className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        {toAirport ? (
                          <span className="truncate">
                            {toAirport.isGroup ? toAirport.name : `${toAirport.code} - ${toAirport.city}`}
                          </span>
                        ) : (
                          <span className="text-slate-500">Select destination airport</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[350px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search airport or code..." 
                        value={toSearchTerm}
                        onValueChange={setToSearchTerm}
                      />
                      <CommandEmpty>No airport found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredToAirports.map((option) => (
                          <CommandItem
                            key={option.isGroup ? `group-${option.code}` : `airport-${option.code}`}
                            value={option.code}
                            onSelect={() => {
                              setToAirport(option);
                              setToSearchTerm('');
                              setOpenTo(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {option.isGroup ? option.name : `${option.code} - ${option.city}`}
                              </span>
                              <span className="text-xs text-slate-500">{option.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Dates Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Combined Date Picker - now always takes one column */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {tripType === 'round-trip' ? 'Travel Dates' : 'Depart'}
                </Label>
                <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !departDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {tripType === 'round-trip' ? (
                        departDate && returnDate ? (
                          <span className="truncate">
                            {format(departDate, 'd MMM')} → {format(returnDate, 'd MMM')}
                          </span>
                        ) : departDate ? (
                          <span className="truncate">{format(departDate, 'd MMM')} → Select</span>
                        ) : (
                          'Select dates'
                        )
                      ) : (
                        departDate ? format(departDate, 'd MMM yyyy') : 'Select date'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 max-w-[95vw]" 
                    align="start"
                    side="bottom"
                    sideOffset={4}
                  >
                    <BigCalendar
                      departDate={departDate}
                      returnDate={returnDate}
                      onDepartSelect={handleDepartDateSelect}
                      onReturnSelect={handleReturnDateSelect}
                      onSelectionComplete={handleDateSelectionComplete}
                      tripType={tripType}
                      fares={fares}
                      faresLoading={faresLoading}
                      currency="£"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Passengers and Class */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Passengers Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Travellers</Label>
                <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between text-left font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{totalPassengers} Traveller{totalPassengers > 1 ? 's' : ''}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] sm:w-[320px] p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-xs text-slate-500">18+ years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setAdults(Math.min(9, adults + 1))}
                            disabled={adults >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Youth */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Youth</div>
                          <div className="text-xs text-slate-500">12-18 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setYouth(Math.max(0, youth - 1))}
                            disabled={youth <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{youth}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setYouth(Math.min(9, youth + 1))}
                            disabled={youth >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-xs text-slate-500">2-12 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            disabled={children <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setChildren(Math.min(9, children + 1))}
                            disabled={children >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Infants</div>
                          <div className="text-xs text-slate-500">0-2 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            disabled={infants <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setInfants(Math.min(adults, infants + 1))}
                            disabled={infants >= adults}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => setOpenPassengers(false)}
                        className="w-full bg-brand-600 hover:bg-brand-700"
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Travel Class */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Class</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-between">
                      <span className="capitalize">{travelClass.replace('-', ' ')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {['economy', 'premium-economy', 'business', 'first'].map((classType) => (
                        <Button
                          key={classType}
                          variant={travelClass === classType ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setTravelClass(classType)}
                        >
                          {classType === 'premium-economy' ? 'Premium Economy' : 
                           classType === 'first' ? 'First Class' : 
                           classType === 'business' ? 'Business Class' : 'Economy'}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Airline Selector - Half Width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Airline (Optional)</Label>
                <Popover open={openAirline} onOpenChange={setOpenAirline}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between text-left font-normal"
                    >
                      <span className={selectedAirline ? '' : 'text-slate-500'}>
                        {selectedAirline ? `${selectedAirline.code} - ${selectedAirline.name}` : 'All Airlines'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[350px] p-0">
                    <Command>
                      <CommandInput placeholder="Search airline code or name..." />
                      <CommandEmpty>No airline found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem
                          onSelect={() => {
                            setSelectedAirline(null);
                            setOpenAirline(false);
                          }}
                        >
                          <span className="font-medium">All Airlines</span>
                        </CommandItem>
                        {airlines.map((airline) => (
                          <CommandItem
                            key={airline.code}
                            value={`${airline.code} ${airline.name}`}
                            onSelect={() => {
                              setSelectedAirline(airline);
                              setOpenAirline(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{airline.code} - {airline.name}</span>
                              <span className="text-xs text-slate-500">{airline.country}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="direct-flights"
                  checked={directFlights}
                  onCheckedChange={setDirectFlights}
                />
                <label
                  htmlFor="direct-flights"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Direct flights only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexi-dates"
                  checked={flexiDates}
                  onCheckedChange={setFlexiDates}
                />
                <label
                  htmlFor="flexi-dates"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Flexible dates (±3 days)
                </label>
              </div>
            </div>

            <div className="flex justify-center sm:justify-start">
              <Button 
                onClick={handleSearch} 
                className="w-full sm:w-auto sm:min-w-[200px] h-12 text-base font-semibold bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 transition-all duration-300"
                disabled={!fromAirport || !toAirport || !departDate || (tripType === 'round-trip' && !returnDate)}
              >
                Search Flights
              </Button>
            </div>
          </TabsContent>
        )}

        {/* Multi-City - Similar structure with updated traveller categories */}
        {tripType === 'multi-city' && (
          <TabsContent value="multi-city" className="space-y-4">
            {multiCityLegs.map((leg, index) => (
              <Card key={`multi-city-leg-${index}`} className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-brand-100 text-brand-700">Journey {index + 1}</Badge>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* From */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">From</Label>
                      <Popover 
                        open={isMultiCityPopoverOpen(index, 'from')} 
                        onOpenChange={(open) => setMultiCityPopoverOpen(index, 'from', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal"
                            onClick={() => setMultiCityPopoverOpen(index, 'from', true)}
                          >
                            <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                            {leg.from ? (
                              <span className="text-sm font-medium">
                                {leg.from.isGroup ? leg.from.name : `${leg.from.code} - ${leg.from.city}`}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select departure</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start" sideOffset={4}>
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search airport or city..." 
                              value={multiCitySearchTerms[`${index}-from`] || ''}
                              onValueChange={(value) => updateMultiCitySearchTerm(index, 'from', value)}
                            />
                            <CommandEmpty>No airport found. Try another search.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {getFilteredMultiCityAirports(index, 'from').map((option) => (
                                <CommandItem
                                  key={option.isGroup ? `group-${index}-${option.code}` : `airport-${index}-${option.code}`}
                                  value={option.code}
                                  onSelect={() => {
                                    console.log('Selected airport:', option);
                                    updateMultiCityLeg(index, 'from', option);
                                    updateMultiCitySearchTerm(index, 'from', '');
                                    setMultiCityPopoverOpen(index, 'from', false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {option.isGroup ? option.name : `${option.code} - ${option.city}`}
                                    </span>
                                    <span className="text-xs text-slate-500">{option.name}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* To */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">To</Label>
                      <Popover
                        open={isMultiCityPopoverOpen(index, 'to')} 
                        onOpenChange={(open) => setMultiCityPopoverOpen(index, 'to', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal"
                            onClick={() => setMultiCityPopoverOpen(index, 'to', true)}
                          >
                            <Plane className="mr-2 h-4 w-4 text-slate-500" />
                            {leg.to ? (
                              <span className="text-sm font-medium">
                                {leg.to.isGroup ? leg.to.name : `${leg.to.code} - ${leg.to.city}`}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select destination</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0" align="start" sideOffset={4}>
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search airport or city..." 
                              value={multiCitySearchTerms[`${index}-to`] || ''}
                              onValueChange={(value) => updateMultiCitySearchTerm(index, 'to', value)}
                            />
                            <CommandEmpty>No airport found. Try another search.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {getFilteredMultiCityAirports(index, 'to').map((option) => (
                                <CommandItem
                                  key={option.isGroup ? `group-${index}-${option.code}` : `airport-${index}-${option.code}`}
                                  value={option.code}
                                  onSelect={() => {
                                    console.log('Selected destination:', option);
                                    updateMultiCityLeg(index, 'to', option);
                                    updateMultiCitySearchTerm(index, 'to', '');
                                    setMultiCityPopoverOpen(index, 'to', false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {option.isGroup ? option.name : `${option.code} - ${option.city}`}
                                    </span>
                                    <span className="text-xs text-slate-500">{option.name}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Departure</Label>
                      <Popover
                        open={isMultiCityPopoverOpen(index, 'date')}
                        onOpenChange={(open) => setMultiCityPopoverOpen(index, 'date', open)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal",
                              !leg.date && "text-slate-500"
                            )}
                            onClick={() => setMultiCityPopoverOpen(index, 'date', true)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leg.date ? format(leg.date, 'PP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                          <Calendar
                            mode="single"
                            selected={leg.date}
                            defaultMonth={index > 0 && multiCityLegs[index - 1]?.date 
                              ? new Date(multiCityLegs[index - 1].date) 
                              : undefined}
                            onSelect={(date) => {
                              if (date) {
                                updateMultiCityLeg(index, 'date', date);
                                setMultiCityPopoverOpen(index, 'date', false);
                                
                                // Auto-open next journey's date picker after a short delay
                                if (index < multiCityLegs.length - 1) {
                                  setTimeout(() => {
                                    // Check if next leg needs a date and has airports selected
                                    const nextLeg = multiCityLegs[index + 1];
                                    if (!nextLeg?.date && nextLeg?.from && nextLeg?.to) {
                                      setMultiCityPopoverOpen(index + 1, 'date', true);
                                    }
                                  }, 300);
                                }
                              }
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              if (date < today) return true;
                              if (index > 0) {
                                const prevLeg = multiCityLegs[index - 1];
                                if (prevLeg?.date) {
                                  const prevDate = new Date(prevLeg.date);
                                  prevDate.setHours(0, 0, 0, 0);
                                  return date < prevDate;
                                }
                              }
                              return false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Remove button */}
                  {multiCityLegs.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeMultiCityLeg(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}

            {/* Add More Button */}
            {multiCityLegs.length < 5 && (
              <Button
                variant="outline"
                onClick={addMultiCityLeg}
                className="w-full h-12 border-dashed border-2 hover:bg-brand-50 hover:border-brand-600 hover:text-brand-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Flight
              </Button>
            )}

            {/* Passengers, Class, Airline, and Options - Same as Round Trip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Passengers */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Travellers</Label>
                <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between text-left font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{totalPassengers} Traveller{totalPassengers > 1 ? 's' : ''}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-xs text-slate-500">18+ years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{adults}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setAdults(Math.min(9, adults + 1))}
                            disabled={adults >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Youth */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Youth</div>
                          <div className="text-xs text-slate-500">12-18 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setYouth(Math.max(0, youth - 1))}
                            disabled={youth <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{youth}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setYouth(Math.min(9, youth + 1))}
                            disabled={youth >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-xs text-slate-500">2-12 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                            disabled={children <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{children}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setChildren(Math.min(9, children + 1))}
                            disabled={children >= 9}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Infants</div>
                          <div className="text-xs text-slate-500">0-2 years</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            disabled={infants <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{infants}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setInfants(Math.min(adults, infants + 1))}
                            disabled={infants >= adults}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={() => setOpenPassengers(false)}
                        className="w-full bg-brand-600 hover:bg-brand-700"
                      >
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Travel Class */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Class</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-between">
                      <span className="capitalize">{travelClass.replace('-', ' ')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2">
                    <div className="space-y-1">
                      {['economy', 'premium-economy', 'business', 'first'].map((classType) => (
                        <Button
                          key={classType}
                          variant={travelClass === classType ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setTravelClass(classType)}
                        >
                          {classType === 'premium-economy' ? 'Premium Economy' : 
                           classType === 'first' ? 'First Class' : 
                           classType === 'business' ? 'Business Class' : 'Economy'}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Airline Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preferred Airline (Optional)</Label>
              <Popover open={openAirline} onOpenChange={setOpenAirline}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between text-left font-normal"
                  >
                    <span className={selectedAirline ? '' : 'text-slate-500'}>
                      {selectedAirline ? `${selectedAirline.code} - ${selectedAirline.name}` : 'All Airlines'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-0">
                  <Command>
                    <CommandInput placeholder="Search airline code or name..." />
                    <CommandEmpty>No airline found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      <CommandItem
                        onSelect={() => {
                          setSelectedAirline(null);
                          setOpenAirline(false);
                        }}
                      >
                        <span className="font-medium">All Airlines</span>
                      </CommandItem>
                      {airlines.map((airline) => (
                        <CommandItem
                          key={airline.code}
                          value={`${airline.code} ${airline.name}`}
                          onSelect={() => {
                            setSelectedAirline(airline);
                            setOpenAirline(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{airline.code} - {airline.name}</span>
                            <span className="text-xs text-slate-500">{airline.country}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="direct-flights-mc"
                  checked={directFlights}
                  onCheckedChange={setDirectFlights}
                />
                <label
                  htmlFor="direct-flights-mc"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Direct flights only
                </label>
              </div>

              <div className="flex items-center space-x-2 opacity-50">
                <Checkbox
                  id="flexi-dates-mc"
                  checked={false}
                  disabled={true}
                />
                <label
                  htmlFor="flexi-dates-mc"
                  className="text-sm font-medium leading-none cursor-not-allowed"
                >
                  Flexible dates (±3 days) - Not available for multi-city
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 transition-all duration-300"
              disabled={multiCityLegs.filter(leg => leg.from && leg.to && leg.date).length < 2}
            >
              Search Multi-City Flights
            </Button>
          </TabsContent>
        )}
      </Tabs>
    </Card>
  );
};

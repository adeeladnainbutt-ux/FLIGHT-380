import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Calendar } from './ui/calendar';
import { Checkbox } from './ui/checkbox';
import { CalendarIcon, MapPin, Users, Plane, Plus, Minus, X } from 'lucide-react';
import { format } from 'date-fns';
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
  const [openDepartDate, setOpenDepartDate] = useState(false);
  const [openReturnDate, setOpenReturnDate] = useState(false);
  const [openAirline, setOpenAirline] = useState(false);
  const [fromSearchTerm, setFromSearchTerm] = useState('');
  const [toSearchTerm, setToSearchTerm] = useState('');
  const [multiCitySearchTerms, setMultiCitySearchTerms] = useState({});
  const [multiCityLegs, setMultiCityLegs] = useState([
    { from: null, to: null, date: null },
    { from: null, to: null, date: null }
  ]);

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

  const addMultiCityLeg = () => {
    if (multiCityLegs.length < 5) {
      setMultiCityLegs([...multiCityLegs, { from: null, to: null, date: null }]);
    }
  };

  const removeMultiCityLeg = (index) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs(multiCityLegs.filter((_, i) => i !== index));
    }
  };

  const updateMultiCityLeg = (index, field, value) => {
    const newLegs = [...multiCityLegs];
    newLegs[index][field] = value;
    setMultiCityLegs(newLegs);
  };

  const totalPassengers = adults + youth + children + infants;

  const handleDepartDateSelect = (date) => {
    setDepartDate(date);
    setOpenDepartDate(false);
    
    // Auto-open return date calendar for round-trip after selecting departure date
    if (tripType === 'round-trip' && date) {
      setTimeout(() => {
        setOpenReturnDate(true);
      }, 300);
    }
  };

  const handleReturnDateSelect = (date) => {
    setReturnDate(date);
    setOpenReturnDate(false);
  };

  const handleSearch = () => {
    if (tripType === 'multi-city') {
      const validLegs = multiCityLegs.filter(leg => leg.from && leg.to && leg.date);
      if (validLegs.length >= 2) {
        onSearch({
          tripType,
          legs: validLegs,
          adults,
          youth,
          children,
          infants,
          travelClass,
          directFlights,
          flexiDates,
          airline: selectedAirline
        });
      }
    } else if (fromAirport && toAirport && departDate) {
      // Extract airport code (handle both individual airports and groups)
      const originCode = fromAirport.isGroup ? fromAirport.airports[0] : fromAirport.code;
      const destinationCode = toAirport.isGroup ? toAirport.airports[0] : toAirport.code;
      
      onSearch({
        tripType,
        origin: originCode,
        destination: destinationCode,
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
              {/* Depart Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depart</Label>
                <Popover open={openDepartDate} onOpenChange={setOpenDepartDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !departDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {departDate ? format(departDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={handleDepartDateSelect}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return Date */}
              {tripType === 'round-trip' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Return</Label>
                  <Popover open={openReturnDate} onOpenChange={setOpenReturnDate}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !returnDate && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        {returnDate ? format(returnDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={handleReturnDateSelect}
                        disabled={(date) => date < (departDate || new Date())}
                        defaultMonth={departDate || new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
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

            <Button 
              onClick={handleSearch} 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-700 hover:to-brand-700 transition-all duration-300"
              disabled={!fromAirport || !toAirport || !departDate || (tripType === 'round-trip' && !returnDate)}
            >
              Search Flights
            </Button>
          </TabsContent>
        )}

        {/* Multi-City - Similar structure with updated traveller categories */}
        {tripType === 'multi-city' && (
          <TabsContent value="multi-city" className="space-y-4">
            {multiCityLegs.map((leg, index) => (
              <Card key={index} className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* From */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">From</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal"
                          >
                            <MapPin className="mr-2 h-4 w-4 text-slate-500" />
                            {leg.from ? (
                              <span className="text-sm">
                                {leg.from.isGroup ? leg.from.name : leg.from.code}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search airport..." 
                              value={multiCitySearchTerms[`${index}-from`] || ''}
                              onValueChange={(value) => updateMultiCitySearchTerm(index, 'from', value)}
                            />
                            <CommandEmpty>No airport found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {getFilteredMultiCityAirports(index, 'from').map((option) => (
                                <CommandItem
                                  key={option.isGroup ? `group-${option.code}` : `airport-${option.code}`}
                                  value={option.code}
                                  onSelect={() => {
                                    updateMultiCityLeg(index, 'from', option);
                                    updateMultiCitySearchTerm(index, 'from', '');
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

                    {/* To */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">To</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-12 justify-start text-left font-normal"
                          >
                            <Plane className="mr-2 h-4 w-4 text-slate-500" />
                            {leg.to ? (
                              <span className="text-sm">
                                {leg.to.isGroup ? leg.to.name : leg.to.code}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[350px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Search airport..." 
                              value={multiCitySearchTerms[`${index}-to`] || ''}
                              onValueChange={(value) => updateMultiCitySearchTerm(index, 'to', value)}
                            />
                            <CommandEmpty>No airport found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {getFilteredMultiCityAirports(index, 'to').map((option) => (
                                <CommandItem
                                  key={option.isGroup ? `group-${option.code}` : `airport-${option.code}`}
                                  value={option.code}
                                  onSelect={() => {
                                    updateMultiCityLeg(index, 'to', option);
                                    updateMultiCitySearchTerm(index, 'to', '');
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

                    {/* Date */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Departure</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal",
                              !leg.date && "text-slate-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {leg.date ? format(leg.date, 'PP') : 'Select'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leg.date}
                            onSelect={(date) => updateMultiCityLeg(index, 'date', date)}
                            disabled={(date) => {
                              if (index === 0) return date < new Date();
                              const prevLeg = multiCityLegs[index - 1];
                              return date < (prevLeg.date || new Date());
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

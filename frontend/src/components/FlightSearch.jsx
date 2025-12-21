import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { CalendarIcon, MapPin, Users, Plane, Plus, Minus, X } from 'lucide-react';
import { format } from 'date-fns';
import { airports } from '../mock';
import { cn } from '../lib/utils';

export const FlightSearch = ({ onSearch }) => {
  const [tripType, setTripType] = useState('round-trip');
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [departDate, setDepartDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState('economy');
  const [directFlights, setDirectFlights] = useState(false);
  const [flexiDates, setFlexiDates] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState('all');
  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);
  const [openPassengers, setOpenPassengers] = useState(false);
  const [openDepartDate, setOpenDepartDate] = useState(false);
  const [openReturnDate, setOpenReturnDate] = useState(false);
  const [multiCityLegs, setMultiCityLegs] = useState([
    { from: null, to: null, date: null },
    { from: null, to: null, date: null }
  ]);

  const airlines = [
    { value: 'all', label: 'All Airlines' },
    { value: 'british-airways', label: 'British Airways' },
    { value: 'emirates', label: 'Emirates' },
    { value: 'lufthansa', label: 'Lufthansa' },
    { value: 'singapore-airlines', label: 'Singapore Airlines' },
    { value: 'qatar-airways', label: 'Qatar Airways' },
    { value: 'turkish-airlines', label: 'Turkish Airlines' }
  ];

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

  const totalPassengers = adults + children + infants;

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
          children,
          infants,
          travelClass,
          directFlights,
          flexiDates,
          airline: selectedAirline
        });
      }
    } else if (fromAirport && toAirport && departDate) {
      onSearch({
        tripType,
        from: fromAirport,
        to: toAirport,
        departDate,
        returnDate: tripType === 'round-trip' ? returnDate : null,
        adults,
        children,
        infants,
        travelClass,
        directFlights,
        flexiDates,
        airline: selectedAirline
      });
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <Tabs value={tripType} onValueChange={setTripType} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way">One Way</TabsTrigger>
          <TabsTrigger value="multi-city">Multi-City</TabsTrigger>
        </TabsList>
        
        {/* Round Trip and One Way */}
        {(tripType === 'round-trip' || tripType === 'one-way') && (
          <TabsContent value={tripType} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        {fromAirport ? (
                          <span>{fromAirport.code} - {fromAirport.city}</span>
                        ) : (
                          <span className="text-slate-500">Select departure airport</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandEmpty>No airport found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {airports.map((airport) => (
                          <CommandItem
                            key={airport.code}
                            value={`${airport.code} ${airport.name} ${airport.city}`}
                            onSelect={() => {
                              setFromAirport(airport);
                              setOpenFrom(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{airport.code} - {airport.city}</span>
                              <span className="text-xs text-slate-500">{airport.name}</span>
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
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-slate-500" />
                        {toAirport ? (
                          <span>{toAirport.code} - {toAirport.city}</span>
                        ) : (
                          <span className="text-slate-500">Select destination airport</span>
                        )}
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search airport..." />
                      <CommandEmpty>No airport found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {airports.map((airport) => (
                          <CommandItem
                            key={airport.code}
                            value={`${airport.code} ${airport.name} ${airport.city}`}
                            onSelect={() => {
                              setToAirport(airport);
                              setOpenTo(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{airport.code} - {airport.city}</span>
                              <span className="text-xs text-slate-500">{airport.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Depart Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depart</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal",
                        !departDate && "text-slate-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departDate ? format(departDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={setDepartDate}
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-12 justify-start text-left font-normal",
                          !returnDate && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        disabled={(date) => date < (departDate || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {/* Passengers and Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Passengers Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Passengers</Label>
                <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between text-left font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-xs text-slate-500">12+ years</div>
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

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-xs text-slate-500">2-11 years</div>
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
                          <div className="text-xs text-slate-500">Under 2 years</div>
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
                        className="w-full bg-teal-600 hover:bg-teal-700"
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
                <Select value={travelClass} onValueChange={setTravelClass}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium-economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business Class</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Airline Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preferred Airline</Label>
              <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {airlines.map((airline) => (
                    <SelectItem key={airline.value} value={airline.value}>
                      {airline.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  Flexi (+/- 3 days)
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 transition-all duration-300"
              disabled={!fromAirport || !toAirport || !departDate || (tripType === 'round-trip' && !returnDate)}
            >
              Search Flights
            </Button>
          </TabsContent>
        )}

        {/* Multi-City */}
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
                              <span className="text-sm">{leg.from.code}</span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search airport..." />
                            <CommandEmpty>No airport found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {airports.map((airport) => (
                                <CommandItem
                                  key={airport.code}
                                  value={`${airport.code} ${airport.name} ${airport.city}`}
                                  onSelect={() => updateMultiCityLeg(index, 'from', airport)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{airport.code} - {airport.city}</span>
                                    <span className="text-xs text-slate-500">{airport.name}</span>
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
                              <span className="text-sm">{leg.to.code}</span>
                            ) : (
                              <span className="text-slate-500 text-sm">Select</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search airport..." />
                            <CommandEmpty>No airport found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {airports.map((airport) => (
                                <CommandItem
                                  key={airport.code}
                                  value={`${airport.code} ${airport.name} ${airport.city}`}
                                  onSelect={() => updateMultiCityLeg(index, 'to', airport)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{airport.code} - {airport.city}</span>
                                    <span className="text-xs text-slate-500">{airport.name}</span>
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
                className="w-full h-12 border-dashed border-2 hover:bg-teal-50 hover:border-teal-600 hover:text-teal-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Flight
              </Button>
            )}

            {/* Passengers and Class for Multi-City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Passengers Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Passengers</Label>
                <Popover open={openPassengers} onOpenChange={setOpenPassengers}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between text-left font-normal"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>{totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''}</span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-4" align="start">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Adults</div>
                          <div className="text-xs text-slate-500">12+ years</div>
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

                      {/* Children */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Children</div>
                          <div className="text-xs text-slate-500">2-11 years</div>
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
                          <div className="text-xs text-slate-500">Under 2 years</div>
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
                        className="w-full bg-teal-600 hover:bg-teal-700"
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
                <Select value={travelClass} onValueChange={setTravelClass}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium-economy">Premium Economy</SelectItem>
                    <SelectItem value="business">Business Class</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Airline Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preferred Airline</Label>
              <Select value={selectedAirline} onValueChange={setSelectedAirline}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {airlines.map((airline) => (
                    <SelectItem key={airline.value} value={airline.value}>
                      {airline.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flexi-dates-mc"
                  checked={flexiDates}
                  onCheckedChange={setFlexiDates}
                />
                <label
                  htmlFor="flexi-dates-mc"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Flexi (+/- 3 days)
                </label>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 transition-all duration-300"
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
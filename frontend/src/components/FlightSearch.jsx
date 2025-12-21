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
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
          <TabsTrigger value="one-way">One Way</TabsTrigger>
        </TabsList>
        
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

            {/* Passengers */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Passengers</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="number"
                  min="1"
                  max="9"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 transition-all duration-300"
            disabled={!fromAirport || !toAirport || !departDate}
          >
            Search Flights
          </Button>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
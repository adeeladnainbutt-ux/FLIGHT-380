export const mockFlightSearchResults = [
  {
    id: '1',
    from: 'London (LHR)',
    to: 'New York (JFK)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 450,
    airline: 'British Airways',
    airlineCode: 'BA',
    duration: '7h 30m',
    stops: 'Direct'
  },
  {
    id: '2',
    from: 'London (LHR)',
    to: 'Dubai (DXB)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 380,
    airline: 'Emirates',
    airlineCode: 'EK',
    duration: '6h 45m',
    stops: 'Direct'
  },
  {
    id: '3',
    from: 'London (LHR)',
    to: 'Singapore (SIN)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 620,
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    duration: '13h 20m',
    stops: 'Direct'
  },
  {
    id: '4',
    from: 'London (LGW)',
    to: 'New York (JFK)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 420,
    airline: 'Virgin Atlantic',
    airlineCode: 'VS',
    duration: '8h 10m',
    stops: 'Direct'
  },
  {
    id: '5',
    from: 'London (STN)',
    to: 'Dubai (DXB)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 350,
    airline: 'Ryanair',
    airlineCode: 'FR',
    duration: '7h 15m',
    stops: '1 Stop'
  }
];

export const popularDestinations = [
  {
    id: '1',
    city: 'Paris',
    country: 'France',
    description: 'The city of lights and romance',
    price: 89,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop'
  },
  {
    id: '2',
    city: 'Dubai',
    country: 'UAE',
    description: 'Luxury and modern architecture',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop'
  },
  {
    id: '3',
    city: 'New York',
    country: 'USA',
    description: 'The city that never sleeps',
    price: 380,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop'
  },
  {
    id: '4',
    city: 'Tokyo',
    country: 'Japan',
    description: 'Where tradition meets innovation',
    price: 520,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop'
  },
  {
    id: '5',
    city: 'Barcelona',
    country: 'Spain',
    description: 'Art, culture, and Mediterranean charm',
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop'
  },
  {
    id: '6',
    city: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise and serene beaches',
    price: 480,
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop'
  }
];

export const testimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Frequent Traveler',
    content: 'Flight380 made booking my family vacation so easy! Best prices and amazing customer service.',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Business Executive',
    content: 'I use Flight380 for all my business trips. The interface is clean and bookings are instant.',
    rating: 5
  },
  {
    id: '3',
    name: 'Emily Roberts',
    role: 'Travel Blogger',
    content: 'Found incredible deals to exotic destinations. Highly recommend for budget travelers!',
    rating: 5
  }
];

export const airlines = [
  { code: 'BA', name: 'British Airways', country: 'UK' },
  { code: 'VS', name: 'Virgin Atlantic', country: 'UK' },
  { code: 'EK', name: 'Emirates', country: 'UAE' },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar' },
  { code: 'EY', name: 'Etihad Airways', country: 'UAE' },
  { code: 'LH', name: 'Lufthansa', country: 'Germany' },
  { code: 'AF', name: 'Air France', country: 'France' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines', country: 'Netherlands' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore' },
  { code: 'TK', name: 'Turkish Airlines', country: 'Turkey' },
  { code: 'AA', name: 'American Airlines', country: 'USA' },
  { code: 'DL', name: 'Delta Air Lines', country: 'USA' },
  { code: 'UA', name: 'United Airlines', country: 'USA' },
  { code: 'AC', name: 'Air Canada', country: 'Canada' },
  { code: 'NH', name: 'All Nippon Airways', country: 'Japan' },
  { code: 'JL', name: 'Japan Airlines', country: 'Japan' },
  { code: 'CZ', name: 'China Southern Airlines', country: 'China' },
  { code: 'MU', name: 'China Eastern Airlines', country: 'China' },
  { code: 'CA', name: 'Air China', country: 'China' },
  { code: 'AI', name: 'Air India', country: 'India' },
  { code: '6E', name: 'IndiGo', country: 'India' },
  { code: 'UK', name: 'Vistara', country: 'India' },
  { code: 'SG', name: 'SpiceJet', country: 'India' },
  { code: 'PK', name: 'Pakistan International Airlines', country: 'Pakistan' },
  { code: 'PA', name: 'Airblue', country: 'Pakistan' },
  { code: 'ER', name: 'Serene Air', country: 'Pakistan' },
  { code: 'QF', name: 'Qantas', country: 'Australia' },
  { code: 'NZ', name: 'Air New Zealand', country: 'New Zealand' },
  { code: 'TG', name: 'Thai Airways', country: 'Thailand' },
  { code: 'MH', name: 'Malaysia Airlines', country: 'Malaysia' },
  { code: 'GA', name: 'Garuda Indonesia', country: 'Indonesia' },
  { code: 'PR', name: 'Philippine Airlines', country: 'Philippines' },
  { code: 'KE', name: 'Korean Air', country: 'South Korea' },
  { code: 'OZ', name: 'Asiana Airlines', country: 'South Korea' },
  { code: 'CX', name: 'Cathay Pacific', country: 'Hong Kong' },
  { code: 'BR', name: 'EVA Air', country: 'Taiwan' },
  { code: 'VN', name: 'Vietnam Airlines', country: 'Vietnam' },
  { code: 'LX', name: 'Swiss International Air Lines', country: 'Switzerland' },
  { code: 'OS', name: 'Austrian Airlines', country: 'Austria' },
  { code: 'SN', name: 'Brussels Airlines', country: 'Belgium' },
  { code: 'AZ', name: 'ITA Airways', country: 'Italy' },
  { code: 'IB', name: 'Iberia', country: 'Spain' },
  { code: 'UX', name: 'Air Europa', country: 'Spain' },
  { code: 'VY', name: 'Vueling', country: 'Spain' },
  { code: 'TP', name: 'TAP Air Portugal', country: 'Portugal' },
  { code: 'SK', name: 'Scandinavian Airlines', country: 'Scandinavia' },
  { code: 'AY', name: 'Finnair', country: 'Finland' },
  { code: 'LO', name: 'LOT Polish Airlines', country: 'Poland' },
  { code: 'OK', name: 'Czech Airlines', country: 'Czech Republic' },
  { code: 'RO', name: 'Tarom', country: 'Romania' },
  { code: 'MS', name: 'EgyptAir', country: 'Egypt' },
  { code: 'SA', name: 'South African Airways', country: 'South Africa' },
  { code: 'ET', name: 'Ethiopian Airlines', country: 'Ethiopia' },
  { code: 'KQ', name: 'Kenya Airways', country: 'Kenya' },
  { code: 'AT', name: 'Royal Air Maroc', country: 'Morocco' },
  { code: 'LA', name: 'LATAM Airlines', country: 'South America' },
  { code: 'AR', name: 'Aerolineas Argentinas', country: 'Argentina' },
  { code: 'AV', name: 'Avianca', country: 'Colombia' },
  { code: 'CM', name: 'Copa Airlines', country: 'Panama' },
  { code: 'AM', name: 'Aeroméxico', country: 'Mexico' },
  { code: 'Y4', name: 'Volaris', country: 'Mexico' },
  { code: 'FR', name: 'Ryanair', country: 'Ireland' },
  { code: 'U2', name: 'easyJet', country: 'UK' },
  { code: 'WN', name: 'Southwest Airlines', country: 'USA' },
  { code: 'B6', name: 'JetBlue Airways', country: 'USA' },
  { code: 'NK', name: 'Spirit Airlines', country: 'USA' },
  { code: 'F9', name: 'Frontier Airlines', country: 'USA' },
  { code: 'WS', name: 'WestJet', country: 'Canada' },
  { code: 'AS', name: 'Alaska Airlines', country: 'USA' }
];
  {
    id: '1',
    title: 'Best Price Guarantee',
    description: 'We compare prices across hundreds of airlines to ensure you get the best deal every time.',
    icon: 'BadgePoundSterling'
  },
  {
    id: '2',
    title: 'Instant Confirmation',
    description: 'Receive your booking confirmation instantly via email and SMS notification.',
    icon: 'Zap'
  },
  {
    id: '3',
    title: '24/7 Support',
    description: 'Our dedicated support team is available round the clock to assist with your travel needs.',
    icon: 'Headphones'
  },
  {
    id: '4',
    title: 'Flexible Booking',
    description: 'Change or cancel your booking easily with our flexible policies and options.',
    icon: 'CalendarClock'
  },
  {
    id: '5',
    title: 'Secure Payments',
    description: 'Your payment information is encrypted and secure with industry-leading security.',
    icon: 'Shield'
  },
  {
    id: '6',
    title: 'Loyalty Rewards',
    description: 'Earn points on every booking and redeem them for discounts on future flights.',
    icon: 'Gift'
  }
];

export const airports = [
  // United Kingdom - London Area
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London' },
  { code: 'LTN', name: 'London Luton', city: 'London' },
  { code: 'STN', name: 'London Stansted', city: 'London' },
  { code: 'LCY', name: 'London City Airport', city: 'London' },
  { code: 'SEN', name: 'London Southend', city: 'London' },
  
  // United Kingdom - Other Cities
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester' },
  { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh' },
  { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham' },
  { code: 'GLA', name: 'Glasgow Airport', city: 'Glasgow' },
  { code: 'BRS', name: 'Bristol Airport', city: 'Bristol' },
  { code: 'NCL', name: 'Newcastle Airport', city: 'Newcastle' },
  { code: 'LBA', name: 'Leeds Bradford Airport', city: 'Leeds' },
  { code: 'EMA', name: 'East Midlands Airport', city: 'Nottingham' },
  { code: 'ABZ', name: 'Aberdeen Airport', city: 'Aberdeen' },
  { code: 'BFS', name: 'Belfast International', city: 'Belfast' },
  { code: 'LPL', name: 'Liverpool John Lennon Airport', city: 'Liverpool' },
  { code: 'SOU', name: 'Southampton Airport', city: 'Southampton' },
  { code: 'EXT', name: 'Exeter Airport', city: 'Exeter' },
  { code: 'BHD', name: 'Belfast City Airport', city: 'Belfast' },
  { code: 'INV', name: 'Inverness Airport', city: 'Inverness' },
  { code: 'PIK', name: 'Glasgow Prestwick Airport', city: 'Glasgow' },
  { code: 'CWL', name: 'Cardiff Airport', city: 'Cardiff' },
  
  // United States - New York Area
  { code: 'JFK', name: 'John F Kennedy Intl', city: 'New York' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York' },
  { code: 'EWR', name: 'Newark Liberty Intl', city: 'New York' },
  { code: 'HPN', name: 'Westchester County Airport', city: 'New York' },
  { code: 'ISP', name: 'Long Island MacArthur Airport', city: 'New York' },
  
  // United States - Los Angeles Area
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' },
  { code: 'BUR', name: 'Hollywood Burbank Airport', city: 'Los Angeles' },
  { code: 'ONT', name: 'Ontario Intl', city: 'Los Angeles' },
  { code: 'SNA', name: 'John Wayne Airport Orange County', city: 'Los Angeles' },
  { code: 'LGB', name: 'Long Beach Airport', city: 'Los Angeles' },
  
  // United States - San Francisco Bay Area
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' },
  { code: 'OAK', name: 'Oakland Intl', city: 'San Francisco' },
  { code: 'SJC', name: 'San Jose Intl', city: 'San Francisco' },
  
  // United States - Washington DC Area
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington DC' },
  { code: 'IAD', name: 'Washington Dulles Intl', city: 'Washington DC' },
  { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Washington DC' },
  
  // United States - Chicago Area
  { code: 'ORD', name: 'Chicago O\'Hare Intl', city: 'Chicago' },
  { code: 'MDW', name: 'Chicago Midway Intl', city: 'Chicago' },
  
  // United States - Miami/Fort Lauderdale Area
  { code: 'MIA', name: 'Miami Intl', city: 'Miami' },
  { code: 'FLL', name: 'Fort Lauderdale-Hollywood Intl', city: 'Miami' },
  { code: 'PBI', name: 'Palm Beach Intl', city: 'Miami' },
  
  // United States - Other Major Cities
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' },
  { code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas' },
  { code: 'DEN', name: 'Denver Intl', city: 'Denver' },
  { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' },
  { code: 'LAS', name: 'Las Vegas McCarran Intl', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando Intl', city: 'Orlando' },
  { code: 'PHX', name: 'Phoenix Sky Harbor Intl', city: 'Phoenix' },
  { code: 'IAH', name: 'Houston George Bush Intl', city: 'Houston' },
  { code: 'HOU', name: 'Houston William P. Hobby Airport', city: 'Houston' },
  { code: 'BOS', name: 'Boston Logan Intl', city: 'Boston' },
  { code: 'MSP', name: 'Minneapolis-St Paul Intl', city: 'Minneapolis' },
  { code: 'DTW', name: 'Detroit Metro Wayne County', city: 'Detroit' },
  { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' },
  { code: 'SAN', name: 'San Diego Intl', city: 'San Diego' },
  { code: 'TPA', name: 'Tampa Intl', city: 'Tampa' },
  { code: 'PDX', name: 'Portland Intl', city: 'Portland' },
  { code: 'HNL', name: 'Honolulu Daniel K. Inouye Intl', city: 'Honolulu' },
  { code: 'STL', name: 'St. Louis Lambert Intl', city: 'St. Louis' },
  { code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' },
  { code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' },
  { code: 'MSY', name: 'New Orleans Louis Armstrong Intl', city: 'New Orleans' },
  { code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' },
  { code: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh' },
  { code: 'SJU', name: 'San Juan Luis Muñoz Marín Intl', city: 'San Juan' },
  
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto' },
  { code: 'YTZ', name: 'Billy Bishop Toronto City Airport', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver' },
  { code: 'YUL', name: 'Montreal Pierre Elliott Trudeau Intl', city: 'Montreal' },
  { code: 'YYC', name: 'Calgary Intl', city: 'Calgary' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier Intl', city: 'Ottawa' },
  { code: 'YEG', name: 'Edmonton Intl', city: 'Edmonton' },
  { code: 'YHZ', name: 'Halifax Stanfield Intl', city: 'Halifax' },
  { code: 'YWG', name: 'Winnipeg James Armstrong Richardson Intl', city: 'Winnipeg' },
  
  // Europe - France (Paris Area)
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris' },
  { code: 'BVA', name: 'Paris Beauvais-Tillé', city: 'Paris' },
  
  // Europe - France (Other Cities)
  { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice' },
  { code: 'LYS', name: 'Lyon Saint-Exupéry', city: 'Lyon' },
  { code: 'MRS', name: 'Marseille Provence', city: 'Marseille' },
  { code: 'TLS', name: 'Toulouse Blagnac', city: 'Toulouse' },
  { code: 'BOD', name: 'Bordeaux Mérignac', city: 'Bordeaux' },
  { code: 'NTE', name: 'Nantes Atlantique', city: 'Nantes' },
  
  // Europe - Germany (Berlin Area)
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin' },
  
  // Europe - Germany (Other Cities)
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich' },
  { code: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf' },
  { code: 'HAM', name: 'Hamburg Airport', city: 'Hamburg' },
  { code: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne' },
  { code: 'STR', name: 'Stuttgart Airport', city: 'Stuttgart' },
  { code: 'NUE', name: 'Nuremberg Airport', city: 'Nuremberg' },
  
  // Europe - Spain
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid' },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona' },
  { code: 'AGP', name: 'Málaga Costa del Sol', city: 'Málaga' },
  { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma' },
  { code: 'SVQ', name: 'Sevilla Airport', city: 'Sevilla' },
  { code: 'VLC', name: 'Valencia Airport', city: 'Valencia' },
  { code: 'ALC', name: 'Alicante-Elche', city: 'Alicante' },
  { code: 'BIO', name: 'Bilbao Airport', city: 'Bilbao' },
  { code: 'TFN', name: 'Tenerife North Airport', city: 'Tenerife' },
  { code: 'TFS', name: 'Tenerife South Airport', city: 'Tenerife' },
  { code: 'LPA', name: 'Gran Canaria Airport', city: 'Gran Canaria' },
  { code: 'IBZ', name: 'Ibiza Airport', city: 'Ibiza' },
  
  // Europe - Italy (Rome Area)
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome' },
  { code: 'CIA', name: 'Rome Ciampino', city: 'Rome' },
  
  // Europe - Italy (Milan Area)
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan' },
  { code: 'LIN', name: 'Milan Linate', city: 'Milan' },
  { code: 'BGY', name: 'Milan Bergamo Orio al Serio', city: 'Milan' },
  
  // Europe - Italy (Other Cities)
  { code: 'VCE', name: 'Venice Marco Polo', city: 'Venice' },
  { code: 'NAP', name: 'Naples Intl', city: 'Naples' },
  { code: 'PSA', name: 'Pisa Intl', city: 'Pisa' },
  { code: 'BLQ', name: 'Bologna Guglielmo Marconi', city: 'Bologna' },
  { code: 'FLR', name: 'Florence Airport', city: 'Florence' },
  { code: 'CTA', name: 'Catania Fontanarossa', city: 'Catania' },
  { code: 'PMO', name: 'Palermo Falcone-Borsellino', city: 'Palermo' },
  
  // Europe - Netherlands
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'EIN', name: 'Eindhoven Airport', city: 'Eindhoven' },
  { code: 'RTM', name: 'Rotterdam The Hague Airport', city: 'Rotterdam' },
  
  // Europe - Switzerland
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva' },
  { code: 'BSL', name: 'Basel Mulhouse Freiburg', city: 'Basel' },
  { code: 'BRN', name: 'Bern Airport', city: 'Bern' },
  
  // Europe - Belgium
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels' },
  { code: 'CRL', name: 'Brussels South Charleroi', city: 'Brussels' },
  
  // Europe - Austria
  { code: 'VIE', name: 'Vienna Intl', city: 'Vienna' },
  { code: 'SZG', name: 'Salzburg Airport', city: 'Salzburg' },
  { code: 'INN', name: 'Innsbruck Airport', city: 'Innsbruck' },
  
  // Europe - Portugal
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon' },
  { code: 'OPO', name: 'Porto Airport', city: 'Porto' },
  { code: 'FAO', name: 'Faro Airport', city: 'Faro' },
  { code: 'FNC', name: 'Funchal Madeira Airport', city: 'Funchal' },
  
  // Europe - Greece
  { code: 'ATH', name: 'Athens Intl', city: 'Athens' },
  { code: 'HER', name: 'Heraklion Intl', city: 'Heraklion' },
  { code: 'RHO', name: 'Rhodes Intl', city: 'Rhodes' },
  { code: 'CFU', name: 'Corfu Intl', city: 'Corfu' },
  { code: 'SKG', name: 'Thessaloniki Macedonia Intl', city: 'Thessaloniki' },
  { code: 'JTR', name: 'Santorini Airport', city: 'Santorini' },
  { code: 'ZTH', name: 'Zakynthos Intl', city: 'Zakynthos' },
  { code: 'KGS', name: 'Kos Island Intl', city: 'Kos' },
  { code: 'JMK', name: 'Mykonos Airport', city: 'Mykonos' },
  
  // Europe - Turkey (Istanbul Area)
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
  { code: 'SAW', name: 'Istanbul Sabiha Gökçen', city: 'Istanbul' },
  
  // Europe - Turkey (Other Cities)
  { code: 'ESB', name: 'Ankara Esenboğa', city: 'Ankara' },
  { code: 'AYT', name: 'Antalya Airport', city: 'Antalya' },
  { code: 'ADB', name: 'Izmir Adnan Menderes', city: 'Izmir' },
  { code: 'BJV', name: 'Bodrum Milas Airport', city: 'Bodrum' },
  
  // Europe - Ireland
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin' },
  { code: 'ORK', name: 'Cork Airport', city: 'Cork' },
  { code: 'SNN', name: 'Shannon Airport', city: 'Shannon' },
  
  // Europe - Scandinavia (Stockholm Area)
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm' },
  { code: 'BMA', name: 'Stockholm Bromma', city: 'Stockholm' },
  { code: 'NYO', name: 'Stockholm Skavsta', city: 'Stockholm' },
  
  // Europe - Scandinavia (Other Cities)
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo' },
  { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki' },
  { code: 'BGO', name: 'Bergen Airport', city: 'Bergen' },
  { code: 'GOT', name: 'Gothenburg Landvetter', city: 'Gothenburg' },
  { code: 'TRD', name: 'Trondheim Værnes', city: 'Trondheim' },
  { code: 'AAL', name: 'Aalborg Airport', city: 'Aalborg' },
  { code: 'BLL', name: 'Billund Airport', city: 'Billund' },
  
  // Europe - Poland
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw' },
  { code: 'KRK', name: 'Kraków John Paul II Intl', city: 'Kraków' },
  { code: 'GDN', name: 'Gdańsk Lech Wałęsa Airport', city: 'Gdańsk' },
  { code: 'WRO', name: 'Wrocław Copernicus Airport', city: 'Wrocław' },
  
  // Europe - Czech Republic
  { code: 'PRG', name: 'Prague Václav Havel', city: 'Prague' },
  
  // Europe - Hungary
  { code: 'BUD', name: 'Budapest Ferenc Liszt Intl', city: 'Budapest' },
  
  // Europe - Romania
  { code: 'OTP', name: 'Bucharest Henri Coandă Intl', city: 'Bucharest' },
  
  // Europe - Bulgaria
  { code: 'SOF', name: 'Sofia Airport', city: 'Sofia' },
  { code: 'VAR', name: 'Varna Airport', city: 'Varna' },
  { code: 'BOJ', name: 'Burgas Airport', city: 'Burgas' },
  
  // Europe - Croatia
  { code: 'ZAG', name: 'Zagreb Airport', city: 'Zagreb' },
  { code: 'DBV', name: 'Dubrovnik Airport', city: 'Dubrovnik' },
  { code: 'SPU', name: 'Split Airport', city: 'Split' },
  
  // Middle East - UAE (Dubai Area)
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai' },
  { code: 'DWC', name: 'Dubai World Central', city: 'Dubai' },
  { code: 'SHJ', name: 'Sharjah Intl', city: 'Sharjah' },
  
  // Middle East - UAE (Other)
  { code: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dhabi' },
  { code: 'RKT', name: 'Ras Al Khaimah Intl', city: 'Ras Al Khaimah' },
  
  // Middle East - Qatar
  { code: 'DOH', name: 'Hamad Intl', city: 'Doha' },
  
  // Middle East - Saudi Arabia
  { code: 'RUH', name: 'King Khalid Intl', city: 'Riyadh' },
  { code: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah' },
  { code: 'DMM', name: 'King Fahd Intl', city: 'Dammam' },
  { code: 'MED', name: 'Prince Mohammad bin Abdulaziz Intl', city: 'Madinah' },
  
  // Middle East - Israel
  { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv' },
  
  // Middle East - Jordan
  { code: 'AMM', name: 'Queen Alia Intl', city: 'Amman' },
  
  // Middle East - Lebanon
  { code: 'BEY', name: 'Beirut Rafic Hariri Intl', city: 'Beirut' },
  
  // Middle East - Oman
  { code: 'MCT', name: 'Muscat Intl', city: 'Muscat' },
  
  // Middle East - Kuwait
  { code: 'KWI', name: 'Kuwait Intl', city: 'Kuwait City' },
  
  // Middle East - Bahrain
  { code: 'BAH', name: 'Bahrain Intl', city: 'Manama' },
  
  // Asia - Singapore
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  
  // Asia - Japan (Tokyo Area)
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo' },
  
  // Asia - Japan (Other Cities)
  { code: 'KIX', name: 'Osaka Kansai Intl', city: 'Osaka' },
  { code: 'ITM', name: 'Osaka Itami', city: 'Osaka' },
  { code: 'NGO', name: 'Nagoya Chubu Centrair', city: 'Nagoya' },
  { code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka' },
  { code: 'CTS', name: 'Sapporo New Chitose', city: 'Sapporo' },
  { code: 'OKA', name: 'Naha Airport', city: 'Okinawa' },
  
  // Asia - China (Beijing Area)
  { code: 'PEK', name: 'Beijing Capital Intl', city: 'Beijing' },
  { code: 'PKX', name: 'Beijing Daxing Intl', city: 'Beijing' },
  
  // Asia - China (Shanghai Area)
  { code: 'PVG', name: 'Shanghai Pudong Intl', city: 'Shanghai' },
  { code: 'SHA', name: 'Shanghai Hongqiao Intl', city: 'Shanghai' },
  
  // Asia - China (Other Cities)
  { code: 'CAN', name: 'Guangzhou Baiyun Intl', city: 'Guangzhou' },
  { code: 'SZX', name: 'Shenzhen Bao\'an Intl', city: 'Shenzhen' },
  { code: 'CTU', name: 'Chengdu Shuangliu Intl', city: 'Chengdu' },
  { code: 'HGH', name: 'Hangzhou Xiaoshan Intl', city: 'Hangzhou' },
  { code: 'XIY', name: 'Xi\'an Xianyang Intl', city: 'Xi\'an' },
  { code: 'KMG', name: 'Kunming Changshui Intl', city: 'Kunming' },
  { code: 'CSX', name: 'Changsha Huanghua Intl', city: 'Changsha' },
  { code: 'WUH', name: 'Wuhan Tianhe Intl', city: 'Wuhan' },
  { code: 'NKG', name: 'Nanjing Lukou Intl', city: 'Nanjing' },
  
  // Asia - Hong Kong & Macau
  { code: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong' },
  { code: 'MFM', name: 'Macau Intl', city: 'Macau' },
  
  // Asia - Taiwan
  { code: 'TPE', name: 'Taiwan Taoyuan Intl', city: 'Taipei' },
  { code: 'TSA', name: 'Taipei Songshan', city: 'Taipei' },
  { code: 'KHH', name: 'Kaohsiung Intl', city: 'Kaohsiung' },
  
  // Asia - South Korea (Seoul Area)
  { code: 'ICN', name: 'Seoul Incheon Intl', city: 'Seoul' },
  { code: 'GMP', name: 'Seoul Gimpo Intl', city: 'Seoul' },
  
  // Asia - South Korea (Other Cities)
  { code: 'PUS', name: 'Busan Gimhae Intl', city: 'Busan' },
  { code: 'CJU', name: 'Jeju Intl', city: 'Jeju' },
  
  // Asia - Thailand (Bangkok Area)
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok' },
  { code: 'DMK', name: 'Bangkok Don Mueang Intl', city: 'Bangkok' },
  
  // Asia - Thailand (Other Cities)
  { code: 'HKT', name: 'Phuket Intl', city: 'Phuket' },
  { code: 'CNX', name: 'Chiang Mai Intl', city: 'Chiang Mai' },
  { code: 'USM', name: 'Koh Samui Airport', city: 'Koh Samui' },
  { code: 'HDY', name: 'Hat Yai Intl', city: 'Hat Yai' },
  
  // Asia - Malaysia (Kuala Lumpur Area)
  { code: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur' },
  { code: 'SZB', name: 'Sultan Abdul Aziz Shah Airport', city: 'Kuala Lumpur' },
  
  // Asia - Malaysia (Other Cities)
  { code: 'PEN', name: 'Penang Intl', city: 'Penang' },
  { code: 'JHB', name: 'Johor Bahru Senai Intl', city: 'Johor Bahru' },
  { code: 'KCH', name: 'Kuching Intl', city: 'Kuching' },
  { code: 'BKI', name: 'Kota Kinabalu Intl', city: 'Kota Kinabalu' },
  { code: 'LGK', name: 'Langkawi Intl', city: 'Langkawi' },
  
  // Asia - Indonesia (Jakarta Area)
  { code: 'CGK', name: 'Jakarta Soekarno-Hatta Intl', city: 'Jakarta' },
  { code: 'HLP', name: 'Jakarta Halim Perdanakusuma', city: 'Jakarta' },
  
  // Asia - Indonesia (Other Cities)
  { code: 'DPS', name: 'Bali Ngurah Rai Intl', city: 'Bali' },
  { code: 'SUB', name: 'Surabaya Juanda Intl', city: 'Surabaya' },
  { code: 'UPG', name: 'Makassar Sultan Hasanuddin Intl', city: 'Makassar' },
  { code: 'MDC', name: 'Manado Sam Ratulangi Intl', city: 'Manado' },
  { code: 'JOG', name: 'Yogyakarta Adisucipto Intl', city: 'Yogyakarta' },
  
  // Asia - Vietnam
  { code: 'SGN', name: 'Ho Chi Minh City Tan Son Nhat', city: 'Ho Chi Minh City' },
  { code: 'HAN', name: 'Hanoi Noi Bai Intl', city: 'Hanoi' },
  { code: 'DAD', name: 'Da Nang Intl', city: 'Da Nang' },
  { code: 'CXR', name: 'Cam Ranh Intl', city: 'Nha Trang' },
  { code: 'PQC', name: 'Phu Quoc Intl', city: 'Phu Quoc' },
  
  // Asia - Philippines (Manila Area)
  { code: 'MNL', name: 'Manila Ninoy Aquino Intl', city: 'Manila' },
  { code: 'CRK', name: 'Clark Intl', city: 'Manila' },
  
  // Asia - Philippines (Other Cities)
  { code: 'CEB', name: 'Cebu Mactan Intl', city: 'Cebu' },
  { code: 'DVO', name: 'Davao Francisco Bangoy Intl', city: 'Davao' },
  { code: 'ILO', name: 'Iloilo Intl', city: 'Iloilo' },
  { code: 'MPH', name: 'Caticlan (Boracay)', city: 'Caticlan' },
  
  // Asia - India (Mumbai Area)
  { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji Intl', city: 'Mumbai' },
  
  // Asia - India (Delhi Area)
  { code: 'DEL', name: 'Delhi Indira Gandhi Intl', city: 'Delhi' },
  
  // Asia - India (Other Cities)
  { code: 'BLR', name: 'Bengaluru Kempegowda Intl', city: 'Bengaluru' },
  { code: 'HYD', name: 'Hyderabad Rajiv Gandhi Intl', city: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai Intl', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata Netaji Subhas Chandra Bose Intl', city: 'Kolkata' },
  { code: 'GOI', name: 'Goa Dabolim Airport', city: 'Goa' },
  { code: 'COK', name: 'Kochi Intl', city: 'Kochi' },
  { code: 'AMD', name: 'Ahmedabad Sardar Vallabhbhai Patel Intl', city: 'Ahmedabad' },
  { code: 'PNQ', name: 'Pune Airport', city: 'Pune' },
  { code: 'JAI', name: 'Jaipur Intl', city: 'Jaipur' },
  
  // Asia - Pakistan
  { code: 'KHI', name: 'Karachi Jinnah Intl', city: 'Karachi' },
  { code: 'LHE', name: 'Lahore Allama Iqbal Intl', city: 'Lahore' },
  { code: 'ISB', name: 'Islamabad Intl', city: 'Islamabad' },
  
  // Asia - Bangladesh
  { code: 'DAC', name: 'Dhaka Hazrat Shahjalal Intl', city: 'Dhaka' },
  
  // Asia - Sri Lanka
  { code: 'CMB', name: 'Colombo Bandaranaike Intl', city: 'Colombo' },
  
  // Asia - Nepal
  { code: 'KTM', name: 'Kathmandu Tribhuvan Intl', city: 'Kathmandu' },
  
  // Asia - Maldives
  { code: 'MLE', name: 'Malé Velana Intl', city: 'Malé' },
  
  // Australia & Oceania (Sydney Area)
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
  
  // Australia & Oceania (Melbourne Area)
  { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne' },
  { code: 'AVV', name: 'Melbourne Avalon', city: 'Melbourne' },
  
  // Australia & Oceania (Other Cities)
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth' },
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide' },
  { code: 'CNS', name: 'Cairns Airport', city: 'Cairns' },
  { code: 'OOL', name: 'Gold Coast Airport', city: 'Gold Coast' },
  { code: 'DRW', name: 'Darwin Intl', city: 'Darwin' },
  { code: 'HBA', name: 'Hobart Airport', city: 'Hobart' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland' },
  { code: 'WLG', name: 'Wellington Airport', city: 'Wellington' },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch' },
  { code: 'ZQN', name: 'Queenstown Airport', city: 'Queenstown' },
  { code: 'NAN', name: 'Nadi Intl', city: 'Nadi' },
  { code: 'PPT', name: 'Faa\'a Intl Tahiti', city: 'Papeete' },
  
  // Africa - South Africa
  { code: 'JNB', name: 'Johannesburg OR Tambo Intl', city: 'Johannesburg' },
  { code: 'CPT', name: 'Cape Town Intl', city: 'Cape Town' },
  { code: 'DUR', name: 'Durban King Shaka Intl', city: 'Durban' },
  
  // Africa - Egypt
  { code: 'CAI', name: 'Cairo Intl', city: 'Cairo' },
  { code: 'HRG', name: 'Hurghada Intl', city: 'Hurghada' },
  { code: 'SSH', name: 'Sharm El Sheikh Intl', city: 'Sharm El Sheikh' },
  { code: 'LXR', name: 'Luxor Intl', city: 'Luxor' },
  
  // Africa - Morocco
  { code: 'CMN', name: 'Casablanca Mohammed V Intl', city: 'Casablanca' },
  { code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech' },
  { code: 'AGA', name: 'Agadir Al Massira', city: 'Agadir' },
  { code: 'FEZ', name: 'Fez Saïss Airport', city: 'Fez' },
  
  // Africa - Kenya
  { code: 'NBO', name: 'Nairobi Jomo Kenyatta Intl', city: 'Nairobi' },
  { code: 'MBA', name: 'Mombasa Moi Intl', city: 'Mombasa' },
  
  // Africa - Tanzania
  { code: 'DAR', name: 'Dar es Salaam Julius Nyerere Intl', city: 'Dar es Salaam' },
  { code: 'JRO', name: 'Kilimanjaro Intl', city: 'Kilimanjaro' },
  { code: 'ZNZ', name: 'Zanzibar Abeid Amani Karume Intl', city: 'Zanzibar' },
  
  // Africa - Nigeria
  { code: 'LOS', name: 'Lagos Murtala Muhammed Intl', city: 'Lagos' },
  { code: 'ABV', name: 'Abuja Nnamdi Azikiwe Intl', city: 'Abuja' },
  
  // Africa - Ethiopia
  { code: 'ADD', name: 'Addis Ababa Bole Intl', city: 'Addis Ababa' },
  
  // Africa - Ghana
  { code: 'ACC', name: 'Accra Kotoka Intl', city: 'Accra' },
  
  // Africa - Tunisia
  { code: 'TUN', name: 'Tunis Carthage Intl', city: 'Tunis' },
  
  // South America - Brazil (São Paulo Area)
  { code: 'GRU', name: 'São Paulo Guarulhos Intl', city: 'São Paulo' },
  { code: 'CGH', name: 'São Paulo Congonhas', city: 'São Paulo' },
  { code: 'VCP', name: 'Campinas Viracopos Intl', city: 'São Paulo' },
  
  // South America - Brazil (Rio Area)
  { code: 'GIG', name: 'Rio de Janeiro Galeão Intl', city: 'Rio de Janeiro' },
  { code: 'SDU', name: 'Rio de Janeiro Santos Dumont', city: 'Rio de Janeiro' },
  
  // South America - Brazil (Other Cities)
  { code: 'BSB', name: 'Brasília Intl', city: 'Brasília' },
  { code: 'CNF', name: 'Belo Horizonte Confins Intl', city: 'Belo Horizonte' },
  { code: 'SSA', name: 'Salvador Deputado Luís Eduardo Magalhães Intl', city: 'Salvador' },
  { code: 'FOR', name: 'Fortaleza Pinto Martins Intl', city: 'Fortaleza' },
  { code: 'REC', name: 'Recife Guararapes Intl', city: 'Recife' },
  
  // South America - Argentina (Buenos Aires Area)
  { code: 'EZE', name: 'Buenos Aires Ezeiza Intl', city: 'Buenos Aires' },
  { code: 'AEP', name: 'Buenos Aires Jorge Newbery', city: 'Buenos Aires' },
  
  // South America - Chile
  { code: 'SCL', name: 'Santiago Arturo Merino Benítez Intl', city: 'Santiago' },
  
  // South America - Peru
  { code: 'LIM', name: 'Lima Jorge Chávez Intl', city: 'Lima' },
  { code: 'CUZ', name: 'Cusco Alejandro Velasco Astete Intl', city: 'Cusco' },
  
  // South America - Colombia
  { code: 'BOG', name: 'Bogotá El Dorado Intl', city: 'Bogotá' },
  { code: 'MDE', name: 'Medellín José María Córdova Intl', city: 'Medellín' },
  { code: 'CTG', name: 'Cartagena Rafael Núñez Intl', city: 'Cartagena' },
  { code: 'CLO', name: 'Cali Alfonso Bonilla Aragón Intl', city: 'Cali' },
  
  // South America - Ecuador
  { code: 'UIO', name: 'Quito Mariscal Sucre Intl', city: 'Quito' },
  { code: 'GYE', name: 'Guayaquil José Joaquín de Olmedo Intl', city: 'Guayaquil' },
  
  // South America - Venezuela
  { code: 'CCS', name: 'Caracas Simón Bolívar Intl', city: 'Caracas' },
  
  // Central America & Caribbean (Mexico)
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City' },
  { code: 'CUN', name: 'Cancún Intl', city: 'Cancún' },
  { code: 'GDL', name: 'Guadalajara Miguel Hidalgo y Costilla Intl', city: 'Guadalajara' },
  { code: 'TIJ', name: 'Tijuana Intl', city: 'Tijuana' },
  { code: 'MTY', name: 'Monterrey Gen. Mariano Escobedo Intl', city: 'Monterrey' },
  { code: 'PVR', name: 'Puerto Vallarta Gustavo Díaz Ordaz Intl', city: 'Puerto Vallarta' },
  { code: 'SJD', name: 'Los Cabos Intl', city: 'Los Cabos' },
  { code: 'MID', name: 'Mérida Manuel Crescencio Rejón Intl', city: 'Mérida' },
  
  // Central America & Caribbean (Other Countries)
  { code: 'PTY', name: 'Panama City Tocumen Intl', city: 'Panama City' },
  { code: 'SJO', name: 'San José Juan Santamaría Intl', city: 'San José' },
  { code: 'LIR', name: 'Liberia Daniel Oduber Quirós Intl', city: 'Liberia' },
  { code: 'SAL', name: 'San Salvador El Salvador Intl', city: 'San Salvador' },
  { code: 'GUA', name: 'Guatemala City La Aurora Intl', city: 'Guatemala City' },
  { code: 'MBJ', name: 'Montego Bay Sangster Intl', city: 'Montego Bay' },
  { code: 'KIN', name: 'Kingston Norman Manley Intl', city: 'Kingston' },
  { code: 'NAS', name: 'Nassau Lynden Pindling Intl', city: 'Nassau' },
  { code: 'PUJ', name: 'Punta Cana Intl', city: 'Punta Cana' },
  { code: 'SDQ', name: 'Santo Domingo Las Américas Intl', city: 'Santo Domingo' },
  { code: 'HAV', name: 'Havana José Martí Intl', city: 'Havana' },
  { code: 'AUA', name: 'Aruba Queen Beatrix Intl', city: 'Aruba' },
  { code: 'CUR', name: 'Curaçao Hato Intl', city: 'Curaçao' },
  { code: 'BGI', name: 'Bridgetown Grantley Adams Intl', city: 'Bridgetown' }
];
  
  // United States
  { code: 'JFK', name: 'John F Kennedy Intl', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago O\'Hare Intl', city: 'Chicago' },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' },
  { code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' },
  { code: 'DEN', name: 'Denver Intl', city: 'Denver' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' },
  { code: 'LAS', name: 'Las Vegas McCarran Intl', city: 'Las Vegas' },
  { code: 'MCO', name: 'Orlando Intl', city: 'Orlando' },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami' },
  { code: 'PHX', name: 'Phoenix Sky Harbor Intl', city: 'Phoenix' },
  { code: 'IAH', name: 'Houston George Bush Intl', city: 'Houston' },
  { code: 'BOS', name: 'Boston Logan Intl', city: 'Boston' },
  { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' },
  { code: 'MSP', name: 'Minneapolis-St Paul Intl', city: 'Minneapolis' },
  { code: 'DTW', name: 'Detroit Metro Wayne County', city: 'Detroit' },
  { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York' },
  { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' },
  { code: 'DCA', name: 'Ronald Reagan Washington National', city: 'Washington DC' },
  { code: 'IAD', name: 'Washington Dulles Intl', city: 'Washington DC' },
  { code: 'SAN', name: 'San Diego Intl', city: 'San Diego' },
  { code: 'TPA', name: 'Tampa Intl', city: 'Tampa' },
  { code: 'PDX', name: 'Portland Intl', city: 'Portland' },
  { code: 'HNL', name: 'Honolulu Daniel K. Inouye Intl', city: 'Honolulu' },
  
  // Canada
  { code: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto' },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver' },
  { code: 'YUL', name: 'Montreal Pierre Elliott Trudeau Intl', city: 'Montreal' },
  { code: 'YYC', name: 'Calgary Intl', city: 'Calgary' },
  { code: 'YOW', name: 'Ottawa Macdonald-Cartier Intl', city: 'Ottawa' },
  { code: 'YEG', name: 'Edmonton Intl', city: 'Edmonton' },
  { code: 'YHZ', name: 'Halifax Stanfield Intl', city: 'Halifax' },
  
  // Europe - France
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'ORY', name: 'Paris Orly', city: 'Paris' },
  { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice' },
  { code: 'LYS', name: 'Lyon Saint-Exupéry', city: 'Lyon' },
  { code: 'MRS', name: 'Marseille Provence', city: 'Marseille' },
  { code: 'TLS', name: 'Toulouse Blagnac', city: 'Toulouse' },
  
  // Europe - Germany
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich' },
  { code: 'TXL', name: 'Berlin Tegel', city: 'Berlin' },
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin' },
  { code: 'DUS', name: 'Düsseldorf Airport', city: 'Düsseldorf' },
  { code: 'HAM', name: 'Hamburg Airport', city: 'Hamburg' },
  { code: 'CGN', name: 'Cologne Bonn Airport', city: 'Cologne' },
  
  // Europe - Spain
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid' },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona' },
  { code: 'AGP', name: 'Málaga Costa del Sol', city: 'Málaga' },
  { code: 'PMI', name: 'Palma de Mallorca', city: 'Palma' },
  { code: 'SVQ', name: 'Sevilla Airport', city: 'Sevilla' },
  { code: 'VLC', name: 'Valencia Airport', city: 'Valencia' },
  { code: 'ALC', name: 'Alicante-Elche', city: 'Alicante' },
  
  // Europe - Italy
  { code: 'FCO', name: 'Rome Fiumicino', city: 'Rome' },
  { code: 'MXP', name: 'Milan Malpensa', city: 'Milan' },
  { code: 'LIN', name: 'Milan Linate', city: 'Milan' },
  { code: 'VCE', name: 'Venice Marco Polo', city: 'Venice' },
  { code: 'NAP', name: 'Naples Intl', city: 'Naples' },
  { code: 'PSA', name: 'Pisa Intl', city: 'Pisa' },
  { code: 'BLQ', name: 'Bologna Guglielmo Marconi', city: 'Bologna' },
  { code: 'FLR', name: 'Florence Airport', city: 'Florence' },
  
  // Europe - Netherlands
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam' },
  { code: 'EIN', name: 'Eindhoven Airport', city: 'Eindhoven' },
  
  // Europe - Switzerland
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva' },
  { code: 'BSL', name: 'Basel Mulhouse Freiburg', city: 'Basel' },
  
  // Europe - Belgium
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels' },
  
  // Europe - Austria
  { code: 'VIE', name: 'Vienna Intl', city: 'Vienna' },
  
  // Europe - Portugal
  { code: 'LIS', name: 'Lisbon Portela', city: 'Lisbon' },
  { code: 'OPO', name: 'Porto Airport', city: 'Porto' },
  { code: 'FAO', name: 'Faro Airport', city: 'Faro' },
  
  // Europe - Greece
  { code: 'ATH', name: 'Athens Intl', city: 'Athens' },
  { code: 'HER', name: 'Heraklion Intl', city: 'Heraklion' },
  { code: 'RHO', name: 'Rhodes Intl', city: 'Rhodes' },
  { code: 'CFU', name: 'Corfu Intl', city: 'Corfu' },
  
  // Europe - Turkey
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul' },
  { code: 'SAW', name: 'Istanbul Sabiha Gökçen', city: 'Istanbul' },
  { code: 'ESB', name: 'Ankara Esenboğa', city: 'Ankara' },
  { code: 'AYT', name: 'Antalya Airport', city: 'Antalya' },
  
  // Europe - Ireland
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin' },
  { code: 'ORK', name: 'Cork Airport', city: 'Cork' },
  { code: 'SNN', name: 'Shannon Airport', city: 'Shannon' },
  
  // Europe - Scandinavia
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen' },
  { code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo' },
  { code: 'HEL', name: 'Helsinki Vantaa', city: 'Helsinki' },
  { code: 'BGO', name: 'Bergen Airport', city: 'Bergen' },
  
  // Europe - Poland
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Warsaw' },
  { code: 'KRK', name: 'Kraków John Paul II Intl', city: 'Kraków' },
  
  // Europe - Czech Republic
  { code: 'PRG', name: 'Prague Václav Havel', city: 'Prague' },
  
  // Middle East - UAE
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai' },
  { code: 'DWC', name: 'Dubai World Central', city: 'Dubai' },
  { code: 'AUH', name: 'Abu Dhabi Intl', city: 'Abu Dhabi' },
  { code: 'SHJ', name: 'Sharjah Intl', city: 'Sharjah' },
  
  // Middle East - Qatar
  { code: 'DOH', name: 'Hamad Intl', city: 'Doha' },
  
  // Middle East - Saudi Arabia
  { code: 'RUH', name: 'King Khalid Intl', city: 'Riyadh' },
  { code: 'JED', name: 'King Abdulaziz Intl', city: 'Jeddah' },
  { code: 'DMM', name: 'King Fahd Intl', city: 'Dammam' },
  
  // Middle East - Israel
  { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv' },
  
  // Middle East - Jordan
  { code: 'AMM', name: 'Queen Alia Intl', city: 'Amman' },
  
  // Middle East - Lebanon
  { code: 'BEY', name: 'Beirut Rafic Hariri Intl', city: 'Beirut' },
  
  // Asia - Singapore
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore' },
  
  // Asia - Japan
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo' },
  { code: 'HND', name: 'Tokyo Haneda', city: 'Tokyo' },
  { code: 'KIX', name: 'Osaka Kansai Intl', city: 'Osaka' },
  { code: 'NGO', name: 'Nagoya Chubu Centrair', city: 'Nagoya' },
  { code: 'FUK', name: 'Fukuoka Airport', city: 'Fukuoka' },
  
  // Asia - China
  { code: 'PEK', name: 'Beijing Capital Intl', city: 'Beijing' },
  { code: 'PVG', name: 'Shanghai Pudong Intl', city: 'Shanghai' },
  { code: 'SHA', name: 'Shanghai Hongqiao Intl', city: 'Shanghai' },
  { code: 'CAN', name: 'Guangzhou Baiyun Intl', city: 'Guangzhou' },
  { code: 'SZX', name: 'Shenzhen Bao\'an Intl', city: 'Shenzhen' },
  { code: 'CTU', name: 'Chengdu Shuangliu Intl', city: 'Chengdu' },
  { code: 'HGH', name: 'Hangzhou Xiaoshan Intl', city: 'Hangzhou' },
  
  // Asia - Hong Kong & Macau
  { code: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong' },
  { code: 'MFM', name: 'Macau Intl', city: 'Macau' },
  
  // Asia - South Korea
  { code: 'ICN', name: 'Seoul Incheon Intl', city: 'Seoul' },
  { code: 'GMP', name: 'Seoul Gimpo Intl', city: 'Seoul' },
  { code: 'PUS', name: 'Busan Gimhae Intl', city: 'Busan' },
  
  // Asia - Thailand
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok' },
  { code: 'DMK', name: 'Bangkok Don Mueang Intl', city: 'Bangkok' },
  { code: 'HKT', name: 'Phuket Intl', city: 'Phuket' },
  { code: 'CNX', name: 'Chiang Mai Intl', city: 'Chiang Mai' },
  
  // Asia - Malaysia
  { code: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur' },
  { code: 'PEN', name: 'Penang Intl', city: 'Penang' },
  { code: 'JHB', name: 'Johor Bahru Senai Intl', city: 'Johor Bahru' },
  
  // Asia - Indonesia
  { code: 'CGK', name: 'Jakarta Soekarno-Hatta Intl', city: 'Jakarta' },
  { code: 'DPS', name: 'Bali Ngurah Rai Intl', city: 'Bali' },
  { code: 'SUB', name: 'Surabaya Juanda Intl', city: 'Surabaya' },
  
  // Asia - Vietnam
  { code: 'SGN', name: 'Ho Chi Minh City Tan Son Nhat', city: 'Ho Chi Minh City' },
  { code: 'HAN', name: 'Hanoi Noi Bai Intl', city: 'Hanoi' },
  { code: 'DAD', name: 'Da Nang Intl', city: 'Da Nang' },
  
  // Asia - Philippines
  { code: 'MNL', name: 'Manila Ninoy Aquino Intl', city: 'Manila' },
  { code: 'CEB', name: 'Cebu Mactan Intl', city: 'Cebu' },
  
  // Asia - India
  { code: 'DEL', name: 'Delhi Indira Gandhi Intl', city: 'Delhi' },
  { code: 'BOM', name: 'Mumbai Chhatrapati Shivaji Intl', city: 'Mumbai' },
  { code: 'BLR', name: 'Bengaluru Kempegowda Intl', city: 'Bengaluru' },
  { code: 'HYD', name: 'Hyderabad Rajiv Gandhi Intl', city: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai Intl', city: 'Chennai' },
  { code: 'CCU', name: 'Kolkata Netaji Subhas Chandra Bose Intl', city: 'Kolkata' },
  { code: 'GOI', name: 'Goa Dabolim Airport', city: 'Goa' },
  
  // Asia - Pakistan
  { code: 'KHI', name: 'Karachi Jinnah Intl', city: 'Karachi' },
  { code: 'LHE', name: 'Lahore Allama Iqbal Intl', city: 'Lahore' },
  { code: 'ISB', name: 'Islamabad Intl', city: 'Islamabad' },
  
  // Asia - Bangladesh
  { code: 'DAC', name: 'Dhaka Hazrat Shahjalal Intl', city: 'Dhaka' },
  
  // Asia - Sri Lanka
  { code: 'CMB', name: 'Colombo Bandaranaike Intl', city: 'Colombo' },
  
  // Asia - Nepal
  { code: 'KTM', name: 'Kathmandu Tribhuvan Intl', city: 'Kathmandu' },
  
  // Australia & Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
  { code: 'MEL', name: 'Melbourne Tullamarine', city: 'Melbourne' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth' },
  { code: 'ADL', name: 'Adelaide Airport', city: 'Adelaide' },
  { code: 'CNS', name: 'Cairns Airport', city: 'Cairns' },
  { code: 'OOL', name: 'Gold Coast Airport', city: 'Gold Coast' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland' },
  { code: 'WLG', name: 'Wellington Airport', city: 'Wellington' },
  { code: 'CHC', name: 'Christchurch Airport', city: 'Christchurch' },
  { code: 'NAN', name: 'Nadi Intl', city: 'Nadi' },
  
  // Africa - South Africa
  { code: 'JNB', name: 'Johannesburg OR Tambo Intl', city: 'Johannesburg' },
  { code: 'CPT', name: 'Cape Town Intl', city: 'Cape Town' },
  { code: 'DUR', name: 'Durban King Shaka Intl', city: 'Durban' },
  
  // Africa - Egypt
  { code: 'CAI', name: 'Cairo Intl', city: 'Cairo' },
  { code: 'HRG', name: 'Hurghada Intl', city: 'Hurghada' },
  { code: 'SSH', name: 'Sharm El Sheikh Intl', city: 'Sharm El Sheikh' },
  
  // Africa - Morocco
  { code: 'CMN', name: 'Casablanca Mohammed V Intl', city: 'Casablanca' },
  { code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech' },
  
  // Africa - Kenya
  { code: 'NBO', name: 'Nairobi Jomo Kenyatta Intl', city: 'Nairobi' },
  { code: 'MBA', name: 'Mombasa Moi Intl', city: 'Mombasa' },
  
  // Africa - Nigeria
  { code: 'LOS', name: 'Lagos Murtala Muhammed Intl', city: 'Lagos' },
  { code: 'ABV', name: 'Abuja Nnamdi Azikiwe Intl', city: 'Abuja' },
  
  // Africa - Ethiopia
  { code: 'ADD', name: 'Addis Ababa Bole Intl', city: 'Addis Ababa' },
  
  // South America - Brazil
  { code: 'GRU', name: 'São Paulo Guarulhos Intl', city: 'São Paulo' },
  { code: 'GIG', name: 'Rio de Janeiro Galeão Intl', city: 'Rio de Janeiro' },
  { code: 'BSB', name: 'Brasília Intl', city: 'Brasília' },
  { code: 'CNF', name: 'Belo Horizonte Confins Intl', city: 'Belo Horizonte' },
  
  // South America - Argentina
  { code: 'EZE', name: 'Buenos Aires Ezeiza Intl', city: 'Buenos Aires' },
  { code: 'AEP', name: 'Buenos Aires Jorge Newbery', city: 'Buenos Aires' },
  
  // South America - Chile
  { code: 'SCL', name: 'Santiago Arturo Merino Benítez Intl', city: 'Santiago' },
  
  // South America - Peru
  { code: 'LIM', name: 'Lima Jorge Chávez Intl', city: 'Lima' },
  { code: 'CUZ', name: 'Cusco Alejandro Velasco Astete Intl', city: 'Cusco' },
  
  // South America - Colombia
  { code: 'BOG', name: 'Bogotá El Dorado Intl', city: 'Bogotá' },
  { code: 'MDE', name: 'Medellín José María Córdova Intl', city: 'Medellín' },
  { code: 'CTG', name: 'Cartagena Rafael Núñez Intl', city: 'Cartagena' },
  
  // Central America & Caribbean
  { code: 'MEX', name: 'Mexico City Intl', city: 'Mexico City' },
  { code: 'CUN', name: 'Cancún Intl', city: 'Cancún' },
  { code: 'GDL', name: 'Guadalajara Miguel Hidalgo y Costilla Intl', city: 'Guadalajara' },
  { code: 'PTY', name: 'Panama City Tocumen Intl', city: 'Panama City' },
  { code: 'SJO', name: 'San José Juan Santamaría Intl', city: 'San José' },
  { code: 'MBJ', name: 'Montego Bay Sangster Intl', city: 'Montego Bay' },
  { code: 'NAS', name: 'Nassau Lynden Pindling Intl', city: 'Nassau' },
  { code: 'PUJ', name: 'Punta Cana Intl', city: 'Punta Cana' },
  { code: 'SJU', name: 'San Juan Luis Muñoz Marín Intl', city: 'San Juan' }
];

// Airport groups for "Any" options
export const airportGroups = [
  { 
    code: 'LON', 
    name: 'Any London Airport', 
    city: 'London',
    airports: ['LHR', 'LGW', 'LTN', 'STN', 'LCY', 'SEN']
  },
  { 
    code: 'NYC', 
    name: 'Any New York Airport', 
    city: 'New York',
    airports: ['JFK', 'LGA', 'EWR']
  },
  { 
    code: 'PAR', 
    name: 'Any Paris Airport', 
    city: 'Paris',
    airports: ['CDG', 'ORY', 'BVA']
  },
  { 
    code: 'MIL', 
    name: 'Any Milan Airport', 
    city: 'Milan',
    airports: ['MXP', 'LIN', 'BGY']
  },
  { 
    code: 'ROM', 
    name: 'Any Rome Airport', 
    city: 'Rome',
    airports: ['FCO', 'CIA']
  },
  { 
    code: 'BER', 
    name: 'Any Berlin Airport', 
    city: 'Berlin',
    airports: ['BER']
  },
  { 
    code: 'STO', 
    name: 'Any Stockholm Airport', 
    city: 'Stockholm',
    airports: ['ARN', 'BMA', 'NYO']
  },
  { 
    code: 'BRU', 
    name: 'Any Brussels Airport', 
    city: 'Brussels',
    airports: ['BRU', 'CRL']
  },
  { 
    code: 'TYO', 
    name: 'Any Tokyo Airport', 
    city: 'Tokyo',
    airports: ['HND', 'NRT']
  },
  { 
    code: 'OSA', 
    name: 'Any Osaka Airport', 
    city: 'Osaka',
    airports: ['KIX', 'ITM']
  },
  { 
    code: 'SHA', 
    name: 'Any Shanghai Airport', 
    city: 'Shanghai',
    airports: ['PVG', 'SHA']
  },
  { 
    code: 'BJS', 
    name: 'Any Beijing Airport', 
    city: 'Beijing',
    airports: ['PEK', 'PKX']
  },
  { 
    code: 'BKK', 
    name: 'Any Bangkok Airport', 
    city: 'Bangkok',
    airports: ['BKK', 'DMK']
  },
  { 
    code: 'SEL', 
    name: 'Any Seoul Airport', 
    city: 'Seoul',
    airports: ['ICN', 'GMP']
  },
  { 
    code: 'IST', 
    name: 'Any Istanbul Airport', 
    city: 'Istanbul',
    airports: ['IST', 'SAW']
  },
  { 
    code: 'DXB', 
    name: 'Any Dubai Airport', 
    city: 'Dubai',
    airports: ['DXB', 'DWC', 'SHJ']
  },
  { 
    code: 'SAO', 
    name: 'Any São Paulo Airport', 
    city: 'São Paulo',
    airports: ['GRU', 'CGH', 'VCP']
  },
  { 
    code: 'RIO', 
    name: 'Any Rio de Janeiro Airport', 
    city: 'Rio de Janeiro',
    airports: ['GIG', 'SDU']
  },
  { 
    code: 'BUE', 
    name: 'Any Buenos Aires Airport', 
    city: 'Buenos Aires',
    airports: ['EZE', 'AEP']
  },
  { 
    code: 'JKT', 
    name: 'Any Jakarta Airport', 
    city: 'Jakarta',
    airports: ['CGK', 'HLP']
  },
  { 
    code: 'TPE', 
    name: 'Any Taipei Airport', 
    city: 'Taipei',
    airports: ['TPE', 'TSA']
  },
  { 
    code: 'WAS', 
    name: 'Any Washington DC Airport', 
    city: 'Washington DC',
    airports: ['DCA', 'IAD', 'BWI']
  },
  { 
    code: 'CHI', 
    name: 'Any Chicago Airport', 
    city: 'Chicago',
    airports: ['ORD', 'MDW']
  },
  { 
    code: 'MIA', 
    name: 'Any Miami Airport', 
    city: 'Miami',
    airports: ['MIA', 'FLL', 'PBI']
  },
  { 
    code: 'LAX', 
    name: 'Any Los Angeles Airport', 
    city: 'Los Angeles',
    airports: ['LAX', 'BUR', 'ONT', 'SNA', 'LGB']
  },
  { 
    code: 'SFO', 
    name: 'Any San Francisco Bay Area Airport', 
    city: 'San Francisco',
    airports: ['SFO', 'OAK', 'SJC']
  },
  { 
    code: 'HOU', 
    name: 'Any Houston Airport', 
    city: 'Houston',
    airports: ['IAH', 'HOU']
  },
  { 
    code: 'DAL', 
    name: 'Any Dallas Airport', 
    city: 'Dallas',
    airports: ['DFW', 'DAL']
  },
  { 
    code: 'TOR', 
    name: 'Any Toronto Airport', 
    city: 'Toronto',
    airports: ['YYZ', 'YTZ']
  },
  { 
    code: 'MNL', 
    name: 'Any Manila Airport', 
    city: 'Manila',
    airports: ['MNL', 'CRK']
  },
  { 
    code: 'MEL', 
    name: 'Any Melbourne Airport', 
    city: 'Melbourne',
    airports: ['MEL', 'AVV']
  },
  { 
    code: 'IND', 
    name: 'Any India Airport', 
    city: 'India',
    airports: ['DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'CCU', 'GOI', 'COK', 'AMD', 'PNQ', 'JAI']
  },
  { 
    code: 'PAK', 
    name: 'Any Pakistan Airport', 
    city: 'Pakistan',
    airports: ['KHI', 'LHE', 'ISB']
  }
];

export const features = [
export const mockFlightSearchResults = [
  {
    id: '1',
    from: 'London (LHR)',
    to: 'New York (JFK)',
    departureDate: '2025-09-15',
    returnDate: '2025-09-22',
    price: 450,
    airline: 'British Airways',
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
    duration: '13h 20m',
    stops: 'Direct'
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

export const features = [
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
  // United Kingdom
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London' },
  { code: 'LTN', name: 'London Luton', city: 'London' },
  { code: 'STN', name: 'London Stansted', city: 'London' },
  { code: 'LCY', name: 'London City Airport', city: 'London' },
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
export interface Venue {
  name: string;
  lat: number;
  lng: number;
  sports: string[];
  address: string;
  url: string;
}

export const GLASGOW_MAP_CENTER: [number, number] = [-4.2518, 55.8642];

const DEFAULT_URL = "https://www.glasgowlife.org.uk";

function venue(
  name: string,
  lat: number,
  lng: number,
  sports: string[],
  address: string,
  url = DEFAULT_URL,
): Venue {
  return { name, lat, lng, sports, address, url };
}

export const DISCOVER_VENUES: Venue[] = [
  venue("Powerleague Glasgow Parkhead", 55.8515, -4.2232, ["Football"], "Parkhead, Glasgow", "https://www.powerleague.com"),
  venue("Toryglen Regional Football Centre", 55.8234, -4.2412, ["Football"], "Toryglen, Glasgow", "https://glasgowclub.org/venues/toryglen/"),
  venue("Kelvingrove Park Pitches", 55.8687, -4.2876, ["Football"], "Kelvingrove, Glasgow"),
  venue("Scotstoun Stadium", 55.8721, -4.3412, ["Football", "Rugby"], "Scotstoun, Glasgow", "https://glasgowwarriors.org"),
  venue("Powerleague Silverburn", 55.8112, -4.3198, ["Football"], "Silverburn, Glasgow", "https://www.powerleague.com"),
  venue("Powerleague Glasgow Townhead", 55.8644, -4.238, ["Football"], "McPhater St, Glasgow G4 0HW", "https://www.powerleague.com/location/glasgow"),
  venue("Goals Glasgow West", 55.9011, -4.3612, ["Football"], "2680 Great Western Rd, Glasgow G15 6SA", "https://www.goalsfootball.co.uk/our-clubs/scotland/glasgow-west"),
  venue("Goals Glasgow South", 55.805, -4.278, ["Football"], "Scotland St, Glasgow G5 8NL", "https://www.goalsfootball.co.uk/our-clubs/scotland/glasgow-south"),
  venue("Scotstoun Leisure Centre Tennis", 55.8721, -4.3412, ["Tennis"], "Scotstoun, Glasgow", "https://glasgowclub.org/venues/scotstoun/"),
  venue("Kelvingrove Lawn Tennis Club", 55.8698, -4.2901, ["Tennis"], "Kelvingrove, Glasgow"),
  venue("Victoria Park Tennis Courts", 55.8812, -4.3456, ["Tennis"], "Victoria Park, Glasgow"),
  venue("Pollok Tennis Club", 55.8234, -4.3123, ["Tennis"], "Pollok, Glasgow"),
  venue("Glasgow Green Tennis Courts", 55.8503, -4.2347, ["Tennis"], "Glasgow Green, Glasgow G40 1AT"),
  venue("Kelvin Hall International Sports Arena", 55.8701, -4.2987, ["Basketball"], "Kelvin Hall, Glasgow", "https://glasgowclub.org/venues/kelvin-hall/"),
  venue("Scotstoun Leisure Centre Basketball", 55.8721, -4.3412, ["Basketball"], "Scotstoun, Glasgow", "https://glasgowclub.org/venues/scotstoun/"),
  venue("Kelvingrove Outdoor Basketball Courts", 55.8687, -4.2876, ["Basketball"], "Kelvingrove, Glasgow"),
  venue("Emirates Arena", 55.8534, -4.2198, ["Basketball", "Badminton", "Boxing"], "London Road, Glasgow", "https://glasgowclub.org/venues/emirates-arena/"),
  venue("Glasgow Club Kelvin Hall", 55.8701, -4.2987, ["Gym"], "Kelvin Hall, Glasgow", "https://glasgowclub.org/venues/kelvin-hall/"),
  venue("Glasgow Club Emirates", 55.8534, -4.2198, ["Gym"], "London Road, Glasgow", "https://glasgowclub.org/venues/emirates-arena/"),
  venue("Glasgow Club Scotstoun", 55.8721, -4.3412, ["Gym"], "Scotstoun, Glasgow", "https://glasgowclub.org/venues/scotstoun/"),
  venue("Glasgow Club Tollcross", 55.8456, -4.2012, ["Gym", "Swimming"], "Tollcross, Glasgow", "https://glasgowclub.org/venues/tollcross/"),
  venue("PureGym Glasgow City", 55.8612, -4.2498, ["Gym"], "City Centre, Glasgow", "https://www.puregym.com"),
  venue("The Gym Group Glasgow", 55.8589, -4.2534, ["Gym"], "City Centre, Glasgow", "https://www.thegymgroup.com"),
  venue("Tollcross International Swimming Centre", 55.8456, -4.2012, ["Swimming"], "Tollcross, Glasgow", "https://glasgowclub.org/venues/tollcross/"),
  venue("Scotstoun Leisure Centre Pool", 55.8721, -4.3412, ["Swimming"], "Scotstoun, Glasgow", "https://glasgowclub.org/venues/scotstoun/"),
  venue("North Woodside Leisure Centre", 55.8734, -4.2712, ["Swimming", "Gym"], "North Woodside, Glasgow", "https://glasgowclub.org/venues/north-woodside/"),
  venue("Gorbals Leisure Centre", 55.8456, -4.2512, ["Swimming", "Gym"], "Gorbals, Glasgow", "https://glasgowclub.org/venues/gorbals/"),
  venue("Pollok Country Park Running Trails", 55.8178, -4.3234, ["Running", "Cycling", "Hiking"], "Pollok, Glasgow"),
  venue("Kelvingrove Park Running", 55.8687, -4.2876, ["Running"], "Kelvingrove, Glasgow"),
  venue("Glasgow Green Running Track", 55.8478, -4.2312, ["Running"], "Glasgow Green"),
  venue("Victoria Park Running Trails", 55.8812, -4.3456, ["Running", "Cycling"], "Victoria Park, Glasgow"),
  venue("Clyde Walkway", 55.8534, -4.2867, ["Running", "Cycling"], "River Clyde, Glasgow"),
  venue("Glasgow Green Parkrun", 55.8503, -4.2301, ["Running"], "Glasgow Green, Glasgow G40", "https://www.parkrun.org.uk/glasgowgreen/"),
  venue("Glasgow Velodrome", 55.8456, -4.2012, ["Cycling"], "Tollcross, Glasgow", "https://www.glasgowlife.org.uk/sport/venues/sir-chris-hoy-velodrome"),
  venue("Pollok Park Cycling Trails", 55.8178, -4.3234, ["Cycling"], "Pollok, Glasgow"),
  venue("Sir Chris Hoy Velodrome", 55.8522, -4.2268, ["Cycling"], "London Rd, Glasgow G40 3HG", "https://www.glasgowlife.org.uk/sport/venues/sir-chris-hoy-velodrome"),
  venue("Scotstoun Leisure Centre Squash", 55.8721, -4.3412, ["Squash", "Badminton"], "Scotstoun, Glasgow", "https://glasgowclub.org/venues/scotstoun/"),
  venue("Western Baths Club", 55.8723, -4.2876, ["Squash", "Swimming"], "Hillhead, Glasgow", "https://www.westernbaths.co.uk"),
  venue("Emirates Arena Badminton", 55.8534, -4.2198, ["Badminton"], "London Road, Glasgow", "https://glasgowclub.org/venues/emirates-arena/"),
  venue("Kelvin Hall Badminton", 55.8701, -4.2987, ["Badminton"], "Kelvin Hall, Glasgow", "https://glasgowclub.org/venues/kelvin-hall/"),
  venue("Cardonald Boxing Club", 55.8456, -4.3412, ["Boxing", "MartialArts"], "Cardonald, Glasgow"),
  venue("Emirates Arena Boxing", 55.8534, -4.2198, ["Boxing"], "London Road, Glasgow", "https://glasgowclub.org/venues/emirates-arena/"),
  venue("Pollokshields Boxing Club", 55.8298, -4.2876, ["Boxing"], "Pollokshields, Glasgow"),
  venue("Scotstoun Stadium Rugby", 55.8721, -4.3412, ["Rugby"], "Scotstoun, Glasgow", "https://glasgowwarriors.org"),
  venue("New Anniesland Rugby Ground", 55.8823, -4.3345, ["Rugby"], "Anniesland, Glasgow"),
  venue("Kelvin Hall Table Tennis", 55.8701, -4.2987, ["TableTennis"], "Kelvin Hall, Glasgow", "https://glasgowclub.org/venues/kelvin-hall/"),
  venue("Merchant City Yoga", 55.8589, -4.2423, ["Yoga", "Pilates"], "Merchant City, Glasgow"),
  venue("Hot Yoga Glasgow", 55.8623, -4.2512, ["Yoga"], "City Centre, Glasgow"),
  venue("The Climbing Academy Glasgow", 55.8534, -4.2756, ["Climbing"], "Glasgow", "https://theclimbingacademy.com"),
  venue("Boulder World Glasgow", 55.8456, -4.2634, ["Climbing"], "Glasgow", "https://www.boulderworld.co.uk"),
  venue("Pollok Golf Club", 55.8178, -4.3345, ["Golf"], "Pollok, Glasgow", "https://www.pollokgolfclub.co.uk"),
  venue("Haggs Castle Golf Club", 55.8234, -4.3123, ["Golf"], "Dumbreck, Glasgow", "https://www.haggscastlegolfclub.co.uk"),
  venue("Linn Park Golf Course", 55.8012, -4.2876, ["Golf"], "Linn Park, Glasgow"),
  venue("Clydesdale Cricket Club", 55.8312, -4.2987, ["Cricket"], "Titwood, Glasgow", "https://www.clydesdalecc.org"),
  venue("Poloc Cricket Club", 55.8178, -4.3234, ["Cricket"], "Pollok, Glasgow", "https://www.poloc.co.uk"),
  venue("Kelvin Hall Volleyball", 55.8701, -4.2987, ["Volleyball"], "Kelvin Hall, Glasgow", "https://glasgowclub.org/venues/kelvin-hall/"),
  venue("Glasgow Judo Club", 55.8589, -4.2534, ["Judo", "MartialArts"], "City Centre, Glasgow"),
  venue("KMA Muay Thai Glasgow", 55.8612, -4.2456, ["MuayThai", "MartialArts"], "Glasgow"),
  venue("Glasgow BJJ Academy", 55.8578, -4.2567, ["BJJ", "MartialArts"], "Glasgow"),
  venue("Shotokan Karate Glasgow", 55.8634, -4.2612, ["Karate", "MartialArts"], "Glasgow"),
  venue("Cathkin Braes Country Park", 55.7956, -4.2234, ["Hiking", "Running"], "Cathkin Braes, Glasgow"),
  venue("Pollok Country Park Trails", 55.8178, -4.3234, ["Hiking"], "Pollok, Glasgow"),
  venue("Dance House Glasgow", 55.8645, -4.2723, ["Dancing"], "Woodlands, Glasgow", "https://www.dancehouse.co.uk"),
  venue("Scottish Ballet Studios", 55.8556, -4.2634, ["Dancing"], "Glasgow", "https://www.scottishballet.co.uk"),
  venue("Glasgow Tigers Baseball Club", 55.8534, -4.2198, ["Baseball", "Softball"], "Glasgow"),
  venue("Glasgow Hockey Club", 55.8689, -4.2934, ["Hockey", "FieldHockey"], "Glasgow"),
  venue("Braehead Ice Arena", 55.8712, -4.4023, ["IceSkating", "IceHockey"], "Braehead, Glasgow", "https://www.braehead-ice.co.uk"),
  venue("Glasgow Trampoline Academy", 55.8456, -4.2756, ["Trampolining", "Gymnastics"], "Glasgow"),
  venue("Kelvingrove Skatepark", 55.8698, -4.2912, ["Skateboarding", "Parkour"], "Kelvingrove, Glasgow"),
  venue("St Enoch Skatepark", 55.8556, -4.2534, ["Skateboarding"], "City Centre, Glasgow"),
];

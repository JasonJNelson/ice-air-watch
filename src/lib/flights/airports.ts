import type { Airport } from "./types";

export const AIRPORTS: Airport[] = [
  // ICE Air staging / transfer hubs
  { icao: "KAEX", iata: "AEX", name: "Alexandria Intl", city: "Alexandria", country: "United States", iso: "US", lat: 31.3274, lon: -92.5486, iceHub: true },
  { icao: "KHRL", iata: "HRL", name: "Valley Intl", city: "Harlingen", country: "United States", iso: "US", lat: 26.2285, lon: -97.6544, iceHub: true },
  { icao: "KELP", iata: "ELP", name: "El Paso Intl", city: "El Paso", country: "United States", iso: "US", lat: 31.8073, lon: -106.3776, iceHub: true },
  { icao: "KIWA", iata: "AZA", name: "Phoenix-Mesa Gateway", city: "Mesa", country: "United States", iso: "US", lat: 33.3078, lon: -111.6556, iceHub: true },
  { icao: "KMIA", iata: "MIA", name: "Miami Intl", city: "Miami", country: "United States", iso: "US", lat: 25.7959, lon: -80.287, iceHub: true },
  { icao: "KFLL", iata: "FLL", name: "Fort Lauderdale-Hollywood", city: "Fort Lauderdale", country: "United States", iso: "US", lat: 26.0726, lon: -80.1527, iceHub: true },
  { icao: "KOPF", iata: "OPF", name: "Miami-Opa Locka", city: "Opa-locka", country: "United States", iso: "US", lat: 25.907, lon: -80.2784, iceHub: true },
  { icao: "KCSG", iata: "CSG", name: "Columbus", city: "Columbus", country: "United States", iso: "US", lat: 32.5163, lon: -84.9389, iceHub: true },
  { icao: "KYNG", iata: "YNG", name: "Youngstown-Warren", city: "Youngstown", country: "United States", iso: "US", lat: 41.2607, lon: -80.6791, iceHub: true },
  { icao: "KADW", iata: "ADW", name: "Joint Base Andrews", city: "Camp Springs", country: "United States", iso: "US", lat: 38.8108, lon: -76.867, iceHub: true },
  { icao: "KBWI", iata: "BWI", name: "Baltimore/Washington", city: "Baltimore", country: "United States", iso: "US", lat: 39.1754, lon: -76.6683, iceHub: true },
  { icao: "KTPA", iata: "TPA", name: "Tampa Intl", city: "Tampa", country: "United States", iso: "US", lat: 27.9755, lon: -82.5332, iceHub: true },
  { icao: "KSAT", iata: "SAT", name: "San Antonio Intl", city: "San Antonio", country: "United States", iso: "US", lat: 29.5337, lon: -98.4698, iceHub: true },
  { icao: "KIAH", iata: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "United States", iso: "US", lat: 29.9844, lon: -95.3414, iceHub: true },
  { icao: "KHOU", iata: "HOU", name: "William P. Hobby", city: "Houston", country: "United States", iso: "US", lat: 29.6454, lon: -95.2789, iceHub: true },
  { icao: "KDFW", iata: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "United States", iso: "US", lat: 32.8998, lon: -97.0403, iceHub: true },
  { icao: "KAUS", iata: "AUS", name: "Austin-Bergstrom", city: "Austin", country: "United States", iso: "US", lat: 30.1945, lon: -97.6699, iceHub: true },
  { icao: "KLRD", iata: "LRD", name: "Laredo Intl", city: "Laredo", country: "United States", iso: "US", lat: 27.5438, lon: -99.4616, iceHub: true },
  { icao: "KBRO", iata: "BRO", name: "Brownsville/South Padre", city: "Brownsville", country: "United States", iso: "US", lat: 25.906, lon: -97.4259, iceHub: true },
  { icao: "KMFE", iata: "MFE", name: "McAllen Miller", city: "McAllen", country: "United States", iso: "US", lat: 26.1758, lon: -98.2386, iceHub: true },
  { icao: "KPHX", iata: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix", country: "United States", iso: "US", lat: 33.4342, lon: -112.0116, iceHub: true },
  { icao: "KDEN", iata: "DEN", name: "Denver Intl", city: "Denver", country: "United States", iso: "US", lat: 39.8561, lon: -104.6737, iceHub: true },
  { icao: "KMSP", iata: "MSP", name: "Minneapolis-St Paul", city: "Minneapolis", country: "United States", iso: "US", lat: 44.882, lon: -93.2218, iceHub: true },
  { icao: "KATL", iata: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "United States", iso: "US", lat: 33.6407, lon: -84.4277, iceHub: true },
  { icao: "KORD", iata: "ORD", name: "O'Hare", city: "Chicago", country: "United States", iso: "US", lat: 41.9742, lon: -87.9073, iceHub: true },
  { icao: "KJAX", iata: "JAX", name: "Jacksonville Intl", city: "Jacksonville", country: "United States", iso: "US", lat: 30.4941, lon: -81.6879, iceHub: true },
  { icao: "KMCO", iata: "MCO", name: "Orlando Intl", city: "Orlando", country: "United States", iso: "US", lat: 28.4312, lon: -81.3081, iceHub: true },
  { icao: "KSEA", iata: "SEA", name: "Seattle-Tacoma", city: "Seattle", country: "United States", iso: "US", lat: 47.4502, lon: -122.3088, iceHub: true },
  { icao: "PANC", iata: "ANC", name: "Ted Stevens Anchorage", city: "Anchorage", country: "United States", iso: "US", lat: 61.1744, lon: -149.9963, iceHub: true },
  { icao: "KBOS", iata: "BOS", name: "Logan Intl", city: "Boston", country: "United States", iso: "US", lat: 42.3656, lon: -71.0096, iceHub: true },
  { icao: "KEWR", iata: "EWR", name: "Newark Liberty", city: "Newark", country: "United States", iso: "US", lat: 40.6895, lon: -74.1745, iceHub: true },
  { icao: "KJFK", iata: "JFK", name: "John F. Kennedy", city: "New York", country: "United States", iso: "US", lat: 40.6413, lon: -73.7781, iceHub: true },
  { icao: "KIAD", iata: "IAD", name: "Washington Dulles", city: "Dulles", country: "United States", iso: "US", lat: 38.9531, lon: -77.4565, iceHub: true },
  { icao: "KPHL", iata: "PHL", name: "Philadelphia Intl", city: "Philadelphia", country: "United States", iso: "US", lat: 39.8729, lon: -75.2437, iceHub: true },
  { icao: "KCAK", iata: "CAK", name: "Akron-Canton", city: "Akron", country: "United States", iso: "US", lat: 40.9163, lon: -81.4422, iceHub: true },
  { icao: "KCLE", iata: "CLE", name: "Cleveland Hopkins", city: "Cleveland", country: "United States", iso: "US", lat: 41.4117, lon: -81.8498, iceHub: true },
  { icao: "KMEM", iata: "MEM", name: "Memphis Intl", city: "Memphis", country: "United States", iso: "US", lat: 35.0424, lon: -89.9767, iceHub: true },
  { icao: "KMSY", iata: "MSY", name: "Louis Armstrong", city: "New Orleans", country: "United States", iso: "US", lat: 29.9934, lon: -90.258, iceHub: true },
  { icao: "KLAX", iata: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "United States", iso: "US", lat: 33.9416, lon: -118.4085, iceHub: true },
  { icao: "KSAN", iata: "SAN", name: "San Diego Intl", city: "San Diego", country: "United States", iso: "US", lat: 32.7338, lon: -117.1933, iceHub: true },
  { icao: "KOAK", iata: "OAK", name: "Oakland Intl", city: "Oakland", country: "United States", iso: "US", lat: 37.7213, lon: -122.2208, iceHub: true },
  { icao: "KSFO", iata: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "United States", iso: "US", lat: 37.6213, lon: -122.379, iceHub: true },
  { icao: "KLAS", iata: "LAS", name: "Harry Reid Intl", city: "Las Vegas", country: "United States", iso: "US", lat: 36.084, lon: -115.1537, iceHub: true },
  { icao: "KSLC", iata: "SLC", name: "Salt Lake City Intl", city: "Salt Lake City", country: "United States", iso: "US", lat: 40.7899, lon: -111.9791, iceHub: true },
  { icao: "KPDX", iata: "PDX", name: "Portland Intl", city: "Portland", country: "United States", iso: "US", lat: 45.5898, lon: -122.5951, iceHub: true },
  { icao: "KTUS", iata: "TUS", name: "Tucson Intl", city: "Tucson", country: "United States", iso: "US", lat: 32.1161, lon: -110.941, iceHub: true },
  { icao: "KABQ", iata: "ABQ", name: "Albuquerque Intl", city: "Albuquerque", country: "United States", iso: "US", lat: 35.0402, lon: -106.6092, iceHub: true },
  { icao: "KCRP", iata: "CRP", name: "Corpus Christi Intl", city: "Corpus Christi", country: "United States", iso: "US", lat: 27.7704, lon: -97.5012, iceHub: true },
  { icao: "KCLT", iata: "CLT", name: "Charlotte Douglas", city: "Charlotte", country: "United States", iso: "US", lat: 35.214, lon: -80.9431, iceHub: true },
  { icao: "KRDU", iata: "RDU", name: "Raleigh-Durham", city: "Raleigh", country: "United States", iso: "US", lat: 35.8801, lon: -78.788, iceHub: true },
  { icao: "KPBI", iata: "PBI", name: "Palm Beach Intl", city: "West Palm Beach", country: "United States", iso: "US", lat: 26.6832, lon: -80.0956, iceHub: true },
  { icao: "KRSW", iata: "RSW", name: "Southwest Florida", city: "Fort Myers", country: "United States", iso: "US", lat: 26.5362, lon: -81.7552, iceHub: true },
  { icao: "KMCI", iata: "MCI", name: "Kansas City Intl", city: "Kansas City", country: "United States", iso: "US", lat: 39.2976, lon: -94.7139, iceHub: true },
  { icao: "KCVG", iata: "CVG", name: "Cincinnati/Northern Kentucky", city: "Cincinnati", country: "United States", iso: "US", lat: 39.0488, lon: -84.6678, iceHub: true },
  { icao: "KIND", iata: "IND", name: "Indianapolis Intl", city: "Indianapolis", country: "United States", iso: "US", lat: 39.7173, lon: -86.2944, iceHub: true },
  { icao: "KDTW", iata: "DTW", name: "Detroit Metro", city: "Detroit", country: "United States", iso: "US", lat: 42.2124, lon: -83.3534, iceHub: true },
  { icao: "TJSJ", iata: "SJU", name: "Luis Muñoz Marín", city: "San Juan", country: "Puerto Rico", iso: "PR", lat: 18.4394, lon: -66.002, iceHub: true },

  // Removal destinations — Central America / Mexico / Caribbean / South America
  { icao: "MGGT", iata: "GUA", name: "La Aurora", city: "Guatemala City", country: "Guatemala", iso: "GT", lat: 14.5833, lon: -90.5275 },
  { icao: "MHLM", iata: "SAP", name: "Ramón Villeda Morales", city: "San Pedro Sula", country: "Honduras", iso: "HN", lat: 15.4526, lon: -87.9236 },
  { icao: "MHTG", iata: "TGU", name: "Toncontín / Palmerola", city: "Tegucigalpa", country: "Honduras", iso: "HN", lat: 14.0609, lon: -87.2172 },
  { icao: "MHPR", iata: "XPL", name: "Comayagua Palmerola", city: "Comayagua", country: "Honduras", iso: "HN", lat: 14.3824, lon: -87.6212 },
  { icao: "MSLP", iata: "SAL", name: "Óscar Arnulfo Romero", city: "San Salvador", country: "El Salvador", iso: "SV", lat: 13.4409, lon: -89.0557 },
  { icao: "MNMG", iata: "MGA", name: "Augusto C. Sandino", city: "Managua", country: "Nicaragua", iso: "NI", lat: 12.1415, lon: -86.1682 },
  { icao: "MROC", iata: "SJO", name: "Juan Santamaría", city: "San José", country: "Costa Rica", iso: "CR", lat: 9.9939, lon: -84.2088 },
  { icao: "MPTO", iata: "PTY", name: "Tocumen Intl", city: "Panama City", country: "Panama", iso: "PA", lat: 9.0714, lon: -79.3835 },
  { icao: "MZBZ", iata: "BZE", name: "Philip S. W. Goldson", city: "Belize City", country: "Belize", iso: "BZ", lat: 17.5391, lon: -88.3082 },
  { icao: "MMMX", iata: "MEX", name: "Mexico City Intl", city: "Mexico City", country: "Mexico", iso: "MX", lat: 19.4363, lon: -99.0721 },
  { icao: "MMTO", iata: "TLC", name: "Toluca Intl", city: "Toluca", country: "Mexico", iso: "MX", lat: 19.3371, lon: -99.566 },
  { icao: "MMGL", iata: "GDL", name: "Guadalajara", city: "Guadalajara", country: "Mexico", iso: "MX", lat: 20.5218, lon: -103.3112 },
  { icao: "MMMY", iata: "MTY", name: "Monterrey", city: "Monterrey", country: "Mexico", iso: "MX", lat: 25.7785, lon: -100.107 },
  { icao: "MMUN", iata: "CUN", name: "Cancún", city: "Cancún", country: "Mexico", iso: "MX", lat: 21.0365, lon: -86.8771 },
  { icao: "MMHO", iata: "HMO", name: "Hermosillo", city: "Hermosillo", country: "Mexico", iso: "MX", lat: 29.0959, lon: -111.0478 },
  { icao: "MMCS", iata: "CJS", name: "Ciudad Juárez", city: "Ciudad Juárez", country: "Mexico", iso: "MX", lat: 31.636, lon: -106.429 },
  { icao: "MMTJ", iata: "TIJ", name: "Tijuana", city: "Tijuana", country: "Mexico", iso: "MX", lat: 32.5411, lon: -116.97 },
  { icao: "MMNL", iata: "NLD", name: "Nuevo Laredo", city: "Nuevo Laredo", country: "Mexico", iso: "MX", lat: 27.434, lon: -99.57 },
  { icao: "MMRX", iata: "REX", name: "Reynosa", city: "Reynosa", country: "Mexico", iso: "MX", lat: 26.0089, lon: -98.2285 },
  { icao: "MMOX", iata: "OAX", name: "Oaxaca", city: "Oaxaca", country: "Mexico", iso: "MX", lat: 16.9999, lon: -96.7266 },
  { icao: "MMVR", iata: "VER", name: "Veracruz", city: "Veracruz", country: "Mexico", iso: "MX", lat: 19.1459, lon: -96.1873 },
  { icao: "MMMD", iata: "MID", name: "Mérida", city: "Mérida", country: "Mexico", iso: "MX", lat: 20.937, lon: -89.6577 },
  { icao: "MMPR", iata: "PVR", name: "Puerto Vallarta", city: "Puerto Vallarta", country: "Mexico", iso: "MX", lat: 20.6801, lon: -105.2542 },
  { icao: "MMQT", iata: "QRO", name: "Querétaro", city: "Querétaro", country: "Mexico", iso: "MX", lat: 20.6173, lon: -100.1855 },
  { icao: "MMLO", iata: "BJX", name: "Bajío", city: "León", country: "Mexico", iso: "MX", lat: 20.9935, lon: -101.481 },
  { icao: "MMZH", iata: "ZIH", name: "Ixtapa-Zihuatanejo", city: "Zihuatanejo", country: "Mexico", iso: "MX", lat: 17.6016, lon: -101.4605 },
  { icao: "MMZO", iata: "ZLO", name: "Manzanillo", city: "Manzanillo", country: "Mexico", iso: "MX", lat: 19.1448, lon: -104.558 },
  { icao: "SKBO", iata: "BOG", name: "El Dorado", city: "Bogotá", country: "Colombia", iso: "CO", lat: 4.7016, lon: -74.1469 },
  { icao: "SKRG", iata: "MDE", name: "José María Córdova", city: "Medellín", country: "Colombia", iso: "CO", lat: 6.1645, lon: -75.4231 },
  { icao: "SVMI", iata: "CCS", name: "Simón Bolívar", city: "Caracas", country: "Venezuela", iso: "VE", lat: 10.6012, lon: -66.9912 },
  { icao: "SVBC", iata: "BLA", name: "General José Antonio Anzoátegui", city: "Barcelona", country: "Venezuela", iso: "VE", lat: 10.1111, lon: -64.6922 },
  { icao: "SPJC", iata: "LIM", name: "Jorge Chávez", city: "Lima", country: "Peru", iso: "PE", lat: -12.0219, lon: -77.1143 },
  { icao: "SEQM", iata: "UIO", name: "Mariscal Sucre", city: "Quito", country: "Ecuador", iso: "EC", lat: -0.125, lon: -78.3543 },
  { icao: "SEGU", iata: "GYE", name: "José Joaquín de Olmedo", city: "Guayaquil", country: "Ecuador", iso: "EC", lat: -2.1574, lon: -79.8836 },
  { icao: "SCEL", iata: "SCL", name: "Arturo Merino Benítez", city: "Santiago", country: "Chile", iso: "CL", lat: -33.393, lon: -70.7858 },
  { icao: "SBGR", iata: "GRU", name: "Guarulhos", city: "São Paulo", country: "Brazil", iso: "BR", lat: -23.4356, lon: -46.4731 },
  { icao: "SBBR", iata: "BSB", name: "Presidente Kubitschek", city: "Brasília", country: "Brazil", iso: "BR", lat: -15.869, lon: -47.9208 },
  { icao: "SGAS", iata: "ASU", name: "Silvio Pettirossi", city: "Asunción", country: "Paraguay", iso: "PY", lat: -25.2398, lon: -57.5191 },
  { icao: "SAEZ", iata: "EZE", name: "Ministro Pistarini", city: "Buenos Aires", country: "Argentina", iso: "AR", lat: -34.8222, lon: -58.5358 },
  { icao: "MDSD", iata: "SDQ", name: "Las Américas", city: "Santo Domingo", country: "Dominican Republic", iso: "DO", lat: 18.4297, lon: -69.6689 },
  { icao: "MDPP", iata: "POP", name: "Gregorio Luperón", city: "Puerto Plata", country: "Dominican Republic", iso: "DO", lat: 19.7579, lon: -70.57 },
  { icao: "MTPP", iata: "PAP", name: "Toussaint Louverture", city: "Port-au-Prince", country: "Haiti", iso: "HT", lat: 18.58, lon: -72.2925 },
  { icao: "MTCH", iata: "CAP", name: "Cap-Haïtien", city: "Cap-Haïtien", country: "Haiti", iso: "HT", lat: 19.7328, lon: -72.1947 },
  { icao: "MKJP", iata: "KIN", name: "Norman Manley", city: "Kingston", country: "Jamaica", iso: "JM", lat: 17.9357, lon: -76.7875 },
  { icao: "MKJS", iata: "MBJ", name: "Sangster", city: "Montego Bay", country: "Jamaica", iso: "JM", lat: 18.5037, lon: -77.9134 },
  { icao: "MYNN", iata: "NAS", name: "Lynden Pindling", city: "Nassau", country: "Bahamas", iso: "BS", lat: 25.039, lon: -77.4662 },
  { icao: "MYEM", iata: "GGT", name: "Exuma Intl", city: "George Town", country: "Bahamas", iso: "BS", lat: 23.5626, lon: -75.8779 },
  { icao: "MYGF", iata: "FPO", name: "Grand Bahama", city: "Freeport", country: "Bahamas", iso: "BS", lat: 26.5587, lon: -78.6956 },
  { icao: "MUHA", iata: "HAV", name: "José Martí", city: "Havana", country: "Cuba", iso: "CU", lat: 22.9892, lon: -82.4091 },
  { icao: "MUVR", iata: "VRA", name: "Juan Gualberto Gómez", city: "Varadero", country: "Cuba", iso: "CU", lat: 23.0344, lon: -81.4353 },
  { icao: "MUPB", iata: "UPB", name: "Playa Baracoa", city: "Havana", country: "Cuba", iso: "CU", lat: 23.0328, lon: -82.5794 },
  { icao: "MUCC", iata: "CCC", name: "Jardines del Rey", city: "Cayo Coco", country: "Cuba", iso: "CU", lat: 22.461, lon: -78.3284 },
  { icao: "MUSN", iata: "SNU", name: "Abel Santa María", city: "Santa Clara", country: "Cuba", iso: "CU", lat: 22.4922, lon: -79.9436 },
  { icao: "MUCF", iata: "CFG", name: "Jaime González", city: "Cienfuegos", country: "Cuba", iso: "CU", lat: 22.15, lon: -80.4142 },
  { icao: "MUCM", iata: "CMW", name: "Ignacio Agramonte", city: "Camagüey", country: "Cuba", iso: "CU", lat: 21.4204, lon: -77.8474 },
  { icao: "MUCU", iata: "SCU", name: "Antonio Maceo", city: "Santiago de Cuba", country: "Cuba", iso: "CU", lat: 19.9698, lon: -75.8354 },
  { icao: "MUCA", iata: "AVI", name: "Máximo Gómez", city: "Ciego de Ávila", country: "Cuba", iso: "CU", lat: 22.0271, lon: -78.7896 },
  { icao: "MUGM", iata: "NBW", name: "Guantanamo Bay NS", city: "Guantanamo Bay", country: "Cuba", iso: "CU", lat: 19.9065, lon: -75.207 },
  { icao: "TNCA", iata: "AUA", name: "Queen Beatrix", city: "Oranjestad", country: "Aruba", iso: "AW", lat: 12.5014, lon: -70.0152 },
  { icao: "TNCC", iata: "CUR", name: "Curaçao Intl", city: "Willemstad", country: "Curaçao", iso: "CW", lat: 12.1889, lon: -68.9598 },
  { icao: "TFFR", iata: "PTP", name: "Pointe-à-Pitre", city: "Pointe-à-Pitre", country: "Guadeloupe", iso: "GP", lat: 16.2653, lon: -61.5318 },
  { icao: "TFFF", iata: "FDF", name: "Martinique Aimé Césaire", city: "Fort-de-France", country: "Martinique", iso: "MQ", lat: 14.591, lon: -61.0032 },
  { icao: "TNCM", iata: "SXM", name: "Princess Juliana", city: "St. Maarten", country: "Sint Maarten", iso: "SX", lat: 18.0409, lon: -63.1089 },
  { icao: "TTPP", iata: "POS", name: "Piarco", city: "Port of Spain", country: "Trinidad and Tobago", iso: "TT", lat: 10.5954, lon: -61.3372 },
  { icao: "SYCJ", iata: "GEO", name: "Cheddi Jagan", city: "Georgetown", country: "Guyana", iso: "GY", lat: 6.4986, lon: -58.2541 },
  { icao: "SMJP", iata: "PBM", name: "Johan Adolf Pengel", city: "Paramaribo", country: "Suriname", iso: "SR", lat: 5.4528, lon: -55.1878 },
  { icao: "TKPK", iata: "SKB", name: "Robert L. Bradshaw", city: "Basseterre", country: "Saint Kitts and Nevis", iso: "KN", lat: 17.3112, lon: -62.7186 },
  { icao: "TGPY", iata: "GND", name: "Maurice Bishop", city: "St. George's", country: "Grenada", iso: "GD", lat: 12.0042, lon: -61.7862 },
  { icao: "TLPL", iata: "UVF", name: "Hewanorra", city: "Vieux Fort", country: "Saint Lucia", iso: "LC", lat: 13.7332, lon: -60.9526 },
  { icao: "TBPB", iata: "BGI", name: "Grantley Adams", city: "Bridgetown", country: "Barbados", iso: "BB", lat: 13.0746, lon: -59.4925 },
  { icao: "MWCR", iata: "GCM", name: "Owen Roberts", city: "George Town", country: "Cayman Islands", iso: "KY", lat: 19.2928, lon: -81.3577 },
  { icao: "MBPV", iata: "PLS", name: "Providenciales", city: "Providenciales", country: "Turks and Caicos", iso: "TC", lat: 21.7736, lon: -72.2659 },

  // Long-haul removal destinations
  { icao: "DGAA", iata: "ACC", name: "Kotoka", city: "Accra", country: "Ghana", iso: "GH", lat: 5.6052, lon: -0.1668 },
  { icao: "DNMM", iata: "LOS", name: "Murtala Muhammed", city: "Lagos", country: "Nigeria", iso: "NG", lat: 6.5774, lon: 3.3212 },
  { icao: "GOBD", iata: "DSS", name: "Blaise Diagne", city: "Dakar", country: "Senegal", iso: "SN", lat: 14.67, lon: -17.0733 },
  { icao: "GUCY", iata: "CKY", name: "Conakry", city: "Conakry", country: "Guinea", iso: "GN", lat: 9.5769, lon: -13.612 },
  { icao: "DIAP", iata: "ABJ", name: "Félix-Houphouët-Boigny", city: "Abidjan", country: "Côte d'Ivoire", iso: "CI", lat: 5.2614, lon: -3.9263 },
  { icao: "DFFD", iata: "OUA", name: "Thomas Sankara", city: "Ouagadougou", country: "Burkina Faso", iso: "BF", lat: 12.3532, lon: -1.5124 },
  { icao: "GFLL", iata: "FNA", name: "Lungi", city: "Freetown", country: "Sierra Leone", iso: "SL", lat: 8.6164, lon: -13.1955 },
  { icao: "GLRB", iata: "ROB", name: "Roberts Intl", city: "Monrovia", country: "Liberia", iso: "LR", lat: 6.2338, lon: -10.3623 },
  { icao: "HKJK", iata: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya", iso: "KE", lat: -1.3192, lon: 36.9278 },
  { icao: "HAAB", iata: "ADD", name: "Bole Intl", city: "Addis Ababa", country: "Ethiopia", iso: "ET", lat: 8.9779, lon: 38.7993 },
  { icao: "FYWH", iata: "WDH", name: "Hosea Kutako", city: "Windhoek", country: "Namibia", iso: "NA", lat: -22.4799, lon: 17.4709 },
  { icao: "FAOR", iata: "JNB", name: "O.R. Tambo", city: "Johannesburg", country: "South Africa", iso: "ZA", lat: -26.1392, lon: 28.246 },
  { icao: "HECA", iata: "CAI", name: "Cairo Intl", city: "Cairo", country: "Egypt", iso: "EG", lat: 30.1219, lon: 31.4056 },
  { icao: "GMMN", iata: "CMN", name: "Mohammed V", city: "Casablanca", country: "Morocco", iso: "MA", lat: 33.3675, lon: -7.59 },
  { icao: "OPKC", iata: "KHI", name: "Jinnah Intl", city: "Karachi", country: "Pakistan", iso: "PK", lat: 24.9065, lon: 67.1608 },
  { icao: "VIDP", iata: "DEL", name: "Indira Gandhi", city: "Delhi", country: "India", iso: "IN", lat: 28.5562, lon: 77.1 },
  { icao: "VTBS", iata: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", iso: "TH", lat: 13.69, lon: 100.7501 },
  { icao: "VDPP", iata: "PNH", name: "Phnom Penh", city: "Phnom Penh", country: "Cambodia", iso: "KH", lat: 11.5466, lon: 104.8441 },
  { icao: "VLVT", iata: "VTE", name: "Wattay", city: "Vientiane", country: "Laos", iso: "LA", lat: 17.9883, lon: 102.5633 },
  { icao: "VVNB", iata: "HAN", name: "Noi Bai", city: "Hanoi", country: "Vietnam", iso: "VN", lat: 21.2212, lon: 105.8072 },
  { icao: "VVTS", iata: "SGN", name: "Tan Son Nhat", city: "Ho Chi Minh City", country: "Vietnam", iso: "VN", lat: 10.8188, lon: 106.6519 },
  { icao: "RPLL", iata: "MNL", name: "Ninoy Aquino", city: "Manila", country: "Philippines", iso: "PH", lat: 14.5086, lon: 121.0196 },
  { icao: "OJAI", iata: "AMM", name: "Queen Alia", city: "Amman", country: "Jordan", iso: "JO", lat: 31.7226, lon: 35.9932 },
  { icao: "LLBG", iata: "TLV", name: "Ben Gurion", city: "Tel Aviv", country: "Israel", iso: "IL", lat: 32.0114, lon: 34.8867 },
  { icao: "OAKB", iata: "KBL", name: "Hamid Karzai", city: "Kabul", country: "Afghanistan", iso: "AF", lat: 34.5659, lon: 69.2123 },
  { icao: "UGTB", iata: "TBS", name: "Tbilisi", city: "Tbilisi", country: "Georgia", iso: "GE", lat: 41.6692, lon: 44.9547 },
  { icao: "UDYS", iata: "EVN", name: "Zvartnots", city: "Yerevan", country: "Armenia", iso: "AM", lat: 40.1473, lon: 44.3959 },
  { icao: "UTTT", iata: "TAS", name: "Islam Karimov", city: "Tashkent", country: "Uzbekistan", iso: "UZ", lat: 41.2579, lon: 69.2817 },
  { icao: "OMDB", iata: "DXB", name: "Dubai Intl", city: "Dubai", country: "United Arab Emirates", iso: "AE", lat: 25.2532, lon: 55.3657 },
  { icao: "LTFM", iata: "IST", name: "Istanbul", city: "Istanbul", country: "Türkiye", iso: "TR", lat: 41.2753, lon: 28.7519 },
  { icao: "EPWA", iata: "WAW", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", iso: "PL", lat: 52.1657, lon: 20.9671 },
  { icao: "LROP", iata: "OTP", name: "Henri Coandă", city: "Bucharest", country: "Romania", iso: "RO", lat: 44.5711, lon: 26.085 },
  { icao: "LATI", iata: "TIA", name: "Tirana", city: "Tirana", country: "Albania", iso: "AL", lat: 41.4147, lon: 19.7206 },
  { icao: "CYUL", iata: "YUL", name: "Montréal-Trudeau", city: "Montreal", country: "Canada", iso: "CA", lat: 45.4706, lon: -73.7408 },
  { icao: "CYYZ", iata: "YYZ", name: "Toronto Pearson", city: "Toronto", country: "Canada", iso: "CA", lat: 43.6777, lon: -79.6248 },
];

export const ICE_HUBS = AIRPORTS.filter((a) => a.iceHub);
export const FOREIGN_AIRPORTS = AIRPORTS.filter((a) => a.iso !== "US" && a.iso !== "PR");
/** Canada is in the airport table for filed routes; heading-inference must not treat it as a removal. */
export const REMOVAL_ISOS = new Set(FOREIGN_AIRPORTS.filter((a) => a.iso !== "CA").map((a) => a.iso));

export function isRemovalCountry(iso: string | null | undefined): boolean {
  return Boolean(iso && REMOVAL_ISOS.has(iso));
}

const PRIMARY_IATA = new Set([
  "AEX",
  "HRL",
  "ELP",
  "AZA",
  "MIA",
  "FLL",
  "OPF",
  "CSG",
  "YNG",
  "ADW",
  "BWI",
  "SAT",
  "IAH",
  "BRO",
  "MFE",
  "LRD",
  "DEN",
  "MSP",
  "ATL",
  "SJU",
]);

export const PRIMARY_HUBS = ICE_HUBS.filter((a) => PRIMARY_IATA.has(a.iata));

const SCAN_IATA = ["AEX", "HRL", "ELP", "AZA", "MIA", "GUA", "SAP", "MEX", "HAV", "CCS", "SAL", "KIN"];

export const SCAN_HUBS = SCAN_IATA.map((iata) => {
  const airport = AIRPORTS.find((a) => a.iata === iata);
  if (!airport) throw new Error(`missing scan hub ${iata}`);
  return { iata, lat: airport.lat, lon: airport.lon, dist: 110 };
});

const BY_IATA = new Map(AIRPORTS.map((a) => [a.iata.toUpperCase(), a]));
const BY_ICAO = new Map(AIRPORTS.map((a) => [a.icao.toUpperCase(), a]));

export function findAirport(code: string | null | undefined): Airport | null {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return BY_IATA.get(c) ?? BY_ICAO.get(c) ?? null;
}

function isoFromIcao(icao: string): { iso: string; country: string } {
  const u = icao.toUpperCase();
  if (u.startsWith("TJ")) return { iso: "PR", country: "Puerto Rico" };
  if (u.startsWith("K") || u.startsWith("P")) return { iso: "US", country: "United States" };
  if (u.startsWith("MU")) return { iso: "CU", country: "Cuba" };
  if (u.startsWith("MT")) return { iso: "HT", country: "Haiti" };
  if (u.startsWith("MM")) return { iso: "MX", country: "Mexico" };
  if (u.startsWith("MS")) return { iso: "SV", country: "El Salvador" };
  if (u.startsWith("MH")) return { iso: "HN", country: "Honduras" };
  if (u.startsWith("MG")) return { iso: "GT", country: "Guatemala" };
  if (u.startsWith("MY")) return { iso: "BS", country: "Bahamas" };
  if (u.startsWith("MK")) return { iso: "JM", country: "Jamaica" };
  if (u.startsWith("MD")) return { iso: "DO", country: "Dominican Republic" };
  if (u.startsWith("MZ")) return { iso: "BZ", country: "Belize" };
  if (u.startsWith("MN")) return { iso: "NI", country: "Nicaragua" };
  if (u.startsWith("MR")) return { iso: "CR", country: "Costa Rica" };
  if (u.startsWith("MP")) return { iso: "PA", country: "Panama" };
  if (u.startsWith("SK")) return { iso: "CO", country: "Colombia" };
  if (u.startsWith("SV")) return { iso: "VE", country: "Venezuela" };
  if (u.startsWith("SE")) return { iso: "EC", country: "Ecuador" };
  if (u.startsWith("SP")) return { iso: "PE", country: "Peru" };
  if (u.startsWith("SC")) return { iso: "CL", country: "Chile" };
  if (u.startsWith("SB")) return { iso: "BR", country: "Brazil" };
  if (u.startsWith("SL")) return { iso: "BO", country: "Bolivia" };
  if (u.startsWith("SG")) return { iso: "PY", country: "Paraguay" };
  if (u.startsWith("SA")) return { iso: "AR", country: "Argentina" };
  if (u.startsWith("SO")) return { iso: "GY", country: "Suriname" };
  if (u.startsWith("SM")) return { iso: "SR", country: "Suriname" };
  if (u.startsWith("SY")) return { iso: "GY", country: "Guyana" };
  return { iso: "UN", country: "Unknown" };
}

/** Fallback airport when Aviationstack cites a field not in AIRPORTS. No map coords. */
export function airportFromCodes(opts: {
  iata?: string | null;
  icao?: string | null;
  name?: string | null;
}): Airport | null {
  const found = findAirport(opts.iata) ?? findAirport(opts.icao);
  if (found) return found;
  const iata = (opts.iata ?? "").trim().toUpperCase();
  const icao = (opts.icao ?? "").trim().toUpperCase();
  if (!iata && !icao) return null;
  const { iso, country } = isoFromIcao(icao || iata);
  const label = ((opts.name ?? iata) || icao).replace(/\s+/g, " ").trim();
  return {
    icao: icao || iata,
    iata: iata || (icao.length === 4 ? icao.slice(1) : icao),
    name: label,
    city: label,
    country,
    iso,
    lat: 0,
    lon: 0,
  };
}

export function hasMapCoords(ap: Airport | null | undefined): boolean {
  if (!ap) return false;
  return Math.abs(ap.lat) + Math.abs(ap.lon) > 1;
}

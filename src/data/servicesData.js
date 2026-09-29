// Dynamic Service Catalog for HiBuild / Hindustan Projects
// Sourced directly from official HiBuild service flyer (16 verticals + House/Apartment/Office filtering)

export const PROPERTY_TYPES = [
  { id: 'house', labelEn: 'House', labelHi: 'घर', icon: 'Home' },
  { id: 'apartment', labelEn: 'Apartment', labelHi: 'फ्लैट', icon: 'Building2' },
  { id: 'office', labelEn: 'Office', labelHi: 'ऑफिस', icon: 'Briefcase' }
];

export const SERVICES = [
  {
    id: '01',
    code: 'STRUCTURE_REPAIR',
    titleEn: 'Structure Repair',
    titleHi: 'मकान की मजबूत मरम्मत',
    taglineEn: 'Repair Roof, Beam, Column & Foundation',
    taglineHi: 'छत, बीम, खंभे की मरम्मत और नींव मजबूत करना',
    icon: 'Hammer',
    color: '#E65100',
    bgColor: '#FFF3E0',
    applicableFor: ['house', 'apartment', 'office'],
    popular: true,
    subServices: [
      {
        id: 's01_1',
        titleEn: 'Repair Roof, Beam & Column',
        titleHi: 'छत, बीम, खंभे की मरम्मत',
        desc: 'Structural strengthening for sagging slabs, cracked beams, and corroded rebar columns.',
        checklist: ['Rebar rust treatment', 'Polymer modified mortar patching', 'Structural load testing']
      },
      {
        id: 's01_2',
        titleEn: 'Fill Cracks & Strengthen',
        titleHi: 'दरार भरना और मजबूत करना',
        desc: 'Deep epoxy injection and micro-concrete filling for structural and hairline settlement cracks.',
        checklist: ['Pressure grouting', 'Fiber mesh reinforcement', 'Elastic putty seal']
      },
      {
        id: 's01_3',
        titleEn: 'Foundation & Safety Check',
        titleHi: 'नींव की मजबूती और सुरक्षा जांच',
        desc: 'Comprehensive structural audit and soil settlement analysis by civil engineering experts.',
        checklist: ['Settlement audit', 'Plinth protection inspection', 'Safety certification report']
      }
    ]
  },
  {
    id: '02',
    code: 'WATER_LEAKAGE',
    titleEn: 'Water Leakage Solutions',
    titleHi: 'पानी टपकना बंद करना',
    taglineEn: 'Stop Roof, Bathroom & Wall Seepage',
    taglineHi: 'छत और बाथरूम की लीकेज रोकना व सीलन का इलाज',
    icon: 'Droplets',
    color: '#0277BD',
    bgColor: '#E1F5FE',
    applicableFor: ['house', 'apartment', 'office'],
    popular: true,
    subServices: [
      {
        id: 's02_1',
        titleEn: 'Stop Roof & Terrace Leakage',
        titleHi: 'छत की लीकेज रोकना',
        desc: 'Multi-layer elastomeric polymer waterproofing and joint sealing with ponding test.',
        checklist: ['Thermal leak detection', 'Primer + 3 waterproof coats', '2-Year written warranty']
      },
      {
        id: 's02_2',
        titleEn: 'Bathroom & Wet Area Seepage',
        titleHi: 'बाथरूम की सीलन और लीकेज का इलाज',
        desc: 'Concealed pipe inspection, non-invasive tile grouting, and chemical waterproofing barrier.',
        checklist: ['Tile grout replacement', 'Trap seal inspection', 'Concealed leak scan']
      },
      {
        id: 's02_3',
        titleEn: 'Chemical Grouting & Crack Sealing',
        titleHi: 'केमिकल ग्राउटिंग और दरार सीलिंग',
        desc: 'High-pressure PU chemical injection into concrete voids to stop running water leaks.',
        checklist: ['PU resin injection', 'Hydrophobic barrier creation', 'Zero-breakage repair']
      }
    ]
  },
  {
    id: '03',
    code: 'PLUMBING_ELECTRICAL',
    titleEn: 'Plumbing & Electrical',
    titleHi: 'पानी और बिजली का काम',
    taglineEn: 'Pipes, Drains, Motors, Wiring & MCBs',
    taglineHi: 'पाइप, नाली, मोटर, वायरिंग और स्विच बोर्ड ठीक करना',
    icon: 'Wrench',
    color: '#F57C00',
    bgColor: '#FFF8E1',
    applicableFor: ['house', 'apartment', 'office'],
    popular: true,
    subServices: [
      {
        id: 's03_1',
        titleEn: 'Fix Pipes, Drains & Pumps',
        titleHi: 'पाइप, नाली और मोटर ठीक करना',
        desc: 'Repairing bursts, high-pressure unclogging, booster pump & submersible motor overhaul.',
        checklist: ['Pressure test for leakage', 'Drain blockage removal', 'Motor winding & capacitor test']
      },
      {
        id: 's03_2',
        titleEn: 'House Wiring & Repair',
        titleHi: 'घर की वायरिंग और मरम्मत',
        desc: 'Replacing short-circuited concealed wires, load distribution, and earthing installation.',
        checklist: ['Megger insulation test', 'Fire-retardant wiring', 'Earthing resistance audit']
      },
      {
        id: 's03_3',
        titleEn: 'MCB, Switch & Socket Work',
        titleHi: 'MCB, स्विच और सॉकेट बदलना',
        desc: 'Distribution board reorganization, trip troubleshooting, and modern modular switches.',
        checklist: ['RCCB / MCB replacement', 'Load balance check', 'Spark-free contacts']
      }
    ]
  },
  {
    id: '04',
    code: 'PAINTING_WALL_REPAIR',
    titleEn: 'Painting & Wall Repair',
    titleHi: 'पेंट और दीवार का काम',
    taglineEn: 'Interior & Exterior Weathercoat & Putty',
    taglineHi: 'घर के अंदर और बाहर पेंट, पुट्टी और POP काम',
    icon: 'Paintbrush',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
    applicableFor: ['house', 'apartment', 'office'],
    popular: true,
    subServices: [
      {
        id: 's04_1',
        titleEn: 'Interior & Exterior Painting',
        titleHi: 'घर के अंदर और बाहर पेंट',
        desc: 'Anti-fungal exterior weathercoat and premium washable interior luxury emulsions.',
        checklist: ['Wall moisture measurement', 'Surface sanding & primer', 'Double coat finish']
      },
      {
        id: 's04_2',
        titleEn: 'Putty, POP & Crack Repair',
        titleHi: 'पुट्टी, POP और दरार ठीक करना',
        desc: 'Damp-resistant acrylic putty leveling, POP cornices, and plaster patching.',
        checklist: ['Crack widening & mesh', 'Waterproof putty base', 'Smooth machine sanding']
      },
      {
        id: 's04_3',
        titleEn: 'Wall Cleaning & Repainting',
        titleHi: 'दीवार सफाई और री-पेंटिंग',
        desc: 'Pressure washing facade, efflorescence salt removal, and touch-up repainting.',
        checklist: ['Algae/fungus treatment', 'Primer application', 'Spot match paint']
      }
    ]
  },
  {
    id: '05',
    code: 'TERMITE_BIRD',
    titleEn: 'Termite & Bird Protection',
    titleHi: 'दीमक का इलाज और कबूतर से बचाव',
    taglineEn: 'Pre/Post Construction Termite & Bird Nets',
    taglineHi: 'दीमक का इलाज, लकड़ी सुरक्षा व बर्ड नेट/स्पाइक्स',
    icon: 'ShieldAlert',
    color: '#388E3C',
    bgColor: '#E8F5E9',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's05_1',
        titleEn: 'Termite Treatment & Protection',
        titleHi: 'दीमक का संपूर्ण इलाज',
        desc: 'Drill-fill-seal chemical barrier around doors, wardrobes, and floor skirtings.',
        checklist: ['Odorless Bayer chemicals', 'Door frame perimeter drill', '3-Year warranty cert']
      },
      {
        id: 's05_2',
        titleEn: 'Bird Net & Spikes Installation',
        titleHi: 'कबूतर जाली और बर्ड स्पाइक्स',
        desc: 'UV-stabilized HDPE balcony netting and stainless steel spikes on ACs/ledges.',
        checklist: ['High-tensile UV net', 'Rust-proof SS anchor hooks', 'Unobstructed view']
      }
    ]
  },
  {
    id: '06',
    code: 'TILE_WORK',
    titleEn: 'Tile Work',
    titleHi: 'टाइल्स का काम',
    taglineEn: 'Floor & Wall Tiling, Replace & Regrout',
    taglineHi: 'फर्श और दीवार पर टाइल्स लगाना, टूटी टाइल्स बदलना',
    icon: 'Grid',
    color: '#00796B',
    bgColor: '#E0F2F1',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's06_1',
        titleEn: 'Floor & Wall Tiling',
        titleHi: 'फर्श और दीवार पर टाइल्स लगाना',
        desc: 'Laser-leveled installation of vitrified tiles, granite, marble, and mosaic.',
        checklist: ['Sub-floor leveling', 'Polymer adhesive bedding', 'Laser alignment check']
      },
      {
        id: 's06_2',
        titleEn: 'Replace Broken / Hollow Tiles',
        titleHi: 'टूटी या ढीली टाइल्स बदलना',
        desc: 'Surgical extraction of damaged tiles without breaking neighboring tiles.',
        checklist: ['Careful chisel extraction', 'Fresh adhesive base', 'Precise grout match']
      },
      {
        id: 's06_3',
        titleEn: 'Tile Repair & Epoxy Grouting',
        titleHi: 'टाइल्स मरम्मत और एपॉक्सी ग्राउटिंग',
        desc: 'Waterproof anti-stain epoxy grouting for bathrooms, kitchens, and balconies.',
        checklist: ['Old grout removal', 'Chemical disinfection', 'Epoxy waterproof seal']
      }
    ]
  },
  {
    id: '07',
    code: 'ELECTRIC_MACHINE',
    titleEn: 'Electric & Machine',
    titleHi: 'मशीन और बिजली का काम',
    taglineEn: 'Generator AMC, AC Service, Lift & Panel',
    taglineHi: 'जनरेटर सर्विस, एसी सर्विस और लिफ्ट/पैनल काम',
    icon: 'Cpu',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
    applicableFor: ['apartment', 'office', 'house'],
    popular: false,
    subServices: [
      {
        id: 's07_1',
        titleEn: 'AC Installation, Service & Gas',
        titleHi: 'एसी इंस्टॉलेशन, सर्विस और गैस रिफिल',
        desc: 'Jet pump foam wash, cooling coil inspection, and eco-friendly gas top-up.',
        checklist: ['High pressure coil clean', 'Amperage & gas pressure check', 'Drain pipe flushing']
      },
      {
        id: 's07_2',
        titleEn: 'Generator Service & AMC',
        titleHi: 'जनरेटर सर्विस और AMC',
        desc: 'Oil filter replacement, battery testing, governor tuning, and load trial.',
        checklist: ['Filter & lubricant change', 'Auto-start relay audit', 'Exhaust compliance check']
      },
      {
        id: 's07_3',
        titleEn: 'Lift Service & Electrical Panel',
        titleHi: 'लिफ्ट सर्विस और इलेक्ट्रिकल पैनल काम',
        desc: 'Control panel servicing, ARD emergency rescue system check, and wire harness testing.',
        checklist: ['Brake & sensor calibration', 'Main feeder panel inspection', 'Safety lock check']
      }
    ]
  },
  {
    id: '08',
    code: 'GARDENING',
    titleEn: 'Gardening',
    titleHi: 'बाग-बगीचे का काम',
    taglineEn: 'Garden Setup, Plantation & Lawn Care',
    taglineHi: 'गार्डन बनाना, पौधे लगाना और लॉन की देखभाल',
    icon: 'Flower2',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's08_1',
        titleEn: 'Garden Setup & Maintenance',
        titleHi: 'गार्डन बनाना और नियमित देखभाल',
        desc: 'Landscape designing, terrace garden setup, and periodic pruning/manuring.',
        checklist: ['Soil aeration & vermicompost', 'Drip irrigation setup', 'Weed removal']
      },
      {
        id: 's08_2',
        titleEn: 'Plant & Tree Plantation',
        titleHi: 'पौधे और पेड़ लगाना',
        desc: 'Indoor oxygen-enriching plants, seasonal flowering trees, and lawn turfing.',
        checklist: ['Healthy nursery stock', 'Root hormone application', 'Nutrient feeding']
      }
    ]
  },
  {
    id: '09',
    code: 'CCTV_SECURITY',
    titleEn: 'CCTV & Security',
    titleHi: 'CCTV और सुरक्षा',
    taglineEn: 'CCTV Camera, Video Door Phone, Guard',
    taglineHi: 'CCTV कैमरा लगाना, वीडियो डोर फोन और गार्ड सेवा',
    icon: 'Camera',
    color: '#455A64',
    bgColor: '#ECEFF1',
    applicableFor: ['apartment', 'office', 'house'],
    popular: false,
    subServices: [
      {
        id: 's09_1',
        titleEn: 'CCTV Camera Installation & DVR',
        titleHi: 'CCTV कैमरा और DVR सेटअप',
        desc: 'Night-vision IP / HD cameras with mobile view setup for anywhere monitoring.',
        checklist: ['High resolution night vision', 'Mobile remote streaming', 'Concealed conduit cabling']
      },
      {
        id: 's09_2',
        titleEn: 'Video Door Phone & Intercom',
        titleHi: 'वीडियो डोर फोन और इंटरकॉम',
        desc: 'Smart digital bell with 2-way audio talk and motion detection unlock.',
        checklist: ['HD outdoor camera', 'Indoor color monitor', 'Electronic strike lock link']
      }
    ]
  },
  {
    id: '10',
    code: 'SAFETY_COMPLIANCE',
    titleEn: 'Safety & Compliance',
    titleHi: 'सुरक्षा और नियम पालन',
    taglineEn: 'Fire Safety Setup, Building Safety Audit',
    taglineHi: 'आग से बचाव सिस्टम और बिल्डिंग की सुरक्षा जांच',
    icon: 'Flame',
    color: '#C62828',
    bgColor: '#FFEBEE',
    applicableFor: ['apartment', 'office', 'house'],
    popular: false,
    subServices: [
      {
        id: 's10_1',
        titleEn: 'Fire Safety Setup & Refilling',
        titleHi: 'फायर सेफ्टी सिस्टम और रीफिलिंग',
        desc: 'ABC/CO2 fire extinguisher deployment, smoke detectors, and fire hose reel servicing.',
        checklist: ['Hydrostatic pressure test', 'Refilling certification', 'Staff evacuation drill']
      },
      {
        id: 's10_2',
        titleEn: 'Building Safety Audit & Exit Plan',
        titleHi: 'बिल्डिंग की जांच और इमरजेंसी एग्जिट प्लान',
        desc: 'Architectural compliance check for emergency exits, signages, and hazard prevention.',
        checklist: ['Escape route illumination', 'Structural safety audit', 'Compliance paperwork']
      }
    ]
  },
  {
    id: '11',
    code: 'SMART_HOME',
    titleEn: 'Smart Home Automation',
    titleHi: 'स्मार्ट होम (आधुनिक घर)',
    taglineEn: 'Mobile App Control, Sensors & Smart Switches',
    taglineHi: 'मोबाइल से लाइट/पंखे चलाना और मोशन सेंसर',
    icon: 'Smartphone',
    color: '#512DA8',
    bgColor: '#EDE7F6',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's11_1',
        titleEn: 'Smart Switch & Touch Panels',
        titleHi: 'स्मार्ट स्विच और टच पैनल',
        desc: 'Retrofit WiFi switches behind existing switchboards without altering wall wiring.',
        checklist: ['No wiring alteration needed', 'Google Home / Alexa sync', 'Timer & scheduling']
      },
      {
        id: 's11_2',
        titleEn: 'Motion Sensors & Energy Saving',
        titleHi: 'मोशन सेंसर और बिजली बचाना',
        desc: 'PIR motion sensor lighting for staircases, bathrooms, and corridors to cut electricity bills.',
        checklist: ['Automatic occupancy detect', 'Adjustable daylight lux sensor', 'Surge protection']
      }
    ]
  },
  {
    id: '12',
    code: 'WALL_DECOR',
    titleEn: 'Wall Decor & Wallpaper',
    titleHi: 'दीवार सजावट और वॉलपेपर',
    taglineEn: 'Designer Wallpaper, 3D Wall Panels, Makeover',
    taglineHi: 'वॉलपेपर लगाना, 3D वॉल पैनल और नया लुक',
    icon: 'Sparkles',
    color: '#C2185B',
    bgColor: '#FCE4EC',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's12_1',
        titleEn: 'Wallpaper Installation & Removal',
        titleHi: 'वॉलपेपर लगाना और हटाना',
        desc: 'Seamless vinyl, textured, and custom 3D scenic wallpapers installed bubble-free.',
        checklist: ['Surface primer seal', 'Specialized German glue', 'Perfect pattern match']
      },
      {
        id: 's12_2',
        titleEn: 'Designer 3D Wall Panels & Fluted Louvers',
        titleHi: 'डिजाइनर वॉल पैनल्स और लूवर्स',
        desc: 'PVC charcoal fluted panels, wooden battens, and accent acoustic cladding.',
        checklist: ['Termite-proof PVC panels', 'Concealed clip mounting', 'Modern luxury aesthetic']
      }
    ]
  },
  {
    id: '13',
    code: 'FACADE_WORK',
    titleEn: 'Facade Work (ACP & Glass)',
    titleHi: 'फ़ेसाड का काम (ACP और ग्लास)',
    taglineEn: 'Building Front Design, ACP Sheet, Glazing',
    taglineHi: 'ACP शीट लगाना, ग्लास व ग्लेज़िंग का काम',
    icon: 'Layers',
    color: '#00838F',
    bgColor: '#E0F7FA',
    applicableFor: ['office', 'house', 'apartment'],
    popular: false,
    subServices: [
      {
        id: 's13_1',
        titleEn: 'ACP Sheet Cladding & Elevation',
        titleHi: 'ACP पैनल लगाना और एलिवेशन',
        desc: 'Weatherproof exterior aluminum composite panels in wooden/metallic textures.',
        checklist: ['Galvanized framework', 'Silicone weather sealing', 'Corrosion-free anchors']
      },
      {
        id: 's13_2',
        titleEn: 'Glass & Glazing Work',
        titleHi: 'ग्लास और ग्लेज़िंग का काम',
        desc: 'Toughened glass spider facades, structural curtain walls, and frameless railings.',
        checklist: ['Toughened laminated glass', 'Wind-load certified brackets', 'Clean acoustic seal']
      }
    ]
  },
  {
    id: '14',
    code: 'FURNITURE_FABRICATION',
    titleEn: 'Furniture & Fabrication',
    titleHi: 'फर्नीचर और फैब्रिकेशन का काम',
    taglineEn: 'Custom Furniture, Iron/Steel Sheds & Polish',
    taglineHi: 'कस्टम फर्नीचर, शेड, सीढ़ी और मेटल का काम',
    icon: 'Package',
    color: '#5D4037',
    bgColor: '#EFEBE9',
    applicableFor: ['house', 'office', 'apartment'],
    popular: false,
    subServices: [
      {
        id: 's14_1',
        titleEn: 'Custom Furniture & Modular Repair',
        titleHi: 'कस्टम फर्नीचर और मरम्मत',
        desc: 'Wardrobes, kitchen cabinets, hinge replacements, and PU polish restoration.',
        checklist: ['Marine ply grade', 'Soft-close hardware fitting', 'Polyurethane spray finish']
      },
      {
        id: 's14_2',
        titleEn: 'Iron & Steel Structure, Sheds & Stairs',
        titleHi: 'लोहे और स्टील के शेड, सीढ़ी व रेलिंग',
        desc: 'TIN shed roofing, spiral MS staircases, balcony safety grills, and gate repair.',
        checklist: ['Heavy gauge MS pipes', 'Anti-rust red oxide primer', 'Precision arc welding']
      }
    ]
  },
  {
    id: '15',
    code: 'PACKERS_MOVERS',
    titleEn: 'Packers & Movers',
    titleHi: 'सामान शिफ्ट करना',
    taglineEn: 'House Shifting, Office Relocation & Packing',
    taglineHi: 'घर और ऑफिस बदलना, सुरक्षित सामान ट्रांसपोर्ट',
    icon: 'Truck',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's15_1',
        titleEn: 'House Shifting & Packaging',
        titleHi: 'घर का सामान पैक करना और शिफ्टिंग',
        desc: '3-layer bubble wrapping, cardboard cartons, careful loading, and safe transit.',
        checklist: ['Fragile crockery boxing', 'Furniture blanket wrap', 'Damage-free guarantee']
      },
      {
        id: 's15_2',
        titleEn: 'Office Shifting & IT Equipment Moving',
        titleHi: 'ऑफिस शिफ्टिंग और कंप्यूटर सुरक्षित ट्रांसपोर्ट',
        desc: 'Systematic server/desktop anti-static wrapping, desk dismantling, and rapid setup.',
        checklist: ['Color-coded carton tagging', 'IT equipment safety boxes', 'Weekend swift move']
      }
    ]
  },
  {
    id: '16',
    code: 'HOUSE_KEEPING',
    titleEn: 'House-Keeping & Help',
    titleHi: 'हाउस-कीपिंग और हाउस हेल्प',
    taglineEn: 'Deep Cleaning, Facility Staff & Post-Renovation',
    taglineHi: 'डीप क्लीनिंग, ट्रेंड स्टाफ और घर-ऑफिस सफाई',
    icon: 'Sparkle',
    color: '#00695C',
    bgColor: '#E0F2F1',
    applicableFor: ['house', 'apartment', 'office'],
    popular: false,
    subServices: [
      {
        id: 's16_1',
        titleEn: 'Deep Building & Home Cleaning',
        titleHi: 'डीप क्लीनिंग (घर और ऑफिस)',
        desc: 'Single-disc floor scrubbing, window glass wash, kitchen degreasing, and sanitization.',
        checklist: ['Mechanized floor polishing', 'Bathroom acid-free descaling', 'Eco-friendly disinfectants']
      },
      {
        id: 's16_2',
        titleEn: 'Post-Renovation & Construction Cleaning',
        titleHi: 'पुट्टी और पेंट के बाद सफाई',
        desc: 'Removing cement splatter, paint residue from tiles, and heavy construction dust evacuation.',
        checklist: ['Industrial vacuuming', 'Paint stain spot removal', 'Move-in ready handover']
      }
    ]
  }
];

// Preset demo cases for 1-click user testing
export const DEMO_PRESETS = [
  {
    name: 'Terrace Seepage',
    serviceCode: 'WATER_LEAKAGE',
    subServiceId: 's02_1',
    propertyType: 'house',
    description: 'During recent rain, water started dripping from ceiling fan point. Damp patches visible across 15x12 ft area on terrace.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
    mockQuote: {
      quoteNumber: 'QTE-7821',
      lineItems: [
        { item: 'Chemical Waterproofing Primer + 2 Coats', qty: 220, unit: 'sq_ft', rate: 45, amount: 9900 },
        { item: 'Crack Injection Polyurethane Grouting', qty: 3, unit: 'points', rate: 450, amount: 1350 },
        { item: 'Labor & Surface Preparation', qty: 1, unit: 'job', rate: 1200, amount: 1200 }
      ],
      materialCost: 11250,
      laborCost: 1200,
      gst: 0,
      totalAmount: 12450,
      timeline: '2 Days Execution',
      warranty: '2 Years Seepage-Free Warranty'
    }
  },
  {
    name: 'Bathroom Wall Dampness',
    serviceCode: 'WATER_LEAKAGE',
    subServiceId: 's02_2',
    propertyType: 'apartment',
    description: 'Flaking paint and white powder efflorescence on bedroom wall adjoining bathroom. Suspecting concealed pipe joint leak.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    mockQuote: {
      quoteNumber: 'QTE-4412',
      lineItems: [
        { item: 'Thermal Camera Leak Scan', qty: 1, unit: 'scan', rate: 500, amount: 500 },
        { item: 'Tile Regrouting with Waterproof Epoxy', qty: 80, unit: 'sq_ft', rate: 25, amount: 2000 },
        { item: 'Damp-Proof Acrylic Sealant Coating', qty: 60, unit: 'sq_ft', rate: 35, amount: 2100 }
      ],
      materialCost: 4100,
      laborCost: 500,
      gst: 0,
      totalAmount: 4600,
      timeline: 'Same-day Execution (4 Hours)',
      warranty: '1 Year Warranty'
    }
  },
  {
    name: 'Broken Tiles Patch Work',
    serviceCode: 'TILE_WORK',
    subServiceId: 's06_2',
    propertyType: 'house',
    description: '4 vitrified floor tiles near kitchen entry cracked due to heavy cylinder impact. Hollow sound under 2 nearby tiles.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    mockQuote: {
      quoteNumber: 'QTE-3109',
      lineItems: [
        { item: 'Tile Extraction & Base Chipping', qty: 6, unit: 'tiles', rate: 150, amount: 900 },
        { item: 'High Strength Polymer Tile Adhesive', qty: 1, unit: 'bag', rate: 650, amount: 650 },
        { item: 'Tile Laying & Color Matching Grout', qty: 6, unit: 'tiles', rate: 200, amount: 1200 }
      ],
      materialCost: 650,
      laborCost: 2100,
      gst: 0,
      totalAmount: 2750,
      timeline: '1 Day Execution',
      warranty: '6 Months Bonding Warranty'
    }
  }
];

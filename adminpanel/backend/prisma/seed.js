const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Neon Database with Services and SubServices...');

  const servicesData = [
    {
      code: "STRUCTURE_REPAIR",
      name: "Structure Repair",
      description: "Repair Roof, Beam, Column & Foundation with polymer reinforcement.",
      icon: "Hammer",
      rating: 4.9,
      subServices: [
        {
          titleEn: "Repair Roof, Beam & Column",
          titleHi: "छत, बीम, खंभे की मरम्मत",
          desc: "Structural strengthening for sagging slabs, cracked beams, and corroded columns.",
          checklist: ["Rebar rust treatment", "Polymer modified mortar patching", "Structural load testing"]
        },
        {
          titleEn: "Fill Cracks & Strengthen",
          titleHi: "दरार भरना और मजबूत करना",
          desc: "Deep epoxy injection and micro-concrete filling for structural settlement cracks.",
          checklist: ["Pressure grouting", "Fiber mesh reinforcement", "Elastic putty seal"]
        },
        {
          titleEn: "Foundation & Safety Check",
          titleHi: "नींव की मजबूती और सुरक्षा जांच",
          desc: "Comprehensive structural audit and soil settlement analysis by civil engineering experts.",
          checklist: ["Settlement audit", "Plinth protection inspection", "Safety certification report"]
        }
      ]
    },
    {
      code: "WATER_LEAKAGE",
      name: "Water Leakage Solutions",
      description: "Stop Roof, Bathroom & Wall Seepage with nano-seal chemical barriers.",
      icon: "Droplets",
      rating: 4.9,
      subServices: [
        {
          titleEn: "Stop Roof & Terrace Leakage",
          titleHi: "छत की लीकेज रोकना",
          desc: "Multi-layer elastomeric polymer waterproofing and joint sealing with ponding test.",
          checklist: ["Thermal leak detection", "Primer + 3 waterproof coats", "2-Year written warranty"]
        },
        {
          titleEn: "Bathroom & Wet Area Seepage",
          titleHi: "बाथरूम की सीलन और लीकेज का इलाज",
          desc: "Concealed pipe inspection, non-invasive tile grouting, and chemical waterproofing.",
          checklist: ["Tile grout replacement", "Trap seal inspection", "Concealed leak scan"]
        },
        {
          titleEn: "Chemical PU Injection & Crack Sealing",
          titleHi: "केमिकल ग्राउटिंग और दरार सीलिंग",
          desc: "High-pressure polyurethane injection into concrete voids to stop running leaks.",
          checklist: ["PU resin injection", "Hydrophobic barrier creation", "Zero-breakage repair"]
        }
      ]
    },
    {
      code: "PLUMBING_ELECTRICAL",
      name: "Plumbing & Electrical",
      description: "Pipes, Drains, Motors, Wiring & MCBs repair with zero unnecessary wall breakage.",
      icon: "Wrench",
      rating: 4.8,
      subServices: [
        {
          titleEn: "Fix Pipes, Drains & Pumps",
          titleHi: "पाइप, नाली और मोटर ठीक करना",
          desc: "Repairing bursts, high-pressure unclogging, booster pump & submersible overhaul.",
          checklist: ["Pressure test for leakage", "Drain blockage removal", "Motor capacitor test"]
        },
        {
          titleEn: "House Wiring & Repair",
          titleHi: "घर की वायरिंग और मरम्मत",
          desc: "Replacing short-circuited concealed wires, load distribution, and earthing.",
          checklist: ["Megger insulation test", "Fire-retardant wiring", "Earthing resistance audit"]
        },
        {
          titleEn: "MCB, Switch & Socket Work",
          titleHi: "MCB, स्विच और सॉकेट बदलना",
          desc: "Distribution board reorganization, trip troubleshooting, and modern modular switches.",
          checklist: ["RCCB / MCB replacement", "Load balance check", "Spark-free contacts"]
        }
      ]
    },
    {
      code: "PAINTING_WALL_REPAIR",
      name: "Painting & Wall Repair",
      description: "Interior & Exterior Weathercoat, Damp Treatment & Putty Leveling.",
      icon: "Paintbrush",
      rating: 4.8,
      subServices: [
        {
          titleEn: "Interior & Exterior Painting",
          titleHi: "घर के अंदर और बाहर पेंट",
          desc: "Anti-fungal exterior weathercoat and premium washable interior luxury emulsions.",
          checklist: ["Wall moisture measurement", "Surface sanding & primer", "Double coat finish"]
        },
        {
          titleEn: "Putty, POP & Crack Repair",
          titleHi: "पुट्टी, POP और दरार ठीक करना",
          desc: "Damp-resistant acrylic putty leveling, POP cornices, and plaster patching.",
          checklist: ["Crack widening & mesh", "Waterproof putty base", "Smooth machine sanding"]
        },
        {
          titleEn: "Wall Cleaning & Efflorescence (Shora) Removal",
          titleHi: "दीवार सफाई और शोरा का इलाज",
          desc: "Chemical treatment for white salt efflorescence powder flaking off walls.",
          checklist: ["Algae/fungus treatment", "Shora barrier coat", "Spot match paint"]
        }
      ]
    },
    {
      code: "TILE_WORK",
      name: "Tile & Marble Work",
      description: "Floor & Wall Tiling, Replace Broken Tiles & Waterproof Epoxy Grout.",
      icon: "Grid",
      rating: 4.9,
      subServices: [
        {
          titleEn: "Floor & Wall Tiling",
          titleHi: "फर्श और दीवार पर टाइल्स लगाना",
          desc: "Laser-leveled installation of vitrified tiles, granite, marble, and mosaic.",
          checklist: ["Sub-floor leveling", "Polymer adhesive bedding", "Laser alignment check"]
        },
        {
          titleEn: "Replace Broken / Hollow Tiles",
          titleHi: "टूटी या ढीली टाइल्स बदलना",
          desc: "Surgical extraction of damaged tiles without breaking neighboring tiles.",
          checklist: ["Careful chisel extraction", "Fresh adhesive base", "Precise grout match"]
        },
        {
          titleEn: "Tile Repair & Epoxy Grouting",
          titleHi: "टाइल्स मरम्मत और एपॉक्सी ग्राउटिंग",
          desc: "Waterproof anti-stain epoxy grouting for bathrooms, kitchens, and balconies.",
          checklist: ["Old grout removal", "Chemical disinfection", "Epoxy waterproof seal"]
        }
      ]
    }
  ];

  for (const s of servicesData) {
    const { subServices, ...serviceFields } = s;

    // 1. Upsert Service
    const service = await prisma.service.upsert({
      where: { code: s.code },
      update: serviceFields,
      create: serviceFields
    });

    // 2. Delete existing subservices for this service to re-seed fresh
    await prisma.subService.deleteMany({
      where: { serviceId: service.id }
    });

    // 3. Create subServices
    for (const sub of subServices) {
      await prisma.subService.create({
        data: {
          serviceId: service.id,
          titleEn: sub.titleEn,
          titleHi: sub.titleHi,
          desc: sub.desc,
          checklist: sub.checklist
        }
      });
    }
  }

  console.log('✅ Services and SubServices successfully Seeded into Neon DB!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

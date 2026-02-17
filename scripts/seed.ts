import "dotenv/config";

import { db } from "../lib/db";
import { cars, content } from "../lib/db/schema";

const sampleCars = [
  {
    name: "Astra Terra X",
    slug: "astra-terra-x",
    priceFrom: 34900,
    bodyType: "SUV",
    description:
      "A confident midsize SUV with hybrid-ready architecture, panoramic visibility, and adaptive drive modes.",
    featured: true,
    specs: {
      Power: "245 hp",
      Drivetrain: "AWD",
      Range: "520 km",
      Seats: "5",
    },
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Astra Urban E",
    slug: "astra-urban-e",
    priceFrom: 28900,
    bodyType: "Crossover",
    description:
      "Compact crossover engineered for city efficiency with quick charging support and agile handling.",
    featured: true,
    specs: {
      Power: "190 hp",
      Drivetrain: "FWD",
      Range: "430 km",
      Seats: "5",
    },
    images: [
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    name: "Astra Voyager 7",
    slug: "astra-voyager-7",
    priceFrom: 42900,
    bodyType: "SUV",
    description:
      "Family-focused seven-seater with flexible cargo layout, advanced safety suite, and long-range touring comfort.",
    featured: true,
    specs: {
      Power: "260 hp",
      Drivetrain: "AWD",
      Range: "610 km",
      Seats: "7",
    },
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?auto=format&fit=crop&w=1400&q=80",
    ],
  },
];

const homepageContent = {
  hero: {
    eyebrow: "Astra 2026 lineup",
    title: "Contemporary mobility designed around real life.",
    subtitle:
      "Explore connected SUVs and crossovers engineered for efficiency, comfort, and confident everyday driving.",
    primaryCta: { label: "Book a test drive", href: "/book-test-drive" },
    secondaryCta: { label: "Browse models", href: "/models" },
  },
  highlights: [
    {
      title: "Predictive safety systems",
      description: "Lane, distance, and collision assist features standard on core trims.",
    },
    {
      title: "Connected cockpit",
      description: "Large-format displays, voice controls, and OTA software updates.",
    },
    {
      title: "Low-emission performance",
      description: "Hybrid-ready platforms tuned for smooth torque and efficient cruising.",
    },
  ],
};

async function seed() {
  for (const car of sampleCars) {
    await db
      .insert(cars)
      .values({
        ...car,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cars.slug,
        set: {
          name: car.name,
          priceFrom: car.priceFrom,
          bodyType: car.bodyType,
          description: car.description,
          featured: car.featured,
          specs: car.specs,
          images: car.images,
          updatedAt: new Date(),
        },
      });
  }

  await db
    .insert(content)
    .values({
      key: "homepage",
      value: homepageContent,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: content.key,
      set: {
        value: homepageContent,
        updatedAt: new Date(),
      },
    });

  console.log("Seed completed");
}

seed()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });

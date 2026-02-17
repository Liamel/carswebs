import "dotenv/config";

import { db } from "../lib/db";
import { cars, content, homepageSlides } from "../lib/db/schema";

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

const sampleSlides = [
  {
    id: "a06260e2-b58a-4ba3-9d7a-8430f6ac2b2f",
    title: "Astra Terra X",
    description: "Confident SUV comfort built for every weekday and every weekend.",
    imageUrl:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80",
    ctaLabel: "Explore Terra X",
    ctaHref: "/models/astra-terra-x",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "2585b170-2ec9-4f65-9b27-4720b4245fd7",
    title: "Astra Urban E",
    description: "Compact electric-ready crossover designed for city agility.",
    imageUrl:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1600&q=80",
    ctaLabel: "See Urban E",
    ctaHref: "/models/astra-urban-e",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "b8ac8451-f7dd-42eb-9c9c-04ba3a6a9e2f",
    title: "Astra Voyager 7",
    description: "Seven-seat versatility with road-trip range and premium safety tech.",
    imageUrl:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80",
    ctaLabel: "View Voyager 7",
    ctaHref: "/models/astra-voyager-7",
    sortOrder: 2,
    isActive: true,
  },
] as const;

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

  for (const slide of sampleSlides) {
    await db
      .insert(homepageSlides)
      .values({
        ...slide,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: homepageSlides.id,
        set: {
          title: slide.title,
          description: slide.description,
          imageUrl: slide.imageUrl,
          ctaLabel: slide.ctaLabel,
          ctaHref: slide.ctaHref,
          sortOrder: slide.sortOrder,
          isActive: slide.isActive,
          updatedAt: new Date(),
        },
      });
  }

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

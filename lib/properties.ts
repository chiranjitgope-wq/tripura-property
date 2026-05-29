export type PropertyType = "house" | "flat" | "plot" | "rent";

export type Property = {
  id: string;
  slug: string;
  type: PropertyType;
  featured: boolean;
  premium: boolean;
  verified?: boolean;
  urgent_sale?: boolean;
  title: string;
  location: string;
  price: string;
  priceValue: number;
  area: string;
  beds?: number;
  baths?: number;
  description: string;
  image: string;
  images: string[];
  whatsappMessage: string;
  stats: string[];
  youtubeUrl?: string;
};

export const properties: Property[] = [
  {
    id: "plot-1",
    slug: "premium-road-facing-plot-agartala",
    type: "plot",
    featured: true,
    premium: true,
    verified: true,
    urgent_sale: false,
    title: "Premium Road Facing Plot",
    location: "Agartala, Tripura",
    price: "₹18.00 Lakh",
    priceValue: 1800000,
    area: "1800 Sqft",
    description:
      "A premium road-facing residential plot in a growing location with strong investment potential.",
    image:
      "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage:
      "Hi, I want details about Premium Road Facing Plot in Agartala.",
    stats: ["1800 Sqft", "Road Facing", "Prime Location"],
  },
  {
    id: "plot-2",
    slug: "residential-corner-plot-ujjayanta",
    type: "plot",
    featured: true,
    premium: false,
    verified: true,
    urgent_sale: false,
    title: "Residential Corner Plot",
    location: "Ujjayanta Palace Road",
    price: "₹22.00 Lakh",
    priceValue: 2200000,
    area: "2400 Sqft",
    description:
      "Corner plot with excellent road connectivity, suitable for house construction or investment.",
    image:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage:
      "Hi, I want details about Residential Corner Plot in Ujjayanta Palace Road.",
    stats: ["2400 Sqft", "Corner Plot", "Prime Location"],
  },
  {
    id: "flat-1",
    slug: "2-bhk-flat-kunjaban-agartala",
    type: "flat",
    featured: true,
    premium: true,
    verified: true,
    urgent_sale: false,
    title: "2 BHK Flat",
    location: "Kunjaban, Agartala",
    price: "₹32.00 Lakh",
    priceValue: 3200000,
    area: "950 Sqft",
    beds: 2,
    baths: 2,
    description:
      "Modern flat for sale with clean interiors, good ventilation, and a family-friendly location.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage: "Hi, I want details about 2 BHK Flat in Kunjaban, Agartala.",
    stats: ["2 Beds", "2 Baths", "950 Sqft"],
  },
  {
    id: "flat-2",
    slug: "3-bhk-premium-flat-agartala",
    type: "flat",
    featured: true,
    premium: false,
    verified: false,
    urgent_sale: true,
    title: "3 BHK Premium Flat",
    location: "Agartala, Tripura",
    price: "₹48.00 Lakh",
    priceValue: 4800000,
    area: "1250 Sqft",
    beds: 3,
    baths: 2,
    description:
      "Spacious premium flat for families looking for comfort, location, and good resale value.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage: "Hi, I want details about 3 BHK Premium Flat in Agartala.",
    stats: ["3 Beds", "2 Baths", "1250 Sqft"],
  },
  {
    id: "house-1",
    slug: "3-bhk-independent-house-agartala",
    type: "house",
    featured: true,
    premium: false,
    verified: true,
    urgent_sale: false,
    title: "3 BHK Independent House",
    location: "Agartala, Tripura",
    price: "₹45.00 Lakh",
    priceValue: 4500000,
    area: "1200 Sqft",
    beds: 3,
    baths: 2,
    description:
      "A neat independent house for sale in a peaceful residential area with good road access.",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage:
      "Hi, I want details about 3 BHK Independent House in Agartala.",
    stats: ["3 Beds", "2 Baths", "1200 Sqft"],
  },
  {
    id: "rent-1",
    slug: "2-bhk-family-home-rk-nagar",
    type: "rent",
    featured: false,
    premium: false,
    verified: false,
    urgent_sale: false,
    title: "2 BHK Family Home",
    location: "R.K. Nagar, Agartala",
    price: "₹12,000 /month",
    priceValue: 12000,
    area: "850 Sqft",
    beds: 2,
    baths: 1,
    description:
      "Affordable family home for rent in a convenient location, suitable for small families.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    ],
    whatsappMessage:
      "Hi, I want details about 2 BHK Family Home in R.K. Nagar, Agartala.",
    stats: ["2 Beds", "1 Bath", "850 Sqft"],
  },
];
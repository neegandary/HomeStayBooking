import { Room } from '@/types/room';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Cozy Garden Suite',
    description: 'A peaceful retreat with garden views and modern amenities. Perfect for couples seeking a quiet getaway.',
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'AC', 'Breakfast', 'Garden View'],
    available: true,
  },
  {
    id: '2',
    name: 'Modern Loft Apartment',
    description: 'Centrally located loft with industrial design. High ceilings and plenty of natural light.',
    price: 200,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 3,
    amenities: ['Wifi', 'AC', 'Kitchen', 'Workspace'],
    available: true,
  },
  {
    id: '3',
    name: 'Seaside Villa',
    description: 'Stunning villa just steps away from the beach. Features a private pool and spacious deck.',
    price: 450,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 6,
    amenities: ['Wifi', 'AC', 'Private Pool', 'Ocean View', 'Kitchen'],
    available: true,
  },
  {
    id: '4',
    name: 'Mountain Cabin',
    description: 'Rustic cabin with cozy fireplace. Ideal for hiking enthusiasts and nature lovers.',
    price: 150,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1449156001533-cb39c7160759?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 4,
    amenities: ['Wifi', 'Fireplace', 'Mountain View', 'Hiking Trails'],
    available: true,
  },
  {
    id: '5',
    name: 'Urban Studio',
    description: 'Sleek studio in the heart of the city. Close to main attractions and public transport.',
    price: 95,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 2,
    amenities: ['Wifi', 'AC', 'Gym Access', 'City View'],
    available: true,
  },
  {
    id: '6',
    name: 'Heritage Home',
    description: 'Classic architecture meets modern comfort in this beautifully restored heritage house.',
    price: 180,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    ],
    capacity: 5,
    amenities: ['Wifi', 'AC', 'Breakfast Included', 'Historical District'],
    available: true,
  }
];
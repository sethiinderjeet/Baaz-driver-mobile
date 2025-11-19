// app/api/jobs.ts
export type Delivery = {
  id: string;
  title: string;      // e.g. "Deliver - Order #1234"
  short: string;      // short note
  pickupAddress: string;
  dropoffAddress: string;
  recipient: string;
  phone?: string;
  eta?: string;       // e.g. '11:30 AM'
  status?: string;    // Assigned / In Transit / Delivered
  priority?: string;  // Low / Normal / High
  notes?: string;
};

export async function fetchAssignedDeliveriesApi(token: string): Promise<Delivery[]> {
  // MOCK list - replace with real fetch when backend ready
  await new Promise((r) => setTimeout(r, 600));
  return [
    {
      id: 'D-1001',
      title: 'Deliver - Order #1001',
      short: 'Fragile - Handle with care',
      pickupAddress: 'Baaz Warehouse 7, Industrial Area A',
      dropoffAddress: '12A, Vineet Colony, Jaipur',
      recipient: 'Mr. Suresh',
      phone: '+91-98765-43210',
      eta: 'Today 11:00 - 12:00',
      status: 'Assigned',
      priority: 'High',
      notes: 'Collect COD ₹450'
    },
    {
      id: 'D-1002',
      title: 'Deliver - Order #1002',
      short: 'Documents - signature required',
      pickupAddress: 'Baaz Hub, Sector 9, Jaipur',
      dropoffAddress: 'Plot 45, Green Park, Jaipur',
      recipient: 'Ms. Rekha',
      phone: '+91-91234-56789',
      eta: 'Today 14:00 - 16:00',
      status: 'Assigned',
      priority: 'Normal',
      notes: 'Call before arrival'
    },
    {
      id: 'D-1003',
      title: 'Pickup - Return #1003',
      short: 'Return pickup from customer',
      pickupAddress: 'Shop 3, Market Lane, Jaipur',
      dropoffAddress: 'Baaz Returns Center, Warehouse 7',
      recipient: 'Shop Owner',
      phone: '+91-99887-77665',
      eta: 'Today 15:30',
      status: 'Open',
      priority: 'Normal',
      notes: 'Box sealed'
    },
  ];
}

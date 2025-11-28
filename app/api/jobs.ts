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
  dropoffLat?: number;
  dropoffLng?: number;
  zipCode?: string;
};

export async function fetchAssignedDeliveriesApi(token: string): Promise<Delivery[]> {
  // MOCK list - replace with real fetch when backend ready
  await new Promise((r) => setTimeout(r, 600));
  return [
    {
      id: 'D-1001',
      title: 'Deliver - Order #1001',
      short: 'Fragile - Handle with care',
      pickupAddress: 'Unit 5, Industrial Estate, Birmingham B25 8HE',
      dropoffAddress: '10 Downing Street, London SW1A 2AA',
      recipient: 'Mr. Suresh',
      phone: '+91-98765-43210',
      eta: 'Today 11:00 - 12:00',
      status: 'Assigned',
      priority: 'High',
      notes: 'Collect COD ₹450',
      dropoffLat: 26.885141,
      dropoffLng: 75.790558,
      zipCode: 'B25 8HE'
    },
    {
      id: 'D-1002',
      title: 'Deliver - Order #1002',
      short: 'Documents - signature required',
      pickupAddress: 'Manchester Airport, Manchester M90 1QX',
      dropoffAddress: 'Old Trafford, Sir Matt Busby Way, Manchester M16 0RA',
      recipient: 'Ms. Rekha',
      phone: '+91-91234-56789',
      eta: 'Today 14:00 - 16:00',
      status: 'Assigned',
      priority: 'Normal',
      notes: 'Call before arrival',
      dropoffLat: 26.912434,
      dropoffLng: 75.787270,
      zipCode: 'M16 0RA'
    },
    {
      id: 'D-1003',
      title: 'Pickup - Return #1003',
      short: 'Return pickup from customer',
      pickupAddress: 'Edinburgh Castle, Castlehill, Edinburgh EH1 2NG',
      dropoffAddress: 'Scottish Parliament, Edinburgh EH99 1SP',
      recipient: 'Shop Owner',
      phone: '+91-99887-77665',
      eta: 'Today 15:30',
      status: 'Open',
      priority: 'Normal',
      notes: 'Box sealed',
      dropoffLat: 26.855123,
      dropoffLng: 75.821123,
      zipCode: 'EH99 1SP'
    },
  ];
}

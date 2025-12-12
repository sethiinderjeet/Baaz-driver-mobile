// app/api/jobs.ts
export type Delivery = {
  id: string; // Will store trackingNumber or unique ID for UI lists
  jobId: number; // Backend ID for navigation
  trackingNumber: string; // Displayed tracking ID
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
  currentJobStatus: number; // 0-6
  nextStep: number;         // 0-6
};

export const JOB_STATUS = {
  ASSIGNED: 1,
  ON_THE_WAY: 2,
  ON_PICKUP_SITE: 3,
  LOADED: 4,
  ON_DROP_SITE: 5,
  DELIVERED: 6,
  COMPLETED: 7,
};

export const STATUS_LABELS = [
  "Job Assigned",
  "On the Way",
  "On Pickup Site",
  "Loaded",
  "On Drop Site",
  "Delivered",
  "Job Complete"
];

export const STATUS_COLORS = [
  "#0b6eaa", // Assigned - Blue
  "#f59e0b", // On the Way - Amber
  "#8b5cf6", // On Pickup Site - Violet
  "#10b981", // Loaded - Emerald
  "#3b82f6", // On Drop Site - Blue
  "#ef4444", // Delivered - Red
  "#64748b"  // Completed - Slate
];

import { API_BASE_URL } from '../constants/config';

export type JobResponse = {
  jobId: number;
  trackingNumber: string;
  title: string;
  short: string;
  pickupAddress: string;
  pickupLocation?: string; // Add optional to match detailed response
  pickupPostCode: string;
  dropoffAddress: string;
  dropoffPostCode: string;
  recipient: string;
  phone: string;
  eta: string;
  status: string; // Changed to string
  priority: string;
  notes: string;
  nextStep: string;
};

export interface Stop {
  id: number;
  address: string;
  sequenceOrder: number;
  status: string;
  contactName: string;
  contactPhone: string;
  notes: string;
}

export interface StatusHistory {
  currentStatusHistoryID: number;
  jobId: number;
  currentStatusId: number;
  currentStatusName: string;
  nextStatusId: number;
  nextStatusName: string;
  pendingStopId: number;
  notes: string | null;
  createdDate: string;
}

export interface JobDetail extends JobResponse {
  clientName: string;
  clientPhone: string;
  driverName: string;
  truckNo: string;
  pickupDateTime: string;
  stops: Stop[];
  statusHistory: StatusHistory[];
  attachments: any[]; // Define specific type if known, using any[] for now based on []
}

export async function fetchJobsApi(driverId: number): Promise<JobResponse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/Jobs/${driverId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch jobs error', error);
    throw error;
  }
}

export async function fetchJobDetailApi(jobId: number): Promise<JobDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/Jobs/detail/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job detail');
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch detail error', error);
    throw error; // Re-throw to handle in UI
  }
}

export async function fetchAssignedDeliveriesApi(token: string): Promise<Delivery[]> {
  // MOCK list - replace with real fetch when backend ready
  await new Promise((r) => setTimeout(r, 600));
  return [
    {
      id: 'D-1001',
      jobId: 1001,
      trackingNumber: 'D-1001',
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
      zipCode: 'B25 8HE',
      currentJobStatus: 0,
      nextStep: 1
    },
    {
      id: 'D-1002',
      jobId: 1002,
      trackingNumber: 'D-1002',
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
      zipCode: 'M16 0RA',
      currentJobStatus: 0,
      nextStep: 1
    },
    {
      id: 'D-1003',
      jobId: 1003,
      trackingNumber: 'D-1003',
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
      zipCode: 'EH99 1SP',
      currentJobStatus: 0,
      nextStep: 1
    },
  ];
}

// types.ts (or top of file)
export interface UploadFile {
  uri: string;       // file://, blob:, http(s):// or content:// (may need conversion)
  name?: string;     // filename to send to server
  type?: string;     // mime type e.g. "image/jpeg"
}

export interface JobStatusHistoryRequest {
  JobId: number;
  StopId?: number | null;
  StatusId: number;
  StatusTime: string | Date;
  Latitude?: number | null;
  Longitude?: number | null;
  Notes?: string | null;
  CreatedBy?: string | null;
  Files?: UploadFile[] | null;
}

export async function updateJobStatusApi(token: string, jobId: string, status: number): Promise<boolean> {
  // Mock API call
  console.log(`[API] Updating job ${jobId} status to ${status}`);
  await new Promise((r) => setTimeout(r, 500));
  return true;
}


export async function postJobStatusHistory(payload: JobStatusHistoryRequest) {
  const formData = new FormData();

  // Append non-file fields
  (Object.keys(payload) as Array<keyof JobStatusHistoryRequest>).forEach(key => {
    if (key !== "Files") {
      formData.append(key, String(payload[key] ?? ""));
    }
  });

  // Append files
  payload.Files?.forEach((file, index) => {
    formData.append(
      "Files",
      {
        uri: file.uri,
        name: file.name ?? "image.jpg",
        type: file.type || "application/octet-stream",
      } as any
    );
  });

  const response = await fetch(API_BASE_URL + "/JobStatusHistory", {
    method: "POST",
    body: formData,   //  DO NOT SET HEADERS!! Android will break.
  });

  return await response.json();
}

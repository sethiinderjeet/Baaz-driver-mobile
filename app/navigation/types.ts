// app/navigation/types.ts
export type RootStackParamList = {
  Login: undefined;
  Jobs: undefined; // we'll keep the name "Jobs" for stack-route compatibility
  JobDetail: { job: {
    id: string;
    title: string;
    short: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    recipient?: string;
    phone?: string;
    eta?: string;
    status?: string;
    priority?: string;
    notes?: string;
  } };
};

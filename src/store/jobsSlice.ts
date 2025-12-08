import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Delivery, JobResponse } from '../api/jobs';

interface JobsState {
    jobs: Delivery[];
}

const initialState: JobsState = {
    jobs: [],
};

const jobsSlice = createSlice({
    name: 'jobs',
    initialState,
    reducers: {
        setJobs(state, action: PayloadAction<Delivery[]>) {
            state.jobs = action.payload;
        },
        // Adapter reducer to convert API response to UI Delivery model
        setJobSummaries(state, action: PayloadAction<JobResponse[]>) {
            state.jobs = action.payload.map(s => ({
                id: s.trackingNumber, // Use trackingNumber as unique ID for list
                jobId: s.jobId,
                trackingNumber: s.trackingNumber,
                title: s.title,
                short: s.short,
                recipient: s.recipient,
                pickupAddress: s.pickupAddress,
                dropoffAddress: s.dropoffAddress,
                phone: s.phone,
                eta: s.eta,
                priority: s.priority,
                notes: s.notes,
                zipCode: s.dropoffPostCode,

                // State management
                status: s.status,
                currentJobStatus: 0,
                nextStep: parseInt(s.nextStep, 10) || 0,
            }));
        },
        updateJobStatus(state, action: PayloadAction<{ jobId: string; status: number; nextStep: number }>) {
            const job = state.jobs.find((j) => j.id === action.payload.jobId);
            if (job) {
                job.currentJobStatus = action.payload.status;
                job.nextStep = action.payload.nextStep;
            }
        },
    },
});

export const { setJobs, updateJobStatus, setJobSummaries } = jobsSlice.actions;
export default jobsSlice.reducer;

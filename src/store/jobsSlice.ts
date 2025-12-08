import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Delivery, JobSummary } from '../api/jobs';

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
        // Adapter reducer to convert API summary to UI Delivery model
        setJobSummaries(state, action: PayloadAction<JobSummary[]>) {
            state.jobs = action.payload.map(s => ({
                id: s.trackingNumber,
                title: s.jobTitle,
                short: `${s.totalStops} stop(s)`,
                recipient: s.clientName,
                // Placeholders for required fields in Delivery type:
                pickupAddress: '',
                dropoffAddress: '',
                currentJobStatus: 0,
                nextStep: 0,
                // ... map defaults
                status: 'Assigned',
                priority: 'Normal',
                eta: '--',
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

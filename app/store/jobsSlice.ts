import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Delivery } from '../api/jobs';

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
        updateJobStatus(state, action: PayloadAction<{ jobId: string; status: number; nextStep: number }>) {
            const job = state.jobs.find((j) => j.id === action.payload.jobId);
            if (job) {
                job.currentJobStatus = action.payload.status;
                job.nextStep = action.payload.nextStep;
            }
        },
    },
});

export const { setJobs, updateJobStatus } = jobsSlice.actions;
export default jobsSlice.reducer;

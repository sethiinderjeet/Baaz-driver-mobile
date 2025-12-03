import { Delivery } from '../api/jobs';

export type RootStackParamList = {
  Login: undefined;
  Jobs: undefined; // we'll keep the name "Jobs" for stack-route compatibility
  JobDetail: {
    job: Delivery;
  };
};

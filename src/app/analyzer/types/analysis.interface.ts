import { Request } from './request.interface';

export interface Analysis {
    rangeOfSimultaneousReqestsQueries: {from: number, to: number};
    step: number,
    queryTime: number;
    requestsQuery: Array<Request>;
}

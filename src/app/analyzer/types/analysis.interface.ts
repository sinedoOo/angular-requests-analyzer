import { AnalyzerRequest } from './analyzerRequest.interface';

export interface Analysis {
    rangeOfSimultaneousReqestsQueries: {from: number, to: number};
    step: number,
    queryTime: number;
    requestsQuery: Array<AnalyzerRequest>;
}

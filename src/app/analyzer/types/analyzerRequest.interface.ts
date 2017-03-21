import { HttpRequestType } from './httpRequestType.enum';

export interface AnalyzerRequest {
    type: HttpRequestType;
    url: string;
    headers?: any;
    data?: any;
}

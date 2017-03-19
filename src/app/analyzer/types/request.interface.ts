import { HttpRequestType } from './httpRequestType.enum';

export interface Request {
    type: HttpRequestType;
    url: string;
    headers?: any;
    data?: any;
}

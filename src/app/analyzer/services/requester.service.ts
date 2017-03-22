import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import { Analysis } from './../types/analysis.interface';
import { AnalyzerRequest } from './../types/analyzerRequest.interface';
import { HttpRequestType } from './../types/httpRequestType.enum';
import { RequesterResult } from './../types/requesterResult.interface';

@Injectable()
export class Requester {
    public queryProgress: number = 0;

    private analysis: Analysis = null;
    private query: Array<Array<{
        request: AnalyzerRequest,
        result: RequesterResult}>> = [];

    constructor(private http: Http) {}

    public setAnalysis(analysis: Analysis): boolean {
        if (!analysis) {
            return false;
        }

        this.analysis = analysis;

        if (!this.generateRequestsQuery()) {
            return false;
        }

        return true;
    }

    private generateRequestsQuery(): boolean {
        this.query = [];
        let range = this.analysis.rangeOfSimultaneousReqestsQueries;
        let step = this.analysis.step || 1;

        for (let queryCount = range.from;
            queryCount <= range.to;
            queryCount += step) {
            let queryItems = [];
            let baseRequest = this.analysis.requestsQuery;
            let baseRequestIterator = 0;

            for (let i = 0; i < queryCount; i++) {
                if (baseRequestIterator > baseRequest.length - 1) {
                    baseRequestIterator = 0;
                }

                queryItems.push({
                    request: baseRequest[baseRequestIterator],
                    result: {
                        count: 0,
                        interrupts: 0,
                        delay: {
                            min: 0,
                            avg: 0,
                            max: 0
                        }
                    }
                });

                baseRequestIterator++;
            }

            this.query.push(queryItems);
        }

        return true;
    }

    public execute(): number {
        if (!this.analysis) {
            return 0;
        }

        this.queryProgress = 0;
        let queryTime: number = this.analysis.queryTime;

        let doneCount = 0;
        for (let queryItem of this.query) {
            (function(doneCount, requester) {
                setTimeout(() => {
                    for (let executionItem of queryItem) {
                        let request = executionItem.request;
                        let result = executionItem.result;
                        let startDate: number = new Date().getTime();
                        let expireDate: number = new Date().getTime() + queryTime;

                        requester.processRequest(request, result, startDate, expireDate);
                    }

                    requester.queryProgress += 1 / requester.query.length;
                },(queryTime) * doneCount);
            })(doneCount, this);
            doneCount++;
        }

        return (queryTime) * (this.query.length + 1);
    }

    private processRequest(
        request: AnalyzerRequest,
        result: RequesterResult,
        startDate: number,
        expireDate: number): void {
        let now: number = new Date().getTime();

        if (now > expireDate) {
            return;
        }

        let executionObject = null;
        let options = null;

        if (request.headers) {
            let headers = new Headers(request.headers);
            options = new RequestOptions({ headers: headers });
        }

        switch (request.type) {
            case HttpRequestType.GET:
                if (options) {
                    executionObject = this.http.get(request.url, options);
                }else{
                    executionObject = this.http.get(request.url);
                }
                break;
            case HttpRequestType.POST:
                if (!request.data) {
                    break;
                }
                if (options) {
                    executionObject = this.http.post(request.url, request.data, options);
                }else{
                    executionObject = this.http.post(request.url, request.data);
                }
                break;
        }

        if (!executionObject) {
            return;
        }

        executionObject.subscribe(
            data => {
                let delay: number = new Date().getTime() - startDate;
                result.count++;
                result.delay.avg += delay;
                result.delay.min = Math.min(
                    result.delay.min,
                    delay
                );
                result.delay.max = Math.max(
                    result.delay.max,
                    delay
                );
                this.processRequest(request, result, now, expireDate);
            },
            data => {
                let delay: number = new Date().getTime() - startDate;
                result.count++;
                result.interrupts++;
                result.delay.avg += delay;
                result.delay.min = Math.min(
                    result.delay.min,
                    delay
                );
                result.delay.max = Math.max(
                    result.delay.max,
                    delay
                );
                this.processRequest(request, result, now, expireDate);
            }
        );
    }

    public getFlattenResults(): Array<{
            simultaneousReqestsCount: number,
            results: RequesterResult}> {
        return this.query.map(queryItem => {
            let summaryResults: RequesterResult = {
                count: 0,
                interrupts: 0,
                delay: {
                    min: Number.MAX_SAFE_INTEGER,
                    avg: 0,
                    max: 0
                }
            };

            for (let request of queryItem) {
                summaryResults.count += request.result.count;
                summaryResults.interrupts += request.result.interrupts;
                summaryResults.delay.min = Math.min(
                    request.result.delay.min,
                    summaryResults.delay.min
                );
                summaryResults.delay.avg += request.result.delay.avg;
                summaryResults.delay.max = Math.max(
                    request.result.delay.max,
                    summaryResults.delay.max
                );
            }

            summaryResults.delay.avg =
                (summaryResults.delay.avg / summaryResults.count) || 0;

            return {
                simultaneousReqestsCount: queryItem.length,
                results: summaryResults
            };
        });
    }
}

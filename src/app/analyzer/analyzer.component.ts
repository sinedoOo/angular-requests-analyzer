import { Component, OnInit } from '@angular/core';

import { Analysis } from './types/analysis.interface';
import { RequesterResult } from './types/requesterResult.interface';
import { Requester } from './services/requester.service';
import { HttpRequestType } from './types/httpRequestType.enum';
import { AnalyzerRequest } from './types/analyzerRequest.interface';

@Component({
    selector: 'analyzer',
    providers: [],
    styleUrls: ['./analyzer.component.scss'],
    templateUrl: './analyzer.component.html'
})
export class AnalyzerComponent implements OnInit {
    public analysis: Analysis = null;
    public executingAnalysis: boolean = false;
    public executedAnalysis: boolean = false;
    public requestsData: any[][] = null;
    public requestsDataOptions = {
        isStacked: true,
        title: 'Ilość wykonanych zapytań',
        curveType: 'function',
        vAxis: { title: 'Ilość zapytań' },
        hAxis: { title: 'Ilość równoległych zapytań w zadanym oknie czasu' }
    };
    public delayData: any[][] = null;
    public delayDataOptions = {
        title: 'Opóźnienia wykonywanych zapytań',
        curveType: 'function',
        vAxis: { title: 'Opóźnienie zapytań' },
        hAxis: { title: 'Ilość równoległych zapytań w zadanym oknie czasu' }
    };

    public currentRequest: AnalyzerRequest = null;
    public httpMethods = [
        {
            value: HttpRequestType.GET,
            name: 'GET',
            data: true
        },
        {
            value: HttpRequestType.POST,
            name: 'POST',
            data: false
        }
    ];
    public currentRequestNewHeader: { key: string, value: string } = {
        key: '',
        value: ''
    };

    private results: Array<{
        simultaneousReqestsCount: number,
        results: RequesterResult
    }> = null;

    constructor(
        public requester: Requester
    ) { }

    public ngOnInit() {
        let savedAnalysis = JSON.parse(localStorage.getItem('analysis'));

        if (savedAnalysis) {
            this.analysis = savedAnalysis;
            return true;
        }

        this.analysis = {
            queryTime: 3000,
            rangeOfSimultaneousReqestsQueries: {
                from: 100,
                to: 700
            },
            requestsQuery: [],
            step: 100
        };
    }

    public executeAnalysis(): boolean {
        if (!this.requester.setAnalysis(this.analysis)) {
            return false;
        }

        this.executingAnalysis = true;
        let executionTimeout: number = this.requester.execute();

        (function(executionTimeout, analyzer) {
            setTimeout(() => {
                analyzer.results = analyzer.requester.getFlattenResults();
                analyzer.requestsData = analyzer.prepareGoogleChartsRequestsData(analyzer.results);
                analyzer.delayData = analyzer.prepareGoogleChartsDelayData(analyzer.results);
                analyzer.executingAnalysis = false;
                analyzer.executedAnalysis = true;
            }, executionTimeout);
        })(executionTimeout, this);

        return true;
    }

    /* stacked area charts for requests */
    private prepareGoogleChartsRequestsData(
        results: Array<{
            simultaneousReqestsCount: number,
            results: RequesterResult
        }>
    ): any[][] {
        let data = [];

        data.push([
            'Ilość równoległych zapytań w zadanym oknie czasu',
            'Zapytania zakończone sukcesem',
            'Zapytania nieudane',
        ]);

        for (let result of results) {
            data.push([
                result.simultaneousReqestsCount,
                result.results.count - result.results.interrupts,
                result.results.interrupts
            ]);
        }

        return data;
    }

    /* non stacked area charts for delay */
    private prepareGoogleChartsDelayData(
        results: Array<{
            simultaneousReqestsCount: number,
            results: RequesterResult
        }>
    ): any[][] {
        let data = [];

        data.push([
            'Ilość równoległych zapytań w zadanym oknie czasu',
            'Minimalne opóźnienie zapytania',
            'Średnie opóźnienie zapytania',
            'Maksymalne opóźnienie zapytania'
        ]);

        for (let result of results) {
            data.push([
                result.simultaneousReqestsCount,
                result.results.delay.min,
                result.results.delay.avg,
                result.results.delay.max
            ]);
        }

        return data;
    }

    public selectCurrentRequest(request: AnalyzerRequest): AnalyzerRequest {
        this.currentRequest = request;

        this.currentRequestNewHeader = {
            key: '',
            value: ''
        };

        return this.currentRequest;
    }

    public addNewRequest(): AnalyzerRequest {
        let request = {
            type: HttpRequestType.GET,
            url: 'http://localhost/',
            headers: null,
            data: null
        };

        this.analysis.requestsQuery.push(request);

        return request;
    }

    public removeCurrentRequest(): AnalyzerRequest {
        let request = this.currentRequest;
        let currentRequestIndex = this.analysis.requestsQuery.indexOf(request);

        if (currentRequestIndex > -1)
        {
            this.analysis.requestsQuery.splice(currentRequestIndex, 1);
        }

        this.currentRequest = null;

        return request;
    }

    public addNewHeader(): boolean {
        let key = this.currentRequestNewHeader.key;
        let value = this.currentRequestNewHeader.value;

        if (!key.length || !value.length)
            return false;

        if (!this.currentRequest.headers)
            this.currentRequest.headers = {};

        this.currentRequest.headers[key] = value;

        this.currentRequestNewHeader = {
            key: '',
            value: ''
        };

        return true;
    }

    public deleteCurrentRequestHeader(key: string): boolean {
        if (!this.currentRequest.headers[key])
            return false;

        delete this.currentRequest.headers[key];

        return true;
    }

    public saveAnalysis(): Analysis {
        localStorage.setItem('analysis', JSON.stringify(this.analysis));

        return this.analysis;
    }
}

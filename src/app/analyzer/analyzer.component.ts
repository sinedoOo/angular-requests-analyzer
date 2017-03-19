import { Component, OnInit } from '@angular/core';

import { Analysis } from './types/analysis.interface';
import { RequesterResult } from './types/requesterResult.interface';
import { Requester } from './services/requester.service';

@Component({
  selector: 'analyzer',
  providers: [],
  styleUrls: [ './analyzer.component.scss' ],
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
      hAxis: {title: 'Ilość zapytań'},
      vAxis: {title: 'Ilość równoległych zapytań w zadanym oknie czasu'}
  };
  public delayData: any[][] = null;
  public delayDataOptions = {
      title: 'Opóźnienia wykonywanych zapytań',
      curveType: 'function',
      hAxis: {title: 'Opóźnienie zapytań'},
      vAxis: {title: 'Ilość równoległych zapytań w zadanym oknie czasu'}
  };

  private results: Array<{
      simultaneousReqestsCount: number,
      results: RequesterResult}> = null;

  constructor(
    public requester: Requester
  ) {}

  public ngOnInit() {
    this.analysis = JSON.parse(localStorage.getItem('analysis'));
  }

  public executeAnalysis(): boolean {
      if (!this.requester.setAnalysis(this.analysis)) {
          return false;
      }

      this.executingAnalysis = true;
      let executionTimeout: number = this.requester.execute();

      (function(executionTimeout, analyzer){
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
          results: RequesterResult}>
  ): any[][] {
      let data = [];

      data.push([
          'Ilość równoległych zapytań w zadanym oknie czasu',
          'Zapytania zakończone sukcesem',
          'Wszystkie wykonane zapytania',
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
          results: RequesterResult}>
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
}

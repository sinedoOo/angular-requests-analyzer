import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';

import { Requester } from './analyzer/services/requester.service';
import { AnalyzerComponent } from './analyzer/analyzer.component';
import { GoogleChart } from './../directives/googleChart.directive';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'analyzer',
        pathMatch: 'full',
    },
    {
        path: 'analyzer',
        component: AnalyzerComponent,
    }
];


@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(routes, { useHash: true }),
        MaterialModule
    ],
    providers: [Requester],
    declarations: [
        AnalyzerComponent,
        GoogleChart
    ],
    exports: [
        RouterModule
    ],
})

export class AppRoutingModule { }

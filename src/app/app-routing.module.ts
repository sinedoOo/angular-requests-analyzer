import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { MaterialModule } from '@angular/material';

import { Requester } from './analyzer/services/requester.service';
import { AnalyzerComponent } from './analyzer/analyzer.component';
import { GoogleChart } from './../directives/googleChart.directive';
import { KeysPipe } from './../pipes/keys.pipe';

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
        BrowserAnimationsModule,
        RouterModule.forRoot(routes, { useHash: true }),
        FormsModule,
        MaterialModule
    ],
    providers: [Requester],
    declarations: [
        AnalyzerComponent,
        GoogleChart,
        KeysPipe
    ],
    exports: [
        RouterModule
    ],
})

export class AppRoutingModule { }

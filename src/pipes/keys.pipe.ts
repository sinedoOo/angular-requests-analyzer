import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'keys',
    pure: false
})
export class KeysPipe implements PipeTransform {
    transform(object: any, args?: any[]): any[] {
        return Object.keys(object);
    }
}

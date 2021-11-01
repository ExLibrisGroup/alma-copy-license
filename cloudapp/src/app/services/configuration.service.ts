import { Injectable } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { merge } from 'lodash';
import { Configuration } from '../models/configuration';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  private _configuration: Configuration;

  constructor(
    private configService: CloudAppConfigService,
  ) { }

  get(): Observable<Configuration> {
    if (this._configuration) {
      return of(this._configuration);
    } else {
      return this.configService.get()
        .pipe(
          map(settings => merge(new Configuration(), settings)),
          tap(settings => this._configuration = settings)
        );
    }
  }

  set(val: Configuration) {
    this._configuration = val;
    return this.configService.set(val);
  }
}
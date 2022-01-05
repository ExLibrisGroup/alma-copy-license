import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { CloudAppEventsService, HttpMethod, Request } from '@exlibris/exl-cloudapp-angular-lib';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { merge, mapKeys } from 'lodash';
import { ConfigurationService } from './configuration.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RestProxyService {
  private _token: string;
  instCode: string;

  public constructor(
    private http: HttpClient, 
    private eventsService: CloudAppEventsService,
    private configurationService: ConfigurationService,
    private translate: TranslateService,
    ) { }

  call<T = any>(request: string | Request): Observable<T> {
    let req: Request = typeof request == 'string' ? { url: request, method: HttpMethod.GET } : request;
    req = merge({ method: HttpMethod.GET, headers: {}, params: {} }, req);
    let params = new HttpParams({ fromObject: req.queryParams });

    return forkJoin([
      this.configurationService.get(),
      this.getToken(),
    ])
    .pipe(
      switchMap(results => {
        const [configuration, token] = results;
        if (!configuration.restProxyUrl) {
          const msg = this.translate.instant('CONFIGURATION.NO_PROXY_DEFINED');
          throw new Error(msg);
        };
        const url =  'https://api-ap.exldevnetwork.net/proxy'+ req.url ;
        const key = configuration.restProxyUrl;
        const headers = 
          new HttpHeaders(
            merge(
              {
                'content-type': 'application/json',
                'accept': 'application/json',
                'authorization': `Bearer ${token}`,
                'X-Proxy-Auth': 'apikey '+ key,
                'X-Proxy-Host': 'api-eu.hosted.exlibrisgroup.com',
              }, 
              mapKeys(req.headers, (v, k) => k.toLowerCase())
            )
          );
        const options = { headers, params };
        switch (req.method) {
          case HttpMethod.GET:
            return wrapError(this.http.get<T>(url, options));
          case HttpMethod.PUT:
            return wrapError(this.http.put<T>(url, req.requestBody, options));
          case HttpMethod.POST:
            return wrapError(this.http.post<T>(url, req.requestBody, options));
          case HttpMethod.DELETE:
            return wrapError(this.http.delete<T>(url, options));
        }
      })
    )
  }

  private getToken() {
    if (this._token) return of(this._token);
    return this.eventsService.getAuthToken()
    .pipe(tap(token => this._token = token));
  }
}

const wrapError = (obs: Observable<any>): Observable<any> => {
  return obs.pipe(
    catchError(err=>{
      if (err.error && err.error.errorList) {
        err.message = err.error.errorList.error[0].errorMessage
      };
      return throwError(err);
    })
  )
}
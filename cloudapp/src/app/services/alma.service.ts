import { Injectable } from "@angular/core";
import { CloudAppRestService, HttpMethod } from "@exlibris/exl-cloudapp-angular-lib";
import { omitBy } from "lodash";
import { of } from "rxjs";
import { catchError, mergeMap, tap } from "rxjs/operators";
import { License } from "../models/alma";
import { isEmptyValue, parseAlmaError } from "../utilities";

@Injectable({
  providedIn: 'root'
})
export class AlmaService { 

  constructor(
    private rest: CloudAppRestService,
  ) {}

  createLicense(license: License) {
    let url = `/acq/licenses/${license.code}`;
    let method = HttpMethod.PUT;
    return this.rest.call<License>(url)
    .pipe(
      catchError(e => {
        /* License doesn't exist */
        if (parseAlmaError(e).errorCode == '403400') {
          url = '/acq/licenses';
          method = HttpMethod.POST;
          return of(undefined);
        }
        throw e;
      }),
      tap((existingLicense: License) => {
        if (existingLicense && existingLicense.status.value != 'DELETED') {
          throw new Error('License already exists')
        }
      }),
      mergeMap(() => this.rest.call<License>({
        url,
        method,
        requestBody: omitBy(license, isEmptyValue) /* 500 when sending { value: null }, URM-162045 */
      }))
    ) 
  }
}
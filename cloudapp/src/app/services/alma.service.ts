import { Injectable } from "@angular/core";
import { CloudAppRestService, HttpMethod, Request } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateService } from "@ngx-translate/core";
import { omitBy } from "lodash";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { License, licenseDeleted } from "../models/alma";
import { Configuration } from "../models/configuration";
import { isEmptyValue, parseAlmaError } from "../utilities";
import { ConfigurationService } from "./configuration.service";

@Injectable({
  providedIn: 'root'
})
export class AlmaService { 

  constructor(
    private rest: CloudAppRestService,
    private translate: TranslateService,
    private configration: ConfigurationService,
  ) {}

  createLicense(license: License) { 
    return forkJoin([
      this.configration.get(),
      this.licenseExists(license.code),
    ])
    .pipe(
      map(([configuration, existingLicense]) => {
        if (existingLicense && !this.checkExistingLicenseCondition(configuration, existingLicense)) {
          const msg = this.translate.instant('LICENSE_EXISTS', { code: license.code })
          throw new Error(msg);
        } 
        return !!existingLicense;
      }),
      map(override => ({
        url: override ? `/acq/licenses/${license.code}` : '/acq/licenses',
        method: override ? HttpMethod.PUT : HttpMethod.POST,
        requestBody: omitBy(license, isEmptyValue) /* 500 when sending { value: null }, URM-162045 */
      } as Request)),
      mergeMap(request => this.rest.call<License>(request))
    )
  }

  private checkExistingLicenseCondition(configuration: Configuration, license: License) {
    const failed = configuration.existingLicense == 'overwrite_none' ||
      (configuration.existingLicense == 'overwrite_deleted' && !licenseDeleted(license));
    return !failed;
  }

  /**
   * 
   * @param code Returns license if exists or null
   * @returns Observable<License> | null
   */
  private licenseExists(code: string): Observable<License> {
    return this.getLicense(code)
    .pipe(
      catchError(e => {
        /* License doesn't exist */
        if (parseAlmaError(e).errorCode == '403400') {
          return of(null);
        }
        throw e;
      }),
    )
  }

  getLicense(code: string) {
    return this.rest.call<License>(`/acq/licenses/${code}`);
  }
}
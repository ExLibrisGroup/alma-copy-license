import { Injectable } from "@angular/core";
import { CloudAppRestService, HttpMethod, Request } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateService } from "@ngx-translate/core";
import { omitBy } from "lodash";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { Amendment, Attachment, License, licenseDeleted } from "../models/alma";
import { Configuration } from "../models/configuration";
import { isEmptyValue, parseAlmaError } from "../utilities";
import { ConfigurationService } from "./configuration.service";
import { Vendor } from "../models/alma";
import { RemoteAlmaService } from "./remote-alma.service";

@Injectable({
  providedIn: 'root'
})
export class AlmaService { 

  vendors_created = 0;
  amendments_created = 0;
  attachments_created = 0;
  attachments: Attachment[] = [];

  constructor(
    private rest: CloudAppRestService,
    private translate: TranslateService,
    private configration: ConfigurationService,
    private remote: RemoteAlmaService,
  ) {}

  createLicense(license: License, vendor: Vendor) {
    return forkJoin([
      this.configration.get(),
      this.licenseExists(license.code),
      this.remote.getAttachments(license.code),
      this.getAttachments(license.code),
      this.createVendor(vendor),
    ])
    .pipe(
      map(([configuration, existingLicense, attachmentsRemote, attachmentsLocal]) => {
        if (configuration.createAttachments) {
          if (attachmentsLocal){
            let remote_attachments = attachmentsRemote.attachment;
            let local_attachments = attachmentsLocal.attachment.map((attachment: Attachment) => attachment.file_name)
            for (let attachment of remote_attachments) {
              if (!local_attachments.includes(attachment.file_name)) {
                this.attachments.push(attachment);
              }
            }
          } 
          else {
            this.attachments = attachmentsRemote.attachment;
          } 
        }
    
        if (license.type.value == "NEGOTIATION") {
          license.type.value = "LICENSE";
        }
        
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
    const failed = configuration.existingLicense == 'OVERWRITE_NONE' ||
      (configuration.existingLicense == 'OVERWRITE_DELETED' && !licenseDeleted(license));
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

  getVendor(code:string) {
    return this.rest.call(`/almaws/v1/acq/vendors/${code}`);
  }

  getAmendment(license_code: string, amendment_code: string) {
    return this.rest.call(`/almaws/v1/acq/licenses/${license_code}/amendments/${amendment_code}`);
  }

  getAttachments(license_code: string){
    return this.rest.call(`/almaws/v1/acq/licenses/${license_code}/attachments`).pipe(catchError(e => {
      /* License doesn't exist */
      return of(null);
    }))
  }
  
  createVendor(vendor: Vendor): Observable<Vendor>{
    return this.getVendor(vendor.code)
    .pipe(
      catchError(e =>{
        /* Vendor doesn't exist */
        const requestBody = vendor;
          let request = {
            url: "/almaws/v1/acq/vendors",
            method: HttpMethod.POST,
            requestBody
          };
          return this.rest.call(request).pipe(
            map((vendor) => {
              console.log(`Vendor code '${ vendor.code }' successfully created.`);
              this.vendors_created++;
            }),
            catchError(e => {
              const msg = this.translate.instant('COPY_LICENSE.VENDOR_FAILED', {code: vendor.code}) +" - " + e.message
              console.log(e);
              throw new Error(msg);
            })
          );
      })
   )    
  }
  
  createAmendment(license_code: string, amendment: Amendment): Observable<Amendment>{
    return this.getAmendment(license_code, amendment.code)
    .pipe(
      catchError(e =>{
        /* Amendment doesn't exist */
        const requestBody = amendment;
          let request = {
            url: `/almaws/v1/acq/licenses/${license_code}/amendments`,
            method: HttpMethod.POST,
            requestBody
          };
          return this.rest.call(request).pipe(
            map((amendment) => {
              console.log(`Amendment code '${ amendment.code }' successfully created.`);
              this.amendments_created++;
            }),
            catchError(e => {
              const msg = this.translate.instant('COPY_LICENSE.AMENDMENT_FAILED', {code: amendment.code}) +" - " + e.message
              console.log(e);
              throw new Error(msg);
            })
          );
      })
   )    
  }
  
  createAttachment(attachment: Attachment ,license_code: string){
      const requestBody = attachment;
      let request = {
        url: `/almaws/v1/acq/licenses/${license_code}/attachments`,
        method: HttpMethod.POST,
        requestBody
      }; 
      return this.rest.call(request).pipe(
        map((attachment) => {
          console.log(`Attachment name '${ attachment.file_name }' successfully created.`);
          this.attachments_created++;
        }),
        catchError(e => {
          const msg = this.translate.instant('COPY_LICENSE.ATTACHMENT_FAILED', {code: attachment.file_name}) +" - " + e.message;
          console.log(e);
          throw new Error(msg);
        })
      )
  }
}
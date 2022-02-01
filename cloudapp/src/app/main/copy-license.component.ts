import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlertService } from "@exlibris/exl-cloudapp-angular-lib";
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from "eca-components";
import { RemoteAlmaService } from "../services/remote-alma.service";
import { concatMap, finalize, mergeMap } from "rxjs/operators";
import { AlmaService } from "../services/alma.service";
import { TranslateService } from "@ngx-translate/core";
import { License } from "../models/alma";
import { from } from "rxjs";

@Component({
  selector: 'app-copy-license',
  template: '',
})
export class CopyLicenseComponent implements OnInit {

  @Input() loading: boolean;
  @Output() loadingChange = new EventEmitter<boolean>();
  
  constructor(
    private alert: AlertService,
    private dialog: DialogService,
    private remote: RemoteAlmaService,
    private alma: AlmaService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
  }

  copyLicense(code: string, vendor_code: string) {
    this.dialog.confirm({
      text: [ _('COPY_LICENSE.CONFIRM'), { code }],
      ok: _('COPY_LICENSE.CONFIRM_OK'),
    })
    .subscribe(result => {
      if (!result) return;
      this.alert.clear();
      this.alma.vendors_created = 0;
      this.alma.amendments_created = 0;
      this.alma.attachments_created = 0;
      this.loadingChange.emit(true);
      this.remote.getVendor(vendor_code).subscribe(vendor => {
        this.remote.getLicense(code)
        .pipe(
          mergeMap(license => this.alma.createLicense(license, vendor)),
        )
        .subscribe({
          next: license => {
            this.createVendors(license);    
          },
          error: e => {
            this.alert.error(e.message);
            this.loadingChange.emit(false);
          },
        })
      },
      error => {
        this.alert.error(error.message);
        this.loadingChange.emit(false);
      })  
    })
  }

  createAmendments(license: License){
    this.remote.getAmendments(license.code).subscribe(amendments => {
      from(amendments.license).pipe(
        mergeMap(amendment => {
          return this.alma.createAmendment(license.code, amendment);
        }),
        finalize(() => {
          const vendors_msg = this.translate.instant('COPY_LICENSE.VENDORS_ADDED', {vendors: this.alma.vendors_created})
          const amendments_msg = this.translate.instant('COPY_LICENSE.AMENDMENTS_ADDED', { amendments: this.alma.amendments_created })
          const attachments_msg = this.translate.instant('COPY_LICENSE.ATTACHMENTS_ADDED', { attachments: this.alma.attachments_created })
          const msg = this.translate.instant('COPY_LICENSE.SUCCESS', { code: license.code }) + " - " + vendors_msg + " - " + amendments_msg + " - " + attachments_msg;
          this.alert.success(msg, { autoClose: false });
          this.loadingChange.emit(false);
        })
      ).subscribe()
    });
  }

  createAttachments(license: License){
    from(this.alma.attachments).pipe(
      mergeMap(attachment => {
        return this.remote.getAttachment(license.code, attachment.id).pipe(
          concatMap(full_attachment => this.alma.createAttachment(full_attachment, license.code))
        )
      }),
      finalize(() => {
        this.createAmendments(license);
      })
    ).subscribe()
  }

  createVendors(license: License){
    this.remote.getAmendments(license.code).subscribe(amendments => {
      from(amendments.license).pipe(
        mergeMap(amendment => {
          return this.remote.getVendor(amendment.licensor.value).pipe(
            concatMap(vendor => this.alma.createVendor(vendor))
          )
        }),
        finalize(() => {
          this.createAttachments(license);
        })
      ).subscribe()
    })
  }
}
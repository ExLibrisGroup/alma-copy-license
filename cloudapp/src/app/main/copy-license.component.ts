import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlertService } from "@exlibris/exl-cloudapp-angular-lib";
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from "eca-components";
import { RemoteAlmaService } from "../services/remote-alma.service";
import { finalize, mergeMap } from "rxjs/operators";
import { AlmaService } from "../services/alma.service";
import { TranslateService } from "@ngx-translate/core";

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

  copyLicense(code: string) {
    this.dialog.confirm({
      text: [ _('COPY_LICENSE.CONFIRM'), { code }],
      ok: _('COPY_LICENSE.CONFIRM_OK'),
    })
    .subscribe(result => {
      if (!result) return;
      this.alert.clear();
      this.loadingChange.emit(true);
      this.remote.getLicense(code)
      .pipe(
        mergeMap(license => this.alma.createLicense(license)),
        finalize(() => this.loadingChange.emit(false)),
      )
      .subscribe({
        next: license => {
          const msg = this.translate.instant('COPY_LICENSE.SUCCESS', { code: license.code })
          this.alert.success(msg, { autoClose: false });
        },
        error: e => this.alert.error(e.message),
      })
    })
  }
}
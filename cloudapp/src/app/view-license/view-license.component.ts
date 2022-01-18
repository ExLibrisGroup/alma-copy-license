import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { download } from '../utilities';
import { Attachment, License, Amendment } from '../models/alma';
import { RemoteAlmaService } from '../services/remote-alma.service';
import { CopyLicenseComponent } from '../main/copy-license.component';

@Component({
  selector: 'app-view-license',
  templateUrl: './view-license.component.html',
  styleUrls: ['./view-license.component.scss']
})
export class ViewLicenseComponent implements OnInit {
  loading = false;
  license: License;
  attachments: Attachment[];
  amendments : Amendment[];
  @ViewChild(CopyLicenseComponent) copyLicense: CopyLicenseComponent;

  constructor(
    private route: ActivatedRoute,
    private remote: RemoteAlmaService,
    private alert: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {
    const licenseCode = this.route.snapshot.params['licenseCode'];
    
    if (!licenseCode) this.router.navigate(['']);
    this.loading = true;
    forkJoin([
      this.remote.getLicense(licenseCode),
      this.remote.getAttachments(licenseCode),
      this.remote.getAmendments(licenseCode),
    ])
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: results => {
        const [license, attachments, amendments ] = results;
        console.log(license);
        console.log(attachments);
        console.log(amendments);
        
        this.license = license;
        this.attachments = attachments.attachment.filter(a => !!a.file_name);
        this.amendments = amendments.license.filter(a => !!a.name);
      },
      error: e => this.alert.error(e.message),
    })
  }

  downloadAttachment(id: string) {
    this.loading = true;
    this.remote.getAttachment(this.license.code, id)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: attachment => download(attachment.file_name, attachment.type, attachment.content),
      error: e => this.alert.error(e.message),
    })
  }

  copy() {
    this.copyLicense.copyLicense(this.license.code, this.license.licensor.value);
  }

  get terms() {
    return this.license?.term.filter(t => !!t.code.value)
  }
}

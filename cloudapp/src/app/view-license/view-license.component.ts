import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { download } from '../utilities';
import { Attachment, License } from '../models/alma';
import { RemoteAlmaService } from '../services/remote-alma.service';

@Component({
  selector: 'app-view-license',
  templateUrl: './view-license.component.html',
  styleUrls: ['./view-license.component.scss']
})
export class ViewLicenseComponent implements OnInit {
  saving = false;
  license: License;
  attachments: Attachment[];

  constructor(
    private route: ActivatedRoute,
    private alma: RemoteAlmaService,
    private alert: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {
    const licenseCode = this.route.snapshot.params['licenseCode'];
    if (!licenseCode) this.router.navigate(['']);
    this.saving = true;
    forkJoin([
      this.alma.getLicense(licenseCode),
      this.alma.getAttachments(licenseCode),
    ])
    .pipe(finalize(() => this.saving = false))
    .subscribe({
      next: results => {
        const [license, attachments] = results;
        this.license = license;
        this.attachments = attachments.attachment.filter(a => !!a.file_name);
      },
      error: e => this.alert.error(e.message),
    })
  }

  downloadAttachment(id: string) {
    this.saving = true;
    this.alma.getAttachment(this.license.code, id)
    .pipe(finalize(() => this.saving = false))
    .subscribe({
      next: attachment => download(attachment.file_name, attachment.type, attachment.content),
      error: e => this.alert.error(e.message),
    })
  }

  get terms() {
    return this.license?.term.filter(t => !!t.code.value)
  }
}

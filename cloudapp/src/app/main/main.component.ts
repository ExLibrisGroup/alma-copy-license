import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { DataService } from '../services/data.service';
import { RestProxyService } from '../services/rest-proxy.service';
import { RemoteAlmaService } from '../services/remote-alma.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { finalize } from 'rxjs/operators';
import { PageOptions } from '../models/alma';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { CopyLicenseComponent } from './copy-license.component';
import { mapi18n } from '../utilities';

export const STORE_INST_CODE = 'INST_CODE';
export const STORE_SEARCH_TYPE = 'SEARCH_TYPE';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('searchTermInput') searchTermInput: ElementRef;
  @ViewChild(CopyLicenseComponent) copyLicense: CopyLicenseComponent;
  loading = false;
  instCodes: string[] = [];
  searchType: string;
  searchOptions = [ _('SEARCH_OPTIONS.NAME'), _('SEARCH_OPTIONS.CODE'), _('SEARCH_OPTIONS.LICENSOR')];
  selectedLicense: string;

  private _instCode: string;
  get instCode() {
    return this._instCode;
  }
  set instCode(val: string) {
    this._instCode = val;
    this.store.set(STORE_INST_CODE, val).subscribe();
    this.rest.instCode = val;
  }

  constructor(
    private store: CloudAppStoreService,
    private alert: AlertService,
    private rest: RestProxyService,
    private data: DataService,
    private remote: RemoteAlmaService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.data.getInstCodes()
    .subscribe({
      next: instCodes => {
        this.instCodes = instCodes;
        if (instCodes.length == 1) this.instCode = instCodes[0];
      },
      error: e => this.alert.error(e.message),
    });
    this.store.get(STORE_INST_CODE).subscribe(val => this.instCode = val);
    this.store.get(STORE_SEARCH_TYPE).subscribe(val => this.searchType = val || 'name');
  }

  ngAfterViewInit() {
    setTimeout(() => this.searchTermInput.nativeElement.focus());
  }

  ngOnDestroy(): void {
  }

  page(event: PageEvent) {
    this.getLicenses({
      limit: event.pageSize,
      offset: event.pageIndex * event.pageSize,
    });
  }

  search() {
    this.getLicenses();
  }

  setSearchType(type: string) {
    this.searchType = type;
    this.store.set(STORE_SEARCH_TYPE, type).subscribe();
  }

  getLicenses(page: PageOptions = undefined) {
    this.loading = true;
    const searchType = mapi18n(this.searchType).toLowerCase()
    return this.remote.getLicenses(this.data.searchTerm, searchType, page)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: licenses => this.data.licenses = licenses,
      error: e => this.alert.error(e.message),
    });;
  }

  view() {
    const params = {licenseCode: this.selectedLicense};
    this.router.navigate(['view', params]);
  }

  copy() {
    this.copyLicense.copyLicense(this.selectedLicense);
  }
}
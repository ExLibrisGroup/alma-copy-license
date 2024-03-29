import { Injectable } from "@angular/core";
import { Attachment, Attachments, License, Licenses, PageOptions, Amendments, Vendor, LicenseTerms } from "../models/alma";
import { RestProxyService } from "./rest-proxy.service";

@Injectable({
  providedIn: 'root'
})
export class RemoteAlmaService {

  constructor(
    private rest: RestProxyService,
  ) {}

  getLicenses(term: string, type: string = "name", page: PageOptions = { limit: 10, offset: 0 }, licenseType: string) {
    const queryParams = {
      q: `${type}~${term}`,
      limit: page.limit,
      offset: page.offset,
      type: licenseType,
      status: 'ACTIVE'
    } 
    return this.rest.call<Licenses>({ url: '/almaws/v1/acq/licenses', queryParams })
  }

  getLicense(code: string) {
    return this.rest.call<License>(`/almaws/v1/acq/licenses/${code}`);
  }

  getAttachments(code: string) {
    return this.rest.call<Attachments>(`/almaws/v1/acq/licenses/${code}/attachments`);
  }

  getAttachment(code: string, id: string) {
    return this.rest.call<Attachment>(`/almaws/v1/acq/licenses/${code}/attachments/${id}?expand=content`)
  }

  getAmendments(code: string) {
    return this.rest.call<Amendments>(`/almaws/v1/acq/licenses/${code}/amendments`);
  }
  getAmendment(code: string) {
    return this.rest.call<License>(`/almaws/v1/acq/licenses/${code}`);
  }

  getVendor(code: string) {
    return this.rest.call<Vendor>(`/almaws/v1/acq/vendors/${code}`);
  }
  getLicenseTerms() {
    return this.rest.call<LicenseTerms>(`/almaws/v1/conf/license-terms`);
  }
}
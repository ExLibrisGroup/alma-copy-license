import { Injectable } from "@angular/core";
import { Amendment, Attachment, Attachments, License, Licenses, PageOptions, Amendments } from "../models/alma";
import { RestProxyService } from "./rest-proxy.service";

@Injectable({
  providedIn: 'root'
})
export class RemoteAlmaService {

  constructor(
    private rest: RestProxyService,
  ) {}

  getLicenses(term: string, type: string = "name", page: PageOptions = { limit: 10, offset: 0 }) {
    const queryParams = {
      q: `${type}~${encodeURIComponent(term)}`,
      limit: page.limit,
      offset: page.offset,
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

  // getAmendment(code: string, amendment_code: string) {
  //   return this.rest.call<Amendment>(`/almaws/v1/acq/licenses/${code}/amendments/${amendment_code}?expand=content`)
  // }

}
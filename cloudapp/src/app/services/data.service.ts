import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { tap } from "rxjs/operators";
import { Licenses } from "../models/alma";
import { RestProxyService } from "./rest-proxy.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _instCodes: string[];
  searchTerm: string = "";
  licenses: Licenses;

  constructor(
    private rest: RestProxyService,
  ) {}

  getInstCodes() {
    if (this._instCodes) return of(this._instCodes);
    return this.rest.call<string[]>('/.manage/inst-codes')
    .pipe(tap(resp => this._instCodes = resp));
  }
}
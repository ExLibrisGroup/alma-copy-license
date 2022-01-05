import { Injectable } from "@angular/core";
import { Licenses } from "../models/alma";
import { RestProxyService } from "./rest-proxy.service";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  searchTerm: string = "";
  licenses: Licenses;

  constructor(
    private rest: RestProxyService,
  ) {}
}
import { FormGroupUtil } from "@exlibris/exl-cloudapp-angular-lib";
import { merge } from 'lodash';

export class Configuration {
  restProxyUrl: string = "";
}

export const configurationFormGroup = (config: Configuration) => FormGroupUtil.toFormGroup(merge(new Configuration(), config));
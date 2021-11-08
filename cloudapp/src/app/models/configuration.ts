import { FormGroupUtil } from "@exlibris/exl-cloudapp-angular-lib";
import { merge } from 'lodash';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const ExistingLicenseOptions = [
  _('overwrite_deleted'),
  _('overwrite_all'),
  _('overwrite_none'),
]

export class Configuration {
  restProxyUrl: string = "";
  existingLicense: string = 'overwrite_deleted';
}

export const configurationFormGroup = (config: Configuration) => FormGroupUtil.toFormGroup(merge(new Configuration(), config));
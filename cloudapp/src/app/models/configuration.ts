import { FormGroupUtil } from "@exlibris/exl-cloudapp-angular-lib";
import { merge } from 'lodash';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const ExistingLicenseOptions = [
  _('EXISTING_LICENSE.OVERWRITE_DELETED'),
  _('EXISTING_LICENSE.OVERWRITE_ALL'),
  _('EXISTING_LICENSE.OVERWRITE_NONE'),
]

export class Configuration {
  restProxyUrl: string = "";
  existingLicense: string = 'OVERWRITE_DELETED';
}

export const configurationFormGroup = (config: Configuration) => FormGroupUtil.toFormGroup(merge(new Configuration(), config));
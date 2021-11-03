import { RestErrorResponse } from '@exlibris/exl-cloudapp-angular-lib'
/**
 * Downloads a file
 * @param filename 
 * @param filetype Mimetype
 * @param contents Contents in base64 format
 */
const download = (filename: string, filetype: string, contents: string) => {
  var element = document.createElement('a');
  element.setAttribute('href', `data:${filetype};base64,` + contents);
  element.setAttribute('download', `${filename}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export interface RestError {
  errorCode: string;
  errorMessage: string;
  trackingId: string;
}

const parseAlmaError = (e: RestErrorResponse) => {
  return e.error.errorList?.error?.[0] as RestError;
}

const isEmptyValue = (value: any, key: string) => {
  return value.value !== undefined && value.value === null;
}

export { download, parseAlmaError, isEmptyValue };
export interface Licenses {
  total_record_count: number;
  license: License[];
}

export interface License {
  link: string;
  code: string;
  name: string;
  licensor: Value;
  status: Value;
  term: Term[];
}

export const licenseDeleted = (license: License) => 
  license && license.status.value == 'DELETED';

export interface Term {
  code: Value;
  value: Value;
}

export interface Value {
  value: string;
  desc: string;
}

export interface PageOptions {
  limit: number;
  offset: number;
}

export interface Attachments {
  total_record_count: number;
  attachment: Attachment[];
}

export interface Attachment {
  link: string;
  id: string;
  file_name: string;
  type: string;
  content: string;
}
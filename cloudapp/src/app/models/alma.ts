export interface Licenses {
  total_record_count: number;
  license: License[];
}

export interface License {
  link: string;
  code: string;
  name: string;
  licensor: Value;
}

export interface Value {
  value: string;
  desc: string;
}

export interface PageOptions {
  limit: number;
  offset: number;
}
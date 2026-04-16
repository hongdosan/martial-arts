export interface DetailEntry {
  l: string;
  t: string;
}

export interface MemberEntry {
  n: string;
  d: string;
}

export interface MemberGroup {
  label: string;
  members: MemberEntry[];
}

export interface HasId {
  id: string;
}

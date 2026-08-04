export type EntryType = 'lent' | 'borrowed' | 'received' | 'repaid';

export interface Entry {
  id: string;
  personId: string;
  amount: number;
  type: EntryType;
  date: string;
  note: string;
}

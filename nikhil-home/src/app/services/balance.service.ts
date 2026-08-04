import { computed, Injectable, signal, Signal } from '@angular/core';
import { Entry, EntryType } from '../models/entry';
import { Person } from '../models/person';
import { StorageService } from './storage.service';

const PERSONS_KEY = 'balance-tracker-persons';
const ENTRIES_KEY = 'balance-tracker-entries';

interface InitialData {
  persons: Person[];
  entries: Entry[];
}

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  lent: 'Lent Money',
  borrowed: 'Borrowed Money',
  received: 'Received Repayment',
  repaid: 'Repaid Debt',
};

export const ENTRY_POLARITY: Record<EntryType, 1 | -1> = {
  lent: 1,
  repaid: 1,
  borrowed: -1,
  received: -1,
};

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private readonly persons = signal<Person[]>([]);
  private readonly entries = signal<Entry[]>([]);
  private readonly searchTerm = signal('');
  readonly selectedPersonId = signal<string | null>(null);

  readonly people = computed(() => this.persons());

  readonly filteredPeople = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.people();
    }

    return this.people().filter((person) =>
      person.name.toLowerCase().includes(term),
    );
  });

  readonly selectedPerson = computed(() => {
    const id = this.selectedPersonId();
    return id ? this.people().find((person) => person.id === id) ?? null : null;
  });

  readonly selectedPersonEntries = computed(() => {
    const personId = this.selectedPersonId();
    if (!personId) {
      return [] as Entry[];
    }

    return this.entries()
      .filter((entry) => entry.personId === personId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  readonly toReceive = computed(() =>
    this.people().filter((person) => this.getPersonNet(person.id) > 0),
  );

  readonly toPay = computed(() =>
    this.people().filter((person) => this.getPersonNet(person.id) < 0),
  );

  readonly totals = computed(() => {
    let receive = 0;
    let pay = 0;

    this.people().forEach((person) => {
      const net = this.getPersonNet(person.id);
      if (net > 0) {
        receive += net;
      }
      if (net < 0) {
        pay += Math.abs(net);
      }
    });

    return {
      receive,
      pay,
      net: receive - pay,
    };
  });

  constructor(private readonly storage: StorageService) {
    this.load();
  }

  search(term: string): void {
    this.searchTerm.set(term);
  }

  selectPerson(personId: string | null): void {
    this.selectedPersonId.set(personId);
  }

  addPerson(name: string): Person | null {
    const trimmed = name.trim();
    if (!trimmed) {
      return null;
    }

    const existing = this.persons().find(
      (person) => person.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (existing) {
      return existing;
    }

    const person: Person = {
      id: this.createId(),
      name: trimmed,
    };

    this.persons.set([...this.persons(), person]);
    this.save();
    return person;
  }

  addEntry(entry: Omit<Entry, 'id'>): void {
    const newEntry: Entry = {
      id: this.createId(),
      ...entry,
    };

    this.entries.set([newEntry, ...this.entries()]);
    this.save();
    this.selectPerson(entry.personId);
  }

  updateEntry(entry: Entry): void {
    this.entries.set(
      this.entries().map((item) => (item.id === entry.id ? entry : item)),
    );
    this.save();
  }

  deleteEntry(entryId: string): void {
    this.entries.set(this.entries().filter((entry) => entry.id !== entryId));
    this.save();
  }

  getPersonNet(personId: string): number {
    return this.entries().reduce((net, entry) => {
      if (entry.personId !== personId) {
        return net;
      }

      return net + this.getSignedAmount(entry);
    }, 0);
  }

  getSignedAmount(entry: Entry): number {
    return entry.amount * ENTRY_POLARITY[entry.type];
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  }

  private load(): void {
    void this.loadRemoteData().then((loaded) => {
      if (loaded) {
        return;
      }

      const storedPersons = this.storage.load<Person[]>(PERSONS_KEY, []);
      const storedEntries = this.storage.load<Entry[]>(ENTRIES_KEY, []);

      if (storedPersons.length && storedEntries.length) {
        this.persons.set(storedPersons);
        this.entries.set(storedEntries);
        return;
      }

      this.persons.set(storedPersons);
      this.entries.set(storedEntries);

      this.loadInitialData().catch(() => {
        // If JSON load fails, keep local storage data or empty state.
      });
    });
  }

  private async loadRemoteData(): Promise<boolean> {
    try {
      const response = await fetch('/.netlify/functions/entries', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as InitialData;
      if (!data?.persons?.length || !data?.entries?.length) {
        return false;
      }

      this.persons.set(data.persons);
      this.entries.set(data.entries);
      this.storage.save(PERSONS_KEY, this.persons());
      this.storage.save(ENTRIES_KEY, this.entries());
      return true;
    } catch {
      return false;
    }
  }

  private async loadInitialData(): Promise<void> {
    const response = await fetch('entries.json');
    if (!response.ok) {
      return;
    }

    const initialData = (await response.json()) as InitialData;
    if (!initialData?.persons?.length || !initialData?.entries?.length) {
      return;
    }

    const storedPersons = this.storage.load<Person[]>(PERSONS_KEY, []);
    const storedEntries = this.storage.load<Entry[]>(ENTRIES_KEY, []);
    if (storedPersons.length || storedEntries.length) {
      return;
    }

    this.persons.set(initialData.persons);
    this.entries.set(initialData.entries);
    this.save();
  }

  private save(): void {
    this.storage.save(PERSONS_KEY, this.persons());
    this.storage.save(ENTRIES_KEY, this.entries());
    void this.saveRemoteData();
  }

  private async saveRemoteData(): Promise<void> {
    try {
      await fetch('/.netlify/functions/entries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persons: this.persons(),
          entries: this.entries(),
        }),
      });
    } catch {
      // Keep local storage for offline use.
    }
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

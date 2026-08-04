import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BalanceService, ENTRY_TYPE_LABELS } from '../../services/balance.service';
import { Entry, EntryType } from '../../models/entry';

@Component({
  selector: 'app-balance-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance-tracker.html',
  styleUrl: './balance-tracker.scss',
})
export class BalanceTracker {
  newPersonName = '';
  newEntryPersonId = '';
  newEntryType: EntryType = 'lent';
  newAmount = 0;
  newDate = new Date().toISOString().slice(0, 10);
  newNote = '';
  editingEntryId: string | null = null;

  showAddEntry = false;

  readonly entryTypeLabels = ENTRY_TYPE_LABELS;
  readonly entryTypes = Object.keys(ENTRY_TYPE_LABELS) as EntryType[];

  constructor(public readonly balance: BalanceService) {}

  get filteredPeople() {
    return this.balance.filteredPeople();
  }

  get selectedPerson() {
    return this.balance.selectedPerson();
  }

  get totals() {
    return this.balance.totals();
  }

  searchPeople(value: string): void {
    this.balance.search(value);
  }

  selectPerson(personId: string): void {
    this.balance.selectPerson(personId);
  }

  toggleAddEntry(): void {
    this.showAddEntry = !this.showAddEntry;
  }

  addEntry(): void {
    const amount = Number(this.newAmount);
    if (!amount) {
      return;
    }

    const personId = this.newEntryPersonId || this.selectedPerson?.id;
    const person = personId
      ? this.balance.people().find((item) => item.id === personId) ?? null
      : this.newPersonName.trim()
      ? this.balance.addPerson(this.newPersonName)
      : null;

    if (!person) {
      return;
    }

    const entry: Entry = {
      id: this.editingEntryId ?? '',
      personId: person.id,
      amount,
      type: this.newEntryType,
      date: this.newDate,
      note: this.newNote.trim(),
    };

    if (this.editingEntryId) {
      this.balance.updateEntry(entry);
    } else {
      this.balance.addEntry(entry);
    }

    this.resetForm();
  }

  editEntry(entry: Entry): void {
    this.editingEntryId = entry.id;
    this.newEntryPersonId = entry.personId;
    this.newPersonName = '';
    this.newEntryType = entry.type;
    this.newAmount = entry.amount;
    this.newDate = entry.date;
    this.newNote = entry.note;
    this.showAddEntry = true;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  removeEntry(entryId: string): void {
    this.balance.deleteEntry(entryId);
  }

  private resetForm(): void {
    this.newPersonName = '';
    this.newEntryPersonId = '';
    this.newEntryType = 'lent';
    this.newAmount = 0;
    this.newDate = new Date().toISOString().slice(0, 10);
    this.newNote = '';
    this.editingEntryId = null;
    this.showAddEntry = false;
  }

  getBalanceClass(value: number): string {
    return value >= 0 ? 'positive' : 'negative';
  }

  formatAbsoluteEntryValue(entryValue: number): string {
    return this.balance.formatCurrency(Math.abs(entryValue));
  }
}

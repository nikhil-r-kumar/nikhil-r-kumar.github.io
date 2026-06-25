import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-pomodoro',
  imports: [],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.scss',
})
export class Pomodoro implements OnDestroy {
  constructor(private readonly cdr: ChangeDetectorRef) {}

  totalSeconds = 25 * 60;
  remainingSeconds = this.totalSeconds;

  isRunning = false;

  private intervalId: number | null = null;

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    this.intervalId = window.setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds = this.remainingSeconds - 1;
        this.cdr.detectChanges();
      } else {
        this.pause();
        alert('Pomodoro Complete!');
      }
    }, 1000);
  }

  pause(): void {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
  }

  get minutes(): string {
    return Math.floor(this.remainingSeconds / 60)
      .toString()
      .padStart(2, '0');
  }

  get seconds(): string {
    return (this.remainingSeconds % 60)
      .toString()
      .padStart(2, '0');
  }

  ngOnDestroy(): void {
    this.pause();
  }
}
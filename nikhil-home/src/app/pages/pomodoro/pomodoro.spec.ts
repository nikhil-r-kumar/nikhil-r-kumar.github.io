import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Pomodoro } from './pomodoro';

describe('Pomodoro', () => {
  let component: Pomodoro;
  let fixture: ComponentFixture<Pomodoro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pomodoro],
    }).compileComponents();

    fixture = TestBed.createComponent(Pomodoro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update the displayed time every second', fakeAsync(() => {
    fixture.detectChanges();

    component.start();
    tick(1000);

    const timer = fixture.nativeElement.querySelector('.timer')?.textContent?.trim();
    expect(timer).toBe('24:59');
  }));
});

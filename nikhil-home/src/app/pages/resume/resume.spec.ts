import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resume } from './resume';

describe('Resume', () => {
  let component: Resume;
  let fixture: ComponentFixture<Resume>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Resume],
    }).compileComponents();

    fixture = TestBed.createComponent(Resume);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main resume sections', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Aarav Sharma');
    expect(element.textContent).toContain('Professional Summary');
    expect(element.textContent).toContain('Professional Experience');
  });

  it('should expose a profile selector for choosing a profile', () => {
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeTruthy();
    expect(select?.options.length).toBeGreaterThan(0);
  });
});

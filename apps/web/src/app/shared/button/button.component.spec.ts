import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default props (primary, md, button)', () => {
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(buttonEl).toBeTruthy();
    expect(buttonEl.type).toBe('button');
    expect(buttonEl.disabled).toBe(false);
  });

  it('should set type from input', () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(buttonEl.type).toBe('submit');
  });

  it('should disable the button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(buttonEl.disabled).toBe(true);
  });

  it('should disable the button when loading input is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(buttonEl.disabled).toBe(true);
  });

  it('should show a spinner SVG when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('svg.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should not show a spinner when loading is false', () => {
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('svg.animate-spin');
    expect(spinner).toBeFalsy();
  });

  it('should emit onClick when button is clicked', () => {
    let clicked = false;
    component.onClick.subscribe(() => (clicked = true));
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    buttonEl.click();
    expect(clicked).toBe(true);
  });

  it('should not emit onClick when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let clicked = false;
    component.onClick.subscribe(() => (clicked = true));
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    buttonEl.click();
    expect(clicked).toBe(false);
  });

  it('should not emit onClick when loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    let clicked = false;
    component.onClick.subscribe(() => (clicked = true));
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    buttonEl.click();
    expect(clicked).toBe(false);
  });

  it('should apply variant classes for primary variant', () => {
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('bg-primary-500');
  });

  it('should apply variant classes for danger variant', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('bg-danger-500');
  });

  it('should apply variant classes for ghost variant', () => {
    fixture.componentRef.setInput('variant', 'ghost');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('bg-transparent');
    expect(buttonEl.className).toContain('text-text-secondary');
  });

  it('should apply variant classes for outline variant', () => {
    fixture.componentRef.setInput('variant', 'outline');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('border');
    expect(buttonEl.className).toContain('border-border');
  });

  it('should apply size classes for sm size', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('px-3');
    expect(buttonEl.className).toContain('py-1.5');
  });

  it('should apply size classes for lg size', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector('button');
    expect(buttonEl.className).toContain('px-6');
    expect(buttonEl.className).toContain('py-3');
  });

  it('should project ng-content inside the button', () => {
    const testText = 'Click Me';
    const paragraph = document.createElement('span');
    paragraph.textContent = testText;
    fixture.nativeElement.querySelector('button').appendChild(paragraph);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(testText);
  });
});

import { Component, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RevealDirective } from './reveal.directive';

// ── Test doubles ────────────────────────────────────────────────────────────

/** Minimal `matchMedia` mock (JSDOM doesn't implement it). */
function mockMatchMedia(reducedMotion: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('reduce') ? reducedMotion : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/** Captures the last created observer so a test can fire intersection manually. */
class FakeIntersectionObserver {
  static last: FakeIntersectionObserver | undefined;
  observed: Element[] = [];
  disconnected = false;
  unobserved: Element[] = [];

  constructor(private readonly cb: IntersectionObserverCallback) {
    FakeIntersectionObserver.last = this;
  }

  observe(el: Element): void {
    this.observed.push(el);
  }
  unobserve(el: Element): void {
    this.unobserved.push(el);
  }
  disconnect(): void {
    this.disconnected = true;
  }

  /** Simulate the target entering the viewport. */
  trigger(el: Element): void {
    this.cb(
      [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

@Component({
  imports: [RevealDirective],
  template: `<div ctReveal [ctRevealDelay]="delay">contenu</div>`,
})
class HostComponent {
  delay = 0;
}

function getTarget(fixture: ComponentFixture<HostComponent>): HTMLElement {
  return fixture.nativeElement.querySelector('div') as HTMLElement;
}

// ── Specs ────────────────────────────────────────────────────────────────────

describe('RevealDirective : navigateur, mouvement autorisé', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    FakeIntersectionObserver.last = undefined;
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
  });

  it('ajoute la classe ct-reveal et observe après le rendu', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = getTarget(fixture);
    expect(el.classList.contains('ct-reveal')).toBe(true);
    expect(FakeIntersectionObserver.last?.observed).toContain(el);
  });

  it('ajoute is-visible puis se déconnecte à l\'intersection (one-shot)', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = getTarget(fixture);
    const observer = FakeIntersectionObserver.last;
    observer?.trigger(el);

    expect(el.classList.contains('is-visible')).toBe(true);
    expect(observer?.unobserved).toContain(el);
    expect(observer?.disconnected).toBe(true);
  });

  it('applique le délai de stagger via transition-delay', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.delay = 180;
    fixture.detectChanges();
    await fixture.whenStable();

    const el = getTarget(fixture);
    expect(el.style.transitionDelay).toBe('180ms');
  });
});

describe('RevealDirective : reduced-motion', () => {
  beforeEach(() => {
    mockMatchMedia(true);
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    FakeIntersectionObserver.last = undefined;
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
  });

  it('ne cache pas le contenu ni ne crée d\'observer', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = getTarget(fixture);
    expect(el.classList.contains('ct-reveal')).toBe(false);
    expect(FakeIntersectionObserver.last).toBeUndefined();
  });
});

describe('RevealDirective : serveur (SSR)', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    FakeIntersectionObserver.last = undefined;
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
  });

  it('ne touche pas au DOM et laisse le contenu visible', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const el = getTarget(fixture);
    expect(el.classList.contains('ct-reveal')).toBe(false);
    expect(FakeIntersectionObserver.last).toBeUndefined();
  });
});

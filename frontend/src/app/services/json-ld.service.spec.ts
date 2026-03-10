import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { JsonLdService } from './json-ld.service';

describe('JsonLdService', () => {
  let service: JsonLdService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonLdService);
    document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('injecte un script JSON-LD dans le <head>', () => {
    service.setSchema('test', { '@type': 'Organization', name: 'Test' });
    const script = document.querySelector('script[data-jsonld="test"]');
    expect(script).not.toBeNull();
    expect(script!.getAttribute('type')).toBe('application/ld+json');
  });

  it('sérialise correctement le schéma en JSON', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'FAQPage' };
    service.setSchema('faq', schema);
    const script = document.querySelector('script[data-jsonld="faq"]');
    expect(JSON.parse(script!.textContent!)).toEqual(schema);
  });

  it('remplace le script existant lors d\'un second appel avec la même clé', () => {
    service.setSchema('org', { name: 'v1' });
    service.setSchema('org', { name: 'v2' });
    const scripts = document.querySelectorAll('script[data-jsonld="org"]');
    expect(scripts.length).toBe(1);
    expect(JSON.parse(scripts[0].textContent!).name).toBe('v2');
  });

  it('supprime le script avec removeSchema', () => {
    service.setSchema('to-remove', { name: 'temp' });
    service.removeSchema('to-remove');
    expect(document.querySelector('script[data-jsonld="to-remove"]')).toBeNull();
  });

  it('removeSchema ne plante pas si la clé est inconnue', () => {
    expect(() => service.removeSchema('inexistant')).not.toThrow();
  });
});

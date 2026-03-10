import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { JsonLdService } from '../../services/json-ld.service';
import { COMPANY } from '../../config/company.config';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  imports: [AccordionModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  private readonly jsonLd = inject(JsonLdService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly faqItems = signal<FaqItem[]>([
    {
      question: 'Qu\'est-ce que le GEO (Generative Engine Optimization) ?',
      answer: 'Le GEO est la nouvelle discipline qui optimise votre présence pour les moteurs génératifs comme ChatGPT, Gemini ou Perplexity. Contrairement au SEO qui cible les pages de résultats classiques de Google, le GEO s\'assure que les IA vous connaissent, vous comprennent et vous recommandent dans leurs réponses.',
    },
    {
      question: 'Quelle est la différence entre SEO et GEO ?',
      answer: 'Le SEO optimise votre site pour apparaître dans les résultats de recherche traditionnels (liens bleus de Google). Le GEO, lui, travaille sur la façon dont les intelligences artificielles synthétisent et citent votre entreprise dans leurs réponses. C\'est un travail plus proche des relations publiques que du code technique.',
    },
    {
      question: 'J\'ai déjà une agence SEO, pourquoi aurais-je besoin de Citatio ?',
      answer: 'Votre agence SEO fait probablement un excellent travail sur le référencement Google traditionnel — gardez-la ! Citatio intervient en complément pour ajouter la couche IA que les agences SEO classiques ne traitent pas encore. Nous travaillons en duo avec votre agence, pas en remplacement.',
    },
    {
      question: 'Mes clients n\'utilisent pas ChatGPT, est-ce vraiment utile ?',
      answer: 'Même si vos clients n\'utilisent pas directement ChatGPT, Google intègre désormais des réponses générées par IA directement en haut de ses pages de résultats (AI Overviews). Vos clients utilisent Google, et le GEO devient indispensable pour ne pas disparaître de ces nouveaux formats.',
    },
    {
      question: 'Combien de temps faut-il pour voir des résultats ?',
      answer: 'Les premiers résultats sont généralement visibles entre 4 et 8 semaines après le début de la stratégie. Nous mesurons régulièrement votre fréquence de citation dans les réponses IA et vous fournissons des rapports de progression détaillés.',
    },
    {
      question: 'Comment mesurez-vous la visibilité sur les IA ?',
      answer: 'Nous interrogeons régulièrement les principaux moteurs génératifs avec les requêtes que vos prospects utilisent réellement. Nous mesurons la fréquence de citation de votre marque, le positionnement dans les réponses, et l\'évolution par rapport à vos concurrents.',
    },
    {
      question: 'Est-ce que le GEO va remplacer le SEO ?',
      answer: 'Non, le GEO ne remplace pas le SEO, il le complète. Le référencement Google traditionnel reste essentiel. Mais à mesure que les IA prennent une place croissante dans la recherche d\'information, le GEO devient une brique stratégique incontournable pour rester visible.',
    },
    {
      question: 'Comment se passe un premier échange avec Citatio ?',
      answer: 'Nous proposons un premier échange gratuit de 10 minutes pour évaluer votre visibilité actuelle sur les moteurs génératifs. Pas de vente, pas d\'engagement : juste un diagnostic rapide pour savoir si le GEO est pertinent pour votre activité.',
    },
  ]);

  constructor() {
    this.jsonLd.setSchema('faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqItems().map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });

    this.jsonLd.setSchema('breadcrumb-faq', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: COMPANY.url + '/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: COMPANY.url + '/faq' },
      ],
    });

    this.destroyRef.onDestroy(() => {
      this.jsonLd.removeSchema('faq');
      this.jsonLd.removeSchema('breadcrumb-faq');
    });
  }
}

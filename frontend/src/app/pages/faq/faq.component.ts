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
      question: 'Que fait Citatio exactement ?',
      answer: 'Citatio est un studio web qui conçoit des sites vitrines sur mesure pour les TPE, PME, artisans et indépendants. Nous proposons en option le référencement Google (SEO) et la visibilité sur l\'IA (GEO), ainsi que l\'hébergement, le nom de domaine et la maintenance de votre site.',
    },
    {
      question: 'Combien coûte un site vitrine ?',
      answer: 'Le tarif dépend de votre projet : nombre de pages, niveau de design, contenu à produire et options choisies (SEO, GEO, hébergement, maintenance). Nous établissons un devis clair et sans coûts cachés après un premier échange gratuit.',
    },
    {
      question: 'Combien de temps faut-il pour créer mon site ?',
      answer: 'Cela dépend de la formule et de la disponibilité de vos contenus. Un site vitrine se réalise généralement en quelques semaines. Nous cadrons ensemble un planning précis au démarrage du projet.',
    },
    {
      question: 'C\'est quoi le SEO et le GEO, et en ai-je besoin ?',
      answer: 'Le SEO optimise votre site pour apparaître dans les résultats de Google. Le GEO travaille votre visibilité dans les réponses des IA comme ChatGPT, Gemini ou les AI Overviews de Google. Ce sont deux options : on les active selon vos objectifs et votre marché. Un site bien conçu intègre déjà une base SEO technique.',
    },
    {
      question: 'Pouvez-vous héberger mon site et gérer mon nom de domaine ?',
      answer: 'Oui. Nous proposons l\'hébergement géré, l\'achat et la configuration de votre nom de domaine, ainsi que la maintenance (mises à jour, sécurité, sauvegardes). Vous gardez un interlocuteur unique, du devis à la mise en ligne et au-delà.',
    },
    {
      question: 'Je n\'ai pas encore de contenu ni de logo, pouvez-vous m\'aider ?',
      answer: 'Oui. Notre pack contenu couvre la rédaction de vos pages et articles, et nous vous accompagnons sur le design et l\'identité visuelle pour partir sur des bases solides, même si vous démarrez de zéro.',
    },
    {
      question: 'Mon site sera-t-il adapté au mobile ?',
      answer: 'Toujours. Tous nos sites sont responsives par défaut : ils s\'affichent parfaitement sur mobile, tablette et ordinateur. Nous soignons aussi la vitesse de chargement et l\'accessibilité.',
    },
    {
      question: 'Comment se passe un premier échange avec Citatio ?',
      answer: 'Nous proposons un premier échange gratuit, sans engagement, pour comprendre votre activité et vos besoins. À l\'issue, vous recevez un devis adapté à votre projet. Pas de jargon ni de vente forcée : juste un point clair sur ce dont vous avez besoin.',
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

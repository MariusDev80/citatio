import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FaqComponent utilise `p-accordion` de PrimeNG pour un rendu accessible
 * et natif des FAQ. Le signal `faqItems` fournit les données de manière réactive.
 */
@Component({
  selector: 'app-faq',
  imports: [AccordionModule],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  protected readonly faqItems = signal<FaqItem[]>([
    {
      question: 'Quels sont vos horaires ?',
      answer: 'Nous sommes disponibles de 9h à 18h du lundi au vendredi. Pour les urgences, notre support 24/7 est à votre disposition.',
    },
    {
      question: 'Offrez-vous une période d\'essai gratuite ?',
      answer: 'Oui ! Nous proposons une période d\'essai de 14 jours sans engagement et sans carte bancaire.',
    },
    {
      question: 'Comment puis-je annuler mon abonnement ?',
      answer: 'Vous pouvez annuler à tout moment depuis votre tableau de bord, sans frais d\'annulation.',
    },
    {
      question: 'Proposez-vous un support client ?',
      answer: 'Notre équipe de support est disponible par email, téléphone et chat en direct.',
    },
    {
      question: 'Mes données sont-elles sécurisées ?',
      answer: 'Oui, nous utilisons le chiffrement SSL et respectons les normes RGPD pour protéger vos données.',
    },
  ]);
}

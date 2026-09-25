import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { COMPANY } from '../../../config/company.config';
import {
  ACCEPTED_IMAGE_TYPES,
  ArticleCategory,
  BlogService,
  MAX_IMAGE_BYTES,
  PublishFailure,
  toPublishFailure,
} from '../../../services/blog.service';

/** Bornes des champs, identiques à celles du record Java `ArticleDraft`. */
export const ARTICLE_LIMITS = {
  title: { min: 5, max: 140 },
  excerpt: { min: 20, max: 300 },
  body: { min: 50, max: 50_000 },
  categories: { min: 1, max: 3 },
  imageAlt: { max: 200 },
} as const;

/** Une à trois rubriques cochées. */
function categoryCount(control: AbstractControl<string[]>): ValidationErrors | null {
  const count = control.value.length;
  const { min, max } = ARTICLE_LIMITS.categories;
  return count < min || count > max ? { categoryCount: { count } } : null;
}

/**
 * Refus anticipé d'un fichier. Le serveur revérifie les octets ; ce contrôle-ci
 * évite seulement de téléverser 8 Mo pour apprendre qu'ils sont refusés.
 */
function imageProblemOf(file: File): ImageProblem | null {
  if (!ACCEPTED_IMAGE_TYPES.some((type) => type === file.type)) {
    return 'type';
  }
  return file.size > MAX_IMAGE_BYTES ? 'size' : null;
}

type CategoriesState = 'loading' | 'ready' | 'error';
type ImageProblem = 'type' | 'size';

/**
 * Formulaire de rédaction d'un article.
 *
 * Rendu côté client, comme tout le blog (voir `app.routes.server.ts`), et
 * non indexé : c'est un outil de l'équipe, pas une page du site.
 *
 * Après publication, on ouvre directement l'article à l'adresse choisie par le
 * serveur : c'est lui qui fabrique le slug et règle les doublons, le
 * formulaire ne le devine pas.
 */
@Component({
  selector: 'app-article-form',
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, TextareaModule],
  templateUrl: './article-form.html',
  styleUrl: './article-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly blog = inject(BlogService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly limits = ARTICLE_LIMITS;
  protected readonly acceptedTypes = ACCEPTED_IMAGE_TYPES.join(',');

  /**
   * Auteurs possibles : les fondateurs, depuis company.config. Une liste
   * plutôt qu'un champ libre, pour qu'un article ne soit jamais signé d'un nom
   * mal orthographié ou d'une personne qui n'est pas de l'équipe.
   */
  protected readonly authors = COMPANY.founders.map((founder) => founder.fullName);

  protected readonly categoriesState = signal<CategoriesState>('loading');
  protected readonly categories = signal<ArticleCategory[]>([]);

  protected readonly submitted = signal(false);
  protected readonly sending = signal(false);
  protected readonly failure = signal<PublishFailure | null>(null);

  protected readonly imageFile = signal<File | null>(null);
  protected readonly imagePreview = signal<string | null>(null);
  protected readonly imageProblem = signal<ImageProblem | null>(null);
  private readonly imageInput = viewChild<ElementRef<HTMLInputElement>>('imageInput');

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [
      Validators.required,
      Validators.minLength(ARTICLE_LIMITS.title.min),
      Validators.maxLength(ARTICLE_LIMITS.title.max),
    ]],
    excerpt: ['', [
      Validators.required,
      Validators.minLength(ARTICLE_LIMITS.excerpt.min),
      Validators.maxLength(ARTICLE_LIMITS.excerpt.max),
    ]],
    categories: this.fb.nonNullable.control<string[]>([], categoryCount),
    author: ['', Validators.required],
    // Validateurs posés à l'ajout d'une image : sans image, rien à décrire.
    imageAlt: [''],
    body: ['', [
      Validators.required,
      Validators.minLength(ARTICLE_LIMITS.body.min),
      Validators.maxLength(ARTICLE_LIMITS.body.max),
    ]],
  });

  constructor() {
    this.blog
      .categories()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.categoriesState.set('ready');
        },
        error: () => this.categoriesState.set('error'),
      });

    // Une URL d'aperçu retient le fichier en mémoire jusqu'à sa révocation.
    this.destroyRef.onDestroy(() => this.revokePreview());
  }

  /** Vrai une fois le champ invalide et l'erreur utile à montrer. */
  protected showError(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected isCategorySelected(code: string): boolean {
    return this.form.controls.categories.value.includes(code);
  }

  protected toggleCategory(code: string, checked: boolean): void {
    const control = this.form.controls.categories;
    const others = control.value.filter((value) => value !== code);
    // L'ordre de la liste serveur est conservé, quel que soit l'ordre des clics.
    const selected = checked ? [...others, code] : others;
    control.setValue(
      this.categories().map((category) => category.code).filter((value) => selected.includes(value)),
    );
    control.markAsTouched();
  }

  protected onImageSelected(input: HTMLInputElement): void {
    const file = input.files?.item(0) ?? null;
    if (!file) {
      this.clearImage();
      return;
    }

    const problem = imageProblemOf(file);
    if (problem) {
      this.clearImage();
      this.imageProblem.set(problem);
      return;
    }

    this.revokePreview();
    this.imageProblem.set(null);
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
    this.setAltRequired(true);
  }

  protected clearImage(): void {
    this.revokePreview();
    this.imageFile.set(null);
    this.imageProblem.set(null);
    const input = this.imageInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
    this.form.controls.imageAlt.reset('');
    this.setAltRequired(false);
  }

  protected submitForm(): void {
    this.submitted.set(true);

    if (this.form.invalid || this.categoriesState() !== 'ready') {
      this.form.markAllAsTouched();
      // Le focus va au premier champ en erreur : au clavier ou au lecteur
      // d'écran, un bouton qui ne fait rien n'explique rien.
      const firstInvalid = Object.entries(this.form.controls).find(([, control]) => control.invalid);
      if (firstInvalid) {
        document.getElementById(firstInvalid[0])?.focus();
      }
      return;
    }

    const value = this.form.getRawValue();
    const image = this.imageFile();
    this.sending.set(true);
    this.failure.set(null);
    this.blog
      .publish({ ...value, imageAlt: image ? value.imageAlt : null }, image)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (article) => {
          void this.router.navigate(['/blog', article.slug]);
        },
        error: (error: HttpErrorResponse) => {
          this.failure.set(toPublishFailure(error));
          this.sending.set(false);
        },
      });
  }

  private setAltRequired(required: boolean): void {
    const control = this.form.controls.imageAlt;
    control.setValidators(
      required
        ? [Validators.required, Validators.maxLength(ARTICLE_LIMITS.imageAlt.max)]
        : null,
    );
    control.updateValueAndValidity();
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url) {
      URL.revokeObjectURL(url);
      this.imagePreview.set(null);
    }
  }
}

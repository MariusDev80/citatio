import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);

  protected readonly submitted = signal(false);
  protected readonly submitSuccess = signal(false);

  protected readonly contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(5)]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submitForm(): void {
    this.submitted.set(true);
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      this.submitSuccess.set(true);
      this.contactForm.reset();
      this.submitted.set(false);
    }
  }
}

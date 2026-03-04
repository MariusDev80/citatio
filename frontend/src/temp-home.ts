import { Component, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      
      <!-- Navigation -->
      <nav [class]="'fixed w-full z-50 transition-all duration-300 ' + (isScrolled() ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'bg-transparent py-5')">
        <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div class="flex items-center gap-2 group cursor-pointer">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <span class="text-2xl font-black tracking-tighter text-slate-800 uppercase">CITATIO</span>
          </div>
          
          <div class="hidden md:flex items-center gap-8">
            @for (item of ['Accueil', 'Services', 'Qui sommes nous', 'FAQ']; track item) {
              <a href="#" class="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                {{ item }}
              </a>
            }
            <button class="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95">
              Contact
            </button>
          </div>
          
          <div class="md:hidden text-slate-800">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-40 pb-40 overflow-hidden min-h-[95vh] flex items-center justify-center">
        
        <!-- BACKDROP: Mesh + Radar Neural -->
        <div class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-0 z-0">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
          </div>
          
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[1200px] z-10 opacity-80">
             <svg viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto animate-slow-spin">
                <circle cx="400" cy="400" r="140" stroke="#3b82f6" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="2 12" />
                <circle cx="400" cy="400" r="220" stroke="#6366f1" stroke-opacity="0.15" stroke-width="1" stroke-dasharray="8 20" />
                <circle cx="400" cy="400" r="300" stroke="#3b82f6" stroke-opacity="0.1" stroke-width="0.8" stroke-dasharray="1 30" />
                <circle cx="400" cy="400" r="380" stroke="#6366f1" stroke-opacity="0.05" stroke-width="0.5" />
                
                <!-- Bulles Orbitantes (Taille ajustée) -->
                <circle r="5.5" fill="#3b82f6" class="filter blur-[1px]">
                   <animateMotion dur="14s" repeatCount="indefinite" path="M 400, 260 a 140,140 0 1,0 1,0 Z" />
                </circle>
                <circle r="4.5" fill="#6366f1" opacity="0.9">
                   <animateMotion dur="24s" repeatCount="indefinite" path="M 400, 180 a 220,220 0 1,1 1,0 Z" />
                </circle>
                <circle r="4" fill="#2563eb" opacity="0.7">
                   <animateMotion dur="19s" begin="-3s" repeatCount="indefinite" path="M 400, 180 a 220,220 0 1,0 1,0 Z" />
                </circle>
                <circle r="5" fill="#818cf8" opacity="0.5">
                   <animateMotion dur="40s" repeatCount="indefinite" path="M 400, 100 a 300,300 0 1,1 1,0 Z" />
                </circle>
                <circle r="3" fill="#3b82f6" opacity="0.4">
                   <animateMotion dur="50s" begin="-8s" repeatCount="indefinite" path="M 400, 20 a 380,380 0 1,0 1,0 Z" />
                </circle>
             </svg>
          </div>

          <div class="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-white via-white/80 to-transparent z-20"></div>
        </div>

        <!-- Contenu Hero -->
        <div class="max-w-7xl mx-auto px-6 relative z-30 flex flex-col items-center text-center">
          
          <!-- Badge SAUTILLANT -->
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 backdrop-blur-md border border-blue-100 text-blue-700 text-xs font-bold mb-10 animate-bounce shadow-sm cursor-default">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            L'ÈRE DU SEO EST RÉVOLUE
          </div>
          
          <div class="relative">
            <h1 class="text-6xl md:text-8xl font-black text-slate-900 leading-[1] tracking-tight mb-8">
              Rendez votre entreprise <br />
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                visible sur l'IA
              </span>
            </h1>
            <div class="absolute -top-12 -right-16 text-blue-400/40 animate-pulse hidden lg:block">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
          </div>
          
          <p class="max-w-2xl mx-auto text-xl text-slate-600 leading-relaxed mb-12">
            Vos clients utilisent ChatGPT, Gemini et Google AI pour trouver des solutions. 
            <span class="font-bold text-slate-800">Êtes-vous cité dans leurs réponses ?</span>
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button class="cta-primary group relative bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200/50 overflow-hidden">
              <span class="relative z-10 flex items-center gap-2">
                Découvrir le GEO 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </span>
              <div class="shine-effect"></div>
            </button>
            <button class="px-10 py-5 rounded-2xl font-bold text-lg text-slate-600 hover:bg-white hover:shadow-md transition-all flex items-center gap-2 bg-white/50 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7"/><path d="M16 5V3"/><path d="M8 5V3"/><path d="M3 10h18"/><path d="M18 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="m22 22-1.5-1.5"/></svg>
              Voir l'audit gratuit
            </button>
          </div>
        </div>
      </section>

      <!-- Problem Section -->
      <section class="py-24 bg-white relative z-30">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-4xl font-black text-slate-900 mb-6 leading-tight">
                Le SEO classique <br>ne suffit plus.
              </h2>
              <div class="space-y-6 text-lg text-slate-600">
                <p>
                  De plus en plus de vos prospects utilisent les moteurs génératifs — ChatGPT, Gemini, Perplexity — pour chercher des prestataires et prendre des décisions.
                </p>
                <p class="p-6 bg-slate-50 rounded-2xl border-l-4 border-blue-600 italic">
                  "Si votre entreprise n'apparaît pas dans ces réponses, <span class="text-slate-900 font-bold">vous êtes invisible</span> sur un canal qui explose."
                </p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-6">
              <div class="flex gap-5 p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div class="w-12 h-12 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 mb-1">Le SEO sature</h3>
                  <p class="text-slate-600">Optimiser pour Google est devenu une guerre de position coûteuse et lente.</p>
                </div>
              </div>

              <div class="flex gap-5 p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div class="w-12 h-12 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 mb-1">La solution : le GEO</h3>
                  <p class="text-slate-600">Optimisez votre présence pour les moteurs de recherche génératifs (LLM).</p>
                </div>
              </div>

              <div class="flex gap-5 p-6 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div class="w-12 h-12 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 mb-1">Complémentaire</h3>
                  <p class="text-slate-600">Nous ne remplaçons pas votre SEO, nous ajoutons la couche IA cruciale.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services -->
      <section class="py-24 bg-slate-50">
        <div class="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 class="text-4xl font-black text-slate-900 mb-4">Ce que nous faisons pour vous</h2>
          <p class="text-slate-600 max-w-xl mx-auto">Une approche scientifique pour dominer les résultats générés par l'Intelligence Artificielle.</p>
        </div>

        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white relative overflow-hidden group shadow-2xl shadow-blue-200/50 transition-all hover:scale-[1.01]">
            <div class="relative z-10 flex flex-col h-full justify-between">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-6 opacity-80"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <h3 class="text-3xl font-black mb-4 tracking-tight">Audit de visibilité IA</h3>
                <p class="text-blue-100 text-lg max-w-md leading-relaxed">
                  Nous analysons comment les IA perçoivent votre marque aujourd'hui et identifions les opportunités pour apparaître dans leurs recommandations.
                </p>
              </div>
              <button class="mt-8 self-start px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                Lancer mon audit
              </button>
            </div>
            <div class="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
          </div>

          <div class="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-blue-300 transition-all flex flex-col justify-between hover:scale-[1.01]">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-6 text-blue-600"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
              <h3 class="text-2xl font-black mb-4 text-slate-900">Stratégie GEO</h3>
              <p class="text-slate-600 leading-relaxed">
                Un plan d'action précis pour positionner votre entreprise dans ChatGPT, Gemini et Perplexity.
              </p>
            </div>
          </div>

          <div class="md:col-span-3 bg-white rounded-3xl p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-300 transition-all flex flex-col md:flex-row items-center gap-10 hover:scale-[1.01]">
            <div class="w-20 h-20 md:w-32 md:h-32 shrink-0 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
            </div>
            <div class="flex-1 text-center md:text-left">
              <h3 class="text-2xl font-black mb-4 text-slate-900">Déploiement & Suivi</h3>
              <p class="text-slate-600 text-lg leading-relaxed">
                Nous mettons en œuvre la stratégie, produisons les contenus optimisés et mesurons votre progression.
              </p>
            </div>
            <button class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-24 px-6">
        <div class="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent)] opacity-30"></div>
          <div class="relative z-10">
            <h2 class="text-3xl md:text-5xl font-black text-white mb-6">Prêt à devenir visible sur l'IA ?</h2>
            <button class="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              Prendre rendez-vous
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div class="col-span-1 md:col-span-2 text-left">
               <div class="flex items-center gap-2 mb-6 justify-start">
                <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <span class="text-xl font-black tracking-tighter text-slate-800 uppercase">CITATIO</span>
              </div>
              <p class="text-slate-500 max-w-xs leading-relaxed">
                Le leader de l'optimisation pour les moteurs de recherche génératifs (GEO). Vos services, notre passion.
              </p>
            </div>
            
            <div class="text-left">
              <h4 class="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Navigation</h4>
              <ul class="space-y-4 text-slate-600 font-medium">
                <li><a href="#" class="hover:text-blue-600 transition-colors">Accueil</a></li>
                <li><a href="#" class="hover:text-blue-600 transition-colors">Services</a></li>
                <li><a href="#" class="hover:text-blue-600 transition-colors">Qui sommes nous</a></li>
                <li><a href="#" class="hover:text-blue-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div class="text-left">
              <h4 class="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Légal</h4>
              <ul class="space-y-4 text-slate-600 font-medium">
                <li><a href="#" class="hover:text-blue-600 transition-colors">Mentions légales</a></li>
                <li><a href="#" class="hover:text-blue-600 transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" class="hover:text-blue-600 transition-colors">CGU</a></li>
              </ul>
            </div>
          </div>
          
          <div class="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
            <p>© 2026 Citatio. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
    }
    .blob-1 { width: 800px; height: 800px; background: #dbeafe; top: -300px; left: -200px; animation: float 15s infinite alternate; }
    .blob-2 { width: 700px; height: 700px; background: #e0e7ff; bottom: -200px; right: -200px; animation: float 20s infinite alternate-reverse; }
    .blob-3 { width: 400px; height: 400px; background: #eff6ff; top: 10%; right: 10%; animation: float 12s infinite alternate; }

    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(60px, 40px) scale(1.1); }
    }

    .animate-slow-spin { animation: slow-spin 80s linear infinite; }
    @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @keyframes bounce {
      0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
      50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    }
    .animate-bounce { animation: bounce 1.5s infinite; }

    .cta-primary:hover .shine-effect { transform: translateX(100%); }
    .shine-effect {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
      transform: translateX(-100%);
      transition: transform 0.8s ease;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }
}
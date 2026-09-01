import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Citatio PrimeNG preset, Aura base, remapped onto the editorial palette
 * (paper / ink / ultramarine) defined in `styles.css`.
 *
 * PrimeNG only dresses two surfaces on this site: the FAQ accordion and the
 * contact form fields. Everything else is plain Tailwind on our own tokens, so
 * this file exists purely to stop those two from rendering in Aura's stock
 * blue-and-slate.
 *
 * Values are literals rather than `var(--color-*)` because PrimeNG derives
 * hover/active shades from them at theme-build time and cannot resolve a
 * runtime custom property. Dark mode is driven by the `.dark` class on
 * `<html>`, shared with Tailwind so both react to the same toggle.
 */

/** Ultramarine ramp, the accent from `styles.css`, expanded for PrimeNG. */
const ULTRAMARINE = {
  50: '#eef0fb',
  100: '#d8dcf5',
  200: '#b3bbec',
  300: '#8894f5',
  400: '#5a68c9',
  500: '#3a49ad',
  600: '#26359c',
  700: '#1b2778',
  800: '#141d59',
  900: '#0f1642',
  950: '#0a0e2b',
} as const;

/** Paper/ink neutrals, warm, matching `--color-paper` and `--color-ink`. */
const NEUTRAL = {
  0: '#ffffff',
  50: '#f9f8f5',
  100: '#f2f0ea',
  200: '#e4e1d8',
  300: '#cbc8bf',
  400: '#9b9992',
  500: '#7b7d88',
  600: '#4a4c57',
  700: '#33353f',
  800: '#171923',
  900: '#12131a',
  950: '#0e0f15',
} as const;

const CitatioPreset = definePreset(Aura, {
  semantic: {
    primary: ULTRAMARINE,
    colorScheme: {
      light: {
        primary: {
          color: ULTRAMARINE[600],
          inverseColor: '#ffffff',
          hoverColor: ULTRAMARINE[700],
          activeColor: ULTRAMARINE[800],
        },
        highlight: {
          background: 'rgba(38, 53, 156, 0.07)',
          focusBackground: 'rgba(38, 53, 156, 0.12)',
          color: ULTRAMARINE[700],
          focusColor: ULTRAMARINE[800],
        },
        surface: NEUTRAL,
      },
      dark: {
        primary: {
          color: ULTRAMARINE[300],
          inverseColor: '#0e0f15',
          hoverColor: ULTRAMARINE[200],
          activeColor: ULTRAMARINE[100],
        },
        highlight: {
          background: 'rgba(136, 148, 245, 0.14)',
          focusBackground: 'rgba(136, 148, 245, 0.22)',
          color: '#e8e9f0',
          focusColor: '#ffffff',
        },
        surface: NEUTRAL,
      },
    },
  },

  components: {
    /**
     * The FAQ accordion is the one place PrimeNG paints a large surface.
     * Left alone it renders a pure-white card with `surface.500` labels at
     * 4.09:1, below AA, inside our warm paper page. These tokens strip the
     * card entirely so the accordion reads as ruled editorial rows, and pin
     * the label to `ink` in both schemes.
     */
    accordion: {
      panel: {
        borderWidth: '0 0 1px 0',
      },
      header: {
        padding: '1.25rem 0',
        borderWidth: '0',
        borderRadius: '0',
        fontWeight: '500',
      },
      content: {
        padding: '0 0 1.25rem 0',
        borderWidth: '0',
      },
      colorScheme: {
        light: {
          panel: { borderColor: 'rgba(18, 19, 26, 0.14)' },
          header: {
            background: 'transparent',
            hoverBackground: 'transparent',
            activeBackground: 'transparent',
            activeHoverBackground: 'transparent',
            color: '#12131a',
            hoverColor: '#26359c',
            activeColor: '#12131a',
            activeHoverColor: '#26359c',
          },
          content: { background: 'transparent', color: '#4a4c57' },
        },
        dark: {
          panel: { borderColor: 'rgba(232, 233, 240, 0.16)' },
          header: {
            background: 'transparent',
            hoverBackground: 'transparent',
            activeBackground: 'transparent',
            activeHoverBackground: 'transparent',
            color: '#e8e9f0',
            hoverColor: '#8894f5',
            activeColor: '#e8e9f0',
            activeHoverColor: '#8894f5',
          },
          content: { background: 'transparent', color: '#a9abb8' },
        },
      },
    },
  },
});

export default CitatioPreset;

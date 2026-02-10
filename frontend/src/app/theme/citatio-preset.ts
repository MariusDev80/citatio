import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Custom PrimeNG preset for Citatio.
 *
 * Built on top of Aura using `definePreset` — the recommended approach
 * from PrimeNG's theming documentation. Primitive token references like
 * `{blue.500}` resolve to the built-in color palette at runtime, which
 * ensures consistency and dark/light mode support out of the box.
 *
 * Palette: blue / sky (light blue) primary — slate (black-ish) surfaces.
 */
const CitatioPreset = definePreset(Aura, {
  semantic: {
    // Map the primary color ramp to the built-in blue palette
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },

    colorScheme: {
      light: {
        primary: {
          color: '{blue.600}',
          inverseColor: '#ffffff',
          hoverColor: '{blue.700}',
          activeColor: '{blue.800}',
        },
        highlight: {
          background: '{blue.50}',
          focusBackground: '{blue.100}',
          color: '{blue.700}',
          focusColor: '{blue.800}',
        },
        // Slate surfaces give a subtle cool-gray / black tone in light mode
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        primary: {
          color: '{sky.400}',
          inverseColor: '{slate.950}',
          hoverColor: '{sky.300}',
          activeColor: '{sky.200}',
        },
        highlight: {
          background: 'rgba(56, 189, 248, 0.16)',
          focusBackground: 'rgba(56, 189, 248, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
        // Dark slate surfaces for a deep black/dark-blue feel
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});

export default CitatioPreset;

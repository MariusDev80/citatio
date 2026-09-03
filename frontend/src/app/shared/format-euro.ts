/**
 * Groups thousands with a narrow no-break space, as French typography requires
 * before a thousands group and before the currency symbol.
 *
 * `toLocaleString` is deliberately avoided: it depends on the ICU data present
 * at runtime and could format differently on the server render and in the
 * browser, which would show up as a hydration mismatch on every price.
 */
export function formatEuro(amount: number): string {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

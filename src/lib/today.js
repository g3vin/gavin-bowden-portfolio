// The business date every sheet and screen on the site prints.
//
// One module so the receipt, the inquiry panel and the item record cannot drift
// apart by a day at midnight -- they are all supposed to be the same
// transaction, looked at from two machines.
//
// Read at module load in the browser, which is deliberate: main.jsx mounts with
// createRoot rather than hydrateRoot precisely because this value cannot be
// known when the pages are prerendered.
export const printedOn = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date())

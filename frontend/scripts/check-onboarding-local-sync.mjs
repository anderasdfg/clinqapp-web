// ponytail: self-check for onboarding-local-sync pure rules (no vite aliases)
// run: node frontend/scripts/check-onboarding-local-sync.mjs
function servicesFromPersisted(services) {
  const list = services?.services;
  if (!list?.length) return [];
  return list.map((s, i) => ({
    id: `persisted-${i}-${s.name}`,
    name: s.name,
    description: s.description || '',
  }));
}

function schedulesFromPersisted(businessHours, fallbackLen) {
  return businessHours?.schedules?.length
    ? businessHours.schedules
    : Array.from({ length: fallbackLen }, (_, i) => ({ i }));
}

const empty = servicesFromPersisted(null);
if (empty.length !== 0) throw new Error('empty');
const mapped = servicesFromPersisted({
  services: [{ name: 'X', description: null }],
});
if (mapped[0].id !== 'persisted-0-X' || mapped[0].description !== '') {
  throw new Error('map');
}
const custom = schedulesFromPersisted(
  { schedules: [{ dayOfWeek: 'MONDAY', startTime: '10:00' }] },
  7
);
if (custom[0].startTime !== '10:00') throw new Error('custom');
const def = schedulesFromPersisted(null, 7);
if (def.length !== 7) throw new Error('default');
console.log('ok onboarding-local-sync');

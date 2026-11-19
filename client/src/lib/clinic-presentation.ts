const shorterTitles = new Map([
  ['برنامج متابعة شهرية بالعيادة', 'برنامج المتابعة الشهرية'],
  ['كشف واستشارة بالعيادة (حضور شخصي)', 'كشف واستشارة في العيادة'],
  ['كشف واستشارة بالعيادة', 'كشف واستشارة في العيادة'],
  ['تغذية المرأة ورعاية الحمل بالعيادة', 'تغذية المرأة ورعاية الحمل'],
]);

export const clinicServiceTitle = (title: string) => shorterTitles.get(title) ?? title;

export const clinicServiceArtwork = new Map([
  ['nutrition', '/assets/clinic-services-consultation.webp'],
  ['women', '/assets/clinic-services-women.webp'],
  ['monthly', '/assets/clinic-services-monthly.webp'],
]);

const serviceRank = new Map([
  ['nutrition', 0],
  ['women', 1],
  ['monthly', 3],
]);

export const clinicServiceRank = (id: string) => serviceRank.get(id) ?? 2;

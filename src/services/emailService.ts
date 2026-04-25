export const generateMailToLink = (to: string, subject?: string, body?: string) => {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  
  const queryString = params.toString();
  return `mailto:${to}${queryString ? `?${queryString}` : ''}`;
};

export const openEmailClient = (to: string, subject?: string, body?: string) => {
  const url = generateMailToLink(to, subject, body);
  window.open(url, '_self'); // '_self' is better for mailto to avoid blank tabs
};

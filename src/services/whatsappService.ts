export const generateWhatsAppLink = (phoneNumber?: string, message?: string) => {
  const cleanNumber = phoneNumber?.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message || '');
  
  if (cleanNumber) {
    return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ''}`;
  }
  
  return `https://wa.me/${message ? `?text=${encodedMessage}` : ''}`;
};

export const openWhatsApp = (phoneNumber?: string, message?: string) => {
  const url = generateWhatsAppLink(phoneNumber, message);
  window.open(url, '_blank');
};

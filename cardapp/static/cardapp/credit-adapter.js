// static/cardapp/js/credit-adapter.js
import { bindMasked, formatCardNumber, formatExpiry, validateExpiry, onlyDigits } from './shared.js';

export function initCreditPreview() {
  const els = {
    number: document.getElementById('card-number'),
    name: document.getElementById('card-name'),
    exp: document.getElementById('card-expiry'),
    cvv: document.getElementById('card-cvv'),
    previewNumber: document.getElementById('preview-number'),
    previewName: document.getElementById('preview-name'),
    previewExpiry: document.getElementById('preview-expiry'),
    previewCvv: document.getElementById('preview-cvv'),
    card: document.getElementById('credit-card'),
  };

  // Card number
  bindMasked(els.number, formatCardNumber, (_, display) => {
    els.previewNumber.textContent = display || '#### #### #### ####';
  });

  // Name
  els.name.addEventListener('input', () => {
    els.previewName.textContent = (els.name.value || 'FULL NAME').toUpperCase();
  });

  // Expiry + validation
  bindMasked(els.exp, formatExpiry, (_, display) => {
    const valid = validateExpiry(display);
    els.previewExpiry.textContent = valid ? display : 'MM/YY';
    els.exp.classList.toggle('is-invalid', !valid && display.length === 5);
  });

  // CVV / flip
  els.cvv.addEventListener('focus', () => els.card.classList.add('flip'));
  els.cvv.addEventListener('blur',  () => els.card.classList.remove('flip'));
  els.cvv.addEventListener('input', () => {
    els.cvv.value = onlyDigits(els.cvv.value).slice(0,3);
    els.previewCvv.textContent = els.cvv.value || '***';
  });
}

// static/cardapp/js/shared.js

export function onlyDigits(str){ return String(str || '').replace(/\D/g, ''); }

export function formatCardNumber(raw){
  const digits = onlyDigits(raw).slice(0,16);
  const display = digits.replace(/(.{4})/g, '$1 ').trim();
  return { value: digits, display };
}

export function formatExpiry(raw){
  const digits = onlyDigits(raw).slice(0,4);
  let display = digits;
  if (digits.length >= 3) display = digits.replace(/(\d{2})(\d{1,2})/, '$1/$2');
  return { value: digits, display };
}

export function validateExpiry(display){
  if (!display || display.length !== 5) return false;
  const [mm, yy] = display.split('/').map(v => parseInt(v,10));
  if (!(mm >= 1 && mm <= 12)) return false;
  const now = new Date();
  const cy = parseInt(now.getFullYear().toString().slice(-2), 10);
  const cm = now.getMonth() + 1;
  return yy > cy || (yy === cy && mm >= cm);
}

export function bindMasked(input, formatter, onUpdate){
  input.addEventListener('input', () => {
    const { value, display } = formatter(input.value);
    input.value = display;
    onUpdate(value, display);
  });
}

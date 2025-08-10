// ----------------- helpers
const $ = (s, c = document) => c.querySelector(s);
const setText = (el, v, fb = "—") => { if (el) el.textContent = (v ?? "").trim() || fb; };
const onlyDigits = s => (s || "").replace(/\D+/g, "");

// ----------------- nodes
const form    = $("#license-form");
const card    = $("#license-card");
const flipBtn = $("#flip-btn");

const inNo    = $("#lic-no");
const inTckn  = $("#lic-tckn");
const inName  = $("#lic-name");
const inDob   = $("#lic-dob");
const inClass = $("#lic-class");
const inIssue = $("#lic-issue");
const inExp   = $("#lic-expiry");
const inPhoto = $("#lic-photo");

const outNo    = $("#preview-license-no");
const outTckn  = $("#preview-tckn");
const outName  = $("#preview-name");
const outDob   = $("#preview-dob");
const outClass = $("#preview-class");
const outIssue = $("#preview-issue");
const outExp   = $("#preview-expiry");
const outPhoto = $("#preview-photo");

// error areas
const err = {
  no: $("#err-lic-no"),
  tckn: $("#err-lic-tckn"),
  name: $("#err-lic-name"),
  dob: $("#err-lic-dob"),
  cls: $("#err-lic-class"),
  issue: $("#err-lic-issue"),
  exp: $("#err-lic-expiry"),
  photo: $("#err-lic-photo"),
};

function markInvalid(input, msgEl, msg) {
  input?.classList.add("is-invalid");
  input?.setAttribute("aria-invalid", "true");
  if (msgEl) msgEl.textContent = msg || "";
}
function clearInvalid(input, msgEl) {
  input?.classList.remove("is-invalid");
  input?.removeAttribute("aria-invalid");
  if (msgEl) msgEl.textContent = "";
}

// ----------------- formatters
function formatBelgeNoLive(v) {
  return onlyDigits(v).slice(0, 6); // 6 digits exactly
}
function formatTcknLive(v) {
  return onlyDigits(v).slice(0, 11);
}
function formatDateTRLive(v) {
  v = onlyDigits(v).slice(0, 8); // ddMMyyyy
  const dd = v.slice(0,2);
  const mm = v.slice(2,4);
  const yyyy = v.slice(4,8);
  let out = dd;
  if (mm) out += "." + mm;
  if (yyyy) out += "." + yyyy;
  return out;
}

// ----------------- validators
function parseDateTR(s) {
  // expects GG.AA.YYYY
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
  if (!m) return null;
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}
function validDateRange(d, { minYear = 1900, maxYear = 2100 } = {}) {
  const y = d.getFullYear();
  return y >= minYear && y <= maxYear;
}

// Turkish TCKN algorithm
function validateTCKN(value) {
  const v = onlyDigits(value);
  if (v.length !== 11) return { ok: false, msg: "11 haneli olmalı." };
  if (v[0] === "0") return { ok: false, msg: "İlk hane 0 olamaz." };
  const d = v.split("").map(n => +n);
  const sumOdd  = d[0] + d[2] + d[4] + d[6] + d[8];
  const sumEven = d[1] + d[3] + d[5] + d[7];
  const d10 = ((sumOdd * 7) - sumEven) % 10;
  if (d10 !== d[9]) return { ok: false, msg: "Geçersiz kontrol (10. hane)." };
  const d11 = (d.slice(0,10).reduce((a,b) => a + b, 0)) % 10;
  if (d11 !== d[10]) return { ok: false, msg: "Geçersiz kontrol (11. hane)." };
  return { ok: true };
}

function validateName(value) {
  if (!value || !value.trim()) return { ok: false, msg: "Ad Soyad zorunludur." };
  if (value.trim().length < 2) return { ok: false, msg: "Çok kısa." };
  return { ok: true };
}

function validateClass(value) {
  if (!value || !value.trim()) return { ok: false, msg: "Sınıf zorunludur." };
  if (!/^[A-Z][0-9]?[A-Z]?$/.test(value.trim().toUpperCase())) {
    return { ok: false, msg: "Geçersiz sınıf." };
  }
  return { ok: true };
}

function validateDates(dobStr, issueStr, expStr) {
  const today = new Date();
  const result = { ok: true, problems: {} };

  const dob = parseDateTR(dobStr);
  if (!dob || !validDateRange(dob)) {
    result.ok = false; result.problems.dob = "Tarih GG.AA.YYYY olmalı.";
  }

  const issue = parseDateTR(issueStr);
  if (!issue || !validDateRange(issue)) {
    result.ok = false; result.problems.issue = "Tarih GG.AA.YYYY olmalı.";
  }

  const exp = parseDateTR(expStr);
  if (!exp || !validDateRange(exp)) {
    result.ok = false; result.problems.exp = "Tarih GG.AA.YYYY olmalı.";
  }

  if (dob && issue && issue < dob) { result.ok = false; result.problems.issue = "Veriliş, doğumdan sonra olmalı."; }
  if (issue && exp && exp <= issue) { result.ok = false; result.problems.exp = "Geçerlilik, verilişten sonra olmalı."; }
  if (dob && dob > today) { result.ok = false; result.problems.dob = "Gelecek tarih olamaz."; }
  if (exp && exp < issue) { result.ok = false; result.problems.exp = "Geçerlilik verilişten sonra olmalı."; }

  return result;
}

// ----------------- live formatting + preview
inNo?.addEventListener("input", () => {
  const f = formatBelgeNoLive(inNo.value);
  if (inNo.value !== f) inNo.value = f;
  setText(outNo, f);
});
inName?.addEventListener("input", () => setText(outName, inName.value.toUpperCase()));

inTckn?.addEventListener("input", () => {
  const f = formatTcknLive(inTckn.value);
  if (inTckn.value !== f) inTckn.value = f;
  setText(outTckn, f);
});

[inDob, inIssue, inExp].forEach(inp => {
  inp?.addEventListener("input", () => {
    const f = formatDateTRLive(inp.value);
    if (inp.value !== f) inp.value = f;
    const target = (inp === inDob) ? outDob : (inp === inIssue) ? outIssue : outExp;
    setText(target, f);
  });
});

inClass?.addEventListener("input", () => setText(outClass, inClass.value.toUpperCase()));

// Photo preview + placeholder toggle
inPhoto?.addEventListener("change", () => {
  const file = inPhoto.files?.[0];
  if (!file) {
    outPhoto.style.backgroundImage = "";
    outPhoto.classList.add("empty");
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    outPhoto.style.backgroundImage = `url('${e.target.result}')`;
    outPhoto.classList.remove("empty");
  };
  reader.readAsDataURL(file);
});

// ----------------- validation wiring
function validateField_No() {
  const v = formatBelgeNoLive(inNo.value);
  if (v.length !== 6) { markInvalid(inNo, err.no, "Belge No 6 haneli olmalı."); return false; }
  clearInvalid(inNo, err.no); return true;
}
function validateField_TCKN() {
  const res = validateTCKN(inTckn.value);
  if (!res.ok) { markInvalid(inTckn, err.tckn, res.msg); return false; }
  clearInvalid(inTckn, err.tckn); return true;
}
function validateField_Name() {
  const res = validateName(inName.value);
  if (!res.ok) { markInvalid(inName, err.name, res.msg); return false; }
  clearInvalid(inName, err.name); return true;
}
function validateField_Class() {
  const res = validateClass((inClass.value || "").toUpperCase());
  if (!res.ok) { markInvalid(inClass, err.cls, res.msg); return false; }
  clearInvalid(inClass, err.cls); return true;
}
function validateField_Dates() {
  const res = validateDates(inDob.value, inIssue.value, inExp.value);
  clearInvalid(inDob, err.dob); clearInvalid(inIssue, err.issue); clearInvalid(inExp, err.exp);
  if (!res.ok) {
    if (res.problems.dob)   markInvalid(inDob,   err.dob,   res.problems.dob);
    if (res.problems.issue) markInvalid(inIssue, err.issue, res.problems.issue);
    if (res.problems.exp)   markInvalid(inExp,   err.exp,   res.problems.exp);
    return false;
  }
  return true;
}

[inNo, inTckn, inName, inClass].forEach(inp => {
  inp?.addEventListener("blur", () => {
    if (inp === inNo) return validateField_No();
    if (inp === inTckn) return validateField_TCKN();
    if (inp === inName) return validateField_Name();
    if (inp === inClass) return validateField_Class();
  });
});
[inDob, inIssue, inExp].forEach(inp => {
  inp?.addEventListener("blur", validateField_Dates);
});

function validateAll() {
  const ok =
    validateField_No() &
    validateField_TCKN() &
    validateField_Name() &
    validateField_Class() &
    validateField_Dates();
  return !!ok;
}

// ----------------- flip behavior + initial sync
flipBtn?.addEventListener("click", () => card?.classList.toggle("flip"));
card?.addEventListener("click", () => card.classList.toggle("flip"));

function initDefaults(){
  setText(outNo,    inNo?.value || outNo?.textContent);
  setText(outTckn,  inTckn?.value || outTckn?.textContent);
  setText(outName,  inName?.value || outName?.textContent);
  setText(outDob,   inDob?.value || outDob?.textContent);
  setText(outClass, inClass?.value || outClass?.textContent);
  setText(outIssue, inIssue?.value || outIssue?.textContent);
  setText(outExp,   inExp?.value || outExp?.textContent);
}
initDefaults();

// gate submission (if you add a submit button later)
form?.addEventListener("submit", (e) => {
  if (!validateAll()) {
    e.preventDefault();
    form.querySelector(".is-invalid")?.focus();
  }
});

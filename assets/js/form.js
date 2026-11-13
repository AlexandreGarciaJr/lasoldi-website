// Formulário de contato: validação acessível + envio progressivo (fetch).
// Sem JS, o formulário faz POST normal para api/contato.php.

const MSG = {
  nome: 'Conte como podemos chamar você.',
  telefone: 'Informe um WhatsApp ou telefone com DDD.',
  email: 'Este e-mail parece incompleto.',
  consentimento: 'Precisamos do seu consentimento para retornar o contato.',
  erroEnvio: 'Não conseguimos enviar agora. Tente de novo ou fale direto pelo WhatsApp.',
};

const onlyDigits = (v) => v.replace(/\D/g, '');

function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const time = form.querySelector('[data-form-time]');
  if (time) time.value = String(Date.now());

  const tel = form.elements.telefone;
  tel?.addEventListener('input', () => {
    const pos = tel.selectionStart === tel.value.length;
    tel.value = maskPhone(tel.value);
    if (pos) tel.setSelectionRange(tel.value.length, tel.value.length);
  });

  const setError = (input, msg) => {
    const field = input.closest('.field');
    const out = field?.querySelector('.field__error');
    field?.classList.toggle('is-invalid', !!msg);
    if (msg) {
      input.setAttribute('aria-invalid', 'true');
      if (out) { input.setAttribute('aria-describedby', out.id); out.textContent = msg; }
    } else {
      input.removeAttribute('aria-invalid');
      if (out) out.textContent = '';
    }
  };

  const validate = () => {
    const f = form.elements;
    const errors = [];
    const check = (input, ok, msg) => { setError(input, ok ? '' : msg); if (!ok) errors.push(input); };
    check(f.nome, f.nome.value.trim().length >= 2, MSG.nome);
    const digits = onlyDigits(f.telefone.value);
    check(f.telefone, digits.length >= 10 && digits.length <= 13, MSG.telefone);
    const email = f.email.value.trim();
    check(f.email, !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), MSG.email);
    check(f.consentimento, f.consentimento.checked, MSG.consentimento);
    return errors;
  };

  // revalida campos já marcados enquanto a pessoa corrige
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') validate();
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'consentimento' && e.target.getAttribute('aria-invalid') === 'true') validate();
  });

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[data-form-submit]');

  // retorno do envio sem JS (api/contato.php redireciona com ?erro=1)
  if (new URLSearchParams(location.search).has('erro')) {
    status.textContent = MSG.erroEnvio;
    status.classList.add('is-error');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    const errors = validate();
    if (errors.length) { errors[0].focus(); return; }

    submit.setAttribute('aria-busy', 'true');
    const label = submit.querySelector('span');
    const original = label.textContent;
    label.textContent = 'Enviando…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.message || 'erro');

      const done = document.createElement('div');
      done.className = 'form-success';
      done.setAttribute('tabindex', '-1');
      done.innerHTML = `
        <img class="form-success__coin" src="assets/brand/moeda-prata-claro.svg" alt="" width="48" height="48">
        <h3>Recebemos sua mensagem.</h3>
        <p>Em breve, alguém da nossa equipe fala com você. Se preferir adiantar, chame no WhatsApp.</p>`;
      form.replaceWith(done);
      done.focus();
    } catch (err) {
      status.textContent = err.message && err.message !== 'erro' ? err.message : MSG.erroEnvio;
      status.classList.add('is-error');
      submit.removeAttribute('aria-busy');
      label.textContent = original;
    }
  });
}

(function () {
  if (sessionStorage.getItem('pmQuizSeen')) return;

  const QUESTIONS = {
    goal: {
      text: 'What is your primary health goal?',
      sub: 'Answer two quick questions and we\'ll match you with the right peptide therapy.',
      options: [
        { value: 'weight',   icon: '⚖️', label: 'Lose weight or improve metabolic health' },
        { value: 'recovery', icon: '🩹', label: 'Recover from injury or reduce inflammation' },
        { value: 'neuro',    icon: '🧠', label: 'Improve sleep, mood, or brain health' },
      ],
    },
    weight_detail: {
      text: 'Which best describes your situation?',
      sub: 'This helps us determine whether a single or dual-mechanism therapy fits you better.',
      options: [
        { value: 'tirzepatide', icon: '📉', label: 'I want maximum weight loss — I have significant weight to lose' },
        { value: 'semaglutide', icon: '🩸', label: 'Steady weight loss with blood sugar or insulin sensitivity benefits' },
      ],
    },
    recovery_detail: {
      text: 'What is your primary concern?',
      sub: 'Different peptides target different tissue types and inflammatory pathways.',
      options: [
        { value: 'bpc157', icon: '🫁', label: 'Gut health, IBS, or digestive inflammation' },
        { value: 'kpv',    icon: '🩺', label: 'Wound healing, skin condition, or chronic inflammation' },
        { value: 'tb500',  icon: '💪', label: 'Muscle, tendon, or soft tissue injury' },
        { value: 'motsc',  icon: '🦴', label: 'Bone health, metabolic decline, or low energy' },
      ],
    },
    neuro_detail: {
      text: 'What is your primary concern?',
      sub: 'Each neurological peptide works through a distinct pathway.',
      options: [
        { value: 'epitalon', icon: '😴', label: 'Chronic insomnia or poor sleep quality' },
        { value: 'semax',    icon: '🧬', label: 'Migraines, nerve pain, or cognitive recovery' },
        { value: 'epitalon', icon: '⏳', label: 'Longevity, anti-aging, and circadian health' },
        { value: 'dsip',     icon: '🔄', label: 'Opioid or substance withdrawal support' },
      ],
    },
  };

  const RESULTS = {
    semaglutide: {
      name: 'Semaglutide',
      tag: 'GLP-1 Agonist',
      icon: '💊',
      desc: 'Based on your goals, Semaglutide is a strong match. This GLP-1 receptor agonist is clinically proven to reduce weight by 15–17% while improving blood sugar control and cardiovascular health.',
      anchor: 'semaglutide',
      available: true,
    },
    tirzepatide: {
      name: 'Tirzepatide',
      tag: 'Dual GIP/GLP-1 Agonist',
      icon: '📉',
      desc: 'For maximum weight loss, Tirzepatide is your best option. Its dual hormone mechanism produced up to 22.5% weight reduction in clinical trials — the highest of any approved weight-loss medication.',
      anchor: 'tirzepatide',
      available: true,
    },
    bpc157: {
      name: 'BPC-157',
      tag: 'Gastrointestinal',
      icon: '🫁',
      desc: 'BPC-157 is ideal for your goals. This body protective compound promotes mucosal healing, reduces gut inflammation, and supports tissue repair — a top choice for GI and digestive concerns.',
      anchor: 'bpc-157',
      available: false,
    },
    kpv: {
      name: 'KPV',
      tag: 'Anti-Inflammatory',
      icon: '🩺',
      desc: 'KPV is well-matched for your needs. This tripeptide fragment modulates inflammatory pathways and accelerates wound closure — highly effective for chronic inflammation and skin healing.',
      anchor: 'kpv',
      available: false,
    },
    tb500: {
      name: 'TB-500 (Thymosin Beta-4)',
      tag: 'Wound Healing',
      icon: '💪',
      desc: 'TB-500 is the right fit for soft tissue recovery. It promotes cell migration, angiogenesis, and tissue remodeling — with strong results in muscle, tendon, and dermal injury repair.',
      anchor: 'tb-500',
      available: false,
    },
    motsc: {
      name: 'MOTS-C',
      tag: 'Metabolic & Bone',
      icon: '🦴',
      desc: 'MOTS-C aligns with your metabolic and bone health goals. This mitochondria-derived peptide activates AMPK signaling to improve energy metabolism, insulin sensitivity, and bone mineral density.',
      anchor: 'mots-c',
      available: false,
    },
    dsip: {
      name: 'Emideltide (DSIP)',
      tag: 'Sleep & Withdrawal',
      icon: '🔄',
      desc: 'Emideltide is the right fit for your situation. DSIP modulates deep delta-wave sleep and normalizes stress hormones, with demonstrated effectiveness for opioid withdrawal symptom relief.',
      anchor: 'emideltide',
      available: false,
    },
    epitalon: {
      name: 'Epitalon',
      tag: 'Sleep & Longevity',
      icon: '😴',
      desc: 'Epitalon is your best match for sleep and longevity goals. This synthetic tetrapeptide stimulates melatonin production, regulates circadian rhythm, and has shown telomere-lengthening properties in research.',
      anchor: 'epitalon',
      available: false,
    },
    semax: {
      name: 'Semax',
      tag: 'Neuroprotective',
      icon: '🧬',
      desc: 'Semax is a strong match for your neurological goals. This ACTH-derived neuropeptide elevates BDNF levels, enhances cerebral blood flow, and effectively modulates migraine and nerve pain pathways.',
      anchor: 'semax',
      available: false,
    },
  };

  let step = 0;
  let answers = {};

  function getDetailQuestion() {
    if (answers.goal === 'weight') return 'weight_detail';
    if (answers.goal === 'recovery') return 'recovery_detail';
    return 'neuro_detail';
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'quiz-overlay';
    overlay.id = 'quizOverlay';
    overlay.innerHTML = `
      <div class="quiz-modal" id="quizModal" role="dialog" aria-modal="true" aria-label="Peptide finder quiz">
        <div class="quiz-top">
          <span class="quiz-logo">Peptide<span>Med</span></span>
          <button class="quiz-skip" id="quizSkip" aria-label="Skip quiz">Skip for now</button>
        </div>
        <div class="quiz-progress" aria-hidden="true">
          <div class="quiz-dot active" id="dot0"></div>
          <div class="quiz-dot" id="dot1"></div>
          <div class="quiz-dot" id="dot2"></div>
          <span class="quiz-step-label" id="quizStepLabel">Step 1 of 2</span>
        </div>
        <div id="quizContent"></div>
      </div>
    `;
    return overlay;
  }

  function renderQuestion(qKey) {
    const q = QUESTIONS[qKey];
    document.getElementById('quizContent').innerHTML = `
      <div class="quiz-body">
        <p class="quiz-question-text">${q.text}</p>
        <p class="quiz-question-sub">${q.sub}</p>
        <div class="quiz-options" role="list">
          ${q.options.map(opt => `
            <button class="quiz-option" data-value="${opt.value}" role="listitem">
              <span class="quiz-option-icon" aria-hidden="true">${opt.icon}</span>
              <span class="quiz-option-label">${opt.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleOptionClick(btn, qKey));
    });
  }

  function handleOptionClick(btn, qKey) {
    document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const value = btn.dataset.value;

    if (qKey === 'goal') {
      answers.goal = value;
      setTimeout(() => {
        step = 1;
        updateProgress(1);
        renderQuestion(getDetailQuestion());
      }, 260);
    } else {
      answers.result = value;
      setTimeout(() => {
        step = 2;
        updateProgress(2);
        renderResult(value);
      }, 260);
    }
  }

  function updateProgress(s) {
    ['dot0', 'dot1', 'dot2'].forEach((id, i) => {
      const dot = document.getElementById(id);
      dot.className = 'quiz-dot' + (i < s ? ' done' : i === s ? ' active' : '');
    });
    const labels = ['Step 1 of 2', 'Step 2 of 2', 'Your Result'];
    document.getElementById('quizStepLabel').textContent = labels[s] || '';
  }

  function renderResult(resultKey) {
    const r = RESULTS[resultKey];
    const pendingNote = !r.available
      ? `<div class="quiz-result-pending">⏳ This peptide is pending FDA review for compounding eligibility (est. July 2026). You can join the waitlist now.</div>`
      : '';

    document.getElementById('quizContent').innerHTML = `
      <div class="quiz-result">
        <p class="quiz-result-label">Your recommended peptide</p>
        <div class="quiz-result-icon" aria-hidden="true">${r.icon}</div>
        <div class="quiz-result-badge">${r.tag}</div>
        <h2 class="quiz-result-name">${r.name}</h2>
        <p class="quiz-result-desc">${r.desc}</p>
        ${pendingNote}
        <div class="quiz-result-actions">
          <a href="products.html#${r.anchor}" class="btn-primary" id="quizCTA">
            ${r.available ? 'View My Treatment' : 'Join the Waitlist'}
          </a>
          <button class="quiz-retake" id="quizRetake">Retake quiz</button>
        </div>
      </div>
    `;
    document.getElementById('quizCTA').addEventListener('click', closeQuiz);
    document.getElementById('quizRetake').addEventListener('click', resetQuiz);
  }

  function closeQuiz() {
    const overlay = document.getElementById('quizOverlay');
    if (!overlay) return;
    overlay.classList.add('closing');
    sessionStorage.setItem('pmQuizSeen', '1');
    setTimeout(() => overlay.remove(), 280);
  }

  function resetQuiz() {
    step = 0;
    answers = {};
    updateProgress(0);
    renderQuestion('goal');
  }

  function init() {
    const overlay = buildOverlay();
    document.body.appendChild(overlay);
    renderQuestion('goal');
    document.getElementById('quizSkip').addEventListener('click', closeQuiz);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeQuiz(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQuiz(); });
  }

  setTimeout(init, 600);
})();

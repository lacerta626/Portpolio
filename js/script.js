// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = (e.clientX - 5) + 'px';
  cursor.style.top  = (e.clientY - 5) + 'px';
});
document.querySelectorAll('a, button, .skill-item-card, .hero-tag').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ── Smooth Scroll Nav ──
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── Typing Effect (Hero) ──
const typingText = document.getElementById('typing-text');
const phrases = ["GAME DEVELOPER", "3D ARTIST", "WEB DEVELOPER", "UI DESIGNER"];
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
let typeSpeed = 150;

function typeLoop() {
  const currentPhrase = phrases[phraseIndex];
  if (isDeleting) {
    typingText.innerText = currentPhrase.substring(0, letterIndex - 1);
    letterIndex--;
    typeSpeed = 50;
  } else {
    typingText.innerText = currentPhrase.substring(0, letterIndex + 1);
    letterIndex++;
    typeSpeed = 130;
  }
  if (!isDeleting && letterIndex === currentPhrase.length) {
    isDeleting = true;
    typeSpeed = 1800;
  } else if (isDeleting && letterIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500;
  }
  setTimeout(typeLoop, typeSpeed);
}

if (typingText) {
  setTimeout(typeLoop, 800);
}

// ── Skill Card Hover — 설명 패널 업데이트 ──
const skillDescName = document.getElementById('skill-desc-name');
const skillDescText = document.getElementById('skill-desc-text');
const skillDescPanel = document.getElementById('skill-desc-panel');
const skillCards = document.querySelectorAll('.skill-item-card');

const chars = '!<>-_\\/[]{}—=+*^?#________';
let glitchInterval = null;

function scrambleText(element, finalString) {
  let iteration = 0;
  clearInterval(glitchInterval);
  glitchInterval = setInterval(() => {
    element.innerText = finalString
      .split('')
      .map((letter, index) => {
        if (index < iteration) return finalString[index];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
    if (iteration >= finalString.length) clearInterval(glitchInterval);
    iteration += 1 / 3;
  }, 30);
}

skillCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    const name = card.getAttribute('data-name');
    const desc = card.getAttribute('data-desc');
    scrambleText(skillDescName, name.toUpperCase());
    skillDescText.innerText = desc;
    skillDescPanel.style.borderColor = 'var(--accent)';
  });
  card.addEventListener('mouseleave', () => {
    skillDescPanel.style.borderColor = '';
  });
});

// 스킬 섹션 전체에서 마우스가 나가면 초기화
const skillCategoriesEl = document.querySelector('.skill-categories');
if (skillCategoriesEl) {
  skillCategoriesEl.addEventListener('mouseleave', () => {
    scrambleText(skillDescName, 'HOVER A SKILL');
    skillDescText.innerText = '각 스킬 카드에 마우스를 올려 상세 설명을 확인하세요.';
    skillDescPanel.style.borderColor = '';
  });
}

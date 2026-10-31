(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  // Short curtain reveal
  window.addEventListener('load', () => {
    window.setTimeout(() => $('#preloader')?.classList.add('done'), reducedMotion ? 120 : 1450);
    $$('.reveal-up').forEach((element, index) => {
      window.setTimeout(() => element.classList.add('revealed'), 300 + index * 90);
    });
  });

  const header = $('#header');
  const scrollLine = $('#scrollLine');
  const track = $('#projectTrack');
  const trackProgress = $('#trackProgress');
  let trackBounds = null;

  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (scrollLine) scrollLine.style.height = `${progress * 100}px`;
    header?.classList.toggle('scrolled', window.scrollY > 45);
    if (track) {
      const rect = track.getBoundingClientRect();
      const total = track.scrollWidth - window.innerWidth;
      const start = window.innerHeight * 0.3;
      const end = -total;
      const value = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
      trackProgress && (trackProgress.style.width = `${value * 100}%`);
    }
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', () => { trackBounds = null; updateScroll(); }, { passive: true });

  // Mobile menu
  const menuToggle = $('#menuToggle');
  menuToggle?.addEventListener('click', () => {
    const open = !header.classList.contains('menu-active');
    header.classList.toggle('menu-active', open);
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });
  $$('.nav-links a, .nav-start').forEach(link => link.addEventListener('click', () => {
    header.classList.remove('menu-active');
    menuToggle?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }));

  // Cursor and contextual labels on desktop
  if (!isTouch && !reducedMotion) {
    const cursor = $('#cursor');
    const cursorLabel = $('#cursorLabel');
    let mouseX = -100;
    let mouseY = -100;
    let cursorX = mouseX;
    let cursorY = mouseY;
    const moveCursor = () => {
      cursorX += (mouseX - cursorX) * 0.16;
      cursorY += (mouseY - cursorY) * 0.16;
      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }
      if (cursorLabel) {
        cursorLabel.style.left = `${cursorX}px`;
        cursorLabel.style.top = `${cursorY}px`;
      }
      requestAnimationFrame(moveCursor);
    };
    window.addEventListener('mousemove', event => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });
    moveCursor();
    $$('[data-cursor]').forEach(target => {
      target.addEventListener('mouseenter', () => {
        cursor?.classList.add('is-hover');
        if (cursorLabel) {
          cursorLabel.textContent = target.dataset.cursor;
          cursorLabel.classList.add('show');
        }
      });
      target.addEventListener('mouseleave', () => {
        cursor?.classList.remove('is-hover');
        cursorLabel?.classList.remove('show');
      });
    });
  }

  // Gentle parallax on hero fragments
  if (!isTouch && !reducedMotion) {
    const hero = $('.hero');
    const fragments = $$('.fragment');
    hero?.addEventListener('mousemove', event => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      fragments.forEach((fragment, index) => {
        const strength = (index + 1) * 3;
        fragment.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    }, { passive: true });
  }

  // Reveal elements when they enter the viewport
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -50px' });
    $$('.reveal-up').forEach(element => revealObserver.observe(element));
  } else {
    $$('.reveal-up').forEach(element => element.classList.add('revealed'));
  }

  // Services preview follows the hovered row
  const servicePreview = $('#servicePreview');
  $$('.service-hover').forEach(row => {
    row.addEventListener('mouseenter', () => {
      if (!servicePreview || isTouch) return;
      const previewType = row.dataset.preview || 'corporate';
      servicePreview.className = `service-preview active preview-${previewType}`;
    });
    row.addEventListener('mouseleave', () => servicePreview?.classList.remove('active'));
  });

  // Horizontal project showcase driven by vertical scroll
  const showcase = $('.showcase');
  const animateProjects = () => {
    if (!track || !showcase || isTouch) return;
    const maxTranslate = track.scrollWidth - window.innerWidth + 50;
    const rect = showcase.getBoundingClientRect();
    const travel = Math.max(1, showcase.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    track.style.transform = `translateX(${progress * maxTranslate}px)`;
  };
  window.addEventListener('scroll', animateProjects, { passive: true });
  window.addEventListener('resize', animateProjects, { passive: true });

  // Process steps with cinematic content swap
  const processContent = [
    ['01', 'نستمع.', 'قبل أن نكتب سطرًا واحدًا من الكود، نحاول فهم الفكرة. ما الذي تريد أن يشعر به الناس؟'],
    ['02', 'نصمم.', 'نحوّل الفكرة إلى لغة بصرية. نرسم المساحة التي ستعيش فيها القصة.'],
    ['03', 'نبني.', 'ثم نجعلها تعمل. تفاصيل صغيرة، أداء واضح، وتجربة لا تتوقف عند الشكل.'],
    ['04', 'نطلق.', 'وهنا تبدأ القصة الحقيقية. نضع التجربة أمام الناس ونتركها تتحدث.']
  ];
  const processIndex = $('#processIndex');
  const processTitle = $('#processTitle');
  const processText = $('#processText');
  const processOrb = $('#processOrb');
  $$('.process-step').forEach(step => step.addEventListener('click', () => {
    const item = processContent[Number(step.dataset.step)];
    if (!item) return;
    $$('.process-step').forEach(button => button.classList.remove('active'));
    step.classList.add('active');
    [processTitle, processText, processIndex, processOrb].forEach(element => element?.classList.add('swap-out'));
    window.setTimeout(() => {
      if (processIndex) processIndex.textContent = item[0];
      if (processOrb) processOrb.textContent = item[0];
      if (processTitle) processTitle.textContent = item[1];
      if (processText) processText.textContent = item[2];
      [processTitle, processText, processIndex, processOrb].forEach(element => element?.classList.remove('swap-out'));
    }, reducedMotion ? 0 : 240);
  }));

  // Question lines appear in sequence
  const questionLines = $$('.question-lines p');
  if ('IntersectionObserver' in window) {
    const questionObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        questionLines.forEach((line, index) => window.setTimeout(() => line.classList.add('visible'), index * 230));
        questionObserver.disconnect();
      }
    }, { threshold: .4 });
    const question = $('.question');
    question && questionObserver.observe(question);
  }

  // Magnetic buttons
  if (!isTouch && !reducedMotion) {
    $$('.magnetic').forEach(button => {
      button.addEventListener('mousemove', event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .18;
        const y = (event.clientY - rect.top - rect.height / 2) * .18;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('mouseleave', () => { button.style.transform = ''; });
    });
  }

  // Static form validation; no false sending claim
  const form = $('#contactForm');
  const success = $('#formSuccess');
  const fields = [
    ['name', value => value.length > 1 ? '' : 'اكتب الاسم من فضلك.'],
    ['email', value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'أدخل بريدًا إلكترونيًا صحيحًا.'],
    ['projectType', value => value ? '' : 'اختر نوع المشروع.'],
    ['budget', value => value ? '' : 'اختر نطاقًا تقريبيًا.'],
    ['message', value => value.length > 9 ? '' : 'اكتب بضعة تفاصيل عن الفكرة.']
  ];
  const validate = (id, rule) => {
    const field = $(`#${id}`);
    const message = field ? rule(field.value.trim()) : '';
    const error = field?.parentElement.querySelector('span');
    if (error) error.textContent = message;
    field?.classList.toggle('invalid', Boolean(message));
    return !message;
  };
  fields.forEach(([id, rule]) => $(`#${id}`)?.addEventListener('blur', () => validate(id, rule)));
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const valid = fields.every(([id, rule]) => validate(id, rule));
    if (valid) {
      success?.classList.add('show');
      form.reset();
      window.setTimeout(() => success?.classList.remove('show'), 6500);
    } else {
      form.querySelector('.invalid')?.focus();
    }
  });

  updateScroll();
  animateProjects();
})();

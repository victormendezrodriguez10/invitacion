/* ============================================
   INVITACION DE BODA - Victor & Leticia
   Logica de animaciones e interacciones
   ============================================ */

(function () {
  'use strict';

  // ---------- Elementos DOM ----------
  const envelopeScreen = document.getElementById('envelope-screen');
  const envelope = document.getElementById('envelope');
  const letterContent = document.getElementById('letter-content');
  const musicToggle = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const birdsContainer = document.getElementById('birds-container');

  // ---------- Fecha de la boda ----------
  const WEDDING_DATE = new Date('2027-05-29T15:00:00');

  // ---------- Estado ----------
  let isOpened = false;
  let isMusicPlaying = false;

  // ============================================
  // APERTURA DEL SOBRE
  // ============================================
  function openEnvelope() {
    if (isOpened) return;
    isOpened = true;

    // Iniciar musica directamente en el gesto del usuario
    bgMusic.volume = 0.4;
    bgMusic.play().then(function () {
      isMusicPlaying = true;
      musicToggle.classList.remove('paused');
    }).catch(function () {
      isMusicPlaying = false;
      musicToggle.classList.add('paused');
    });

    // Fase 1: Sello se rompe + solapa se abre + carta sale
    envelope.classList.add('opening');

    // Fase 2: Capturar posicion de la carta y moverla al centro
    setTimeout(function () {
      var letter = document.getElementById('envelope-letter');
      var rect = letter.getBoundingClientRect();

      // Fijar la carta en su posicion actual exacta (sin salto visual)
      letter.style.animation = 'none';
      letter.style.position = 'fixed';
      letter.style.top = rect.top + 'px';
      letter.style.left = rect.left + 'px';
      letter.style.width = rect.width + 'px';
      letter.style.height = rect.height + 'px';
      letter.style.transform = 'none';
      letter.style.zIndex = '2000';
      letter.style.opacity = '1';
      envelopeScreen.appendChild(letter);

      // Desvanecer el sobre
      envelope.style.transition = 'opacity 1s ease';
      envelope.style.opacity = '0';

      // Reflow para que el navegador registre la posicion inicial
      void letter.offsetWidth;

      // Animar al centro manteniendo la misma forma
      letter.style.transition = 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      letter.style.top = '50%';
      letter.style.left = '50%';
      letter.style.transform = 'translate(-50%, -50%) scale(2)';
      letter.style.borderRadius = '8px';
      letter.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12)';
    }, 3500);

    // Fase 3: Desvanecer todo
    setTimeout(function () {
      envelopeScreen.style.transition = 'opacity 0.8s ease';
      envelopeScreen.style.opacity = '0';
    }, 5200);

    // Fase 4: Mostrar contenido
    setTimeout(function () {
      envelopeScreen.classList.add('opened');
      letterContent.classList.remove('hidden');
      void letterContent.offsetWidth;
      letterContent.classList.add('visible');
      musicToggle.classList.remove('hidden');
      birdsContainer.classList.remove('hidden');
      launchBirds();
      initScrollAnimations();
      startCountdown();
      document.body.style.overflow = 'auto';
    }, 6000);
  }

  // Evento click en la pantalla del sobre
  envelopeScreen.addEventListener('click', openEnvelope);

  // Prevenir scroll mientras el sobre esta cerrado
  document.body.style.overflow = 'hidden';

  // ============================================
  // MUSICA DE FONDO
  // ============================================
  function startMusic() {
    if (!bgMusic.querySelector('source') && !bgMusic.src) {
      // No hay archivo de musica configurado
      musicToggle.classList.add('paused');
      return;
    }

    bgMusic.volume = 0.4;
    var playPromise = bgMusic.play();

    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          isMusicPlaying = true;
        })
        .catch(function () {
          // Autoplay bloqueado, el usuario puede usar el boton
          isMusicPlaying = false;
          musicToggle.classList.add('paused');
        });
    }
  }

  function toggleMusic() {
    if (!bgMusic.querySelector('source') && !bgMusic.src) return;

    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      musicToggle.classList.add('paused');
    } else {
      bgMusic.play().then(function () {
        isMusicPlaying = true;
        musicToggle.classList.remove('paused');
      }).catch(function () {
        // No se pudo reproducir
      });
    }
  }

  musicToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMusic();
  });

  // ============================================
  // CUENTA ATRAS
  // ============================================
  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      document.getElementById('countdown-days').textContent = '0';
      document.getElementById('countdown-hours').textContent = '0';
      document.getElementById('countdown-minutes').textContent = '0';
      document.getElementById('countdown-seconds').textContent = '0';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = days;
    document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
  }

  function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ============================================
  // ANIMACIONES DE SCROLL (IntersectionObserver)
  // ============================================
  function initScrollAnimations() {
    var sections = document.querySelectorAll('.fade-in-section');

    if (!('IntersectionObserver' in window)) {
      // Fallback: mostrar todo si no hay soporte
      sections.forEach(function (section) {
        section.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    // Animar la linea del timeline cuando entra en vista
    var timelineSection = document.querySelector('.section-timeline');
    if (timelineSection) {
      var tlObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              timelineSection.classList.add('line-visible');
              tlObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      tlObserver.observe(timelineSection);
    }
  }

  // ============================================
  // PAJAROS ANIMADOS
  // ============================================
  var birdInterval = null;

  // Mariposas blancas con detalles dorados
  function createButterflySVG() {
    var palettes = [
      { wing: '#FFFFFF', inner: '#F5EFE0', vein: 'rgba(180,165,130,0.4)', body: '#C9A84C', dot: 'rgba(201,168,76,0.5)' },
      { wing: '#FFF8F0', inner: '#F0E8D8', vein: 'rgba(170,155,120,0.35)', body: '#D4B96A', dot: 'rgba(201,168,76,0.45)' },
      { wing: '#FFFDF8', inner: '#F2EBE0', vein: 'rgba(175,160,125,0.38)', body: '#C9A84C', dot: 'rgba(201,168,76,0.55)' },
    ];
    var c = palettes[Math.floor(Math.random() * palettes.length)];
    return '<svg viewBox="0 0 60 48" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="wing" transform-origin="30 24">' +
        '<path d="M30 24 Q18 4 6 10 Q2 18 8 26 Q14 32 30 28 Z" fill="' + c.wing + '" stroke="' + c.vein + '" stroke-width="0.5"/>' +
        '<path d="M30 26 Q20 20 12 28 Q16 34 30 30 Z" fill="' + c.inner + '" stroke="' + c.vein + '" stroke-width="0.3"/>' +
        '<circle cx="14" cy="16" r="2.5" fill="' + c.dot + '"/>' +
        '<circle cx="18" cy="26" r="1.5" fill="' + c.dot + '"/>' +
      '</g>' +
      '<g class="wing-right" transform-origin="30 24">' +
        '<path d="M30 24 Q42 4 54 10 Q58 18 52 26 Q46 32 30 28 Z" fill="' + c.wing + '" stroke="' + c.vein + '" stroke-width="0.5"/>' +
        '<path d="M30 26 Q40 20 48 28 Q44 34 30 30 Z" fill="' + c.inner + '" stroke="' + c.vein + '" stroke-width="0.3"/>' +
        '<circle cx="46" cy="16" r="2.5" fill="' + c.dot + '"/>' +
        '<circle cx="42" cy="26" r="1.5" fill="' + c.dot + '"/>' +
      '</g>' +
      '<ellipse cx="30" cy="24" rx="1.5" ry="7" fill="' + c.body + '"/>' +
      '<path d="M29 17 Q26 10 23 8" fill="none" stroke="' + c.body + '" stroke-width="0.7" stroke-linecap="round"/>' +
      '<path d="M31 17 Q34 10 37 8" fill="none" stroke="' + c.body + '" stroke-width="0.7" stroke-linecap="round"/>' +
      '<circle cx="23" cy="8" r="1" fill="' + c.body + '"/>' +
      '<circle cx="37" cy="8" r="1" fill="' + c.body + '"/>' +
    '</svg>';
  }

  function createBird() {
    var bird = document.createElement('div');

    // Variaciones
    var sizes = ['size-sm', 'size-md', 'size-lg'];
    var animations = ['flyAcrossLR', 'flyAcrossRL', 'flyCurveUp'];

    var size = sizes[Math.floor(Math.random() * sizes.length)];
    var anim = animations[Math.floor(Math.random() * animations.length)];

    bird.className = 'bird ' + size;
    bird.innerHTML = createButterflySVG();

    // Posicion vertical aleatoria (tercio superior de la pantalla)
    var startY = Math.random() * 40 + 5;
    bird.style.top = startY + '%';
    bird.style.left = '0';

    // Variables CSS para el drift
    var driftY = (Math.random() * 60 - 30) + 'px';
    var endY = (Math.random() * 80 - 40) + 'px';
    bird.style.setProperty('--drift-y', driftY);
    bird.style.setProperty('--end-y', endY);

    // Velocidad de aleteo variable
    var flapSpeed = (0.25 + Math.random() * 0.2).toFixed(2) + 's';
    var wings = bird.querySelectorAll('.wing, .wing-right');
    wings.forEach(function (w) {
      w.style.animationDuration = flapSpeed;
    });

    // Duracion del vuelo
    var duration = 5 + Math.random() * 6;

    bird.style.animation = anim + ' ' + duration + 's ease-in-out forwards';

    birdsContainer.appendChild(bird);

    // Limpiar despues de la animacion
    setTimeout(function () {
      if (bird.parentNode) {
        bird.parentNode.removeChild(bird);
      }
    }, duration * 1000 + 200);
  }

  function launchBirds() {
    // Oleada inicial: varias mariposas juntas
    for (var i = 0; i < 8; i++) {
      (function(delay) {
        setTimeout(createBird, delay);
      })(i * 250 + Math.random() * 300);
    }

    // Mariposas periodicas (cada 1.5-3 segundos)
    birdInterval = setInterval(function () {
      createBird();
      // A veces lanzar 2-3 juntas
      if (Math.random() > 0.4) {
        setTimeout(createBird, 150 + Math.random() * 400);
      }
      if (Math.random() > 0.7) {
        setTimeout(createBird, 400 + Math.random() * 500);
      }
    }, 1500 + Math.random() * 1500);

    // Parar de generar nuevas mariposas tras 45s
    setTimeout(function () {
      if (birdInterval) {
        clearInterval(birdInterval);
        birdInterval = null;
      }
    }, 45000);
  }

  // ============================================
  // FORMULARIO DE CONFIRMACION
  // ============================================
  var rsvpOpenBtn = document.getElementById('rsvp-open-btn');
  var rsvpFormWrapper = document.getElementById('rsvp-form-wrapper');
  var rsvpForm = document.getElementById('rsvp-form');
  var rsvpFields = document.getElementById('rsvp-fields');
  var rsvpSuccess = document.getElementById('rsvp-success');
  var attendYes = document.getElementById('attend-yes');
  var attendNo = document.getElementById('attend-no');
  var companionYes = document.getElementById('companion-yes');
  var companionNo = document.getElementById('companion-no');
  var companionNameGroup = document.getElementById('companion-name-group');
  var kidsYes = document.getElementById('kids-yes');
  var kidsNo = document.getElementById('kids-no');
  var kidsCountGroup = document.getElementById('kids-count-group');
  var formNextUrl = document.getElementById('form-next-url');

  // URL de retorno tras envio (pagina de agradecimiento)
  if (formNextUrl) {
    var base = window.location.href.split('?')[0];
    formNextUrl.value = base.replace(/index\.html$/, '') + 'gracias.html';
  }

  // Abrir formulario con animacion de puertas
  var doorsOverlay = document.getElementById('doors-overlay');

  if (rsvpOpenBtn) {
    rsvpOpenBtn.addEventListener('click', function () {
      rsvpOpenBtn.classList.add('hidden');

      // Mostrar puertas y animarlas
      doorsOverlay.classList.remove('hidden');

      // Cuando las puertas terminan de abrirse, mostrar formulario
      setTimeout(function () {
        doorsOverlay.classList.add('hidden');
        rsvpFormWrapper.classList.remove('hidden');
        rsvpFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1600);
    });
  }

  // Mostrar/ocultar campos segun asistencia
  var rsvpNoFields = document.getElementById('rsvp-no-fields');

  function toggleAttendFields() {
    var noNombre = document.getElementById('rsvp-no-nombre');
    var noApellidos = document.getElementById('rsvp-no-apellidos');

    var siNombre = document.getElementById('rsvp-nombre');
    var siApellidos = document.getElementById('rsvp-apellidos');
    var siEmail = document.getElementById('rsvp-email');

    if (attendYes && attendYes.checked) {
      // Mostrar campos completos y habilitarlos
      rsvpFields.classList.remove('hidden');
      siNombre.required = true;
      siApellidos.required = true;
      siEmail.required = true;
      siNombre.disabled = false;
      siApellidos.disabled = false;
      siEmail.disabled = false;

      // Ocultar y deshabilitar campos de "no asiste"
      if (rsvpNoFields) {
        rsvpNoFields.classList.add('hidden');
        noNombre.required = false;
        noApellidos.required = false;
        noNombre.disabled = true;
        noApellidos.disabled = true;
      }

      // Mostrar aviso de hotel si hotel-yes esta seleccionado
      toggleHotelNotice();
    } else if (attendNo && attendNo.checked) {
      // Ocultar y deshabilitar campos completos
      rsvpFields.classList.add('hidden');
      siNombre.required = false;
      siApellidos.required = false;
      siEmail.required = false;
      siNombre.disabled = true;
      siApellidos.disabled = true;
      siEmail.disabled = true;

      // Mostrar y habilitar campos de "no asiste"
      if (rsvpNoFields) {
        rsvpNoFields.classList.remove('hidden');
        noNombre.required = true;
        noApellidos.required = true;
        noNombre.disabled = false;
        noApellidos.disabled = false;
      }

      // Ocultar aviso de hotel
      var hotelNotice = document.getElementById('hotel-notice');
      if (hotelNotice) hotelNotice.classList.add('hidden');
    } else {
      rsvpFields.classList.add('hidden');
      siNombre.required = false;
      siApellidos.required = false;
      siEmail.required = false;
      siNombre.disabled = true;
      siApellidos.disabled = true;
      siEmail.disabled = true;

      if (rsvpNoFields) {
        rsvpNoFields.classList.add('hidden');
        noNombre.required = false;
        noApellidos.required = false;
        noNombre.disabled = true;
        noApellidos.disabled = true;
      }
    }
  }

  if (attendYes) attendYes.addEventListener('change', toggleAttendFields);
  if (attendNo) attendNo.addEventListener('change', toggleAttendFields);

  // Mostrar/ocultar nombre acompanante
  function toggleCompanion() {
    var companionInput = document.getElementById('rsvp-companion-name');
    if (companionYes && companionYes.checked) {
      companionNameGroup.classList.remove('hidden');
      companionInput.disabled = false;
    } else {
      companionNameGroup.classList.add('hidden');
      companionInput.disabled = true;
      companionInput.value = '';
    }
  }

  if (companionYes) companionYes.addEventListener('change', toggleCompanion);
  if (companionNo) companionNo.addEventListener('change', toggleCompanion);

  // Mostrar/ocultar cantidad ninos
  function toggleKids() {
    var kidsSelect = document.getElementById('rsvp-kids-count');
    if (kidsYes && kidsYes.checked) {
      kidsCountGroup.classList.remove('hidden');
      kidsSelect.disabled = false;
    } else {
      kidsCountGroup.classList.add('hidden');
      kidsSelect.disabled = true;
    }
  }

  if (kidsYes) kidsYes.addEventListener('change', toggleKids);
  if (kidsNo) kidsNo.addEventListener('change', toggleKids);

  // Mostrar/ocultar aviso DNI/Pasaporte segun alojamiento
  var hotelYes = document.getElementById('hotel-yes');
  var hotelNo = document.getElementById('hotel-no');

  function toggleHotelNotice() {
    var hotelNotice = document.getElementById('hotel-notice');
    if (!hotelNotice) return;
    if (hotelYes && hotelYes.checked && !rsvpFields.classList.contains('hidden')) {
      hotelNotice.classList.remove('hidden');
    } else {
      hotelNotice.classList.add('hidden');
    }
  }

  if (hotelYes) hotelYes.addEventListener('change', toggleHotelNotice);
  if (hotelNo) hotelNo.addEventListener('change', toggleHotelNotice);

  // Enviar formulario
  // FormSubmit requiere activacion del email la primera vez.
  // Primero intentamos AJAX; si la respuesta indica que el email
  // no esta activado, dejamos que el formulario se envie de forma
  // tradicional para que el usuario vea la pagina de activacion.
  var EMAIL_ACTIVATED_KEY = 'rsvp_email_activated';

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      var submitBtn = document.getElementById('rsvp-submit');
      var isActivated = localStorage.getItem(EMAIL_ACTIVATED_KEY) === 'true';

      // Si el email aun no ha sido activado, enviar de forma tradicional
      // para que FormSubmit muestre la pagina de verificacion
      if (!isActivated) {
        // No prevenir default: deja que el form se envie normalmente
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        return; // sale sin e.preventDefault()
      }

      // Si ya esta activado, usar AJAX y redirigir a gracias.html
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      var formData = new FormData(rsvpForm);

      fetch(rsvpForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (response) {
        if (response.ok) {
          window.location.href = formNextUrl.value;
        } else {
          throw new Error('Error en el envio');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Confirmacion';
        // Fallback: enviar de forma tradicional (redirige via _next)
        rsvpForm.submit();
      });
    });
  }

  // Si vuelve de FormSubmit con ?confirmed=true
  if (window.location.search.indexOf('confirmed=true') !== -1) {
    // Marcar email como activado para futuros envios AJAX
    localStorage.setItem(EMAIL_ACTIVATED_KEY, 'true');

    // Abrir sobre automaticamente y mostrar exito
    setTimeout(function () {
      openEnvelope();
      setTimeout(function () {
        if (rsvpOpenBtn) rsvpOpenBtn.classList.add('hidden');
        if (rsvpFormWrapper) rsvpFormWrapper.classList.add('hidden');
        if (rsvpSuccess) rsvpSuccess.classList.remove('hidden');
      }, 2500);
    }, 500);
  }

  // ============================================
  // ACORDEON (FAQ + REGALOS)
  // ============================================
  var accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      var body = header.nextElementSibling;
      var isOpen = !body.classList.contains('hidden');

      // Cerrar todos los demas
      accordionHeaders.forEach(function (h) {
        h.classList.remove('active');
        h.nextElementSibling.classList.add('hidden');
      });

      // Toggle el actual
      if (!isOpen) {
        header.classList.add('active');
        body.classList.remove('hidden');
      }
    });
  });

})();

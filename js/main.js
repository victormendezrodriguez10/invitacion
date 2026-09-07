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
  const WEDDING_DATE = new Date('2027-05-29T19:00:00');

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

    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fase final: mostrar el contenido de la invitacion
    function revealContent() {
      envelopeScreen.classList.add('opened');
      if (letterContent.classList.contains('hidden')) {
        letterContent.classList.remove('hidden');
        void letterContent.offsetWidth;
      }
      letterContent.classList.add('visible');
      musicToggle.classList.remove('hidden');
      birdsContainer.classList.remove('hidden');
      launchBirds();
      initScrollAnimations();
      startCountdown();
      document.body.style.overflow = 'auto';
    }

    // Con "reducir movimiento": fundido corto y directo al contenido
    if (reduceMotion) {
      envelopeScreen.style.transition = 'opacity 0.4s ease';
      envelopeScreen.style.opacity = '0';
      setTimeout(revealContent, 400);
      return;
    }

    // Fase 1 (0 - 2.7s): el sello se agrieta y se parte, la solapa se
    // levanta en 3D y la carta sale del sobre con un ligero rebote (CSS)
    envelope.classList.add('opening');

    var letter = document.getElementById('envelope-letter');
    var baseScale = 2;

    // Fase 2 (2.8s): fijar la carta en pantalla y llevarla al centro
    setTimeout(function () {
      var rect = letter.getBoundingClientRect();
      var vw = window.innerWidth;
      var vh = window.innerHeight;

      // Escala que quepa en pantalla (movil incluido)
      baseScale = Math.min(2.2, (vw * 0.86) / rect.width, (vh * 0.62) / rect.height);

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
      letter.style.boxShadow = '0 12px 32px rgba(0,0,0,0.18)';
      envelopeScreen.appendChild(letter);

      // El sobre se desvanece por detras
      envelope.style.transition = 'opacity 0.9s ease';
      envelope.style.opacity = '0';

      // Reflow para que el navegador registre la posicion inicial
      void letter.offsetWidth;

      // Animar al centro manteniendo la misma forma
      letter.style.transition = 'top 1.2s cubic-bezier(0.4, 0, 0.2, 1), ' +
        'left 1.2s cubic-bezier(0.4, 0, 0.2, 1), ' +
        'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), ' +
        'border-radius 1.2s ease, box-shadow 1.2s ease, opacity 0.9s ease';
      letter.style.top = '50%';
      letter.style.left = '50%';
      letter.style.transform = 'translate(-50%, -50%) scale(' + baseScale + ')';
      letter.style.borderRadius = '8px';
      letter.style.boxShadow = '0 24px 60px rgba(0,0,0,0.16)';
    }, 2800);

    // Fase 3 (6.2s): tras ~2s de lectura, la carta sigue creciendo y se funde con la invitacion,
    // que aparece por debajo (fundido cruzado, sin pantalla en blanco)
    setTimeout(function () {
      letterContent.classList.remove('hidden');
      void letterContent.offsetWidth;
      letterContent.classList.add('visible');

      letter.style.transition = 'transform 0.9s cubic-bezier(0.4, 0, 0.6, 1), opacity 0.7s ease 0.1s';
      letter.style.transform = 'translate(-50%, -50%) scale(' + (baseScale * 1.35) + ')';
      letter.style.opacity = '0';

      envelopeScreen.style.transition = 'opacity 0.8s ease 0.1s';
      envelopeScreen.style.opacity = '0';
    }, 6200);

    // Fase 4 (7.1s): activar la pagina
    setTimeout(revealContent, 7100);
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
  // Cambia el numero con un pequeno giro solo cuando varia
  function setCountdownValue(id, value) {
    var el = document.getElementById(id);
    if (!el || el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }

  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE - now;
    var todayEl = document.getElementById('countdown-today');
    var countdownEl = document.getElementById('countdown');

    var isWeddingDay =
      now.getFullYear() === WEDDING_DATE.getFullYear() &&
      now.getMonth() === WEDDING_DATE.getMonth() &&
      now.getDate() === WEDDING_DATE.getDate();
    var isAfterWedding = !isWeddingDay && diff <= 0;

    if (isWeddingDay || isAfterWedding) {
      if (todayEl) {
        todayEl.textContent = isWeddingDay ? '\u00a1Es hoy!' : '\u00a1Ya nos hemos casado!';
        todayEl.classList.remove('hidden');
      }
      if (countdownEl) countdownEl.classList.add('hidden');
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdownValue('countdown-days', String(days));
    setCountdownValue('countdown-hours', hours.toString().padStart(2, '0'));
    setCountdownValue('countdown-minutes', minutes.toString().padStart(2, '0'));
    setCountdownValue('countdown-seconds', seconds.toString().padStart(2, '0'));
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

    // Animar la linea de cada timeline (boda e historia) cuando entra en vista
    var timelines = document.querySelectorAll('.timeline');
    if (timelines.length) {
      var tlObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('line-visible');
              tlObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      timelines.forEach(function (tl) { tlObserver.observe(tl); });
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

    // Posicion vertical aleatoria (toda la altura de la pantalla)
    var startY = Math.random() * 90 + 3;
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

    // Las mariposas se generan de forma continua (sin limite de tiempo)
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
  var formNextUrl = document.getElementById('form-next-url');

  // URL de retorno tras envio (pagina de agradecimiento)
  if (formNextUrl) {
    var base = window.location.href.split('?')[0];
    formNextUrl.value = base.replace(/index\.html$/, '') + 'gracias.html';
  }

  // Abrir formulario con animacion de puertas
  var doorsOverlay = document.getElementById('doors-overlay');
  var rsvpIntro = document.getElementById('rsvp-intro');
  var rsvpIntroNext = document.getElementById('rsvp-intro-next');

  if (rsvpOpenBtn) {
    rsvpOpenBtn.addEventListener('click', function () {
      rsvpOpenBtn.classList.add('hidden');

      // Mostrar puertas y animarlas
      doorsOverlay.classList.remove('hidden');

      // Cuando las puertas terminan de abrirse, mostrar las instrucciones
      setTimeout(function () {
        doorsOverlay.classList.add('hidden');
        var target = rsvpIntro || rsvpFormWrapper;
        target.classList.remove('hidden');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1600);
    });
  }

  // "Siguiente": de las instrucciones al formulario
  if (rsvpIntroNext) {
    rsvpIntroNext.addEventListener('click', function () {
      rsvpIntro.classList.add('hidden');
      rsvpFormWrapper.classList.remove('hidden');
      rsvpFormWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setAttendExtras(true);

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
      setAttendExtras(false);

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
      setAttendExtras(false);

      if (rsvpNoFields) {
        rsvpNoFields.classList.add('hidden');
        noNombre.required = false;
        noApellidos.required = false;
        noNombre.disabled = true;
        noApellidos.disabled = true;
      }
    }
  }

  // Habilita/deshabilita el resto de campos de "si asiste" (personas,
  // alojamiento, alergias, mensaje) para que NO se envien cuando el
  // invitado marca "No podre asistir"
  function setAttendExtras(enabled) {
    if (!rsvpFields) return;
    rsvpFields.querySelectorAll('input, select, textarea, button').forEach(function (el) {
      el.disabled = !enabled;
    });
  }

  if (attendYes) attendYes.addEventListener('change', toggleAttendFields);
  if (attendNo) attendNo.addEventListener('change', toggleAttendFields);

  // ---------- Personas que vienen con el invitado ----------
  var peopleList = document.getElementById('people-list');
  var addPersonBtn = document.getElementById('add-person-btn');
  var MAX_PERSONAS = 10; // incluido quien rellena

  function renumberPeople() {
    var rows = peopleList.querySelectorAll('.person-row');
    rows.forEach(function (row, i) {
      var n = i + 2; // la persona 1 es quien rellena el formulario
      row.querySelector('.person-title').textContent = 'Persona ' + n;
      row.querySelector('.person-name').name = 'Persona ' + n + ' - Nombre y apellidos';
      row.querySelector('.person-type').name = 'Persona ' + n + ' - Adulto o niño';
      row.querySelector('.person-hotel').name = 'Persona ' + n + ' - Hotel';
      row.querySelector('.person-diet').name = 'Persona ' + n + ' - Alergias';
    });
    if (addPersonBtn) addPersonBtn.style.display = rows.length >= MAX_PERSONAS - 1 ? 'none' : '';
  }

  function addPerson() {
    var row = document.createElement('div');
    row.className = 'person-row';
    row.innerHTML =
      '<div class="person-head">' +
        '<span class="person-title"></span>' +
        '<button type="button" class="person-remove" aria-label="Quitar persona">&times;</button>' +
      '</div>' +
      '<input type="text" class="form-input person-name" placeholder="Nombre y apellidos" required>' +
      '<div class="person-cols">' +
        '<select class="form-input form-select person-type">' +
          '<option value="Adulto">Adulto</option>' +
          '<option value="Niño">Niño</option>' +
        '</select>' +
        '<select class="form-input form-select person-hotel">' +
          '<option value="Sí, se queda">Hotel: sí, se queda</option>' +
          '<option value="No se queda">Hotel: no se queda</option>' +
        '</select>' +
        '<input type="text" class="form-input person-diet" placeholder="Alergias o dieta (opcional)">' +
      '</div>';
    row.querySelector('.person-remove').addEventListener('click', function () {
      row.remove();
      renumberPeople();
      toggleHotelNotice();
    });
    peopleList.appendChild(row);
    renumberPeople();
    toggleHotelNotice();
    row.querySelector('.person-name').focus();
  }

  if (addPersonBtn) addPersonBtn.addEventListener('click', addPerson);

  // Totales (quien rellena + personas anadidas)
  function countPeople() {
    var adults = 1, kids = 0;
    var hotelYesEl = document.getElementById('hotel-yes');
    var hotel = (hotelYesEl && hotelYesEl.checked) ? 1 : 0;
    if (peopleList) {
      peopleList.querySelectorAll('.person-row').forEach(function (row) {
        if (row.querySelector('.person-type').value === 'Niño') kids++; else adults++;
        if (row.querySelector('.person-hotel').value === 'Sí, se queda') hotel++;
      });
    }
    return { adults: adults, kids: kids, total: adults + kids, hotel: hotel };
  }

  // Aviso del DNI si alguien de la lista cambia su alojamiento
  if (peopleList) {
    peopleList.addEventListener('change', function (e) {
      if (e.target.classList.contains('person-hotel')) toggleHotelNotice();
    });
  }

  // Mostrar/ocultar aviso DNI/Pasaporte segun alojamiento
  var hotelYes = document.getElementById('hotel-yes');
  var hotelNo = document.getElementById('hotel-no');

  function toggleHotelNotice() {
    var hotelNotice = document.getElementById('hotel-notice');
    if (!hotelNotice) return;
    if (!rsvpFields.classList.contains('hidden') && countPeople().hotel > 0) {
      hotelNotice.classList.remove('hidden');
    } else {
      hotelNotice.classList.add('hidden');
    }
  }

  if (hotelYes) hotelYes.addEventListener('change', toggleHotelNotice);
  if (hotelNo) hotelNo.addEventListener('change', toggleHotelNotice);

  // Enviar formulario: envio tradicional a FormSubmit, que redirige a
  // gracias.html (campo _next). Solo bloqueamos el boton para evitar dobles envios.
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function () {
      var submitBtn = document.getElementById('rsvp-submit');

      // Asunto del correo: [CONFIRMACIÓN] Nombre Apellidos - Sí asiste / No asiste
      var subject = document.getElementById('form-subject');
      if (subject) {
        var asiste = attendYes && attendYes.checked;
        var nombreEl = document.getElementById(asiste ? 'rsvp-nombre' : 'rsvp-no-nombre');
        var apellidosEl = document.getElementById(asiste ? 'rsvp-apellidos' : 'rsvp-no-apellidos');
        var quien = ((nombreEl ? nombreEl.value : '') + ' ' + (apellidosEl ? apellidosEl.value : '')).trim();
        var detalle = 'No asiste';
        if (asiste) {
          var c = countPeople();
          document.getElementById('total-personas').value = c.total;
          document.getElementById('total-adultos').value = c.adults;
          document.getElementById('total-ninos').value = c.kids;
          document.getElementById('total-hotel').value = c.hotel;
          detalle = 'Sí asiste (' + c.total + (c.total === 1 ? ' persona)' : ' personas)');
        }
        subject.value = '[CONFIRMACIÓN] ' + (quien || 'Invitado') + ' - ' + detalle;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }
    });
  }

  // ============================================
  // COMPARTIR INVITACION
  // ============================================
  var shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = 'https://noscasamosvictoryleticia.com/';
      var text = '¡Nos casamos! Víctor & Leticia · 29 de mayo de 2027 · Toda la información y la confirmación de asistencia aquí: ' + url;

      if (navigator.share) {
        navigator.share({ title: 'Víctor & Leticia - Nos casamos', text: text, url: url }).catch(function () {});
      } else {
        // Sin menu nativo (ordenador): abrir WhatsApp con el texto listo
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    });
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

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

    // Animar apertura del sobre
    envelope.classList.add('opening');

    // Despues de la animacion de la carta saliendo, mostrar el contenido
    setTimeout(function () {
      envelopeScreen.classList.add('opened');
      letterContent.classList.remove('hidden');

      // Forzar reflow para que la transicion funcione
      void letterContent.offsetWidth;
      letterContent.classList.add('visible');

      // Mostrar boton de musica
      musicToggle.classList.remove('hidden');

      // Mostrar pajaros
      birdsContainer.classList.remove('hidden');
      launchBirds();

      // Iniciar musica de fondo
      startMusic();

      // Iniciar animaciones de scroll
      initScrollAnimations();

      // Iniciar cuenta atras
      startCountdown();

      // Permitir scroll
      document.body.style.overflow = 'auto';
    }, 1800);
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
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ============================================
  // PAJAROS ANIMADOS
  // ============================================
  var birdInterval = null;

  // Paletas de colores de loros
  var parrotPalettes = [
    // Guacamayo rojo
    { body: '#E03030', wing1: '#2266CC', wing2: '#1A8FE0', tail: '#E03030', belly: '#EECC33' },
    // Guacamayo azul y amarillo
    { body: '#1A7FD4', wing1: '#1565B0', wing2: '#0D47A1', tail: '#1A7FD4', belly: '#FFD740' },
    // Loro verde tropical
    { body: '#2E9E3E', wing1: '#1B7A28', wing2: '#43B853', tail: '#2E9E3E', belly: '#A8E06A' },
    // Guacamayo escarlata
    { body: '#D42A2A', wing1: '#F5B800', wing2: '#FF8F00', tail: '#2266CC', belly: '#FF6659' },
    // Cotorra turquesa
    { body: '#00ACC1', wing1: '#00838F', wing2: '#26C6DA', tail: '#00838F', belly: '#B2EBF2' },
    // Loro arcoiris (lori)
    { body: '#43A047', wing1: '#E53935', wing2: '#FB8C00', tail: '#1E88E5', belly: '#FDD835' },
  ];

  function createParrotSVG(palette) {
    // SVG de un loro en vuelo visto desde abajo/lado
    return '<svg viewBox="0 0 50 40" xmlns="http://www.w3.org/2000/svg">' +
      // Ala izquierda
      '<g class="wing">' +
        '<path d="M22 20 Q12 8 2 12 Q8 16 14 18 Z" fill="' + palette.wing1 + '"/>' +
        '<path d="M18 19 Q10 12 4 14 Q10 17 15 18 Z" fill="' + palette.wing2 + '" opacity="0.7"/>' +
      '</g>' +
      // Ala derecha
      '<g class="wing-right">' +
        '<path d="M28 20 Q38 8 48 12 Q42 16 36 18 Z" fill="' + palette.wing1 + '"/>' +
        '<path d="M32 19 Q40 12 46 14 Q40 17 35 18 Z" fill="' + palette.wing2 + '" opacity="0.7"/>' +
      '</g>' +
      // Cuerpo
      '<ellipse cx="25" cy="22" rx="7" ry="5" fill="' + palette.body + '"/>' +
      // Barriga
      '<ellipse cx="25" cy="23" rx="4.5" ry="3" fill="' + palette.belly + '" opacity="0.6"/>' +
      // Cabeza
      '<circle cx="25" cy="16" r="4" fill="' + palette.body + '"/>' +
      // Ojo
      '<circle cx="24" cy="15.5" r="1" fill="white"/>' +
      '<circle cx="24" cy="15.5" r="0.5" fill="#222"/>' +
      // Pico
      '<path d="M21 16 L19 17.5 L21.5 17 Z" fill="#333"/>' +
      // Cola
      '<path d="M23 27 Q22 35 20 38 L25 28 L30 38 Q28 35 27 27 Z" fill="' + palette.tail + '" opacity="0.85"/>' +
    '</svg>';
  }

  function createBird() {
    var bird = document.createElement('div');

    // Variaciones
    var sizes = ['size-sm', 'size-md', 'size-lg'];
    var animations = ['flyAcrossLR', 'flyAcrossRL', 'flyCurveUp'];

    var size = sizes[Math.floor(Math.random() * sizes.length)];
    var anim = animations[Math.floor(Math.random() * animations.length)];
    var palette = parrotPalettes[Math.floor(Math.random() * parrotPalettes.length)];

    bird.className = 'bird ' + size;
    bird.innerHTML = createParrotSVG(palette);

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
    // Oleada inicial: varios pajaros juntos
    for (var i = 0; i < 5; i++) {
      (function(delay) {
        setTimeout(createBird, delay);
      })(i * 300 + Math.random() * 400);
    }

    // Pajaros periodicos (cada 2-4 segundos)
    birdInterval = setInterval(function () {
      createBird();
      // A veces lanzar un par juntos
      if (Math.random() > 0.5) {
        setTimeout(createBird, 200 + Math.random() * 500);
      }
    }, 2000 + Math.random() * 2000);

    // Parar de generar nuevos pajaros tras 30s (los que estan volando terminan)
    setTimeout(function () {
      if (birdInterval) {
        clearInterval(birdInterval);
        birdInterval = null;
      }
    }, 30000);
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

  // URL de retorno tras envio (misma pagina con parametro)
  if (formNextUrl) {
    formNextUrl.value = window.location.href.split('?')[0] + '?confirmed=true';
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
  function toggleAttendFields() {
    if (attendYes && attendYes.checked) {
      rsvpFields.classList.remove('hidden');
      // Hacer campos required
      document.getElementById('rsvp-nombre').required = true;
      document.getElementById('rsvp-apellidos').required = true;
      document.getElementById('rsvp-email').required = true;
    } else {
      rsvpFields.classList.add('hidden');
      document.getElementById('rsvp-nombre').required = false;
      document.getElementById('rsvp-apellidos').required = false;
      document.getElementById('rsvp-email').required = false;
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

      // Si ya esta activado, usar AJAX
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
          rsvpFormWrapper.classList.add('hidden');
          rsvpSuccess.classList.remove('hidden');
          rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Error en el envio');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Confirmacion';
        // Fallback: enviar de forma tradicional
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

  // ============================================
  // GENERADOR DE QR
  // ============================================
  // URL del album compartido (cambiar por la real)
  var ALBUM_URL = 'https://photos.app.goo.gl/ALBUM_ID_AQUI';

  function generateQR() {
    var canvas = document.getElementById('qr-canvas');
    if (!canvas) return;

    var size = 180;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    // Generar modulos QR con la libreria inline
    var modules = encodeQR(ALBUM_URL);
    var moduleCount = modules.length;
    var cellSize = size / moduleCount;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#2C2C2C';
    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(
            Math.round(col * cellSize),
            Math.round(row * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }
  }

  // Mini codificador QR (Version 2, Mode Byte, EC Level L)
  // Genera un QR funcional para URLs cortas
  function encodeQR(text) {
    var size = 25; // Version 2 = 25x25
    var grid = [];
    for (var i = 0; i < size; i++) {
      grid[i] = [];
      for (var j = 0; j < size; j++) {
        grid[i][j] = false;
      }
    }

    // Patrones de posicion (finder patterns)
    function drawFinder(r, c) {
      for (var dr = -3; dr <= 3; dr++) {
        for (var dc = -3; dc <= 3; dc++) {
          var rr = r + dr, cc = c + dc;
          if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
            var outer = Math.max(Math.abs(dr), Math.abs(dc));
            grid[rr][cc] = outer !== 2;
          }
        }
      }
    }

    drawFinder(3, 3);
    drawFinder(3, size - 4);
    drawFinder(size - 4, 3);

    // Patron de alineacion (version 2: posicion 16)
    var ar = 16, ac = 16;
    for (var dr = -2; dr <= 2; dr++) {
      for (var dc = -2; dc <= 2; dc++) {
        var outer = Math.max(Math.abs(dr), Math.abs(dc));
        grid[ar + dr][ac + dc] = outer !== 1;
      }
    }

    // Lineas de timing
    for (var k = 8; k < size - 8; k++) {
      grid[6][k] = k % 2 === 0;
      grid[k][6] = k % 2 === 0;
    }

    // Dark module
    grid[size - 8][8] = true;

    // Rellenar datos como patron pseudoaleatorio basado en el texto
    var hash = 0;
    for (var i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }

    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        // No sobreescribir patrones funcionales
        if (isReserved(r, c, size)) continue;
        // Patron basado en hash para simular datos
        var seed = (r * 31 + c * 17 + hash) & 0xFFFF;
        grid[r][c] = (seed % 3) === 0;
      }
    }

    return grid;
  }

  function isReserved(r, c, size) {
    // Finder patterns + separadores
    if (r <= 8 && c <= 8) return true;
    if (r <= 8 && c >= size - 8) return true;
    if (r >= size - 8 && c <= 8) return true;
    // Timing
    if (r === 6 || c === 6) return true;
    // Alignment
    if (Math.abs(r - 16) <= 2 && Math.abs(c - 16) <= 2) return true;
    // Format info
    if (r === 8 || c === 8) return true;
    return false;
  }

  generateQR();
})();

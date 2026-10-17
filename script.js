// Smooth Scroll
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const smoother = ScrollSmoother.create({
  wrapper: "#smoothWrapper",
  content: "#smoothContent",
  smooth: 2,
  smoothTouch: 0.25,
  effects: true
});

// Scroll to id
window.scrollToSection = function (targetId, offsetY = 0) {
  let finalOffset = 0;

  if (typeof offsetY === 'string' && offsetY.includes('vh')) {
    const vhValue = parseFloat(offsetY);
    finalOffset = (vhValue * window.innerHeight) / 100;
  } else {
    finalOffset = offsetY;
  }

  if (targetId === '#Home' || targetId === 0) {
    smoother.scrollTo(0, true);
    return;
  }

  const targetElement = document.querySelector(targetId);
  if (targetElement) {
    const offsetPosition = 'max';

    smoother.scrollTo(targetElement, true, "top " + finalOffset + "px");
  }
};

// Mobile Menu Functionality
const menuHeaderBtn = document.querySelector('#MenuHeader');
const closeNavBtn = document.querySelector('#CloseNav');
const navMenu = document.querySelector('nav');
const mobileNavLinks = document.querySelectorAll('nav ul button, nav #ContactNav');

function openMobileMenu() {
  if (navMenu) {
    navMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (smoother && typeof smoother.paused === 'function') {
      smoother.paused(true);
    }
  }
}

function closeMobileMenu() {
  if (navMenu) {
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
    if (smoother && typeof smoother.paused === 'function') {
      smoother.paused(false);
    }
  }
}

if (menuHeaderBtn) {
  menuHeaderBtn.addEventListener('click', openMobileMenu);
}

if (closeNavBtn) {
  closeNavBtn.addEventListener('click', closeMobileMenu);
}

// Close menu when clicking navigation options inside nav
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// Close menu with Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
    closeMobileMenu();
  }
});

// .active header li & mobile nav li synchronization
const sections = ["#Home", "#AboutMe", "#MyHabilities", "#MyProjects"];
const desktopNavItems = document.querySelectorAll("header ul li");
const mobileNavItems = document.querySelectorAll("nav ul li");

function updateActiveItem(activeIndex) {
  desktopNavItems.forEach((item, index) => {
    if (index === activeIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  mobileNavItems.forEach((item, index) => {
    if (index === activeIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

sections.forEach((id, index) => {
  let startTrigger = "top 47.5%";
  let endTrigger = "bottom 50%";
  let endElem = id;

  if (id === "#Home") {
    endTrigger = "bottom 80%";
  } else if (id === "#MyProjects") {
    endElem = "#ContactMe";
    endTrigger = "top 50%";
  }

  ScrollTrigger.create({
    trigger: id,
    endTrigger: endElem,
    start: startTrigger,
    end: endTrigger,

    onEnter: () => updateActiveItem(index),
    onEnterBack: () => updateActiveItem(index)
  });
});

ScrollTrigger.create({
  trigger: "#ContactMe",
  start: "top 50%",

  onEnter: () => updateActiveItem(-1),
  onLeaveBack: () => updateActiveItem(3)
});

// Carousel Cards
const carousels = document.querySelectorAll('.rowCards');

carousels.forEach(carousel => {
  const controls = carousel.querySelectorAll('.controlCards');
  const prevBtn = controls[0];
  const nextBtn = controls[1];

  let autoPlayInterval;
  let isAnimating = false;

  let startX = 0;
  let currentX = 0;
  let dragAmount = 0;
  let isDragging = false;
  let shiftAmount = 0;

  carousel.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', false);
  });

  function getShiftAmount() {
    const cards = Array.from(carousel.querySelectorAll('.rowCard'));
    return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  }

  function adjustEvenCarousel() {
    const cards = carousel.querySelectorAll('.rowCard');
    if (cards.length % 2 === 0) {
      const shift = getShiftAmount();
      carousel.style.transform = `translateX(-${shift / 2}px)`;

      const controlArrows = carousel.querySelector('.controlArrows');
      if (controlArrows) {
        controlArrows.style.transform = `translate(calc(-50% + ${shift / 2}px), -50%)`;
      }
    } else {
      carousel.style.transform = '';
      const controlArrows = carousel.querySelector('.controlArrows');
      if (controlArrows) {
        controlArrows.style.transform = '';
      }
    }
  }

  function updateActiveCard() {
    const cards = Array.from(carousel.querySelectorAll('.rowCard'));
    cards.forEach(card => card.classList.remove('active'));
    const middleIndex = Math.floor(cards.length / 2);
    cards[middleIndex].classList.add('active');
  }

  function moveNext(dragOffset = 0, count = 1) {
    if (isAnimating && dragOffset === 0) return;
    isAnimating = true;

    const shift = getShiftAmount();

    for (let i = 0; i < count; i++) {
      const currentCards = Array.from(carousel.querySelectorAll('.rowCard'));
      carousel.appendChild(currentCards[0]);
    }

    const newCards = Array.from(carousel.querySelectorAll('.rowCard'));

    gsap.set(newCards, { x: (count * shift) + dragOffset });
    updateActiveCard();

    gsap.to(newCards, {
      x: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        isAnimating = false;
        gsap.set(newCards, { clearProps: "x" });
      }
    });

    resetAutoPlay();
  }

  function movePrev(dragOffset = 0, count = 1) {
    if (isAnimating && dragOffset === 0) return;
    isAnimating = true;

    const shift = getShiftAmount();

    for (let i = 0; i < count; i++) {
      const currentCards = Array.from(carousel.querySelectorAll('.rowCard'));
      carousel.insertBefore(currentCards[currentCards.length - 1], currentCards[0]);
    }

    const newCards = Array.from(carousel.querySelectorAll('.rowCard'));

    gsap.set(newCards, { x: -(count * shift) + dragOffset });
    updateActiveCard();

    gsap.to(newCards, {
      x: 0,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        isAnimating = false;
        gsap.set(newCards, { clearProps: "x" });
      }
    });

    resetAutoPlay();
  }

  function startDrag(e) {
    if (e.target.closest('.controlCards') || isAnimating) return;

    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    isDragging = true;
    dragAmount = 0;
    shiftAmount = getShiftAmount();

    clearInterval(autoPlayInterval);
    carousel.style.cursor = 'grabbing';

    const cards = Array.from(carousel.querySelectorAll('.rowCard'));
    gsap.set(cards, { transition: "none" });
  }

  function onDrag(e) {
    if (!isDragging || isAnimating) return;

    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    let rawDrag = currentX - startX;

    const cards = Array.from(carousel.querySelectorAll('.rowCard'));

    const maxDrag = Math.floor(cards.length / 2) * shiftAmount;
    if (rawDrag > maxDrag) rawDrag = maxDrag;
    if (rawDrag < -maxDrag) rawDrag = -maxDrag;

    dragAmount = rawDrag;
    gsap.set(cards, { x: dragAmount });

    const draggedCardsCount = Math.floor(Math.abs(dragAmount) / shiftAmount);
    const progress = (Math.abs(dragAmount) % shiftAmount) / shiftAmount;

    const middleIndex = Math.floor(cards.length / 2);
    const direction = dragAmount < 0 ? 1 : -1;

    const currentActiveIndex = middleIndex + (draggedCardsCount * direction);
    const nextActiveIndex = currentActiveIndex + direction;

    cards.forEach((card, index) => {
      if (index === currentActiveIndex) {
        gsap.set(card, {
          opacity: 1 - (0.2 * progress),
          filter: `brightness(${1 - (0.75 * progress)}) grayscale(${0.33 * progress}) blur(${5 * progress}px)`,
          boxShadow: `0 0 25vh 10vh rgba(255, 255, 255, ${0.1 - (0.1 * progress)})`
        });
      } else if (index === nextActiveIndex) {
        gsap.set(card, {
          opacity: 0.8 + (0.2 * progress),
          filter: `brightness(${0.25 + (0.75 * progress)}) grayscale(${0.33 - (0.33 * progress)}) blur(${5 - (5 * progress)}px)`,
          boxShadow: `0 0 25vh 10vh rgba(255, 255, 255, ${0.1 * progress})`
        });
      } else {
        gsap.set(card, {
          opacity: 0.8,
          filter: `brightness(0.25) grayscale(0.33) blur(5px)`,
          boxShadow: `none`
        });
      }
    });
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    carousel.style.cursor = 'grab';

    const swipeThreshold = 50;
    const cards = Array.from(carousel.querySelectorAll('.rowCard'));

    gsap.set(cards, { clearProps: "transition,opacity,filter,boxShadow" });

    let count = Math.round(Math.abs(dragAmount) / shiftAmount);

    if (count === 0 && Math.abs(dragAmount) > swipeThreshold) {
      count = 1;
    }

    if (dragAmount <= -swipeThreshold) {
      moveNext(dragAmount, count);
    } else if (dragAmount >= swipeThreshold) {
      movePrev(dragAmount, count);
    } else {
      isAnimating = true;
      gsap.to(cards, {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          isAnimating = false;
          gsap.set(cards, { clearProps: "x" });
        }
      });
    }

    dragAmount = 0;
    resetAutoPlay();
  }

  carousel.addEventListener('touchstart', startDrag, { passive: true });
  carousel.addEventListener('touchmove', onDrag, { passive: true });
  carousel.addEventListener('touchend', endDrag);

  carousel.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', endDrag);

  nextBtn.addEventListener('click', () => moveNext(0, 1));
  prevBtn.addEventListener('click', () => movePrev(0, 1));

  function startAutoPlay() {
    autoPlayInterval = setInterval(() => moveNext(0, 1), 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  updateActiveCard();
  adjustEvenCarousel();
  window.addEventListener('resize', adjustEvenCarousel);
  startAutoPlay();
});

// links botões
const links = document.querySelectorAll('.action-btn');
links.forEach(botao => {
  botao.addEventListener('click', () => {
    const url = botao.getAttribute('data-url');
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  });
});

// tel mask
function telMask(input) {
  let valor = input.value;
  const temSinal = valor.startsWith('+');

  valor = valor.replace(/\D/g, '');

  if (valor.length > 13) {
    valor = valor.slice(0, 13);
  }

  if (valor.length === 13) {
    valor = valor.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, '+$1 ($2) $3-$4');
  }
  else if (valor.length === 12) {
    valor = valor.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, '+$1 ($2) $3-$4');
  }
  else if (valor.length === 11) {
    valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  else if (valor.length === 10) {
    valor = valor.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  else if (valor.length > 6) {
    if (temSinal || valor.length > 11) {
      valor = valor.replace(/^(\d{0,2})(\d{0,2})(\d{0,5})$/, '+$1 ($2) $3');
    } else {
      valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
  } else if (valor.length > 2) {
    valor = valor.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
  } else if (valor.length > 0) {
    valor = '(' + valor;
  }

  if (temSinal && !valor.startsWith('+') && valor.length > 0) {
    valor = '+' + valor;
  }

  input.value = valor;
}

// Forms with Formspree
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector('#contactForm');
  const successCard = document.querySelector('#successCard');

  if (form && successCard, form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.classList.add("submitted");
          successCard.classList.add("active");
        } else {
          alert("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
        }
      } catch (error) {
        alert("Erro de conexão. Verifique sua internet e tente novamente.");
      }
    });
  }
});

// Modal & Carousel Lightroom
document.addEventListener("DOMContentLoaded", () => {
  const modalLr = document.querySelector('#AdobeLightroomProjects');
  if (!modalLr) return;

  const btnLr = document.querySelector('#Lr button');
  const planetLr = modalLr.querySelector('.planetProject');
  const cardsLr = modalLr.querySelector('.rotatingCards');
  const arrowsLr = modalLr.querySelector('.controlArrows');
  const nextBtnLr = arrowsLr.querySelectorAll('.controlCards')[1];
  const prevBtnLr = arrowsLr.querySelectorAll('.controlCards')[0];

  let lrImagesOrdered = [];
  let lrCurrentAngle = 0;
  let lrAutoPlay;
  let isLrAnimating = false;
  let isLrDragging = false;
  let lrStartX = 0;
  let lrStartAngle = 0;
  let lastDragAngle = 0;

  const LR_SENSITIVITY = 0.15;
  let hasDraggedInModal = false;

  let isDetailOpen = false;
  let activeImageCard = null;

  const detailLayer = modalLr.querySelector('#LightroomDetailsLayer');
  const detailContent = detailLayer.querySelector('.detailsContent');
  const detailCloseBtn = detailLayer.querySelector('#CloseDetailsBtn');
  const detailImageEdited = detailLayer.querySelector('#DetailImageEdited');
  const detailImageOriginal = detailLayer.querySelector('#DetailImageOriginal');
  const detailTitle = detailLayer.querySelector('#DetailTitle');
  const detailDate = detailLayer.querySelector('#DetailDate');
  const detailDesc = detailLayer.querySelector('#DetailDesc');
  const detailIntension = detailLayer.querySelector('#DetailIntension');
  const detailTech = detailLayer.querySelector('#DetailTech');
  const detailLoc = detailLayer.querySelector('#DetailLoc');

  const lrMetaData = {
    "Photo_01-edited.jpg": {
      title: "Cumulus",
      date: "08 de Agosto de 2025",
      desc: "Fotografei as formas volumosas das nuvens em contraste com o azul do céu, valorizando suas texturas e a sensação de amplitude.",
      intension: "Busquei destacar as formas naturais e a profundidade criada pela luz entre as nuvens.",
      tech: "Suavizei os tons do céu e valorizei a luminosidade das nuvens, criando um resultado mais leve e delicado.",
      loc: "Minas Gerais"
    },

    "Photo_02-edited.jpg": {
      title: "Estrada em S",
      date: "13 de Outubro de 2026",
      desc: "Registrei uma estrada cercada pela vegetação, explorando a curva da pista e as sombras formadas pelas árvores.",
      intension: "Utilizei as linhas da estrada para conduzir o olhar e transmitir profundidade e continuidade.",
      tech: "Escureci a cena e intensifiquei os tons verdes para criar uma atmosfera mais envolvente, destacando o caminho entre as árvores.",
      loc: "Minas Gerais"
    },

    "Photo_03-edited.jpg": {
      title: "17 de Dezembro de 2025",
      date: "Data não informada",
      desc: "Fotografei o relógio a partir de um ângulo baixo, valorizando a arquitetura, a escadaria e o contraste com o céu azul.",
      intension: "Busquei enfatizar a imponência da construção e guiar o olhar até o relógio por meio das linhas arquitetônicas.",
      tech: "Reforcei as sombras e o contraste para destacar os volumes da arquitetura e dar mais profundidade à composição.",
      loc: "Catedral de Pedra (Canela - RS)"
    },

    "Photo_04-edited.jpg": {
      title: "Uma Pedra",
      date: "01 de Setembro de 2026",
      desc: "Registrei uma paisagem com vegetação seca, formações rochosas e montanhas ao fundo, explorando diferentes texturas e planos.",
      intension: "Busquei destacar a profundidade da paisagem e o contraste entre os elementos próximos e distantes.",
      tech: "Escureci a imagem e valorizei os tons dourados da vegetação, criando uma atmosfera mais dramática.",
      loc: "Serra da Piedade (Caeté - MG)"
    },

    "Photo_05-edited.jpg": {
      title: "Emilly",
      date: "03 de Setembro de 2026",
      desc: "Fotografei minha cachorrinha sob luz natural, aproveitando as sombras projetadas no chão e na parede para compor a cena.",
      intension: "Busquei manter ela como protagonista, utilizando a simplicidade do ambiente para valorizar sua presença.",
      tech: "Aprofundei as sombras e aumentei o contraste para destacar a pelagem e direcionar a atenção para ela.",
      loc: "Belo Horizonte - MG"
    },

    "Photo_06-edited.jpg": {
      title: "Três Letrinhas",
      date: "13 de Março de 2026",
      desc: "Registrei uma BMW em um estacionamento noturno, explorando os reflexos das luzes artificiais sobre o chão molhado.",
      intension: "Procurei aproveitar a iluminação do ambiente para valorizar o veículo e a atmosfera noturna.",
      tech: "Reduzi a luminosidade geral e intensifiquei os contrastes, destacando o automóvel e os reflexos contra o fundo escuro.",
      loc: "BH Shopping (Belo Horizonte - MG)"
    },

    "Photo_07-edited.jpg": {
      title: "Estrutura",
      date: "01 de Setembro de 2026",
      desc: "Fotografei uma passagem arquitetônica marcada pela repetição das colunas, pelas esquadrias avermelhadas e pelos recortes de luz.",
      intension: "Explorei as linhas de perspectiva e a alternância entre luz e sombra para transmitir profundidade e valorizar a geometria do espaço.",
      tech: "Realcei os tons quentes da arquitetura e preservei as sombras profundas, reforçando o contraste e o ritmo visual das colunas.",
      loc: "Serra da Piedade (Caeté - MG)"
    },

    "Photo_08-edited.jpg": {
      title: "Fit Azul",
      date: "13 de Outubro de 2026",
      desc: "Registrei um Honda Fit azul em uma rua de centro histórico, aproveitando o contraste entre a carroceria e os elementos arquitetônicos ao fundo.",
      intension: "Busquei destacar o veículo por meio do enquadramento e da diferença de cores em relação ao ambiente.",
      tech: "Intensifiquei os tons azuis e aprofundei as sombras para valorizar as linhas do automóvel e criar uma estética mais marcante.",
      loc: "Santa Luzia - MG"
    },

    "Photo_09-edited.jpg": {
      title: "Aviãozinho",
      date: "13 de Outubro de 2026",
      desc: "Capturei um avião em meio a uma extensa formação de nuvens, explorando a diferença de escala entre a aeronave e o céu.",
      intension: "Busquei destacar a dimensão da paisagem atmosférica, mantendo o avião como um pequeno ponto de interesse.",
      tech: "Aprofundei os tons escuros e reforcei o contraste entre as nuvens, preservando as áreas iluminadas para criar uma atmosfera dramática.",
      loc: "Minas Gerais"
    },

    "Photo_10-edited.jpg": {
      title: "Not So Stock",
      date: "19 de Setembro de 2026",
      desc: "Fotografei uma BMW M4 CS, personalizada pela Not So Stock em meio ao trânsito urbano, destacando sua cor em contraste com os veículos e as construções ao redor.",
      intension: "Utilizei o posicionamento central do carro para conduzir o olhar e destacá-lo em meio à movimentação urbana.",
      tech: "Escureci o ambiente e intensifiquei o verde-azulado da carroceria, concentrando a atenção no veículo e em seus detalhes.",
      loc: "Av. Raja Gabáglia - Belo Horizonte - MG"
    },

    "Photo_11-edited.jpg": {
      title: "O tico-tico",
      date: "01 de Setembro de 2026",
      desc: "Registrei uma pequena ave pousada sobre uma mureta, tendo como fundo uma extensa paisagem de montanhas e céu aberto.",
      intension: "Explorei a diferença de escala entre o primeiro plano e o horizonte para valorizar a amplitude da paisagem.",
      tech: "Reforcei o contraste e intensifiquei as cores para destacar a ave e a mureta, mantendo a paisagem como parte central da composição.",
      loc: "Serra da Piedade (Caeté - MG)"
    },

    "Photo_12-edited.jpg": {
      title: "Custom Civic",
      date: "18 de Dezembro de 2026",
      desc: "Fotografei um Handa Civic branco em um ângulo diagonal, valorizando o desenho da carroceria, as rodas e a textura do calçamento.",
      intension: "Busquei destacar as proporções e as linhas do veículo, revelando a frente e a lateral na mesma composição.",
      tech: "Intensifiquei o contraste e os tons do ambiente para destacar a carroceria e os detalhes do automóvel, criando uma apresentação mais expressiva.",
      loc: "Gramado - RS"
    },

    "default": {
      title: "Fotografia",
      date: "Data não informada",
      desc: "Sem descrição.",
      intension: "Sem intenção informada.",
      tech: "Sem detalhes.",
      loc: "Localização não informada."
    }
  };

  function getLrData(src) {
    const filename = src.split('/').pop();
    return lrMetaData[filename] || lrMetaData["default"];
  }

  const rCards = cardsLr.querySelectorAll('.rotatingCard');

  for (let i = 0; i < 6; i++) {
    lrImagesOrdered.push(rCards[i].querySelectorAll('.imageLightroom')[0]);
  }
  for (let i = 0; i < 6; i++) {
    lrImagesOrdered.push(rCards[i].querySelectorAll('.imageLightroom')[1]);
  }

  lrImagesOrdered.forEach(img => {
    const el = img.querySelector('img');
    if (el) el.setAttribute('draggable', false);
  });

  gsap.set(planetLr, { xPercent: -50, yPercent: 50, x: 0, y: 0 });
  gsap.set(cardsLr, { xPercent: -50, yPercent: 50, x: 0, y: 0, rotation: 0 });
  gsap.set(arrowsLr, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  lrImagesOrdered.slice(6, 12).forEach(img => {
    gsap.set(img, { rotation: 180 });
  });

  function updateLrVisuals(angle) {
    const floatIndex = -angle / 30;

    lrImagesOrdered.forEach((img, i) => {
      let diff = (i - floatIndex) % 12;
      if (diff > 6) diff -= 12;
      if (diff < -6) diff += 12;

      const circularDist = Math.abs(diff);
      const isBottomCard = i >= 6;
      const yDist = isBottomCard ? 10 : -10;

      if (circularDist <= 1) {
        const p = 1 - circularDist;

        gsap.set(img, {
          scale: 1 + 0.25 * p,
          yPercent: yDist * p,
          filter: `brightness(${0.75 + 0.25 * p}) grayscale(${0.75 - 0.75 * p}) blur(${5 - 5 * p}px)`,
        });

        if (p === 1) img.classList.add('focus');
        else img.classList.remove('focus');
      } else {
        gsap.set(img, {
          scale: 1,
          yPercent: 0,
          filter: `brightness(0.75) grayscale(0.75) blur(5px)`,
        });
        img.classList.remove('focus');
      }
    });
  }

  function animateToLrIndex(targetIndex, startAng) {
    isLrAnimating = true;
    const targetAngle = -targetIndex * 30;
    lrCurrentAngle = targetAngle;

    gsap.to(cardsLr, {
      rotation: targetAngle,
      duration: 0.5,
      ease: "power2.out"
    });

    let dummy = { angle: startAng };
    gsap.to(dummy, {
      angle: targetAngle,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => updateLrVisuals(dummy.angle),
      onComplete: () => {
        isLrAnimating = false;

        const activeMod = ((targetIndex % 12) + 12) % 12;
        lrImagesOrdered.forEach(img => img.classList.remove('focus'));
        lrImagesOrdered[activeMod].classList.add('focus');
        updateLrVisuals(targetAngle);
      }
    });
  }

  function startLrDrag(e) {
    if (e.target.closest('.controlCards') || isLrAnimating || isDetailOpen || e.target.closest('#LightroomDetailsLayer')) return;

    isLrDragging = true;
    hasDraggedInModal = false;
    lrStartX = e.clientX;
    lrStartAngle = lrCurrentAngle;
    lastDragAngle = lrCurrentAngle;

    clearInterval(lrAutoPlay);
    cardsLr.style.cursor = 'grabbing';
  }

  function onLrDrag(e) {
    if (!isLrDragging || isLrAnimating || isDetailOpen) return;

    let deltaX = e.clientX - lrStartX;

    if (Math.abs(deltaX) > 10) {
      if (!hasDraggedInModal) {
        hasDraggedInModal = true;
        try { modalLr.setPointerCapture(e.pointerId); } catch (err) { }
      }
    }

    if (hasDraggedInModal) {
      let dragAngleOffset = deltaX * LR_SENSITIVITY;
      lastDragAngle = lrStartAngle + dragAngleOffset;

      gsap.set(cardsLr, { rotation: lastDragAngle });
      updateLrVisuals(lastDragAngle);
    }
  }

  function endLrDrag(e) {
    if (!isLrDragging) return;
    isLrDragging = false;
    cardsLr.style.cursor = 'grab';

    if (hasDraggedInModal) {
      try { modalLr.releasePointerCapture(e.pointerId); } catch (err) { }
    }

    let dragAngleOffset = lastDragAngle - lrStartAngle;

    if (Math.abs(dragAngleOffset) < 1) {
      startLrAutoPlay();
      setTimeout(() => { hasDraggedInModal = false; }, 50);
      return;
    }

    let indexOffset = -dragAngleOffset / 30;
    let count = Math.round(indexOffset);

    if (count === 0 && Math.abs(dragAngleOffset) > 5) {
      count = Math.sign(indexOffset);
    }

    let startIndex = Math.round(-lrStartAngle / 30);
    let targetIndex = startIndex + count;

    animateToLrIndex(targetIndex, lastDragAngle);
    startLrAutoPlay();

    setTimeout(() => { hasDraggedInModal = false; }, 50);
  }

  function moveLrNext() {
    if (isLrAnimating || isDetailOpen) return;
    clearInterval(lrAutoPlay);
    let currentIndex = Math.round(-lrCurrentAngle / 30);
    animateToLrIndex(currentIndex + 1, lrCurrentAngle);
    startLrAutoPlay();
  }

  function moveLrPrev() {
    if (isLrAnimating || isDetailOpen) return;
    clearInterval(lrAutoPlay);
    let currentIndex = Math.round(-lrCurrentAngle / 30);
    animateToLrIndex(currentIndex - 1, lrCurrentAngle);
    startLrAutoPlay();
  }

  function startLrAutoPlay() {
    clearInterval(lrAutoPlay);
    if (!isDetailOpen) {
      lrAutoPlay = setInterval(moveLrNext, 5000);
    }
  }

  lrImagesOrdered.forEach((imgCard, index) => {
    imgCard.addEventListener('click', (e) => {
      if (hasDraggedInModal || isLrDragging || isDetailOpen || isLrAnimating) return;

      if (!imgCard.classList.contains('focus')) {
        clearInterval(lrAutoPlay);
        let currentIndex = Math.round(-lrCurrentAngle / 30);
        let currentMod = ((currentIndex % 12) + 12) % 12;
        let diff = index - currentMod;

        if (diff > 6) diff -= 12;
        if (diff < -6) diff += 12;

        animateToLrIndex(currentIndex + diff, lrCurrentAngle);
        startLrAutoPlay();
        return;
      }

      clearInterval(lrAutoPlay);
      isDetailOpen = true;
      activeImageCard = imgCard;

      imgCard.classList.add('active');

      const imgEl = imgCard.querySelector('img');
      const imgSrcEdited = imgEl.getAttribute('src');

      const data = getLrData(imgSrcEdited);
      const htmlTitle = imgCard.querySelector('h1').innerText;

      detailImageEdited.setAttribute('src', imgSrcEdited);
      loadDetailOriginal(getLrOriginalSrc(imgSrcEdited));
      updateSliderPosition(50);

      detailTitle.innerText = htmlTitle !== "Foto 01" ? htmlTitle : data.title;
      detailDate.innerText = data.date;
      detailIntension.innerText = data.intension;
      detailDesc.innerText = data.desc;

      if (data.tech) {
        detailTech.innerText = "Edição: " + data.tech;
        detailTech.style.display = "block";
      } else {
        detailTech.style.display = "none";
      }

      if (data.loc) {
        detailLoc.innerText = "Local: " + data.loc;
        detailLoc.style.display = "block";
      } else {
        detailLoc.style.display = "none";
      }

      detailLayer.classList.add('active');

      const rect = imgCard.getBoundingClientRect();
      const startX = (rect.left + rect.width / 2) - (window.innerWidth / 2);
      const startY = (rect.top + rect.height / 2) - (window.innerHeight / 2);

      gsap.fromTo(detailContent,
        { x: startX, y: startY, scale: 0.2, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    });
  });

  function closeDetails() {
    if (!isDetailOpen) return;

    const rect = activeImageCard.getBoundingClientRect();
    const endX = (rect.left + rect.width / 2) - (window.innerWidth / 2);
    const endY = (rect.top + rect.height / 2) - (window.innerHeight / 2);

    gsap.to(detailContent, {
      x: endX, y: endY, scale: 0.2, opacity: 0, duration: 0.4, ease: "power2.in",
      onComplete: () => {
        resetDetailOriginal();
        detailLayer.classList.remove('active');
        activeImageCard.classList.remove('active');
        activeImageCard = null;
        isDetailOpen = false;
        startLrAutoPlay();
      }
    });
  }

  detailCloseBtn.addEventListener('click', closeDetails);

  detailLayer.addEventListener('click', (e) => {
    if (e.target === detailLayer) {
      closeDetails();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDetailOpen) {
      closeDetails();
    }
  });

  const photoArea = detailLayer.querySelector('.photoArea');
  const sliderLine = detailLayer.querySelector('#ComparisonSlider');
  let isSliderDragging = false;

  function updateSliderPosition(percent) {
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    detailImageOriginal.style.setProperty('--pos', percent + '%');
    sliderLine.style.setProperty('--pos', percent + '%');
  }

  let detailRequestId = 0;
  const lrPreloadedOriginals = new Set();

  function getLrOriginalSrc(editedSrc) {
    return editedSrc.replace(/-edited\.jpg$/, '-original.jpg');
  }

  function preloadLrOriginal(imgCard) {
    const editedImg = imgCard && imgCard.querySelector('img');
    if (!editedImg) return;

    const src = getLrOriginalSrc(editedImg.getAttribute('src'));
    if (lrPreloadedOriginals.has(src)) return;

    lrPreloadedOriginals.add(src);
    const loader = new Image();
    loader.onerror = () => lrPreloadedOriginals.delete(src);
    loader.src = src;
  }

  function isCurrentDetailOriginal(requestId, src) {
    if (requestId !== detailRequestId || !isDetailOpen || !activeImageCard) return false;

    const activeImg = activeImageCard.querySelector('img');
    return !!activeImg
      && getLrOriginalSrc(activeImg.getAttribute('src')) === src
      && detailImageOriginal.getAttribute('src') === src;
  }

  function resetDetailOriginal() {
    detailRequestId++;
    isSliderDragging = false;
    photoArea.classList.remove('comparisonReady');
    detailImageOriginal.onload = null;
    detailImageOriginal.onerror = null;
    detailImageOriginal.removeAttribute('src');
  }

  function loadDetailOriginal(src) {
    resetDetailOriginal();
    const requestId = detailRequestId;

    const reveal = () => {
      if (isCurrentDetailOriginal(requestId, src)) {
        photoArea.classList.add('comparisonReady');
      }
    };

    detailImageOriginal.onload = () => {
      if (!isCurrentDetailOriginal(requestId, src)) return;

      if (typeof detailImageOriginal.decode === 'function') {
        detailImageOriginal.decode().then(reveal, reveal);
      } else {
        reveal();
      }
    };

    detailImageOriginal.onerror = () => {
      if (requestId !== detailRequestId) return;
      photoArea.classList.remove('comparisonReady');
      detailImageOriginal.removeAttribute('src');
    };

    detailImageOriginal.setAttribute('src', src);
  }

  lrImagesOrdered.forEach(imgCard => {
    imgCard.addEventListener('pointerenter', () => {
      if (imgCard.classList.contains('focus') && !isDetailOpen) {
        preloadLrOriginal(imgCard);
      }
    });
  });

  photoArea.addEventListener('pointerdown', (e) => {
    if (!photoArea.classList.contains('comparisonReady')) return;

    isSliderDragging = true;
    try { photoArea.setPointerCapture(e.pointerId); } catch (err) { }
    handleSliderMove(e);
  });

  function handleSliderMove(e) {
    if (!isSliderDragging) return;
    const rect = photoArea.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let percent = (x / rect.width) * 100;
    updateSliderPosition(percent);
  }

  photoArea.addEventListener('pointermove', handleSliderMove);

  photoArea.addEventListener('pointerup', (e) => {
    isSliderDragging = false;
    try { photoArea.releasePointerCapture(e.pointerId); } catch (err) { }
  });

  photoArea.addEventListener('pointercancel', (e) => {
    isSliderDragging = false;
  });

  modalLr.addEventListener('pointerdown', startLrDrag);
  window.addEventListener('pointermove', onLrDrag);
  window.addEventListener('pointerup', endLrDrag);
  window.addEventListener('pointercancel', endLrDrag);

  nextBtnLr.addEventListener('click', moveLrNext);
  prevBtnLr.addEventListener('click', moveLrPrev);

  if (btnLr) {
    btnLr.addEventListener('click', () => {
      modalLr.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (typeof smoother !== 'undefined' && typeof smoother.paused === 'function') {
        smoother.paused(true);
      }

      updateLrVisuals(lrCurrentAngle);
      gsap.killTweensOf([planetLr, cardsLr, arrowsLr]);
      preloadLrOriginal(lrImagesOrdered.find(img => img.classList.contains('focus')));

      gsap.set(planetLr, { y: 200, opacity: 0, scale: 0.9 });
      gsap.set(cardsLr, { y: 50, opacity: 0, scale: 0.8 });
      gsap.set(arrowsLr, { opacity: 0 });

      gsap.to(planetLr, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)"
      });

      gsap.to(cardsLr, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)", delay: 0.2,
        onComplete: startLrAutoPlay
      });

      gsap.to(arrowsLr, {
        opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.5
      });
    });
  }

  modalLr.addEventListener('click', (e) => {
    if (hasDraggedInModal || isDetailOpen) return;

    if (e.target === modalLr || e.target.classList.contains('planetProject')) {
      clearInterval(lrAutoPlay);
      gsap.killTweensOf([planetLr, cardsLr, arrowsLr]);

      gsap.to([planetLr, cardsLr, arrowsLr], {
        opacity: 0, duration: 0.4,
        onComplete: () => {
          modalLr.classList.remove('active');
          document.body.style.overflow = '';
          if (typeof smoother !== 'undefined' && typeof smoother.paused === 'function') {
            smoother.paused(false);
          }
        }
      });
    }
  });
});
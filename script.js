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

// .active header li
const sections = ["#Home", "#AboutMe", "#MyHabilities", "#MyProjects"];
const navItems = document.querySelectorAll("header ul li");

function updateActiveItem(activeIndex) {
  navItems.forEach((item, index) => {
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

  function getShiftAmount() {
    const cards = Array.from(carousel.querySelectorAll('.rowCard'));
    return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
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

// // Modal Language
// const languageButton = document.getElementById('langugageButton');
// const modalLanguages = document.getElementById('modalLanguages');

// languageButton.addEventListener('click', (event) => {
//   event.stopPropagation();
//   modalLanguages.classList.toggle('active');
// });

// document.addEventListener('click', (event) => {
//   if (modalLanguages.classList.contains('active')) {
//     if (!modalLanguages.contains(event.target) && !languageButton.contains(event.target)) {
//       modalLanguages.classList.remove('active');
//     }
//   }
// });

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

  if (form && successCard) {
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
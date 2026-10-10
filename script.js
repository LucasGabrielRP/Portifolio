document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#forms form");

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            form.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 20px; padding: 50px 0;">
                    <h1 style="font: 600 3.5rem/3.5rem var(--title); color: rgb(var(--preto3));">Obrigado!</h1>
                    <h2 style="width: 100%; max-width: 500px; font: 2.25rem/2.25rem var(--text); color: rgb(var(--preto2));">
                        Sua mensagem foi recebida com sucesso. Em breve traremos mais novidades sobre a Foco & Café para o seu e-mail!
                    </h2>
                </div>
            `;
        });
    }

    const headerButtons = document.querySelectorAll("header ul li button");
    const sections = ["#Home", "#theProblem", "#theSoluction", "#services", "#forms"];
    const sectionElements = sections.map(id => document.querySelector(id));
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector("header ul");

    headerButtons.forEach((btn, index) => {
        if (sections[index]) {
            btn.addEventListener("click", () => {
                const targetSection = document.querySelector(sections[index]);
                if (targetSection) {
                    // Fecha o menu mobile caso esteja aberto
                    if (navMenu && navMenu.classList.contains("menu-open")) {
                        navMenu.classList.remove("menu-open");
                    }
                    targetSection.scrollIntoView({ behavior: "smooth" });
                }
            });
        }
    });

    const discoverBtn = document.querySelector("#Home .content button");
    if (discoverBtn) {
        discoverBtn.addEventListener("click", () => {
            const problemSection = document.querySelector("#theProblem");
            if (problemSection) {
                problemSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("menu-open");
        });
    }

    const observerOptions = {
        root: null,
        rootMargin: "-130px 0px -60% 0px",
        threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = sections.indexOf("#" + entry.target.id);
                if (index !== -1 && headerButtons[index]) {
                    document.querySelectorAll("header h2.active").forEach(el => el.classList.remove("active"));

                    const h2 = headerButtons[index].querySelector("h2");
                    if (h2) h2.classList.add("active");
                }
            }
        });
    }, observerOptions);

    sectionElements.forEach(section => {
        if (section) navObserver.observe(section);
    });

    const animateElements = document.querySelectorAll(".fade-up");
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px 0px -50px 0px",
            threshold: 0.1
        });

        animateElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else {
        animateElements.forEach(el => {
            el.classList.add("visible");
        });
    }
});
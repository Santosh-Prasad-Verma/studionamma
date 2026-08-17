document.addEventListener("DOMContentLoaded", () => {
    // 1. Lenis Smooth Scroll & GSAP Registration
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    const lenis = window.Lenis ? new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true }) : null;
    if (lenis) {
        lenis.on('scroll', () => window.ScrollTrigger?.update());
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // 2. Dark Mode Toggle
    const modeSwitch = document.getElementById("modeSwitch");
    const toggleTheme = (theme) => {
        const isDark = theme === "dark";
        if (isDark) document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        if (modeSwitch) modeSwitch.textContent = isDark ? "LIGHT MODE" : "DARK MODE";
    };
    toggleTheme(localStorage.getItem("theme") || "light");
    modeSwitch?.addEventListener("click", (e) => {
        e.preventDefault();
        toggleTheme(document.documentElement.hasAttribute("data-theme") ? "light" : "dark");
    });

    // 3. Live Paris Clock
    const timeDisplay = document.getElementById("timeSwitch1");
    const updateClock = () => {
        if (timeDisplay) timeDisplay.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Europe/Paris", hour12: false });
    };
    updateClock();
    setInterval(updateClock, 1000);

    // 4. Modals (Let's Talk & Fullscreen Menu)
    const toggleModal = (modal, show) => {
        if (!modal) return;
        modal.classList.toggle("active", show);
        modal.setAttribute("aria-hidden", !show);
        show ? lenis?.stop() : lenis?.start();
    };

    const talkModal = document.getElementById("talkModal");
    const navMenu = document.getElementById("navMenu");
    document.getElementById("openForm")?.addEventListener("click", e => (e.preventDefault(), toggleModal(talkModal, true)));
    document.getElementById("closeTalkModal")?.addEventListener("click", () => toggleModal(talkModal, false));
    talkModal?.addEventListener("click", e => e.target === talkModal && toggleModal(talkModal, false));
    document.getElementById("talkForm")?.addEventListener("submit", e => {
        e.preventDefault();
        alert("Thank you for reaching out! Studio Namma will get back to you shortly.");
        e.target.reset();
        toggleModal(talkModal, false);
    });

    document.getElementById("menuToggle")?.addEventListener("click", e => (e.preventDefault(), toggleModal(navMenu, true)));
    document.getElementById("closeNavMenu")?.addEventListener("click", () => toggleModal(navMenu, false));
    document.querySelectorAll(".nav-link").forEach(l => l.addEventListener("click", () => toggleModal(navMenu, false)));
    document.addEventListener("keydown", e => e.key === "Escape" && (toggleModal(talkModal, false), toggleModal(navMenu, false)));

    // 5. Preloader Landing Video Smooth Exit Animation
    const preloader = document.getElementById("landingVideo");
    const heroText = document.querySelector(".hero-text");
    let isPreloaderDone = false;

    const hidePreloader = () => {
        if (preloader && !isPreloaderDone) {
            isPreloaderDone = true;
            preloader.classList.add("fade-out");

            if (window.gsap && heroText) {
                gsap.fromTo(heroText, 
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.3, delay: 0.15, ease: "power3.out" }
                );
            }

            setTimeout(() => {
                preloader.style.display = "none";
            }, 1100);
        }
    };

    preloader?.querySelector("video")?.addEventListener("ended", hidePreloader);
    setTimeout(hidePreloader, 3800);

    // 6. WhatsApp Card & Button Toggle
    const waCard = document.querySelector('.whatsapp-card');
    const waBtn = document.querySelector('.whatsapp-button');
    waBtn?.addEventListener('click', e => (e.stopPropagation(), waCard?.classList.toggle('active')));
    document.querySelector('.whatsapp-card-close-button')?.addEventListener('click', () => waCard?.classList.remove('active'));
    document.addEventListener('click', e => waCard?.classList.contains('active') && !waCard.contains(e.target) && e.target !== waBtn && waCard.classList.remove('active'));

    // 7. Custom Cursor
    const cursor = document.querySelector(".custom-cursor");
    if (cursor && window.innerWidth > 1024) {
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        document.addEventListener("mousemove", e => {
            const hover = cursor.classList.contains("hover");
            mouseX = e.clientX + (hover ? 24 : 0);
            mouseY = e.clientY + (hover ? 24 : 0);
            cursor.style.opacity = e.target.closest(".no-cursor") ? "0" : "1";
        });
        (function animCursor() {
            cursorX += (mouseX - cursorX) * 0.25;
            cursorY += (mouseY - cursorY) * 0.25;
            const rot = cursor.classList.contains("hover") ? -7 : 0;
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) rotate(${rot}deg)`;
            requestAnimationFrame(animCursor);
        })();
        document.querySelectorAll("[data-cursor-hover]").forEach(el => {
            el.addEventListener("mouseenter", e => {
                e.stopPropagation();
                if (!el.closest(".no-cursor")) {
                    cursor.classList.add("hover");
                    cursor.textContent = el.getAttribute("data-cursor-hover") || "";
                    cursor.style.opacity = "1";
                }
            });
            el.addEventListener("mouseleave", () => (cursor.classList.remove("hover"), cursor.textContent = ""));
        });
    }

    // 8. Hero Section 3D Moving Card
    const heroRoot = document.querySelector('.hero_component') || document.querySelector('.hero');
    if (heroRoot && window.gsap) {
        const card = heroRoot.querySelector('.moving-visual_wrapper') || heroRoot.querySelector('.cursor');
        if (card) {
            const xTo = gsap.quickTo(card, "x", { duration: 0.8, ease: "power3" });
            const yTo = gsap.quickTo(card, "y", { duration: 0.8, ease: "power3" });
            const rotYTo = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
            const rotXTo = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
            const opacityTo = gsap.quickTo(card, "opacity", { duration: 0.6, ease: "power2" });
            let oldX = 0, oldY = 0, timer, moved = false;
            gsap.set(card, { opacity: 0 });

            window.addEventListener("mousemove", e => {
                const rect = heroRoot.getBoundingClientRect();
                const inHero = e.clientX >= rect.left && e.clientX <= rect.right &&
                               e.clientY >= rect.top && e.clientY <= rect.bottom;
                
                if (inHero) {
                    if (!moved) (opacityTo(1), moved = true);
                    rotYTo((e.clientX - oldX) * 1.5);
                    rotXTo(-(e.clientY - oldY) * 1.5);
                    xTo(e.clientX - rect.left - rect.width / 2);
                    yTo(e.clientY - rect.top - rect.height / 2);
                    oldX = e.clientX; oldY = e.clientY;
                    clearTimeout(timer);
                    timer = setTimeout(() => (rotYTo(0), rotXTo(0)), 66);
                } else {
                    opacityTo(0);
                    moved = false;
                }
            });

            heroRoot.addEventListener("mouseleave", () => (opacityTo(0), moved = false));
        }
    }

    // 9. GSAP Scroll Reveals (.simple-appear)
    if (window.gsap && window.ScrollTrigger) {
        document.querySelectorAll('.simple-appear').forEach(el => {
            gsap.to(el, {
                opacity: 1, y: 0, duration: 1.2, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
            });
        });
    }

    // 10. Word Hover Image Popups
    const hoverWords = document.querySelectorAll('.hover-word');
    const imagePool = Array.from(document.querySelectorAll('.intro-visual-pool img')).map(img => img.src).filter(Boolean);
    let popupTimer = null, hX = 0, hY = 0;

    if (imagePool.length) {
        hoverWords.forEach(word => {
            word.addEventListener('mouseenter', e => {
                hX = e.clientX; hY = e.clientY;
                let i = 0;
                clearInterval(popupTimer);
                popupTimer = setInterval(() => {
                    const img = document.createElement('img');
                    img.src = imagePool[i++ % imagePool.length];
                    img.className = 'intro-popup-image';
                    const rot = (Math.random() * 14 - 7).toFixed(2);
                    img.style.left = `${hX + (Math.random() * 50 - 25)}px`;
                    img.style.top = `${hY + (Math.random() * 40 - 20)}px`;
                    document.body.appendChild(img);

                    requestAnimationFrame(() => (img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(1)`, img.style.opacity = "1"));
                    setTimeout(() => (img.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(.85)`, img.style.opacity = "0", setTimeout(() => img.remove(), 350)), 450);
                }, 240);
            });
            word.addEventListener('mousemove', e => (hX = e.clientX, hY = e.clientY));
            word.addEventListener('mouseleave', () => (clearInterval(popupTimer), popupTimer = null));
        });
    }

    // 11. Services Hover Video & Playground Observer & Footer Logo Stretch
    const sContainer = document.querySelector('.services-container');
    const sVideoEl = document.querySelector('.service-hover-video-element');
    const sHoverBox = document.querySelector('.service-hover-video');
    let sY = -500, sTargetY = -500, sHovering = false, rafId = null;

    if (sContainer && sVideoEl && sHoverBox) {
        const animVideo = () => {
            if (!sHovering) return;
            sY += (sTargetY - sY) * 0.15;
            sHoverBox.style.top = `${sY}px`;
            rafId = requestAnimationFrame(animVideo);
        };
        sContainer.addEventListener("mousemove", e => sTargetY = e.clientY);
        sContainer.addEventListener("mouseenter", () => (sHovering = true, rafId = rafId || requestAnimationFrame(animVideo)));
        sContainer.addEventListener("mouseleave", () => (sHovering = false, cancelAnimationFrame(rafId), rafId = null, sHoverBox.style.display = "none", sContainer.classList.remove('hovering')));

        document.querySelectorAll('.service-container').forEach(row => {
            row.addEventListener('mouseenter', () => {
                sContainer.classList.add('hovering');
                const src = row.getAttribute('data-video');
                if (src) {
                    if (sVideoEl.src !== new URL(src, location.href).href) sVideoEl.src = src;
                    sVideoEl.play().catch(() => {});
                }
                sHoverBox.style.display = "block";
            });
        });
    }

    document.querySelectorAll('.playground-card').forEach(card => {
        new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && card.classList.add('revealed')), { threshold: 0.15 }).observe(card);
        const v = card.querySelector('.playground-video');
        v && card.addEventListener('mouseenter', () => (v.currentTime = 0, v.play().catch(() => {})));
    });

    const footerInner = document.querySelector('.footer-logo-stretch-inner');
    const footerFill = document.querySelector('.footer-logo-fill');
    if (footerInner && footerFill && window.gsap && window.ScrollTrigger) {
        setTimeout(() => {
            ScrollTrigger.refresh();
            gsap.fromTo(footerInner, { height: "0%", transformOrigin: "top" }, {
                height: "100%", ease: "none",
                scrollTrigger: { trigger: footerFill, start: "top bottom-=50px", end: "bottom bottom-=50px", scrub: 0.05 }
            });
        }, 400);
    }
});

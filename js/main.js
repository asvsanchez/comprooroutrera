const monoLoco = false;
let autoSlideInterval;
const slides = document.getElementById('slides');
const totalSlides = slides ? slides.children.length : 0;
const dotsContainer = document.getElementById('dots');
let currentIndex = 0, startX = 0;
const idPrecio24k = document.getElementById('precio24k');
const idPrecio18k = document.getElementById('precio18k');

function openMenu() {
    const menu = document.getElementById('menu');
    const burger = document.querySelector('.burger');
    if (!menu || !burger) return;

    menu.classList.add('active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar el menú de navegación');
    document.body.classList.add('menu-open');
}

function closeMenu() {
    const menu = document.getElementById('menu');
    const burger = document.querySelector('.burger');
    if (!menu || !burger) return;

    menu.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir el menú de navegación');
    document.body.classList.remove('menu-open');
}

function toggleMenu() {
    const menu = document.getElementById('menu');
    if (!menu) return;

    if (menu.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (monoLoco) {
        document.body.style.opacity = '0';
        document.body.style.visibility = 'hidden';
    }

    if (idPrecio24k && idPrecio18k) {
        try {
            idPrecio24k.textContent = localStorage.getItem('precio24k') || idPrecio24k.textContent;
            idPrecio18k.textContent = localStorage.getItem('precio18k') || idPrecio18k.textContent;
        } catch (e) {
            console.error('LocalStorage no disponible 1: ', e);
        }
    }

    fetchPreciosConReintento();

    const menu = document.getElementById('menu');
    const burger = document.querySelector('.burger');

    if (menu && burger) {
        burger.addEventListener('click', toggleMenu);
        burger.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleMenu();
            }
        });

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => closeMenu());
        });
    }

    if (slides) {
        slides.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        slides.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 40) {
                if (diffX > 0) {
                    currentIndex = (currentIndex + 1) % totalSlides;
                } else {
                    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                }
                updateSlide();
                resetAutoSlide();
            }
        });
    }

    if (dotsContainer && totalSlides > 0) {
        for (let i = 0; i < totalSlides; i++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
            btn.addEventListener('click', () => {
                updateSlide(i);
                resetAutoSlide();
            });
            dotsContainer.appendChild(btn);
        }
    }

    if (slides && totalSlides > 0) {
        updateSlide(0);
        startAutoSlide();
    }

    document.addEventListener('click', function (event) {
        const menu = document.getElementById('menu');
        const burger = document.querySelector('.burger');
        if (!menu || !burger) return;
        if (!menu.contains(event.target) && !burger.contains(event.target) && menu.classList.contains('active')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        const menu = document.getElementById('menu');
        if (!menu) return;
        if (event.key === 'Escape' && menu.classList.contains('active')) {
            closeMenu();
        }
    });

    if (monoLoco) {
        const delayAleatorio = Math.floor(Math.random() * 5) + 1;
        setTimeout(() => {
            document.body.style.opacity = '1';
            document.body.style.visibility = 'visible';
        }, delayAleatorio * 1000);
    }
});

function updateSlide(index = currentIndex) {
    if (!slides) return;
    currentIndex = index;
    slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#dots button');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

function startAutoSlide() {
    if (!slides || totalSlides <= 1) return;
    autoSlideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlide();
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function fetchPreciosConReintento() {
    fetch('https://precios-compro-oro.rprnjsy57r.workers.dev/')
        .then((res) => res.text())
        .then((html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            const text = div.textContent;
            const matches = [...text.matchAll(/(\d+,\d+)\s*€\/g/g)];

            if (matches.length >= 3) {
                let descuento24k = 3.5;
                let descuento18k = 3.5;

                if (monoLoco) {
                    descuento24k = -3.5;
                    descuento18k = -3.5;
                }

                const precio24k = (parseFloat(matches[0][1].replace(',', '.')) - descuento24k).toFixed(2);
                const precio18k = (parseFloat(matches[2][1].replace(',', '.')) - descuento18k).toFixed(2);

                if (idPrecio24k) idPrecio24k.textContent = precio24k;
                if (idPrecio18k) idPrecio18k.textContent = precio18k;

                try {
                    localStorage.setItem('precio24k', precio24k);
                    localStorage.setItem('precio18k', precio18k);
                } catch (e) {
                    console.error('LocalStorage no disponible 2: ', e);
                }

                const spinnerOverlay = document.getElementById('spinner-overlay');
                const preciosGrid = document.getElementById('precios-grid');
                if (spinnerOverlay) spinnerOverlay.style.display = 'none';
                if (preciosGrid) preciosGrid.style.opacity = '1';
            } else {
                throw new Error('No se encontraron precios en el HTML.');
            }
        })
        .catch((err) => {
            console.error(`Error al obtener precios: ${err.message}`);
            setTimeout(() => fetchPreciosConReintento(), 500);
        });
}

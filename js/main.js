document.addEventListener('DOMContentLoaded', () => {
    const slides = document.getElementById('slides');
    const totalSlides = slides.children.length;
    const dotsContainer = document.getElementById('dots');
    let currentIndex = 0, startX = 0;
    let autoSlideInterval;
    const idPrecio24k = document.getElementById('precio24k');
    const idPrecio18k = document.getElementById('precio18k');

    try {
        idPrecio24k.textContent = localStorage.getItem('precio24k');
        idPrecio18k.textContent = localStorage.getItem('precio18k');
    } catch (e) {
        console.error("LocalStorage no disponible 1: ", e);
    }

    // Obtener precios reales con reintento rápido
    fetchPreciosConReintento();

    function fetchPreciosConReintento() {
        fetch('https://precios-compro-oro.rprnjsy57r.workers.dev/')
            .then(res => res.text())
            .then(html => {
                const div = document.createElement('div');
                div.innerHTML = html;
                const text = div.textContent;
                const matches = [...text.matchAll(/(\d+,\d+)\s*€\/g/g)];

                if (matches.length >= 3) {
                    const precio24k = (parseFloat(matches[0][1].replace(',', '.')) - 3.5).toFixed(2);
                    const precio18k = (parseFloat(matches[2][1].replace(',', '.')) - 3.5).toFixed(2);

                    idPrecio24k.textContent = precio24k;
                    idPrecio18k.textContent = precio18k;

                    try {
                        localStorage.setItem('precio24k', precio24k);
                        localStorage.setItem('precio18k', precio18k);
                    } catch (e) {
                        console.error("LocalStorage no disponible 2: ", e);
                    }
                    //Se quita el spinner y mostramos precios
                    document.getElementById('spinner-overlay').style.display = 'none';
                    document.getElementById('precios-grid').style.opacity = '1';
                } else {
                    throw new Error("No se encontraron precios en el HTML.");
                }
            })
            .catch(err => {
                console.error(`Error al obtener precios: ${err.message}`);
                setTimeout(() => fetchPreciosConReintento(), 500);
            });
    }

    // Carrusel táctil
    slides.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });

    slides.addEventListener('touchend', e => {
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

    function updateSlide(index = currentIndex) {
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

    for (let i = 0; i < totalSlides; i++) {
        const btn = document.createElement('button');
        btn.onclick = () => {
            updateSlide(i);
            resetAutoSlide();
        };
        dotsContainer.appendChild(btn);
    }

    updateSlide(0);

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlide();
        }, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    startAutoSlide();

    function toggleMenu() {
        const menu = document.getElementById('menu');
        menu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    document.addEventListener('click', function (event) {
        const menu = document.getElementById('menu');
        const burger = document.querySelector('.burger');
        if (!menu.contains(event.target) && !burger.contains(event.target) && menu.classList.contains('active')) {
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        window.scrollTo(0, 0);
    });
});
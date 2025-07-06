// Modern Galactic Birthday Invitation JavaScript

// Inicializar todo cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando invitación interactiva...');
    
    // Initialize space canvas for background effect
    initSpaceCanvas();
    
    // Initialize countdown timer
    initCountdown();
    
    // Initialize music player
    initMusicPlayer();
    
    // Initialize game section
    initGameSection();
    
    // Initialize RSVP buttons with AJAX support
    initRSVPButtons();
    
    // Initialize the link to change RSVP response
    initChangeRSVPLink();
    
    // Setup mobile optimizations
    setupMobileOptimizations();
    
    // Initialize scroll indicator
    initScrollIndicator();
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1200,
            once: false
        });
    }
    
    // Animation for stars effect
    createStars();
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        });
        
        button.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });
    });
});

// Helper functions
function getGuestId() {
    const guestIdInput = document.querySelector('input[name="guest_id"]');
    if (guestIdInput && guestIdInput.value) {
        return guestIdInput.value;
    }
    // Buscar en el elemento de datos guest-info si existe
    const guestInfo = document.getElementById('guest-info');
    if (guestInfo && guestInfo.dataset && guestInfo.dataset.guestId) {
        return guestInfo.dataset.guestId;
    }
    // Si todo falla, intentar recuperar de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const guestCode = urlParams.get('guest');
    console.log('Usando código de invitación como respaldo:', guestCode);
    return '0'; // Retornar 0 como último recurso, el backend buscará por invitation_code
}

function getInvitationCode() {
    const codeInput = document.querySelector('input[name="invitation_code"]');
    if (codeInput && codeInput.value) {
        return codeInput.value;
    }
    // Si no está en el input, intentar recuperar de la URL
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('guest') || '';
}

// Convertir código de estado a texto legible
function getStatusText(status) {
    switch(status) {
        case 'confirmed': return 'asistirás a la fiesta';
        case 'unsure': return 'tal vez asistirás a la fiesta';
        case 'declined': return 'no podrás asistir a la fiesta';
        default: return 'estás pendiente de confirmar';
    }
}

// Function to show visual feedback for RSVP selection
function showRsvpFeedback(status) {
    const rsvpSection = document.getElementById('rsvp-section');
    if (!rsvpSection) return;
    
    // Add animation class based on response
    switch(status) {
        case 'confirmed':
            rsvpSection.classList.add('animate-confirmed');
            // Add particle effects for positive response
            createConfirmParticles();
            break;
        case 'unsure':
            rsvpSection.classList.add('animate-unsure');
            break;
        case 'declined':
            rsvpSection.classList.add('animate-declined');
            break;
    }
    
    // Helper function to create particles
    function createConfirmParticles() {
        const container = document.createElement('div');
        container.className = 'particles-container';
        rsvpSection.appendChild(container);
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(particle);
        }
        
        setTimeout(() => {
            container.remove();
        }, 3000);
    }
}

// Inicializar botones de RSVP con AJAX
function initRSVPButtons() {
    const rsvpForm = document.getElementById('rsvp-form');
    
    if (rsvpForm) {
        console.log('RSVP form encontrado, inicializando botones con AJAX...');
        
        // Obtener todos los botones de RSVP
        const rsvpButtons = rsvpForm.querySelectorAll('button[name="status"]');
        
        // Añadir evento click a cada botón
        rsvpButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Obtener los datos del formulario
                const status = this.value;
                const guestId = document.querySelector('input[name="guest_id"]').value;
                const invitationCode = document.querySelector('input[name="invitation_code"]').value;
                
                // Verificar si tenemos un guest_id válido
                if (!guestId || guestId === '0' || guestId === '') {
                    console.error('Error: guest_id no válido', { guestId, invitationCode });
                    if (!invitationCode) {
                        alert('Error: No se pudo identificar tu invitación. Por favor, recarga la página.');
                        return;
                    }
                    console.log('Usando invitation_code como respaldo:', invitationCode);
                }
                
                console.log('Enviando RSVP con AJAX:', { status, guestId, invitationCode });
                
                // Mostrar feedback visual inmediatamente
                showRsvpFeedback(status);
                
                // Crear y enviar los datos con fetch API
                const formData = new FormData();
                formData.append('guest_id', guestId);
                formData.append('invitation_code', invitationCode);
                formData.append('status', status);
                
                // Enviar solicitud AJAX
                fetch('rsvp_ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Respuesta recibida:', data);
                    
                    if (data.success) {
                        // Actualizar interfaz con mensaje de éxito
                        setTimeout(() => {
                            const rsvpSection = document.getElementById('rsvp-section');
                            if (rsvpSection) {
                                rsvpSection.innerHTML = `
                                    <div class="rsvp-success">
                                        <span class="success-icon"><i class="fas fa-check-circle"></i></span>
                                        <h3>¡Respuesta guardada!</h3>
                                        <p>¡Genial! Has confirmado que ${getStatusText(status)}.</p>
                                        <a href="#" id="change-rsvp" class="btn change-rsvp">Cambiar mi respuesta</a>
                                    </div>
                                `;
                                
                                // Reinicializar el enlace para cambiar respuesta
                                initChangeRSVPLink();
                            }
                        }, 1200);
                    } else {
                        // Mostrar mensaje de error
                        console.error('Error en el servidor:', data.message);
                        alert('Hubo un problema al guardar tu respuesta: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error en la solicitud AJAX:', error);
                    alert('Hubo un problema al comunicarse con el servidor');
                });
            });
        });
        
        // Inicializar el enlace para cambiar RSVP
        initChangeRSVPLink();
        
        console.log('Botones RSVP con AJAX inicializados');
    }
}

// Inicializar el enlace para cambiar RSVP
function initChangeRSVPLink() {
    const changeRSVP = document.getElementById('change-rsvp');
    if (changeRSVP) {
        changeRSVP.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el guest_id de la página - Este es el dato crucial
            // Buscamos el ID que está disponible en los metadatos de la página
            const guestInfoScript = document.getElementById('guest-info');
            let guestId = '0';
            let invitationCode = '';
            
            if (guestInfoScript && guestInfoScript.dataset) {
                guestId = guestInfoScript.dataset.guestId || '0';
                invitationCode = guestInfoScript.dataset.invitationCode || '';
                console.log('Guest info recuperada:', { guestId, invitationCode });
            } else {
                // Si no existe el elemento con metadatos, intentamos obtenerlo de la URL
                const urlParams = new URLSearchParams(window.location.search);
                invitationCode = urlParams.get('guest') || '';
                console.log('Guest info recuperada de URL:', { invitationCode });
            }
            
            // Mostrar el formulario RSVP nuevamente
            const rsvpSection = document.getElementById('rsvp-section');
            if (rsvpSection) {
                // Limpiar contenido actual
                rsvpSection.innerHTML = `
                    <div class="rsvp-prompt">
                        <span class="prompt-emoji">👽</span>
                        <span class="prompt-text">¿JALAS?</span>
                    </div>
                    
                    <form id="rsvp-form" action="rsvp_ajax.php" method="post">
                        <input type="hidden" name="guest_id" value="${guestId}">
                        <input type="hidden" name="invitation_code" value="${invitationCode}">
                        
                        <div class="buttons">
                            <button type="submit" name="status" value="confirmed" class="btn confirm" data-tilt data-tilt-scale="1.1">
                                <span class="btn-icon"><i class="fas fa-check"></i></span>
                                <span class="btn-text">VOY</span>
                            </button>
                            <button type="submit" name="status" value="unsure" class="btn unsure" data-tilt data-tilt-scale="1.1">
                                <span class="btn-icon"><i class="fas fa-question"></i></span>
                                <span class="btn-text">TAL VEZ</span>
                            </button>
                            <button type="submit" name="status" value="declined" class="btn decline" data-tilt data-tilt-scale="1.1">
                                <span class="btn-icon"><i class="fas fa-times"></i></span>
                                <span class="btn-text">NO PUEDO</span>
                            </button>
                        </div>
                    </form>
                `;
                
                // Reinicializar los botones RSVP
                initRSVPButtons();
                
                console.log('Formulario de cambio RSVP recreado con guest_id=' + guestId);
            }
        });
    }
}

// Configurar optimizaciones para dispositivos móviles
function setupMobileOptimizations() {
    console.log('Configurando optimizaciones para móviles...');
    
    // Detectar si es dispositivo móvil
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Ajustar animaciones para mejor rendimiento en móviles
        document.querySelectorAll('[data-tilt]').forEach(el => {
            // Desactivar efectos tilt en móviles para mejor rendimiento
            if (typeof VanillaTilt !== 'undefined') {
                VanillaTilt.init(el, {
                    max: 5,          // menor inclinación
                    speed: 300,      // más rápido
                    glare: false     // sin brillo
                });
            }
        });
        
        // Reducir complejidad de las animaciones de estrellas
        const stars = document.querySelectorAll('.star');
        if (stars.length > 20) {
            // Eliminar exceso de estrellas en móviles
            for (let i = stars.length - 1; i >= 20; i--) {
                if (stars[i] && stars[i].parentNode) {
                    stars[i].parentNode.removeChild(stars[i]);
                }
            }
        }
    }
    console.log('Optimizaciones para móviles completadas');
}

    // Helper functions
    function getGuestId() {
        const guestIdInput = document.querySelector('input[name="guest_id"]');
        if (guestIdInput && guestIdInput.value) {
            return guestIdInput.value;
        }
        // Buscar en el elemento de datos guest-info si existe
        const guestInfo = document.getElementById('guest-info');
        if (guestInfo && guestInfo.dataset && guestInfo.dataset.guestId) {
            return guestInfo.dataset.guestId;
        }
        // Si todo falla, intentar recuperar de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const guestCode = urlParams.get('guest');
        console.log('Usando código de invitación como respaldo:', guestCode);
        return '0'; // Retornar 0 como último recurso, el backend buscará por invitation_code
    }

    function getInvitationCode() {
        const codeInput = document.querySelector('input[name="invitation_code"]');
        if (codeInput && codeInput.value) {
            return codeInput.value;
        }
        // Si no está en el input, intentar recuperar de la URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('guest') || '';
    }

    // Convertir código de estado a texto legible
    function getStatusText(status) {
        switch(status) {
            case 'confirmed': return 'asistirás a la fiesta';
            case 'unsure': return 'tal vez asistirás a la fiesta';
            case 'declined': return 'no podrás asistir a la fiesta';
            default: return 'estás pendiente de confirmar';
        }
    }

    // Function to show visual feedback for RSVP selection
    function showRsvpFeedback(status) {
        const rsvpSection = document.getElementById('rsvp-section');
        if (!rsvpSection) return;
        
        // Add animation class based on response
        switch(status) {
            case 'confirmed':
                rsvpSection.classList.add('animate-confirmed');
                // Add particle effects for positive response
                createConfirmParticles();
                break;
            case 'unsure':
                rsvpSection.classList.add('animate-unsure');
                break;
            case 'declined':
                rsvpSection.classList.add('animate-declined');
                break;
        }
        
        // Helper function to create particles
        function createConfirmParticles() {
            const container = document.createElement('div');
            container.className = 'particles-container';
            rsvpSection.appendChild(container);
            
            for (let i = 0; i < 30; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 0.5 + 's';
                container.appendChild(particle);
            }
            
            setTimeout(() => {
                container.remove();
            }, 3000);
        }
    }

    // Inicializar botones de RSVP con AJAX
    function initRSVPButtons() {
        const rsvpForm = document.getElementById('rsvp-form');
        
        if (rsvpForm) {
            console.log('RSVP form encontrado, inicializando botones con AJAX...');
            
            // Obtener todos los botones de RSVP
            const rsvpButtons = rsvpForm.querySelectorAll('button[name="status"]');
            
            // Añadir evento click a cada botón
            rsvpButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Obtener los datos del formulario
                    const status = this.value;
                    const guestId = getGuestId();
                    const invitationCode = getInvitationCode();
                    
                    // Verificar si tenemos un guest_id válido
                    if (!guestId || guestId === '0' || guestId === '') {
                        console.error('Error: guest_id no válido', { guestId, invitationCode });
                        if (!invitationCode) {
                            alert('Error: No se pudo identificar tu invitación. Por favor, recarga la página.');
                            return;
                        }
                        console.log('Usando invitation_code como respaldo:', invitationCode);
                    }
                    
                    console.log('Enviando RSVP con AJAX:', { status, guestId, invitationCode });
                    
                    // Mostrar feedback visual inmediatamente
                    showRsvpFeedback(status);
                    
                    // Crear y enviar los datos con fetch API
                    const formData = new FormData();
                    formData.append('guest_id', guestId);
                    formData.append('invitation_code', invitationCode);
                    formData.append('status', status);
                    
                    // Enviar solicitud AJAX
                    fetch('rsvp_ajax.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Respuesta recibida:', data);
                        
                        if (data.success) {
                            // Actualizar interfaz con mensaje de éxito
                            setTimeout(() => {
                                const rsvpSection = document.getElementById('rsvp-section');
                                if (rsvpSection) {
                                    rsvpSection.innerHTML = `
                                        <div class="rsvp-success">
                                            <span class="success-icon"><i class="fas fa-check-circle"></i></span>
                                            <h3>¡Respuesta guardada!</h3>
                                            <p>¡Genial! Has confirmado que ${getStatusText(status)}.</p>
                                            <a href="#" id="change-rsvp" class="btn change-rsvp">Cambiar mi respuesta</a>
                                        </div>
                                    `;
                                    
                                    // Reinicializar el enlace para cambiar respuesta
                                    initChangeRSVPLink();
                                }
                            }, 1200);
                        } else {
                            // Mostrar mensaje de error
                            console.error('Error en el servidor:', data.message);
                            alert('Hubo un problema al guardar tu respuesta: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error en la solicitud AJAX:', error);
                        alert('Hubo un problema al comunicarse con el servidor');
                    });
                });
            });
            
            // Inicializar el enlace para cambiar RSVP
            initChangeRSVPLink();
            
            console.log('Botones RSVP con AJAX inicializados');
        }
    }

    // Inicializar el enlace para cambiar RSVP
    function initChangeRSVPLink() {
        const changeRSVP = document.getElementById('change-rsvp');
        if (changeRSVP) {
            changeRSVP.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Obtener el guest_id de la página - Este es el dato crucial
                // Buscamos el ID que está disponible en los metadatos de la página
                const guestInfoScript = document.getElementById('guest-info');
                let guestId = '0';
                let invitationCode = '';
                
                if (guestInfoScript && guestInfoScript.dataset) {
                    guestId = guestInfoScript.dataset.guestId || '0';
                    invitationCode = guestInfoScript.dataset.invitationCode || '';
                    console.log('Guest info recuperada:', { guestId, invitationCode });
                } else {
                    // Si no existe el elemento con metadatos, intentamos obtenerlo de la URL
                    const urlParams = new URLSearchParams(window.location.search);
                    invitationCode = urlParams.get('guest') || '';
                    console.log('Guest info recuperada de URL:', { invitationCode });
                }
                
                // Mostrar el formulario RSVP nuevamente
                const rsvpSection = document.getElementById('rsvp-section');
                if (rsvpSection) {
                    // Limpiar contenido actual
                    rsvpSection.innerHTML = `
                        <div class="rsvp-prompt">
                            <span class="prompt-emoji">👽</span>
                            <span class="prompt-text">¿JALAS?</span>
                        </div>
                        
                        <form id="rsvp-form" action="rsvp_ajax.php" method="post">
                            <input type="hidden" name="guest_id" value="${guestId}">
                            <input type="hidden" name="invitation_code" value="${invitationCode}">
                            
                            <div class="buttons">
                                <button type="submit" name="status" value="confirmed" class="btn confirm" data-tilt data-tilt-scale="1.1">
                                    <span class="btn-icon"><i class="fas fa-check"></i></span>
                                    <span class="btn-text">VOY</span>
                                </button>
                                <button type="submit" name="status" value="unsure" class="btn unsure" data-tilt data-tilt-scale="1.1">
                                    <span class="btn-icon"><i class="fas fa-question"></i></span>
                                    <span class="btn-text">TAL VEZ</span>
                                </button>
                                <button type="submit" name="status" value="declined" class="btn decline" data-tilt data-tilt-scale="1.1">
                                    <span class="btn-icon"><i class="fas fa-times"></i></span>
                                    <span class="btn-text">NO PUEDO</span>
                                </button>
                            </div>
                        </form>
                    `;
                    
                    // Reinicializar los botones RSVP
                    initRSVPButtons();
                    
                    console.log('Formulario de cambio RSVP recreado con guest_id=' + guestId);
                }
            });
        }
    }

    
    // Function to show visual feedback for RSVP selection
    function showRsvpFeedback(status) {
        // Remove any existing feedback
        const existingFeedback = document.querySelector('.rsvp-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Create feedback element
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `rsvp-feedback ${status}`;
        
        // Set message based on status
        let message = '';
        let icon = '';
        
        switch(status) {
            case 'confirmed':
                message = '¡Genial! Te esperamos con emoción';
                icon = '<i class="fas fa-rocket"></i>';
                break;
            case 'unsure':
                message = 'Esperamos que puedas confirmar pronto';
                icon = '<i class="fas fa-question-circle"></i>';
                break;
            case 'declined':
                message = 'Lamentamos que no puedas asistir';
                icon = '<i class="fas fa-sad-tear"></i>';
                break;
        }
        
        // Create animation for feedback
        feedbackEl.innerHTML = `${icon} <span>${message}</span>`;
        
        // Add to page
        const rsvpSection = document.querySelector('.rsvp-section');
        rsvpSection.appendChild(feedbackEl);
        
        // Add animation
        setTimeout(() => {
            feedbackEl.classList.add('show');
        }, 10);
    }
    
    // Helper functions
    function getGuestId() {
        // Get guest ID from hidden form input if it exists
        const guestIdInput = document.querySelector('input[name="guest_id"]');
        return guestIdInput ? guestIdInput.value : '';
    }
    
    function getInvitationCode() {
        // Get invitation code from URL
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('guest') || '';
    }
    
    // Function to create additional star elements for parallax effect
    function createStars() {
        const container = document.querySelector('.container');
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = `${Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDuration = `${Math.random() * 3 + 1}s`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(star);
        }
    
    
    // Add some parallax effect
    document.addEventListener('mousemove', function(e) {
        const invitationCard = document.querySelector('.invitation-card');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        if (invitationCard) {
            invitationCard.style.transform = `translate(${mouseX * -20}px, ${mouseY * -20}px) rotateX(${mouseY * 5}deg) rotateY(${mouseX * 5}deg)`;
            invitationCard.style.transition = 'transform 0.1s ease-out';
        }
    });
    
    // Reset transform when mouse leaves
    document.addEventListener('mouseleave', function() {
        const invitationCard = document.querySelector('.invitation-card');
        if (invitationCard) {
            invitationCard.style.transform = 'translate(0, 0) rotateX(0) rotateY(0)';
            invitationCard.style.transition = 'transform 0.5s ease-out';
        }
    });
    
    // Add additional CSS for star animations
    const style = document.createElement('style');
    style.textContent = `
        .star {
            position: absolute;
            background-color: #ffffff;
            border-radius: 50%;
            z-index: -1;
            animation: twinkle linear infinite;
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize countdown timer
 */
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    const eventDate = new Date(countdownElement.getAttribute('data-event-date'));
    
    // Crear estructura para la cuenta regresiva
    countdownElement.innerHTML = `
        <div class="countdown-container">
            <div class="countdown-item">
                <div class="countdown-value" id="countdown-days">00</div>
                <div class="countdown-label">Días</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-value" id="countdown-hours">00</div>
                <div class="countdown-label">Horas</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-value" id="countdown-minutes">00</div>
                <div class="countdown-label">Minutos</div>
            </div>
            <div class="countdown-item">
                <div class="countdown-value" id="countdown-seconds">00</div>
                <div class="countdown-label">Segundos</div>
            </div>
        </div>
    `;
    
    const daysElement = document.getElementById('countdown-days');
    const hoursElement = document.getElementById('countdown-hours');
    const minutesElement = document.getElementById('countdown-minutes');
    const secondsElement = document.getElementById('countdown-seconds');
    
    function updateCountdown() {
        const now = new Date();
        const distance = eventDate - now;
        
        // Si la fecha ya pasó
        if (distance < 0) {
            countdownElement.innerHTML = '<div class="event-started">¡El evento ya comenzó!</div>';
            return;
        }
        
        // Calcular días, horas, minutos y segundos
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Actualizar elementos con formato de dos dígitos
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Actualizar cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Initialize space canvas with stars and particles
 */
function initSpaceCanvas() {
    const canvas = document.getElementById('space-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Detect mobile devices and adjust particle count
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const particleCount = isMobile ? 50 : 100;
    
    // Set canvas dimensions and handle resize
    const setCanvasDimensions = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Stars and particles
    const stars = [];
    const particles = [];
    
    // Create stars
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            opacity: Math.random() * 0.9 + 0.1
        });
    }
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            color: getRandomColor(),
            velocity: {
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5
            }
        });
    }
    
    function getRandomColor() {
        const colors = [
            '#9d4edd', '#c77dff', '#7b2cbf', '#00d4ff', '#ff0080', '#8a2be2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.fill();
            
            // Make stars twinkle
            star.opacity = Math.sin(Date.now() * 0.001 + star.x * star.y * 0.00001) * 0.4 + 0.6;
        });
        
        // Draw and update particles
        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
            
            // Update position
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // Wrap around screen edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/**
 * Initialize countdown timer to event date
 */
function initCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    // Get event date from data attribute or use default date
    const eventDateStr = countdownEl.dataset.eventDate || '2023-12-31T18:00:00';
    const eventDate = new Date(eventDateStr);
    
    function updateCountdown() {
        const now = new Date();
        const diff = eventDate - now;
        
        if (diff <= 0) {
            countdownEl.innerHTML = '<div class="expired">¡El evento ya comenzó!</div>';
            return;
        }
        
        // Calculate days, hours, minutes, seconds
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Update DOM
        countdownEl.innerHTML = `
            <div>
                <span>${days}</span>
                <span class="time-label">DÍAS</span>
            </div>
            <div>
                <span>${hours}</span>
                <span class="time-label">HORAS</span>
            </div>
            <div>
                <span>${minutes}</span>
                <span class="time-label">MIN</span>
            </div>
            <div>
                <span>${seconds}</span>
                <span class="time-label">SEG</span>
            </div>
        `;
    }
    
    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Initialize background music player
 */
function initMusicPlayer() {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-music');
    
    if (!musicBtn || !audio) return;
    
    // Set initial state
    let isPlaying = false;
    
    // Play/pause music on button click
    musicBtn.addEventListener('click', function() {
        if (isPlaying) {
            audio.pause();
            musicBtn.innerHTML = '<i class="fas fa-play"></i> Música';
        } else {
            audio.volume = 0.3; // Set volume to 30%
            audio.play().catch(e => console.log('Audio play error:', e));
            musicBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        }
        isPlaying = !isPlaying;
        
        // Add ripple effect
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 800);
    });
    
    // Loop the audio when it ends
    audio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play().catch(e => console.log('Audio replay error:', e));
    });
}

/**
 * Initialize the galactic mini-game section
 */
function initGameSection() {
    const gameButton = document.getElementById('open-game');
    const gameContainer = document.querySelector('.game-container');
    let gameInitialized = false;
    let isToggling = false; // Prevenir múltiples clics rápidos
    
    if (gameButton && gameContainer) {
        // Verificar si ya se configuró este botón
        if (gameButton.dataset.initialized === 'true') {
            console.log('Event listener ya configurado, saltando...');
            return;
        }
        
        // Marcar como inicializado
        gameButton.dataset.initialized = 'true';
        
        // Show game canvas by default
        gameContainer.classList.remove('hidden');
        gameContainer.classList.add('visible');
        
        // Verificar si hay múltiples event listeners
        console.log('Configurando event listener para botón del juego...');
        
        // Handle click on game button - versión simplificada
        gameButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('=== CLIC EN BOTÓN DETECTADO ===');
            console.log('isToggling:', isToggling);
            console.log('gameInitialized:', gameInitialized);
            console.log('Container classes:', gameContainer.className);
            
            // Prevenir múltiples clics rápidos
            if (isToggling) {
                console.log('Clic ignorado - ya procesando...');
                return;
            }
            
            isToggling = true;
            
            // Solo permitir cerrar el contenedor, no abrirlo (ya está abierto por defecto)
            if (!gameContainer.classList.contains('hidden')) {
                console.log('>>> CERRANDO CONTENEDOR <<<');
                
                // Ocultar el contenedor
                gameContainer.classList.add('hidden');
                gameContainer.classList.remove('visible');
                gameButton.innerHTML = '<span class="btn-icon"><i class="fas fa-play"></i></span><span class="btn-text">JUGAR AHORA</span>';
                
                setTimeout(() => {
                    isToggling = false;
                    console.log('>>> BOTÓN DESBLOQUEADO DESPUÉS DE CERRAR <<<');
                }, 500);
            } else {
                console.log('>>> ABRIENDO CONTENEDOR <<<');
                
                // Mostrar el contenedor
                gameContainer.classList.remove('hidden');
                gameContainer.classList.add('visible');
                gameButton.innerHTML = '<span class="btn-icon"><i class="fas fa-times"></i></span><span class="btn-text">CERRAR</span>';
                
                setTimeout(() => {
                    isToggling = false;
                    console.log('>>> BOTÓN DESBLOQUEADO <<<');
                }, 500);
            }
        });
        
        console.log('Sección del minijuego inicializada');
        
        // Inicializar el juego automáticamente después de un breve delay
        setTimeout(() => {
            if (typeof initGame === 'function') {
                console.log('>>> INICIALIZANDO JUEGO AUTOMÁTICAMENTE <<<');
                initGame();
                gameInitialized = true;
                
                // Cambiar el texto del botón a CERRAR ya que el juego está visible
                gameButton.innerHTML = '<span class="btn-icon"><i class="fas fa-times"></i></span><span class="btn-text">CERRAR</span>';
            }
        }, 500);
        
    } else {
        console.error('Elementos del minijuego no encontrados');
    }
}

/**
 * Inicializa el indicador de scroll
 */
function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    if (scrollIndicator) {
        // Mostrar/ocultar indicador según posición de scroll
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Ocultar cuando el usuario ha bajado más de 300px o está cerca del final
            if (scrollPosition > 300 || (documentHeight - scrollPosition - windowHeight) < 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.pointerEvents = 'auto';
            }
        });
        
        // Hacer scroll suave al hacer clic en el indicador
        scrollIndicator.addEventListener('click', function() {
            window.scrollBy({
                top: window.innerHeight / 1.5, // Aproximadamente una pantalla
                behavior: 'smooth'
            });
        });
        
        console.log('Indicador de scroll inicializado');
    }
}

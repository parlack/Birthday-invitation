<?php
// Include database connection
require_once '../config/config.php';

// Get guest name from URL parameter
$invitation_code = isset($_GET['guest']) ? $_GET['guest'] : '';
$guest_name = 'Invitado';
$guest_id = null;
$rsvp_status = 'pending';

// Get visitor information
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$last_page = $_SERVER['HTTP_REFERER'] ?? 'Direct';

// Detect device type
$device_type = 'Unknown';
if (strpos($user_agent, 'Mobile') !== false || strpos($user_agent, 'Android') !== false) {
    $device_type = 'Mobile';
} elseif (strpos($user_agent, 'Tablet') !== false || strpos($user_agent, 'iPad') !== false) {
    $device_type = 'Tablet';
} else {
    $device_type = 'Desktop';
}

// If we have an invitation code, look up the guest
if (!empty($invitation_code)) {
    try {
        // Get guest information - Primero obtenemos los datos del invitado
        $stmt = $conn->prepare("SELECT id, name FROM guests WHERE invitation_code = :code");
        $stmt->bindParam(':code', $invitation_code);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $guest_name = $result['name'];
            $guest_id = $result['id'];
            
            // Ahora obtenemos el estado RSVP en una consulta separada
            $rsvp_stmt = $conn->prepare("SELECT status FROM rsvp WHERE guest_id = :guest_id ORDER BY updated_at DESC LIMIT 1");
            $rsvp_stmt->bindParam(':guest_id', $guest_id);
            $rsvp_stmt->execute();
            
            if ($rsvp_stmt->rowCount() > 0) {
                $rsvp_result = $rsvp_stmt->fetch(PDO::FETCH_ASSOC);
                $rsvp_status = $rsvp_result['status'];
                // Registrar para depuración
                error_log("Estado RSVP obtenido para guest_id {$guest_id}: {$rsvp_status}");
            } else {
                $rsvp_status = 'pending';
                error_log("No se encontró estado RSVP para guest_id {$guest_id}, usando 'pending'");
            }
            
            // Log this visit
            // First check if there's an existing log for this guest and IP
            $log_stmt = $conn->prepare("SELECT id, visit_count FROM visitor_logs 
                                      WHERE guest_id = :guest_id AND ip_address = :ip_address");
            $log_stmt->bindParam(':guest_id', $guest_id);
            $log_stmt->bindParam(':ip_address', $ip_address);
            $log_stmt->execute();
            
            if ($log_stmt->rowCount() > 0) {
                // Update existing log
                $log_result = $log_stmt->fetch(PDO::FETCH_ASSOC);
                $visit_count = $log_result['visit_count'] + 1;
                $update_log = $conn->prepare("UPDATE visitor_logs 
                                           SET visit_count = :visit_count, 
                                               last_page = :last_page,
                                               visit_date = NOW(),
                                               user_agent = :user_agent,
                                               device_type = :device_type
                                           WHERE id = :id");
                $update_log->bindParam(':visit_count', $visit_count);
                $update_log->bindParam(':last_page', $last_page);
                $update_log->bindParam(':user_agent', $user_agent);
                $update_log->bindParam(':device_type', $device_type);
                $update_log->bindParam(':id', $log_result['id']);
                $update_log->execute();
            } else {
                // Create new log entry
                $insert_log = $conn->prepare("INSERT INTO visitor_logs 
                                           (guest_id, ip_address, user_agent, last_page, device_type) 
                                           VALUES (:guest_id, :ip_address, :user_agent, :last_page, :device_type)");
                $insert_log->bindParam(':guest_id', $guest_id);
                $insert_log->bindParam(':ip_address', $ip_address);
                $insert_log->bindParam(':user_agent', $user_agent);
                $insert_log->bindParam(':last_page', $last_page);
                $insert_log->bindParam(':device_type', $device_type);
                $insert_log->execute();
            }
        }
    } catch(PDOException $e) {
        // Log error instead of displaying
        error_log("Error: " . $e->getMessage());
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#10002b">
    <meta name="description" content="¡Te invito a mi fiestita! <?php echo htmlspecialchars($guest_name); ?>Confirma tu asistencia porfas.">
    <title>20 Primaveras de Andrés</title>
    
    <!-- Variables globales para el juego -->
    <script>
        // Establecer información del invitado como variables globales para JavaScript
        window.guestName = <?php echo json_encode($guest_name); ?>;
        window.guestId = <?php echo json_encode($guest_id ? (string)$guest_id : '0'); ?>;
        window.invitationCode = <?php echo json_encode($invitation_code); ?>;
        console.log('Información del invitado cargada:', { 
            nombre: window.guestName, 
            id: window.guestId, 
            codigo: window.invitationCode 
        });
    </script>
    
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&family=Quicksand:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
</head>
<body>
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="clouds"></div>
    
    <!-- Canvas for space background -->
    <canvas id="space-canvas"></canvas>
    
    <!-- Shooting stars animation -->
    <div class="shooting-star"></div>
    <div class="shooting-star delayed"></div>
    <div class="shooting-star delayed-more"></div>
    
    <!-- Floating planets -->
    <div class="floating-planet p1"></div>
    <div class="floating-planet p2"></div>
    <div class="floating-planet p3"></div>
    
    <div class="container">
        <div class="invitation-card" data-aos="fade-up">
            <div class="planet-animation"></div>
            
            <h1 class="glow-text" style="color: #0080ff;">ESTAS INVITADO A FESTEJAR</h1>
            <h2 class="subtitle-text">LAS 20 PRIMAVERAS DE ANDRÉS</h2>
            
            <?php if ($guest_name): ?>
            <h2 class="guest-name">HOLAA <?php echo strtoupper(htmlspecialchars($guest_name)); ?></h2>
            <?php else: ?>
            <h2 class="guest-name">¡HOLA!</h2>
            <?php endif; ?>
            
            <div class="personal-message" data-aos="fade-up" data-aos-delay="250">
                <p>El sábado 12 de julio haré una fiestita, va ver comidita (chefs mis papás), alberquita y musiquita. Si quieres ingerir bebidas las puedes traer (Al frente del edificio hay un Oxxo). Btw, mas 
                abajo en esta misma página puedes confirmar asistencia, jugar un minijuego y competir con los demas que van a ir en un ranking. Espero que puedas asistir.
                </p>
            </div>
            
            <div class="event-details" data-aos="fade-up" data-aos-delay="300">
                <div class="detail" data-tilt>
                    <span class="icon"><i class="fas fa-calendar-alt"></i></span>
                    <span>12.07.2025</span>
                </div>
                <div class="detail" data-tilt>
                    <span class="icon"><i class="fas fa-clock"></i></span>
                    <span>16:00</span>
                </div>
                <a href="https://maps.app.goo.gl/spAmbpFSUaWvWsJf8" target="_blank" class="detail location-card" data-tilt>
                    <span class="icon location-icon"><i class="fas fa-map-marker-alt"></i></span>
                    <span class="location-text">Torres La Proeza</span>
                    <span class="location-hint"><i class="fas fa-external-link-alt"></i> Ver en mapa</span>
                </a>
            </div>
            
            <div class="countdown-timer" data-aos="fade-up" data-aos-delay="400">
                <div id="countdown" data-event-date="2025-07-12T16:00:00">
                    <!-- Cuenta regresiva generada por JavaScript -->
                </div>
            </div>
            
            <div class="reminder" data-aos="fade-up" data-aos-delay="450">
                <i class="fas fa-swimmer"></i> ¡No olvides tu traje de baño!
            </div>
            
            <div class="rsvp-section" id="rsvp-section" data-aos="fade-up" data-aos-delay="500">
                <?php if($rsvp_status == 'pending' || $rsvp_status == 'unsure'): ?>
                    <div class="rsvp-prompt">
                        <span class="prompt-emoji">👽</span>
                        <span class="prompt-text">¿JALAS?</span>
                    </div>
                    
                    <form id="rsvp-form" action="rsvp.php" method="post">
                        <input type="hidden" name="guest_id" value="<?php echo $guest_id; ?>">
                        <input type="hidden" name="invitation_code" value="<?php echo $invitation_code; ?>">
                        
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
                                <span class="btn-text">NO PUEDO 😞</span>
                            </button>
                        </div>
                    </form>
                <?php elseif($rsvp_status == 'confirmed'): ?>
                    <div class="response confirmed" data-tilt>
                        <div class="response-emoji">🚀</div>
                        <p class="response-text">¡CONTAMOS CONTIGO!</p>
                        <a href="#" id="change-rsvp" class="change-response">CAMBIAR</a>
                    </div>
                <?php elseif($rsvp_status == 'declined'): ?>
                    <div class="response declined" data-tilt>
                        <div class="response-emoji">🜟</div>
                        <p class="response-text">TE EXTRAÑAREMOS</p>
                        <a href="#" id="change-rsvp" class="change-response">CAMBIAR</a>
                    </div>
                <?php endif; ?>
            </div>
            
            
            <div class="shooting-star"></div>
            <div class="ufo-animation"></div>
            <div class="astronaut"></div>
            
            <div class="game-section" data-aos="fade-up" data-aos-delay="700">
                <div class="section-title">
                    <span class="title-icon"><i class="fas fa-gamepad"></i></span>
                    <h3>MINIJUEGO GALÁCTICO</h3>
                </div>
                <p class="game-description">¡Demuestra tus habilidades en el espacio! Recoge estrellas, esquiva asteroides y compite por el mejor puntaje con otros invitados.</p>
                <div class="game-container">
                    <canvas id="gameCanvas" width="640" height="480"></canvas>
                </div>
                <button id="open-game" class="game-button">
                    <span class="btn-icon"><i class="fas fa-play"></i></span>
                    <span class="btn-text">JUGAR AHORA</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Add audio element -->
    <audio id="bg-music" loop>
        <source src="https://freesound.org/data/previews/380/380240_1935262-lq.mp3" type="audio/mpeg">
    </audio>

    <script src="https://unpkg.com/aos@next/dist/aos.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>
    <script src="../assets/js/script.js"></script>
    <script src="../assets/js/game.js"></script>
    <script>
        // Inicializar AOS (Animate On Scroll)
        document.addEventListener('DOMContentLoaded', function() {
            AOS.init();
            console.log('AOS inicializado');
            
            // Verificación adicional de funciones JavaScript
            if (typeof initSpaceCanvas === 'function') {
                console.log('Inicializando canvas espacial');
                initSpaceCanvas();
            } else {
                console.error('La función initSpaceCanvas no está definida');
            }
            
            if (typeof initCountdown === 'function') {
                console.log('Inicializando contador de tiempo');
                initCountdown();
            } else {
                console.error('La función initCountdown no está definida');
            }
            
            if (typeof initMusicPlayer === 'function') {
                console.log('Inicializando reproductor de música');
                initMusicPlayer();
            } else {
                console.error('La función initMusicPlayer no está definida');
            }
            
            if (typeof initGameSection === 'function') {
                console.log('Inicializando sección del minijuego');
                initGameSection();
            } else {
                console.error('La función initGameSection no está definida');
            }
        });
    </script>
    
    <!-- Indicador de scroll -->
    <div class="scroll-indicator" id="scroll-indicator">
        <i class="fas fa-chevron-down"></i>
    </div>
</body>
</html>

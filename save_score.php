<?php
/**
 * Script para guardar la puntuación del minijuego
 * Recibe: score, guest_name, guest_id
 * Retorna: JSON con estado de la operación
 */

// Desactivar la visualización de errores y advertencias
error_reporting(0);
ini_set('display_errors', 0);

// Configurar cabeceras para JSON antes de cualquier salida
header('Content-Type: application/json');

try {
    require_once 'config.php';
    
    // Verificar que sea una petición POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'error' => 'Método no permitido']);
        exit;
    }
    
    // Obtener datos del POST
    $score = isset($_POST['score']) ? (int)$_POST['score'] : 0;
    $guestName = isset($_POST['guest_name']) ? trim($_POST['guest_name']) : 'Invitado';
    $guestId = isset($_POST['guest_id']) ? (int)$_POST['guest_id'] : 0;
    
    // Log de depuración
    error_log("=== SAVE SCORE DEBUG ===");
    error_log("Score recibido: " . $score);
    error_log("Guest name recibido: " . $guestName);
    error_log("Guest ID recibido: " . $guestId);
    
    // Validación de datos
    if ($score <= 0) {
        echo json_encode(['success' => false, 'error' => 'Puntuación no válida']);
        exit;
    }
    
    // Conectar a la base de datos
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Validar datos recibidos
    if (empty($guestName)) {
        $guestName = 'Invitado';
    }
    
    // Si tenemos un guest_id válido, verificar que existe en la base de datos
    if ($guestId > 0) {
        $stmt = $pdo->prepare("SELECT id, name FROM guests WHERE id = ?");
        $stmt->execute([$guestId]);
        $guest = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($guest) {
            // El guest_id es válido, mantener los datos recibidos
            error_log("Guest ID válido encontrado: " . $guestId . " (" . $guest['name'] . ")");
            // IMPORTANTE: NO sobrescribir el nombre que viene del frontend
            // $guestName = $guest['name']; // ← Esta línea causaba el problema
        } else {
            // El guest_id no existe, intentar buscar por nombre
            error_log("Guest ID " . $guestId . " no existe en la base de datos");
            $guestId = 0; // Resetear para buscar por nombre
        }
    }
    
    // Si no tenemos un guest_id válido, intentar buscar por nombre
    if ($guestId <= 0 && $guestName !== 'Invitado') {
        $stmt = $pdo->prepare("SELECT id FROM guests WHERE name = ?");
        $stmt->execute([$guestName]);
        $guest = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($guest) {
            $guestId = $guest['id'];
            error_log("Guest ID encontrado por nombre '" . $guestName . "': " . $guestId);
        } else {
            error_log("No se encontró guest con nombre: " . $guestName);
        }
    }
    
    // Si aún no tenemos un guest_id válido, usar el invitado genérico
    if ($guestId <= 0) {
        // Buscar el ID del invitado genérico
        $stmt = $pdo->prepare("SELECT id FROM guests WHERE invitation_code = 'generico' OR name = 'Invitado Genérico' LIMIT 1");
        $stmt->execute();
        $genericGuest = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($genericGuest) {
            $guestId = $genericGuest['id'];
            error_log("Usando guest_id genérico: " . $guestId . " para invitado: " . $guestName);
        } else {
            // Si no existe el invitado genérico, crearlo
            $stmt = $pdo->prepare("INSERT INTO guests (name, email, invitation_code) VALUES (?, ?, ?)");
            $stmt->execute(['Invitado Genérico', 'generico@example.com', 'generico']);
            $guestId = $pdo->lastInsertId();
            error_log("Creado nuevo guest_id genérico: " . $guestId . " para invitado: " . $guestName);
        }
    }
    
    error_log("Valores finales - ID: " . $guestId . ", Nombre: " . $guestName);
    
    // Guardar puntuación
    $stmt = $pdo->prepare("INSERT INTO game_scores (guest_id, guest_name, score) VALUES (?, ?, ?)");
    $stmt->execute([$guestId, $guestName, $score]);
    
    // Obtener la posición en el ranking
    $stmt = $pdo->prepare("SELECT COUNT(*) as position FROM game_scores WHERE score > ?");
    $stmt->execute([$score]);
    $position = $stmt->fetch(PDO::FETCH_ASSOC)['position'] + 1;
    
    // Responder con éxito
    echo json_encode([
        'success' => true,
        'message' => '¡Puntuación guardada correctamente!',
        'position' => $position,
        'score' => $score
    ]);

} catch (Exception $e) {
    // Capturar cualquier excepción y devolver JSON
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar la puntuación: ' . $e->getMessage()
    ]);
}
// Asegurarse de que no haya más salida después del JSON
exit;

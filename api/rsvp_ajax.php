<?php
// Manejador de solicitudes AJAX para RSVP
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en la respuesta JSON

// Include database connection
require_once '../config/config.php';

// Log para depuración
function log_debug($message) {
    $log_file = 'rsvp_ajax_debug.log';
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($log_file, "[$timestamp] $message\n", FILE_APPEND);
}

// Verificar que sea una solicitud POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    log_debug("Error: Método no permitido - " . $_SERVER['REQUEST_METHOD']);
    exit;
}

// Obtener y validar datos
$guest_id = isset($_POST['guest_id']) ? intval($_POST['guest_id']) : 0;
$invitation_code = isset($_POST['invitation_code']) ? $_POST['invitation_code'] : '';
$status = isset($_POST['status']) ? $_POST['status'] : '';

log_debug("Solicitud recibida: guest_id=$guest_id, invitation_code=$invitation_code, status=$status");

// Si el guest_id es 0 pero tenemos invitation_code, intentamos buscar el guest_id
if (($guest_id <= 0) && !empty($invitation_code)) {
    try {
        $stmt = $conn->prepare("SELECT id FROM guests WHERE invitation_code = :code");
        $stmt->bindParam(':code', $invitation_code);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $guest_id = $result['id'];
            log_debug("Guest ID recuperado desde invitation_code: $guest_id");
        }
    } catch(PDOException $e) {
        log_debug("Error al buscar guest_id por invitation_code: " . $e->getMessage());
    }
}

// Validar datos
if ($guest_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID de invitado inválido']);
    log_debug("Error: ID de invitado inválido - $guest_id");
    exit;
}

if (!in_array($status, ['confirmed', 'declined', 'unsure'])) {
    echo json_encode(['success' => false, 'message' => 'Estado inválido']);
    log_debug("Error: Estado inválido - $status");
    exit;
}

try {
    // Primero verificamos si el invitado existe
    $check_guest = $conn->prepare("SELECT id, name FROM guests WHERE id = :guest_id");
    $check_guest->bindParam(':guest_id', $guest_id);
    $check_guest->execute();
    
    if ($check_guest->rowCount() == 0) {
        echo json_encode(['success' => false, 'message' => 'Invitado no encontrado']);
        log_debug("Error: Invitado no encontrado - $guest_id");
        exit;
    }
    
    $guest = $check_guest->fetch(PDO::FETCH_ASSOC);
    $guest_name = $guest['name'];
    
    // Verificamos si ya existe un registro RSVP
    $check = $conn->prepare("SELECT id FROM rsvp WHERE guest_id = :guest_id");
    $check->bindParam(':guest_id', $guest_id);
    $check->execute();
    
    if ($check->rowCount() > 0) {
        // Actualizar registro existente
        $update = $conn->prepare("UPDATE rsvp SET status = :status, updated_at = NOW() WHERE guest_id = :guest_id");
        $update->bindParam(':status', $status);
        $update->bindParam(':guest_id', $guest_id);
        $success = $update->execute();
        $operation = "actualizado";
    } else {
        // Crear nuevo registro
        $insert = $conn->prepare("INSERT INTO rsvp (guest_id, status, created_at, updated_at) VALUES (:guest_id, :status, NOW(), NOW())");
        $insert->bindParam(':guest_id', $guest_id);
        $insert->bindParam(':status', $status);
        $success = $insert->execute();
        $operation = "creado";
    }
    
    if ($success) {
        // Obtener el estado actualizado
        $get_status = $conn->prepare("SELECT status FROM rsvp WHERE guest_id = :guest_id ORDER BY updated_at DESC LIMIT 1");
        $get_status->bindParam(':guest_id', $guest_id);
        $get_status->execute();
        $current_status = $get_status->fetch(PDO::FETCH_ASSOC)['status'];
        
        echo json_encode([
            'success' => true, 
            'message' => "Tu respuesta ha sido guardada", 
            'status' => $current_status,
            'guest_name' => $guest_name,
            'operation' => $operation
        ]);
        log_debug("Éxito: Registro $operation para invitado $guest_id con estado $status");
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar el estado']);
        log_debug("Error: Falló la operación SQL para guest_id=$guest_id, status=$status");
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de base de datos']);
    log_debug("Excepción PDO: " . $e->getMessage());
}
?>

<?php
// Activar registro de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Evitar cualquier redirección automática para ver mensajes de depuración
ini_set('display_errors', 1);

// Crear archivo de log y mostrar depuración directo en la página
function debug_log($message) {
    // Guardar en archivo
    $log_file = __DIR__ . '/rsvp_debug.log';
    file_put_contents($log_file, date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
    
    // También mostrarlo en pantalla para depuración
    echo "<div style='background:#f8f9fa;border:1px solid #ddd;padding:5px;margin:5px;font-family:monospace;'>"
         . date('[Y-m-d H:i:s] ') . htmlspecialchars($message) . "</div>\n";
}

echo "<h2>Depuración RSVP</h2>";
debug_log("=== INICIO DE PROCESAMIENTO RSVP ===>");
debug_log("Método HTTP: " . $_SERVER['REQUEST_METHOD']);
debug_log("Datos POST: " . print_r($_POST, true));
debug_log("Directorio actual: " . __DIR__);

// Verificar los permisos del directorio
if (is_writable(__DIR__)) {
    debug_log("El directorio tiene permisos de escritura");
} else {
    debug_log("ERROR: El directorio NO tiene permisos de escritura");
}

// Include database connection
debug_log("Intentando cargar config.php...");
require_once 'config.php';

// Verificar la conexión a la base de datos
if (isset($conn) && $conn instanceof PDO) {
    debug_log("Conexión a la base de datos establecida correctamente");
    
    // Verificar las tablas existentes
    try {
        $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        debug_log("Tablas en la base de datos: " . implode(", ", $tables));
        
        // Verificar estructura de la tabla rsvp
        $columns = $conn->query("DESCRIBE rsvp")->fetchAll(PDO::FETCH_ASSOC);
        $columnsInfo = [];
        foreach ($columns as $col) {
            $columnsInfo[] = $col['Field'] . ' (' . $col['Type'] . ')';
        }
        debug_log("Estructura de tabla rsvp: " . implode(", ", $columnsInfo));
        
        // Verificar registros existentes en rsvp
        $count = $conn->query("SELECT COUNT(*) FROM rsvp")->fetchColumn();
        debug_log("Número de registros en tabla rsvp: {$count}");
    } catch (PDOException $e) {
        debug_log("Error al verificar tablas: " . $e->getMessage());
    }
} else {
    debug_log("ERROR: La conexión a la base de datos no está disponible");
}

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $guest_id = isset($_POST['guest_id']) ? intval($_POST['guest_id']) : 0;
    $status = isset($_POST['status']) ? $_POST['status'] : '';
    $invitation_code = isset($_POST['invitation_code']) ? $_POST['invitation_code'] : '';
    
    debug_log("Procesando datos: guest_id={$guest_id}, status={$status}, invitation_code={$invitation_code}");
    
    // Verificar que guest_id sea válido
    if ($guest_id <= 0) {
        debug_log("ERROR: guest_id no válido: {$guest_id}");
    }
    
    // Validate status
    $valid_statuses = ['confirmed', 'declined', 'unsure'];
    if (!in_array($status, $valid_statuses)) {
        debug_log("Status no válido: {$status}, cambiando a 'pending'");
        $status = 'pending';
    } else {
        debug_log("Status válido: {$status}");
    }
    
    // Update or Insert RSVP status in database
    if ($guest_id > 0) {
        try {
            debug_log("Procesando guest_id: {$guest_id}, status: {$status}");
            
            // First check if the record exists
            $checkStmt = $conn->prepare("SELECT COUNT(*) FROM rsvp WHERE guest_id = :guest_id");
            $checkStmt->bindParam(':guest_id', $guest_id);
            $checkStmt->execute();
            $exists = ($checkStmt->fetchColumn() > 0);
            debug_log("¿El registro existe? " . ($exists ? "SÍ" : "NO"));
            
            if ($exists) {
                // Update existing record
                $sqlUpdate = "UPDATE rsvp SET status = :status, updated_at = NOW() WHERE guest_id = :guest_id";
                debug_log("SQL Update: {$sqlUpdate} [guest_id={$guest_id}, status={$status}]");
                
                $stmt = $conn->prepare($sqlUpdate);
                $stmt->bindParam(':status', $status);
                $stmt->bindParam(':guest_id', $guest_id);
                
                // Ejecutar y verificar
                $success = $stmt->execute();
                $rowsAffected = $stmt->rowCount();
                
                // Log the update
                debug_log("RSVP actualizado para guest_id: {$guest_id}, status: {$status}");
                debug_log("Filas afectadas: {$rowsAffected}");
                
                // Verificar si realmente se actualizó
                if ($rowsAffected == 0) {
                    debug_log("ADVERTENCIA: No se actualizó ninguna fila, pero no hubo error");
                    
                    // Verificar si existe el registro
                    $verifyStmt = $conn->prepare("SELECT status FROM rsvp WHERE guest_id = :guest_id");
                    $verifyStmt->bindParam(':guest_id', $guest_id);
                    $verifyStmt->execute();
                    
                    if ($verifyStmt->rowCount() > 0) {
                        $currentStatus = $verifyStmt->fetchColumn();
                        debug_log("El registro existe, status actual: {$currentStatus}");
                        
                        // Si el estado es el mismo, puede que no haya habido actualización
                        if ($currentStatus == $status) {
                            debug_log("El status actual ya era '{$status}', no hubo cambios");
                            $success = true; // Consideramos éxito aunque no haya cambios
                        } else {
                            // Intentar forzar la actualización
                            debug_log("Intentando forzar actualización con un UPDATE directo");
                            $forcedUpdate = $conn->exec("UPDATE rsvp SET status = '{$status}', updated_at = NOW() WHERE guest_id = {$guest_id}");
                            debug_log("Actualización forzada: {$forcedUpdate} filas afectadas");
                            $success = ($forcedUpdate > 0);
                        }
                    } else {
                        debug_log("ERROR: El registro no existe a pesar de la verificación previa");
                    }
                }
            } else {
                // Insert new record
                $sql = "INSERT INTO rsvp (guest_id, status, created_at, updated_at) VALUES (:guest_id, :status, NOW(), NOW())"; 
                debug_log("SQL para inserción: {$sql} [guest_id={$guest_id}, status={$status}]");
                
                try {
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':guest_id', $guest_id);
                    $stmt->bindParam(':status', $status);
                    $success = $stmt->execute();
                    $lastId = $conn->lastInsertId();
                    
                    // Verificar inserción
                    debug_log("RSVP nuevo creado para guest_id: {$guest_id}, status: {$status}");
                    debug_log("Último ID insertado: {$lastId}");
                    
                    if ($lastId <= 0) {
                        debug_log("ADVERTENCIA: No se obtuvo un ID válido tras la inserción");
                        
                        // Verificar si se creó realmente
                        $verifyInsert = $conn->prepare("SELECT id FROM rsvp WHERE guest_id = :guest_id");
                        $verifyInsert->bindParam(':guest_id', $guest_id);
                        $verifyInsert->execute();
                        
                        if ($verifyInsert->rowCount() > 0) {
                            debug_log("Verificación: El registro se insertó correctamente a pesar del ID");
                            $success = true;
                        } else {
                            debug_log("ERROR: No se pudo verificar la inserción");
                            $success = false;
                        }
                    }
                } catch (PDOException $insertEx) {
                    debug_log("ERROR en inserción: " . $insertEx->getMessage());
                    debug_log("Código SQL: " . $insertEx->getCode());
                    
                    // Si es un error de duplicado, intentar actualizar en su lugar
                    if ($insertEx->getCode() == 23000) { // Código para duplicado
                        debug_log("Detectado error de duplicado, intentando actualizar en su lugar");
                        $updateStmt = $conn->prepare("UPDATE rsvp SET status = :status, updated_at = NOW() WHERE guest_id = :guest_id");
                        $updateStmt->bindParam(':status', $status);
                        $updateStmt->bindParam(':guest_id', $guest_id);
                        $success = $updateStmt->execute();
                        debug_log("Actualización alternativa: " . ($success ? "Exitosa" : "Fallida"));
                    } else {
                        $success = false;
                    }
                }
            }
            
            if ($success) {
                // Verificar una última vez el estado actual
                $finalCheck = $conn->prepare("SELECT status FROM rsvp WHERE guest_id = :guest_id");
                $finalCheck->bindParam(':guest_id', $guest_id);
                $finalCheck->execute();
                
                if ($finalCheck->rowCount() > 0) {
                    $finalStatus = $finalCheck->fetchColumn();
                    debug_log("Verificación final: El estado en la base de datos es '{$finalStatus}'");
                    
                    // Si el status no coincide con lo esperado, forzar una última actualización
                    if ($finalStatus != $status) {
                        debug_log("ADVERTENCIA: Estado final diferente al esperado, forzando actualización");
                        $conn->exec("UPDATE rsvp SET status = '{$status}', updated_at = NOW() WHERE guest_id = {$guest_id}");
                    }
                } else {
                    debug_log("ERROR: No se puede verificar el estado final, el registro no existe");
                }
                
                // Confirmar en el log antes de redireccionar
                debug_log("Operación exitosa, redirigiendo a: index.php?guest=" . urlencode($invitation_code));
                
                // Agregar un mensaje en la URL para depuración
                header("Location: index.php?guest=" . urlencode($invitation_code) . "&status_updated={$status}");
                exit();
            } else {
                debug_log("ERROR: La operación no fue exitosa");
                echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:15px;margin:15px;'>"
                     . "<h3>Error al guardar confirmación</h3>"
                     . "<p>No se pudo guardar tu confirmación. Por favor intenta nuevamente.</p>"
                     . "<p><a href='index.php?guest=" . urlencode($invitation_code) . "' style='background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;display:inline-block;margin-top:10px;'>Volver a la invitación</a></p>"
                     . "</div>";
                throw new Exception("No se pudo guardar la confirmación");  
            }
        } catch(PDOException $e) {
            // Log error instead of displaying
            $errorMsg = "Error DB: " . $e->getMessage();
            debug_log($errorMsg);
            debug_log("SQL State: " . $e->getCode());
            
            // Mostrar mensaje de error para depuración
            echo "<p>Error en la base de datos: {$e->getMessage()}</p>";
            echo "<p>SQL State: {$e->getCode()}</p>";
            echo "<p>Por favor revisa el archivo rsvp_debug.log para más detalles.</p>";
        } catch(Exception $e) {
            // Log general errors
            $errorMsg = "Error General: " . $e->getMessage();
            debug_log($errorMsg);
            
            // Mostrar mensaje de error para depuración
            echo "<p>Error general: {$e->getMessage()}</p>";
            echo "<p>Por favor revisa el archivo rsvp_debug.log para más detalles.</p>";
        }
    } else {
        echo "<p>Invitado no encontrado. Por favor verifica tu enlace de invitación.</p>";
    }
} else {
    // Redirect to homepage if accessed directly
    debug_log("Acceso directo detectado, redirigiendo a index.php");
    header("Location: index.php");
    exit();
}

debug_log("=== FIN DE PROCESAMIENTO RSVP ===");
?>

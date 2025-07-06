<?php
/**
 * Script para obtener el ranking de puntuaciones del minijuego
 * Retorna: JSON con las mejores puntuaciones
 */

// Desactivar la visualización de errores y advertencias
error_reporting(0);
ini_set('display_errors', 0);

// Configurar cabeceras para JSON antes de cualquier salida
header('Content-Type: application/json');

try {
    require_once 'config.php';
    
    // Conectar a la base de datos - CORREGIDO: usar nombres correctos de variables
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener puntuaciones (las mejores para cada invitado)
    $stmt = $pdo->prepare("
        SELECT 
            s1.id,
            s1.guest_id,
            s1.guest_name,
            s1.score,
            DATE_FORMAT(s1.created_at, '%d/%m/%Y %H:%i') as fecha
        FROM 
            game_scores s1
        WHERE
            s1.score = (
                SELECT MAX(s2.score)
                FROM game_scores s2
                WHERE s2.guest_id = s1.guest_id
            )
        ORDER BY 
            s1.score DESC, 
            s1.created_at ASC
        LIMIT 20
    ");
    
    $stmt->execute();
    $leaderboard = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Devolver los resultados
    echo json_encode([
        'success' => true,
        'leaderboard' => $leaderboard
    ]);

} catch (Exception $e) {
    // Error al conectar o consultar la base de datos - usar catch para cualquier excepción
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener el ranking: ' . $e->getMessage()
    ]);
}
// Asegurarse de que no haya más salida después del JSON
exit;

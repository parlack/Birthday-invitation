<?php
// Script para corregir la estructura de la tabla RSVP
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Corrección de la Tabla RSVP</h1>";

try {
    // Conectar a la base de datos
    require_once '../config/config.php';
    echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Conexión a la base de datos establecida</div>";
    
    // Verificar la estructura actual de la tabla
    echo "<h2>Estructura actual de la tabla RSVP</h2>";
    $columns = $conn->query("DESCRIBE rsvp")->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1' cellpadding='5' style='border-collapse:collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th><th>Extra</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . $col['Field'] . "</td>";
        echo "<td>" . $col['Type'] . "</td>";
        echo "<td>" . $col['Null'] . "</td>";
        echo "<td>" . $col['Key'] . "</td>";
        echo "<td>" . $col['Default'] . "</td>";
        echo "<td>" . $col['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Verificar si la columna created_at ya existe
    $hasCreatedAt = false;
    foreach ($columns as $col) {
        if ($col['Field'] === 'created_at') {
            $hasCreatedAt = true;
            break;
        }
    }
    
    if ($hasCreatedAt) {
        echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ La columna 'created_at' ya existe en la tabla</div>";
    } else {
        // Agregar la columna created_at
        echo "<h2>Agregando columna created_at</h2>";
        try {
            $conn->exec("ALTER TABLE rsvp ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER status");
            echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Columna 'created_at' agregada exitosamente</div>";
            
            // Actualizar los registros existentes para que created_at tenga el mismo valor que updated_at
            $conn->exec("UPDATE rsvp SET created_at = updated_at WHERE created_at IS NULL");
            echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Valores de 'created_at' actualizados para registros existentes</div>";
            
        } catch (PDOException $alterEx) {
            echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:10px;margin:10px;'>❌ Error al agregar la columna: " . $alterEx->getMessage() . "</div>";
        }
    }
    
    // Verificar la estructura actualizada
    echo "<h2>Estructura actualizada de la tabla RSVP</h2>";
    $newColumns = $conn->query("DESCRIBE rsvp")->fetchAll(PDO::FETCH_ASSOC);
    echo "<table border='1' cellpadding='5' style='border-collapse:collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th><th>Extra</th></tr>";
    foreach ($newColumns as $col) {
        echo "<tr>";
        echo "<td>" . $col['Field'] . "</td>";
        echo "<td>" . $col['Type'] . "</td>";
        echo "<td>" . $col['Null'] . "</td>";
        echo "<td>" . $col['Key'] . "</td>";
        echo "<td>" . $col['Default'] . "</td>";
        echo "<td>" . $col['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Hacer una prueba de inserción y actualización para comprobar que todo funciona
    echo "<h2>Prueba de inserción</h2>";
    try {
        $test_guest_id = 999; // ID de prueba para no afectar registros reales
        $test_status = 'test_status_' . time(); // Status único para esta prueba
        
        $insert = $conn->prepare("INSERT INTO rsvp (guest_id, status, created_at, updated_at) VALUES (:guest_id, :status, NOW(), NOW())");
        $insert->bindParam(':guest_id', $test_guest_id);
        $insert->bindParam(':status', $test_status);
        $success = $insert->execute();
        
        if ($success) {
            echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Prueba de inserción exitosa</div>";
            
            // Verificar si realmente se guardó
            $verify = $conn->prepare("SELECT * FROM rsvp WHERE guest_id = :guest_id");
            $verify->bindParam(':guest_id', $test_guest_id);
            $verify->execute();
            $result = $verify->fetch(PDO::FETCH_ASSOC);
            
            if ($result && $result['status'] === $test_status) {
                echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Verificación exitosa: el registro se guardó correctamente</div>";
                echo "<pre>" . print_r($result, true) . "</pre>";
            } else {
                echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:10px;margin:10px;'>❌ Verificación fallida: el registro no se guardó o los datos no coinciden</div>";
            }
            
            // Limpiar el registro de prueba
            $conn->exec("DELETE FROM rsvp WHERE guest_id = 999");
            echo "<div style='background:#d4edda;border:1px solid #c3e6cb;padding:10px;margin:10px;'>✅ Registro de prueba eliminado</div>";
        } else {
            echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:10px;margin:10px;'>❌ Error en la prueba de inserción</div>";
        }
    } catch (PDOException $insertEx) {
        echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:10px;margin:10px;'>❌ Error en la prueba de inserción: " . $insertEx->getMessage() . "</div>";
    }
    
    // Solución alternativa para rsvp.php si la modificación de la tabla no funcionó
    echo "<h2>Alternativa de solución en rsvp.php</h2>";
    echo "<p>Si por algún motivo no es posible modificar la estructura de la tabla, también puede modificar el archivo <code>rsvp.php</code> para que no utilice la columna <code>created_at</code>:</p>";
    echo "<pre>";
    echo htmlspecialchars("// Para nuevos registros (INSERT)
\$sql = \"INSERT INTO rsvp (guest_id, status, updated_at) VALUES (:guest_id, :status, NOW())\";");
    echo "</pre>";
    
    echo "<hr><p>Proceso de corrección completado: " . date('Y-m-d H:i:s') . "</p>";
    echo "<p><a href='index.php?guest=LuisSalinas' style='background:#007bff;color:#fff;padding:10px 15px;text-decoration:none;display:inline-block;margin-top:10px;'>Volver a la invitación</a></p>";
    
} catch (PDOException $e) {
    echo "<div style='background:#f8d7da;border:1px solid #f5c6cb;padding:10px;margin:10px;'>❌ Error de conexión: " . $e->getMessage() . "</div>";
}
?>

<?php
// Include database connection
require_once '../config/config.php';

// Basic authentication (you should improve this in production)
$username = "usuario";
$password = "consetraseña"; // Change this to a secure password

$authenticated = false;

// Check if form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['username']) && isset($_POST['password'])) {
        if ($_POST['username'] === $username && $_POST['password'] === $password) {
            $authenticated = true;
            // Start session to maintain login
            session_start();
            $_SESSION['admin_authenticated'] = true;
        } else {
            $error = "Usuario o contraseña incorrectos";
        }
    } elseif (isset($_POST['add_guest'])) {
        // Add new guest
        $name = $_POST['name'];
        $email = $_POST['email'];
        $invitation_code = $_POST['invitation_code'];
        
        try {
            // First add the guest
            $stmt = $conn->prepare("INSERT INTO guests (name, email, invitation_code) VALUES (:name, :email, :code)");
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':code', $invitation_code);
            $stmt->execute();
            
            // Get the new guest ID
            $guest_id = $conn->lastInsertId();
            
            // Add initial RSVP status
            $stmt = $conn->prepare("INSERT INTO rsvp (guest_id, status) VALUES (:guest_id, 'pending')");
            $stmt->bindParam(':guest_id', $guest_id);
            $stmt->execute();
            
            $success = "Invitado agregado correctamente";
        } catch(PDOException $e) {
            $error = "Error: " . $e->getMessage();
        }
    }
} else {
    // Check if already authenticated via session
    session_start();
    if (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true) {
        $authenticated = true;
    }
}

// Fetch guest list if authenticated
$guests = [];
if ($authenticated) {
    try {
        $stmt = $conn->query("SELECT g.id, g.name, g.email, g.invitation_code, r.status, r.updated_at 
                            FROM guests g 
                            JOIN rsvp r ON g.id = r.guest_id 
                            ORDER BY g.name ASC");
        $guests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        $error = "Error: " . $e->getMessage();
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Invitación Galáctica</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <style>
        .admin-container {
            background: rgba(13, 15, 44, 0.95);
            border-radius: 10px;
            padding: 30px;
            width: 90%;
            max-width: 900px;
            margin: 40px auto;
            color: #ffffff;
        }
        
        .admin-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .admin-form {
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #c8b6ff;
        }
        
        .form-control {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #7e22ce;
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .admin-btn {
            padding: 10px 20px;
            background: linear-gradient(45deg, #7e22ce, #4f46e5);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .admin-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .admin-table th, .admin-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .admin-table th {
            background: rgba(123, 104, 238, 0.3);
            color: #e0aaff;
        }
        
        .status-confirmed {
            color: #4CAF50;
        }
        
        .status-declined {
            color: #F44336;
        }
        
        .status-unsure {
            color: #FFC107;
        }
        
        .status-pending {
            color: #9e9e9e;
        }
        
        .admin-alert {
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .error {
            background: rgba(244, 67, 54, 0.2);
            border: 1px solid rgba(244, 67, 54, 0.4);
        }
        
        .success {
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid rgba(76, 175, 80, 0.4);
        }
        
        .invitation-link {
            word-break: break-all;
            color: #00d4ff;
        }
    </style>
</head>
<body>
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="clouds"></div>
    
    <div class="admin-container">
        <div class="admin-header">
            <h1 class="glow-text">Admin - Invitación Galáctica</h1>
        </div>
        
        <?php if (!$authenticated): ?>
            <div class="admin-form">
                <h2>Iniciar Sesión</h2>
                
                <?php if (isset($error)): ?>
                    <div class="admin-alert error"><?php echo $error; ?></div>
                <?php endif; ?>
                
                <form method="post" action="">
                    <div class="form-group">
                        <label for="username">Usuario:</label>
                        <input type="text" id="username" name="username" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" class="form-control" required>
                    </div>
                    
                    <button type="submit" class="admin-btn">Iniciar Sesión</button>
                </form>
            </div>
        <?php else: ?>
            <?php if (isset($success)): ?>
                <div class="admin-alert success"><?php echo $success; ?></div>
            <?php endif; ?>
            
            <?php if (isset($error)): ?>
                <div class="admin-alert error"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <div class="admin-form">
                <h2>Agregar Nuevo Invitado</h2>
                <form method="post" action="">
                    <div class="form-group">
                        <label for="name">Nombre:</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="invitation_code">Código de Invitación (usado en la URL):</label>
                        <input type="text" id="invitation_code" name="invitation_code" class="form-control" required>
                    </div>
                    
                    <button type="submit" name="add_guest" value="1" class="admin-btn">Agregar Invitado</button>
                </form>
            </div>
            
            <h2>Lista de Invitados</h2>
            <p>Total: <?php echo count($guests); ?> invitados</p>
            
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Código</th>
                        <th>Estado</th>
                        <th>Última Actualización</th>
                        <th>Link de Invitación</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach($guests as $guest): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($guest['name']); ?></td>
                            <td><?php echo htmlspecialchars($guest['email']); ?></td>
                            <td><?php echo htmlspecialchars($guest['invitation_code']); ?></td>
                            <td class="status-<?php echo $guest['status']; ?>">
                                <?php 
                                    switch($guest['status']) {
                                        case 'confirmed':
                                            echo "Confirmado";
                                            break;
                                        case 'declined':
                                            echo "No asistirá";
                                            break;
                                        case 'unsure':
                                            echo "No está seguro";
                                            break;
                                        default:
                                            echo "Pendiente";
                                    }
                                ?>
                            </td>
                            <td><?php echo htmlspecialchars($guest['updated_at']); ?></td>
                            <td>
                                <span class="invitation-link"><?php echo "https://venamifiestitade20añosporfaplis.space/" . "?guest=" . $guest['invitation_code']; ?></span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    
                    <?php if (empty($guests)): ?>
                        <tr>
                            <td colspan="6" style="text-align: center;">No hay invitados registrados</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>

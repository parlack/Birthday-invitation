<?php
// Include database connection
require_once '../config/config.php';

// Simple authentication check
session_start();
if(!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    header('Location: admin_login.php');
    exit;
}

// Get all visitor logs with guest names
try {
    $stmt = $conn->prepare(
        "SELECT vl.*, g.name as guest_name 
         FROM visitor_logs vl 
         LEFT JOIN guests g ON vl.guest_id = g.id 
         ORDER BY vl.visit_date DESC"
    );
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    $error = "Database error: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitor Logs - Admin</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="admin-container">
        <h1>Visitor Logs</h1>
        <div class="admin-menu">
            <a href="admin.php">Dashboard</a>
            <a href="visitor_logs.php" class="active">Visitor Logs</a>
            <a href="admin_logout.php">Logout</a>
        </div>
        
        <?php if(isset($error)): ?>
            <div class="error-message"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <div class="stats-summary">
            <div class="stat-card">
                <h3>Total Visits</h3>
                <p><?php echo count($logs); ?></p>
            </div>
            <div class="stat-card">
                <h3>Unique Visitors</h3>
                <p><?php 
                    $unique_ips = array_unique(array_column($logs, 'ip_address'));
                    echo count($unique_ips); 
                ?></p>
            </div>
            <div class="stat-card">
                <h3>Device Breakdown</h3>
                <p>
                <?php 
                    $devices = array_count_values(array_column($logs, 'device_type'));
                    foreach($devices as $device => $count) {
                        echo "$device: $count<br>";
                    }
                ?>
                </p>
            </div>
        </div>
        
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>Guest</th>
                        <th>IP Address</th>
                        <th>Device</th>
                        <th>Visit Date</th>
                        <th>Visit Count</th>
                        <th>Referrer</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach($logs as $log): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($log['guest_name'] ?? 'Unknown'); ?></td>
                        <td><?php echo htmlspecialchars($log['ip_address']); ?></td>
                        <td><?php echo htmlspecialchars($log['device_type']); ?></td>
                        <td><?php echo htmlspecialchars($log['visit_date']); ?></td>
                        <td><?php echo htmlspecialchars($log['visit_count']); ?></td>
                        <td><?php echo htmlspecialchars($log['last_page']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>

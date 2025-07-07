<?php
// Include database connection
require_once '../config/config.php';

try {
    // First check if the invitation_code already exists
    $check = $conn->prepare("SELECT * FROM guests WHERE invitation_code = :code");
    $invitation_code = 'andresin123';
    $check->bindParam(':code', $invitation_code);
    $check->execute();
    
    if ($check->rowCount() == 0) {
        // Add new guest
        $stmt = $conn->prepare("INSERT INTO guests (name, email, invitation_code) VALUES (:name, :email, :code)");
        $name = 'Andresin';
        $email = 'andresin@example.com';
        
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':code', $invitation_code);
        $stmt->execute();
        
        $guest_id = $conn->lastInsertId();
        
        // Add initial RSVP status
        $rsvp = $conn->prepare("INSERT INTO rsvp (guest_id, status) VALUES (:guest_id, 'pending')");
        $rsvp->bindParam(':guest_id', $guest_id);
        $rsvp->execute();
        
        echo "Invitado 'Andresin' creado con código 'andresin123'\n";
    } else {
        echo "El código de invitación 'andresin123' ya existe\n";
    }
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\nRevisando los invitados actuales:\n";
try {
    $list = $conn->query("SELECT g.id, g.name, g.invitation_code, r.status FROM guests g LEFT JOIN rsvp r ON g.id = r.guest_id");
    while ($row = $list->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']}, Nombre: {$row['name']}, Código: {$row['invitation_code']}, RSVP: {$row['status']}\n";
    }
} catch(PDOException $e) {
    echo "Error listando: " . $e->getMessage() . "\n";
}
?>

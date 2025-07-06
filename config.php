<?php
// Database connection configuration
//Las credenciales dependen de como hayas configurado el usuario y contraseña en mysql. 
//Las credenciales de la base de datos real no se encuentran aqui
$host = 'localhost';        // MySQL host
$username = 'root';         // MySQL username
$password = 'abcdefgh12321';             // MySQL password
$database = 'birthday_invitation'; // Database name

// Create database connection
try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>

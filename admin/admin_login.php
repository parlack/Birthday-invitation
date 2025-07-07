<?php
session_start();

// Simple hardcoded credentials for demo purposes
// In production, use proper authentication and store hashed passwords in database
$admin_username = 'admin';
$admin_password = 'spaceparty123';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if ($username === $admin_username && $password === $admin_password) {
        $_SESSION['admin'] = true;
        header('Location: admin.php');
        exit;
    } else {
        $error = 'Invalid username or password';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: #121212;
            color: #fff;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .login-container {
            background: rgba(30, 30, 40, 0.8);
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            width: 350px;
        }
        h1 {
            text-align: center;
            color: #9d4edd;
            margin-bottom: 2rem;
        }
        form {
            display: flex;
            flex-direction: column;
        }
        .form-group {
            margin-bottom: 1rem;
        }
        label {
            margin-bottom: 0.5rem;
            display: block;
            font-weight: bold;
            color: #c77dff;
        }
        input {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #444;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.2);
            color: #fff;
            font-size: 1rem;
            box-sizing: border-box;
        }
        button {
            background: linear-gradient(135deg, #9d4edd, #7b2cbf);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        button:hover {
            background: linear-gradient(135deg, #c77dff, #9d4edd);
            transform: translateY(-2px);
        }
        .error {
            background: rgba(255, 0, 0, 0.2);
            color: #ff6b6b;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            text-align: center;
        }
        .return-link {
            text-align: center;
            margin-top: 1.5rem;
        }
        .return-link a {
            color: #c77dff;
            text-decoration: none;
        }
        .return-link a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>Admin Login</h1>
        
        <?php if($error): ?>
            <div class="error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="post" action="">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
        
        <div class="return-link">
            <a href="../public/index.php">Return to Invitation</a>
        </div>
    </div>
</body>
</html>

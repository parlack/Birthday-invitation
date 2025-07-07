<?php
// Redirect to public folder
header('Location: public/index.php' . ($_SERVER['QUERY_STRING'] ? '?' . $_SERVER['QUERY_STRING'] : ''));
exit;
?> 
<?php
session_start();

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $submittedToken = $_POST['csrf_token'] ?? '';

    if (
        !is_string($submittedToken) ||
        !hash_equals($_SESSION['csrf_token'], $submittedToken)
    ) {
        http_response_code(403);
        exit('Invalid form submission. Please reload the page and try again.');
    }

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (
        !is_string($name) ||
        !is_string($email) ||
        !is_string($password)
    ) {
        $message = 'Please provide valid form values.';
        $messageType = 'error';
    } elseif ($name === '' || $email === '' || $password === '') {
        $message = 'Please fill in all fields.';
        $messageType = 'error';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Please enter a valid email address.';
        $messageType = 'error';
    } elseif (strlen($password) < 8 || strlen($password) > 4096) {
        $message = 'Password must contain between 8 and 4096 bytes.';
        $messageType = 'error';
    } elseif (strlen($name) > 100 || strlen($email) > 150) {
        $message = 'One or more fields exceed the allowed length.';
        $messageType = 'error';
    } else {
        try {
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
            );
            $stmt->execute([$name, $email, $hashedPassword]);

            $message = 'Registration successful! You can now log in.';
            $messageType = 'success';

            // Rotate the token after a successful form submission.
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        } catch (PDOException $e) {
            error_log($e->getMessage());

            // MySQL/MariaDB duplicate-key error.
            if ($e->getCode() === '23000') {
                $message = 'An account with this email already exists.';
            } else {
                $message = 'Registration failed. Please try again.';
            }
            $messageType = 'error';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register | StayNest</title>
    <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body class="auth-page">
    <main class="auth-container">
        <button
            id="theme-toggle"
            class="theme-toggle"
            type="button"
            aria-label="Switch to dark mode"
            aria-pressed="false"
            title="Switch theme"
            data-tooltip="Switch to dark mode"
        >
            <span class="theme-icon" aria-hidden="true">☀</span>
        </button>

        <h1>Join StayNest</h1>
        <p>Create an account to save accommodation you're interested in.</p>

        <?php if ($message !== ''): ?>
            <p class="<?= htmlspecialchars($messageType, ENT_QUOTES, 'UTF-8') ?>"
               role="status">
                <?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?>
                <?php if ($messageType === 'success'): ?>
                    <a href="login.php">Log in now</a>
                <?php endif; ?>
            </p>
        <?php endif; ?>

        <form method="POST" action="" class="auth-card">
            <input
                type="hidden"
                name="csrf_token"
                value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>"
            >

            <div>
                <label for="name">Full name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    maxlength="100"
                    autocomplete="name"
                    required
                >
            </div>

            <div>
                <label for="email">Email address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    maxlength="150"
                    autocomplete="email"
                    required
                >
            </div>

            <div>
                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    minlength="8"
                    maxlength="4096"
                    autocomplete="new-password"
                    required
                >
                <small>Use at least 8 characters.</small>
            </div>

            <button type="submit" class="auth-submit">Create Account</button>
        </form>

        <p>Already have an account? <a href="login.php">Log in</a></p>
    </main>

    <script src="../assets/js/theme.js"></script>
</body>
</html>

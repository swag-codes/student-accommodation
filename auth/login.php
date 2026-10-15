
<?php
session_start();

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $submittedToken = $_POST['csrf_token'] ?? '';

    if (
        !is_string($submittedToken) ||
        !hash_equals($_SESSION['csrf_token'], $submittedToken)
    ) {
        http_response_code(403);
        exit('Invalid form submission. Please reload the page and try again.');
    }

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (
        !is_string($email) ||
        !is_string($password) ||
        $email === '' ||
        $password === '' ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        strlen($email) > 150 ||
        strlen($password) > 4096
    ) {
        $message = 'Invalid email or password.';
    } else {
        try {
            $stmt = $pdo->prepare(
                'SELECT id, name, email, password
                 FROM users
                 WHERE email = ?'
            );

            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                session_regenerate_id(true);

                $_SESSION['user_id'] = (int) $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];

                header('Location: ../index.html');
                exit;
            }

            $message = 'Invalid email or password.';
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $message = 'Login failed. Please try again.';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../assets/css/style.css">
    <title>Login | StayNest</title>
</head>
<body class="auth-page">
    <main class="auth-container">
        <button
    id="theme-toggle"
    class="theme-toggle"
    type="button"
    data-tooltip="Switch to dark mode"
    aria-label="Switch to dark mode"
    aria-pressed="false"
>
            <span class="theme-icon" aria-hidden="true">☀</span>
        </button>

    <h1>Welcome back</h1>
    <p>Log in to your StayNest account.</p>

    <?php if ($message !== ''): ?>
        <p class="error">
            <?= htmlspecialchars($message) ?>
        </p>
    <?php endif; ?>

    <form method="POST" action="" class="auth-card">

<input
    type="hidden"
    name="csrf_token"
    value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>"
>

        <div>
            <label for="email">Email address</label>
            <input
                type="email"
                id="email"
                name="email"
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
                autocomplete="current-password"
                required
            >
        </div>

        <button type="submit" class="auth-submit">Log In</button>
    </form>

    <p>New to StayNest? <a href="register.php">Create an account</a></p>
</div>
<script src="../assets/js/theme.js"></script>
</body>
</html>
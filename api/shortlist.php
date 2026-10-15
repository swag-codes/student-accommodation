
<?php
session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Please log in first.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->prepare(
            'SELECT property_id
             FROM interested_users
             WHERE user_id = ?'
        );

        $stmt->execute([$userId]);

        echo json_encode(
            array_map('intval', $stmt->fetchAll(PDO::FETCH_COLUMN))
        );
        exit;
    }

    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed.']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !is_array($input) ||
        !isset($input['property_id'], $input['action']) ||
        !in_array($input['action'], ['add', 'remove'], true) ||
        filter_var($input['property_id'], FILTER_VALIDATE_INT) === false ||
        (int) $input['property_id'] < 1
    ) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request.']);
        exit;
    }

    $propertyId = (int) $input['property_id'];

    if ($input['action'] === 'add') {
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO interested_users (user_id, property_id)
             SELECT ?, id FROM properties WHERE id = ?'
        );

        $stmt->execute([$userId, $propertyId]);

        if ($stmt->rowCount() === 0) {
            $check = $pdo->prepare(
                'SELECT id FROM properties WHERE id = ?'
            );
            $check->execute([$propertyId]);

            if (!$check->fetchColumn()) {
                http_response_code(404);
                echo json_encode(['error' => 'Property not found.']);
                exit;
            }
        }
    } else {
        $stmt = $pdo->prepare(
            'DELETE FROM interested_users
             WHERE user_id = ? AND property_id = ?'
        );

        $stmt->execute([$userId, $propertyId]);
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'A database error occurred.']);
}

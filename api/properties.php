
<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../db.php';

try {
    // Read filters from the URL.
    $city = trim($_GET['city'] ?? '');
    $budget = $_GET['budget'] ?? '';
    $gender = trim($_GET['gender'] ?? '');

    // Start with a query that includes every property.
    $conditions = [];
    $params = [];

    // Filter by city, if selected.
    if ($city !== '') {
        $conditions[] = 'LOWER(p.city) = LOWER(?)';
$params[] = $city;
    }

    // Filter by maximum rent, if provided.
    if ($budget !== '') {
        if (!is_numeric($budget) || (float) $budget < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid budget.']);
            exit;
        }

        $conditions[] = 'p.price <= ?';
        $params[] = (float) $budget;
    }

    // Match the selected gender and properties available to everyone.

if ($gender !== '') {
    $allowedGenders = ['male', 'female', 'any'];

    if (!in_array($gender, $allowedGenders, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid gender filter.']);
        exit;
    }

    if ($gender === 'any') {
        // Show only properties available to everyone.
        $conditions[] = 'p.gender_type = ?';
        $params[] = 'any';
    } else {
        // Include the selected gender and properties open to everyone.
        $conditions[] = '(p.gender_type = ? OR p.gender_type = ?)';
        $params[] = $gender;
        $params[] = 'any';
    }
}


    $sql = "
        SELECT
            p.id,
            p.name,
            p.city,
            p.location,
            p.price,
            p.gender_type,
            p.description,
            p.rating,
            p.image,
            COALESCE(
                GROUP_CONCAT(a.name ORDER BY a.id SEPARATOR '||'),
                ''
            ) AS amenity_names
        FROM properties p
        LEFT JOIN property_amenities pa
            ON pa.property_id = p.id
        LEFT JOIN amenities a
            ON a.id = pa.amenity_id
    ";

    // Add filters only when they have been selected.
    if (!empty($conditions)) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $sql .= '
        GROUP BY p.id
        ORDER BY p.id
    ';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $properties = $stmt->fetchAll();

    // Convert the database amenity string into a JSON array.
    foreach ($properties as &$property) {
        $property['amenities'] = $property['amenity_names'] === ''
            ? []
            : explode('||', $property['amenity_names']);

        unset($property['amenity_names']);
    }
    unset($property);

    echo json_encode(
        $properties,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode([
        'error' => 'Unable to load properties.'
    ]);
}

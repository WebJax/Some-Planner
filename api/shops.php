<?php
/**
 * Shops API endpoint
 * Handles CRUD operations for shops
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/Response.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

Auth::requireAuth();

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        case 'POST':
            Auth::requireCSRF();
            handlePost($db);
            break;
        case 'PUT':
            Auth::requireCSRF();
            handlePut($db);
            break;
        case 'DELETE':
            Auth::requireCSRF();
            handleDelete($db);
            break;
        default:
            Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('Shops API error: ' . $e->getMessage());
    Response::serverError('An error occurred');
}

/**
 * Get shops
 */
function handleGet($db) {
    $id = $_GET['id'] ?? null;
    $activeOnly = isset($_GET['active']) && $_GET['active'] === '1';

    if ($id) {
        $sql = "SELECT * FROM shops WHERE id = ?";
        $shop = $db->fetchOne($sql, [$id]);
        
        if (!$shop) {
            Response::notFound('Shop not found');
        }
        
        Response::success($shop);
    } else {
        $sql = "SELECT * FROM shops";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " WHERE active = 1";
        }
        
        $sql .= " ORDER BY name ASC";
        
        $shops = $db->fetchAll($sql, $params);
        Response::success($shops);
    }
}

/**
 * Create new shop
 */
function handlePost($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $errors = [];
    if (empty($data['name'])) {
        $errors['name'] = 'Shop name is required';
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $sql = "INSERT INTO shops (name, contact_name, contact_email, contact_phone, active)
            VALUES (?, ?, ?, ?, ?)";
    
    $params = [
        $data['name'],
        $data['contact_name'] ?? null,
        $data['contact_email'] ?? null,
        $data['contact_phone'] ?? null,
        $data['active'] ?? 1
    ];

    $db->query($sql, $params);
    $shopId = $db->lastInsertId();

    Response::success(['id' => $shopId], 'Shop created successfully');
}

/**
 * Update shop
 */
function handlePut($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        Response::error('Shop ID is required', 400);
    }

    $fields = [];
    $params = [];

    $allowedFields = ['name', 'contact_name', 'contact_email', 'contact_phone', 'active'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $params[] = $data[$field];
        }
    }

    if (empty($fields)) {
        Response::error('No fields to update', 400);
    }

    $params[] = $data['id'];
    $sql = "UPDATE shops SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->query($sql, $params);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Shop not found or no changes made');
    }

    Response::success(['id' => $data['id']], 'Shop updated successfully');
}

/**
 * Delete shop
 */
function handleDelete($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        Response::error('Shop ID is required', 400);
    }

    $stmt = $db->query("DELETE FROM shops WHERE id = ?", [$id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Shop not found');
    }

    Response::success([], 'Shop deleted successfully');
}

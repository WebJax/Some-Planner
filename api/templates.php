<?php
/**
 * Templates API endpoint
 * Handles CRUD operations for templates
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
    error_log('Templates API error: ' . $e->getMessage());
    Response::serverError('An error occurred');
}

/**
 * Get templates
 */
function handleGet($db) {
    $id = $_GET['id'] ?? null;
    $activeOnly = isset($_GET['active']) && $_GET['active'] === '1';

    if ($id) {
        $sql = "SELECT * FROM templates WHERE id = ?";
        $template = $db->fetchOne($sql, [$id]);
        
        if (!$template) {
            Response::notFound('Template not found');
        }
        
        Response::success($template);
    } else {
        $sql = "SELECT * FROM templates";
        $params = [];
        
        if ($activeOnly) {
            $sql .= " WHERE active = 1";
        }
        
        $sql .= " ORDER BY name ASC";
        
        $templates = $db->fetchAll($sql, $params);
        Response::success($templates);
    }
}

/**
 * Create new template
 */
function handlePost($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $errors = [];
    if (empty($data['name'])) {
        $errors['name'] = 'Template name is required';
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $sql = "INSERT INTO templates (name, caption_template, media_guide, active)
            VALUES (?, ?, ?, ?)";
    
    $params = [
        $data['name'],
        $data['caption_template'] ?? null,
        $data['media_guide'] ?? null,
        $data['active'] ?? 1
    ];

    $db->query($sql, $params);
    $templateId = $db->lastInsertId();

    Response::success(['id' => $templateId], 'Template created successfully');
}

/**
 * Update template
 */
function handlePut($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        Response::error('Template ID is required', 400);
    }

    $fields = [];
    $params = [];

    $allowedFields = ['name', 'caption_template', 'media_guide', 'active'];
    
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
    $sql = "UPDATE templates SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->query($sql, $params);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Template not found or no changes made');
    }

    Response::success(['id' => $data['id']], 'Template updated successfully');
}

/**
 * Delete template
 */
function handleDelete($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        Response::error('Template ID is required', 400);
    }

    $stmt = $db->query("DELETE FROM templates WHERE id = ?", [$id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Template not found');
    }

    Response::success([], 'Template deleted successfully');
}

<?php
/**
 * Posts API endpoint
 * Handles CRUD operations for posts
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
    error_log('Posts API error: ' . $e->getMessage());
    Response::serverError('An error occurred');
}

/**
 * Get posts
 */
function handleGet($db) {
    // Get query parameters
    $month = $_GET['month'] ?? null;
    $year = $_GET['year'] ?? null;
    $status = $_GET['status'] ?? null;
    $id = $_GET['id'] ?? null;

    if ($id) {
        // Get single post with media and shop info
        $sql = "SELECT p.*, s.name as shop_name,
                       (SELECT JSON_ARRAYAGG(
                           JSON_OBJECT(
                               'id', m.id,
                               'file_path', m.file_path,
                               'file_name', m.file_name,
                               'media_type', m.media_type,
                               'sort_order', m.sort_order
                           )
                       ) FROM media m WHERE m.post_id = p.id ORDER BY m.sort_order) as media
                FROM posts p
                LEFT JOIN shops s ON p.shop_id = s.id
                WHERE p.id = ?";
        $post = $db->fetchOne($sql, [$id]);
        
        if (!$post) {
            Response::notFound('Post not found');
        }
        
        // Decode media JSON
        if ($post['media']) {
            $post['media'] = json_decode($post['media'], true);
        } else {
            $post['media'] = [];
        }
        
        Response::success($post);
    } else {
        // Get all posts for month/year or all
        $sql = "SELECT p.*, s.name as shop_name,
                       (SELECT COUNT(*) FROM media m WHERE m.post_id = p.id) as media_count
                FROM posts p
                LEFT JOIN shops s ON p.shop_id = s.id
                WHERE 1=1";
        $params = [];

        if ($month && $year) {
            $sql .= " AND MONTH(p.date) = ? AND YEAR(p.date) = ?";
            $params[] = $month;
            $params[] = $year;
        }

        if ($status) {
            $sql .= " AND p.status = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY p.date ASC, p.created_at ASC";

        $posts = $db->fetchAll($sql, $params);
        Response::success($posts);
    }
}

/**
 * Create new post
 */
function handlePost($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $errors = [];
    if (empty($data['date'])) {
        $errors['date'] = 'Date is required';
    }
    if (empty($data['type'])) {
        $errors['type'] = 'Type is required';
    }

    if (!empty($errors)) {
        Response::validationError($errors);
    }

    $sql = "INSERT INTO posts (date, type, format, shop_id, status, caption, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $data['date'],
        $data['type'] ?? 'post',
        $data['format'] ?? null,
        $data['shop_id'] ?? null,
        $data['status'] ?? 'draft',
        $data['caption'] ?? null,
        $data['notes'] ?? null
    ];

    $db->query($sql, $params);
    $postId = $db->lastInsertId();

    Response::success(['id' => $postId], 'Post created successfully');
}

/**
 * Update post
 */
function handlePut($db) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data['id'])) {
        Response::error('Post ID is required', 400);
    }

    // Build update query dynamically
    $fields = [];
    $params = [];

    $allowedFields = ['date', 'type', 'format', 'shop_id', 'status', 'caption', 'notes'];
    
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
    $sql = "UPDATE posts SET " . implode(', ', $fields) . " WHERE id = ?";

    $stmt = $db->query($sql, $params);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Post not found or no changes made');
    }

    Response::success(['id' => $data['id']], 'Post updated successfully');
}

/**
 * Delete post
 */
function handleDelete($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        Response::error('Post ID is required', 400);
    }

    // Get media files to delete
    $media = $db->fetchAll("SELECT file_path FROM media WHERE post_id = ?", [$id]);
    
    // Delete post (cascade will delete media records)
    $stmt = $db->query("DELETE FROM posts WHERE id = ?", [$id]);

    if ($stmt->rowCount() === 0) {
        Response::notFound('Post not found');
    }

    // Delete actual media files
    foreach ($media as $m) {
        $filePath = __DIR__ . '/../' . $m['file_path'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    Response::success([], 'Post deleted successfully');
}

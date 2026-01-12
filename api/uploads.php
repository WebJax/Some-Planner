<?php
/**
 * Uploads API endpoint
 * Handles file uploads for posts
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/Response.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

Auth::requireAuth();

$db = Database::getInstance();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'POST':
            Auth::requireCSRF();
            handleUpload($db);
            break;
        case 'DELETE':
            Auth::requireCSRF();
            handleDelete($db);
            break;
        default:
            Response::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log('Upload API error: ' . $e->getMessage());
    Response::serverError('An error occurred');
}

/**
 * Handle file upload
 */
function handleUpload($db) {
    if (!isset($_FILES['file']) || !isset($_POST['post_id'])) {
        Response::error('File and post_id are required', 400);
    }

    $postId = $_POST['post_id'];
    $file = $_FILES['file'];

    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        Response::error('File upload failed', 400);
    }

    // Check file size
    if ($file['size'] > UPLOAD_MAX_SIZE) {
        Response::error('File size exceeds maximum allowed size', 400);
    }

    // Check file type
    $mimeType = mime_content_type($file['tmp_name']);
    $mediaType = null;

    if (in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
        $mediaType = 'image';
    } elseif (in_array($mimeType, ALLOWED_VIDEO_TYPES)) {
        $mediaType = 'video';
    } else {
        Response::error('File type not allowed', 400);
    }

    // Verify post exists
    $post = $db->fetchOne("SELECT id FROM posts WHERE id = ?", [$postId]);
    if (!$post) {
        Response::error('Post not found', 404);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('media_', true) . '.' . $extension;
    $uploadPath = UPLOAD_DIR . $filename;

    // Create upload directory if it doesn't exist
    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0750, true);
    }

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        Response::error('Failed to save file', 500);
    }

    // Get max sort order
    $maxOrder = $db->fetchOne(
        "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM media WHERE post_id = ?",
        [$postId]
    );
    $sortOrder = ($maxOrder['max_order'] ?? -1) + 1;

    // Save to database
    $sql = "INSERT INTO media (post_id, file_path, file_name, media_type, file_size, mime_type, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $params = [
        $postId,
        'uploads/' . $filename,
        $file['name'],
        $mediaType,
        $file['size'],
        $mimeType,
        $sortOrder
    ];

    $db->query($sql, $params);
    $mediaId = $db->lastInsertId();

    Response::success([
        'id' => $mediaId,
        'file_path' => 'uploads/' . $filename,
        'file_name' => $file['name'],
        'media_type' => $mediaType,
        'sort_order' => $sortOrder
    ], 'File uploaded successfully');
}

/**
 * Delete media file
 */
function handleDelete($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id) {
        Response::error('Media ID is required', 400);
    }

    // Get media info
    $media = $db->fetchOne("SELECT * FROM media WHERE id = ?", [$id]);
    
    if (!$media) {
        Response::notFound('Media not found');
    }

    // Delete from database
    $db->query("DELETE FROM media WHERE id = ?", [$id]);

    // Delete file
    $filePath = __DIR__ . '/../' . $media['file_path'];
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    Response::success([], 'Media deleted successfully');
}

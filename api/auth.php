<?php
/**
 * Auth API endpoint
 * Handles login, logout, and session status
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../core/Response.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    if ($method === 'POST' && $action === 'login') {
        handleLogin();
    } elseif ($method === 'POST' && $action === 'logout') {
        handleLogout();
    } elseif ($method === 'GET' && $action === 'status') {
        handleStatus();
    } elseif ($method === 'GET' && $action === 'token') {
        handleToken();
    } else {
        Response::error('Invalid action', 400);
    }
} catch (Exception $e) {
    error_log('Auth API error: ' . $e->getMessage());
    Response::serverError('An error occurred');
}

/**
 * Handle login
 */
function handleLogin() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        Response::error('Username and password are required', 400);
    }

    if (Auth::login($username, $password)) {
        Response::success([
            'username' => $username,
            'csrf_token' => Auth::getCSRFToken()
        ], 'Login successful');
    } else {
        Response::error('Invalid credentials', 401);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    Auth::logout();
    Response::success([], 'Logout successful');
}

/**
 * Handle status check
 */
function handleStatus() {
    Auth::startSession();
    
    if (Auth::isAuthenticated()) {
        Response::success([
            'authenticated' => true,
            'username' => $_SESSION['username'] ?? null,
            'csrf_token' => Auth::getCSRFToken()
        ]);
    } else {
        Response::success([
            'authenticated' => false
        ]);
    }
}

/**
 * Get CSRF token
 */
function handleToken() {
    Auth::requireAuth();
    Response::success([
        'csrf_token' => Auth::getCSRFToken()
    ]);
}

<?php
/**
 * Authentication and session management
 */
class Auth {
    
    /**
     * Start session
     */
    public static function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
            ini_set('session.cookie_samesite', 'Strict');
            session_start();
        }
    }

    /**
     * Check if user is authenticated
     */
    public static function isAuthenticated() {
        self::startSession();
        return isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
    }

    /**
     * Login user
     */
    public static function login($username, $password) {
        if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD_HASH)) {
            self::startSession();
            session_regenerate_id(true);
            $_SESSION['authenticated'] = true;
            $_SESSION['username'] = $username;
            $_SESSION['login_time'] = time();
            self::generateCSRFToken();
            return true;
        }
        return false;
    }

    /**
     * Logout user
     */
    public static function logout() {
        self::startSession();
        $_SESSION = [];
        
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        session_destroy();
    }

    /**
     * Require authentication
     */
    public static function requireAuth() {
        if (!self::isAuthenticated()) {
            http_response_code(401);
            Response::json(['error' => 'Authentication required'], 401);
            exit;
        }

        // Check session timeout
        if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > SESSION_LIFETIME) {
            self::logout();
            http_response_code(401);
            Response::json(['error' => 'Session expired'], 401);
            exit;
        }
    }

    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        self::startSession();
        if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
            $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
        }
        return $_SESSION[CSRF_TOKEN_NAME];
    }

    /**
     * Get CSRF token
     */
    public static function getCSRFToken() {
        self::startSession();
        return $_SESSION[CSRF_TOKEN_NAME] ?? self::generateCSRFToken();
    }

    /**
     * Verify CSRF token
     */
    public static function verifyCSRFToken($token) {
        self::startSession();
        return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
    }

    /**
     * Require CSRF token for POST/PUT/DELETE requests
     */
    public static function requireCSRF() {
        $method = $_SERVER['REQUEST_METHOD'];
        if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
            $token = null;
            
            // Check header first
            $headers = getallheaders();
            if (isset($headers['X-CSRF-Token'])) {
                $token = $headers['X-CSRF-Token'];
            } elseif (isset($_POST[CSRF_TOKEN_NAME])) {
                $token = $_POST[CSRF_TOKEN_NAME];
            }

            if (!$token || !self::verifyCSRFToken($token)) {
                http_response_code(403);
                Response::json(['error' => 'Invalid CSRF token'], 403);
                exit;
            }
        }
    }
}

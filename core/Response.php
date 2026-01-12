<?php
/**
 * Response helper class for JSON responses
 */
class Response {
    
    /**
     * Send JSON response
     */
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Send success response
     */
    public static function success($data = [], $message = 'Success') {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }

    /**
     * Send error response
     */
    public static function error($message, $statusCode = 400, $errors = []) {
        self::json([
            'success' => false,
            'error' => $message,
            'errors' => $errors
        ], $statusCode);
    }

    /**
     * Send validation error response
     */
    public static function validationError($errors) {
        self::json([
            'success' => false,
            'error' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }

    /**
     * Send not found response
     */
    public static function notFound($message = 'Resource not found') {
        self::json([
            'success' => false,
            'error' => $message
        ], 404);
    }

    /**
     * Send server error response
     */
    public static function serverError($message = 'Internal server error') {
        self::json([
            'success' => false,
            'error' => $message
        ], 500);
    }
}

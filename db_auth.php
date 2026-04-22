<?php
// Database connections removed - using stub for interface compatibility
error_reporting(0);
ini_set('display_errors', 0);

// Stub PDO class for interface compatibility
class StubPDOAuth {
    public function query($sql) { return new StubPDOStatementAuth(); }
    public function prepare($sql) { return new StubPDOStatementAuth(); }
    public function exec($sql) { return 0; }
}

class StubPDOStatementAuth {
    public function execute($params = []) { return true; }
    public function fetch() { return null; }
    public function fetchAll() { return []; }
}

$pdo_auth = new StubPDOAuth();
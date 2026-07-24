<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/scores.json';

function readScores($file) {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/api/scores' || $path === '/scores') {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode(readScores($dataFile));
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['winner']) || !in_array($input['winner'], ['red', 'yellow'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid payload']);
            exit;
        }

        $scores = readScores($dataFile);
        $scores[] = [
            'winner' => $input['winner'],
            'date' => $input['date'] ?? date('c')
        ];
        file_put_contents($dataFile, json_encode($scores));

        echo json_encode(['status' => 'ok']);
        exit;
    }
}

http_response_code(404);
echo json_encode(['error' => 'Not found']);
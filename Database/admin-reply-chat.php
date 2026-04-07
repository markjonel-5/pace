<?php
session_start();
header('Content-Type: application/json');
require 'pace-database.php';

if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') exit;

$data = json_decode(file_get_contents("php://input"), true);
$targetEmail = $conn->real_escape_string($data['email']);
$chatHistory = $conn->real_escape_string(json_encode($data['chatHistory']));

$sql = "UPDATE users SET chatHistory='$chatHistory' WHERE email='$targetEmail'";
if ($conn->query($sql) === TRUE) echo json_encode(['success' => true]);
else echo json_encode(['success' => false]);
$conn->close();
?>
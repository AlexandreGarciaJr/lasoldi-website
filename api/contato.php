<?php
/**
 * La Soldi Capital · endpoint do formulário de contato.
 *
 * - Responde JSON quando chamado via fetch (Accept: application/json).
 * - Sem JS: redireciona para obrigado.html ou de volta ao formulário com ?erro=1.
 * - Anti-spam: honeypot "website", tempo mínimo de preenchimento, limite por IP.
 * - Envio: PHPMailer via SMTP (credenciais em api/config.php, fora do git).
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require __DIR__ . '/lib/PHPMailer/Exception.php';
require __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require __DIR__ . '/lib/PHPMailer/SMTP.php';

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

$wantsJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function respond(bool $ok, string $message, int $status = 200): never
{
    global $wantsJson;
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . ($ok ? '../obrigado.html' : '../index.html?erro=1#contato'), true, 303);
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'Método não permitido.', 405);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('[contato] api/config.php ausente.');
    respond(false, 'Formulário temporariamente indisponível. Fale conosco pelo WhatsApp.', 503);
}
$config = require $configFile;

// ---------- anti-spam ----------
// 1. honeypot: robôs preenchem tudo
if (!empty($_POST['website'] ?? '')) {
    respond(true, 'Recebemos sua mensagem.'); // finge sucesso para o robô
}

// 2. tempo mínimo (só quando o JS registrou o início)
$t = (int) ($_POST['t'] ?? 0);
if ($t > 0) {
    $elapsed = (int) floor(microtime(true) * 1000) - $t;
    if ($elapsed < 2500) {
        respond(true, 'Recebemos sua mensagem.');
    }
}

// 3. limite por IP: 5 envios a cada 10 minutos
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateFile = sys_get_temp_dir() . '/lasoldi_rate_' . hash('sha256', $ip . ($config['rate_salt'] ?? ''));
$now = time();
$hits = is_file($rateFile) ? array_filter(
    array_map('intval', explode(',', (string) file_get_contents($rateFile))),
    fn ($ts) => $ts > $now - 600
) : [];
if (count($hits) >= 5) {
    respond(false, 'Recebemos muitas mensagens deste endereço. Tente novamente em alguns minutos ou fale pelo WhatsApp.', 429);
}

// ---------- validação ----------
$clean = static fn (string $v, int $max): string =>
    mb_substr(trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? ''), 0, $max);

$nome = $clean((string) ($_POST['nome'] ?? ''), 120);
$telefone = $clean((string) ($_POST['telefone'] ?? ''), 20);
$email = $clean((string) ($_POST['email'] ?? ''), 160);
$mensagem = $clean((string) ($_POST['mensagem'] ?? ''), 2000);
$consent = ($_POST['consentimento'] ?? '') === 'sim';

$digits = preg_replace('/\D/', '', $telefone) ?? '';
$errors = [];
if (mb_strlen($nome) < 2) $errors[] = 'nome';
if (strlen($digits) < 10 || strlen($digits) > 13) $errors[] = 'telefone';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'e-mail';
if (!$consent) $errors[] = 'consentimento';
// cabeçalhos não podem carregar quebras de linha
if (preg_match('/[\r\n]/', $nome . $email)) $errors[] = 'dados';

if ($errors) {
    respond(false, 'Confira os campos: ' . implode(', ', $errors) . '.', 422);
}

// ---------- envio ----------
$esc = static fn (string $v): string => htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$quando = (new DateTimeImmutable('now', new DateTimeZone('America/Sao_Paulo')))->format('d/m/Y H:i');

$html = '<div style="font-family:Arial,sans-serif;color:#3a1030;line-height:1.5">'
    . '<p style="font-size:12px;letter-spacing:.2em;color:#5f6b52">NOVO CONTATO PELO SITE</p>'
    . '<table cellpadding="6" style="border-collapse:collapse">'
    . '<tr><td><strong>Nome</strong></td><td>' . $esc($nome) . '</td></tr>'
    . '<tr><td><strong>WhatsApp/telefone</strong></td><td>' . $esc($telefone) . '</td></tr>'
    . '<tr><td><strong>E-mail</strong></td><td>' . ($email !== '' ? $esc($email) : '—') . '</td></tr>'
    . '<tr><td valign="top"><strong>Mensagem</strong></td><td>' . ($mensagem !== '' ? nl2br($esc($mensagem)) : '—') . '</td></tr>'
    . '<tr><td><strong>Consentimento LGPD</strong></td><td>Sim · ' . $esc($quando) . '</td></tr>'
    . '</table></div>';

$text = "Novo contato pelo site\n\nNome: {$nome}\nWhatsApp/telefone: {$telefone}\nE-mail: "
    . ($email ?: '—') . "\nMensagem: " . ($mensagem ?: '—') . "\nConsentimento LGPD: sim · {$quando}\n";

$mail = new PHPMailer(true);
try {
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int) $config['smtp_port'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_pass'];
    $mail->SMTPSecure = ($config['smtp_secure'] ?? 'ssl') === 'tls'
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->Timeout = 15;

    $mail->setFrom($config['from_email'], $config['from_name'] ?? 'Site La Soldi Capital');
    foreach ((array) $config['to'] as $to) {
        $mail->addAddress($to);
    }
    if ($email !== '') {
        $mail->addReplyTo($email, $nome);
    }

    $mail->Subject = 'Contato pelo site: ' . $nome;
    $mail->isHTML(true);
    $mail->Body = $html;
    $mail->AltBody = $text;
    $mail->send();
} catch (MailException $e) {
    error_log('[contato] falha no envio: ' . $mail->ErrorInfo);
    respond(false, 'Não conseguimos enviar agora. Tente de novo ou fale direto pelo WhatsApp.', 502);
}

$hits[] = $now;
@file_put_contents($rateFile, implode(',', $hits), LOCK_EX);

respond(true, 'Recebemos sua mensagem.');

<?php
/**
 * Copie este arquivo para api/config.php e preencha com os dados reais do SMTP.
 * O config.php NÃO deve ir para o git nem ser compartilhado.
 *
 * HostGator / Hostinger (e-mail da própria hospedagem):
 *   host: mail.lasoldicapital.com.br  (ou smtp.hostinger.com)
 *   porta 465 + 'ssl'   ou   porta 587 + 'tls'
 */
return [
    'smtp_host'   => 'mail.lasoldicapital.com.br',
    'smtp_port'   => 465,
    'smtp_secure' => 'ssl',                       // 'ssl' (465) ou 'tls' (587)
    'smtp_user'   => 'site@lasoldicapital.com.br',
    'smtp_pass'   => 'TROCAR-PELA-SENHA',

    'from_email'  => 'site@lasoldicapital.com.br', // precisa ser do mesmo domínio do SMTP
    'from_name'   => 'Site La Soldi Capital',
    'to'          => ['contato@lasoldicapital.com.br'], // quem recebe os contatos

    'rate_salt'   => 'troque-por-um-texto-aleatorio',
];

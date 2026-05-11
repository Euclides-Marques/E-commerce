namespace ECommerce.Infrastructure.Services;

internal static class EmailTemplates
{
    private const string Primary = "#ee4d2d";
    private const string BgLight = "#f8f8f8";

    private static string Layout(string title, string bodyContent) => $@"
<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
  <meta charset=""UTF-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0""/>
  <title>{title}</title>
</head>
<body style=""margin:0;padding:0;background:{BgLight};font-family:Arial,sans-serif;"">
  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:{BgLight};padding:32px 0;"">
    <tr><td align=""center"">
      <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);"">
        <!-- Header -->
        <tr>
          <td style=""background:{Primary};padding:24px 32px;"">
            <h1 style=""margin:0;color:#fff;font-size:24px;font-weight:bold;"">🛒 ShopBR</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style=""padding:32px;"">
            {bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style=""background:{BgLight};padding:16px 32px;text-align:center;"">
            <p style=""margin:0;color:#999;font-size:12px;"">
              © {DateTime.UtcNow.Year} ShopBR. Todos os direitos reservados.<br/>
              Este é um e-mail automático, não responda a esta mensagem.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";

    public static string Welcome(string name) => Layout("Bem-vindo ao ShopBR!", $@"
      <h2 style=""color:#333;margin-top:0;"">Bem-vindo, {name}! 🎉</h2>
      <p style=""color:#555;line-height:1.6;"">
        Sua conta foi criada com sucesso. Agora você tem acesso às melhores ofertas do ShopBR.
      </p>
      <p style=""color:#555;line-height:1.6;"">Explore nossos produtos e aproveite frete grátis em seus primeiros pedidos!</p>
      <div style=""text-align:center;margin:24px 0;"">
        <a href=""https://novastore-smoky.vercel.app/products""
           style=""background:{Primary};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;"">
          Ver Produtos
        </a>
      </div>
      <p style=""color:#888;font-size:13px;"">Qualquer dúvida, entre em contato conosco.</p>");

    public static string OrderConfirmation(string name, string orderNumber, decimal total) => Layout(
        $"Pedido {orderNumber} confirmado!", $@"
      <h2 style=""color:#333;margin-top:0;"">Pedido confirmado! ✅</h2>
      <p style=""color:#555;line-height:1.6;"">Olá, <strong>{name}</strong>.</p>
      <p style=""color:#555;line-height:1.6;"">Recebemos seu pedido e ele está sendo processado.</p>
      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:{BgLight};border-radius:6px;margin:16px 0;"">
        <tr>
          <td style=""padding:16px;"">
            <p style=""margin:4px 0;color:#555;""><strong>Número do pedido:</strong> {orderNumber}</p>
            <p style=""margin:4px 0;color:#555;""><strong>Total:</strong> R$ {total:N2}</p>
          </td>
        </tr>
      </table>
      <div style=""text-align:center;margin:24px 0;"">
        <a href=""https://novastore-smoky.vercel.app/orders""
           style=""background:{Primary};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;"">
          Acompanhar Pedido
        </a>
      </div>");

    public static string OrderStatusChanged(string name, string orderNumber, string statusLabel) => Layout(
        $"Pedido {orderNumber} atualizado", $@"
      <h2 style=""color:#333;margin-top:0;"">Status do pedido atualizado 📦</h2>
      <p style=""color:#555;line-height:1.6;"">Olá, <strong>{name}</strong>.</p>
      <p style=""color:#555;line-height:1.6;"">
        Seu pedido <strong>{orderNumber}</strong> teve o status atualizado para:
      </p>
      <div style=""text-align:center;margin:16px 0;"">
        <span style=""background:{Primary};color:#fff;padding:8px 20px;border-radius:20px;font-weight:bold;font-size:16px;"">
          {statusLabel}
        </span>
      </div>
      <div style=""text-align:center;margin:24px 0;"">
        <a href=""https://novastore-smoky.vercel.app/orders""
           style=""background:{Primary};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;"">
          Ver Detalhes
        </a>
      </div>");

    public static string PaymentConfirmed(string name, string orderNumber, decimal total) => Layout(
        $"Pagamento aprovado — {orderNumber}", $@"
      <h2 style=""color:#333;margin-top:0;"">Pagamento aprovado! 💳✅</h2>
      <p style=""color:#555;line-height:1.6;"">Olá, <strong>{name}</strong>.</p>
      <p style=""color:#555;line-height:1.6;"">
        O pagamento do seu pedido <strong>{orderNumber}</strong> foi confirmado com sucesso!
      </p>
      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:{BgLight};border-radius:6px;margin:16px 0;"">
        <tr>
          <td style=""padding:16px;"">
            <p style=""margin:4px 0;color:#555;""><strong>Número do pedido:</strong> {orderNumber}</p>
            <p style=""margin:4px 0;color:#555;""><strong>Valor pago:</strong> R$ {total:N2}</p>
          </td>
        </tr>
      </table>
      <p style=""color:#555;line-height:1.6;"">Seu pedido está sendo preparado para envio.</p>
      <div style=""text-align:center;margin:24px 0;"">
        <a href=""https://novastore-smoky.vercel.app/orders""
           style=""background:{Primary};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;"">
          Acompanhar Pedido
        </a>
      </div>");

    public static string ContactMessage(string name, string email, string subject, string message) => Layout(
        $"Mensagem de contato — {name}", $@"
      <h2 style=""color:#333;margin-top:0;"">Nova mensagem de contato</h2>
      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:{BgLight};border-radius:6px;margin:16px 0;"">
        <tr>
          <td style=""padding:16px;"">
            <p style=""margin:4px 0;color:#555;""><strong>Nome:</strong> {name}</p>
            <p style=""margin:4px 0;color:#555;""><strong>E-mail:</strong> <a href=""mailto:{email}"" style=""color:{Primary};"">{email}</a></p>
            <p style=""margin:4px 0;color:#555;""><strong>Assunto:</strong> {subject}</p>
          </td>
        </tr>
      </table>
      <h3 style=""color:#333;margin-bottom:8px;"">Mensagem</h3>
      <div style=""background:{BgLight};border-left:4px solid {Primary};padding:16px;border-radius:0 6px 6px 0;"">
        <p style=""color:#555;line-height:1.6;margin:0;white-space:pre-wrap;"">{message}</p>
      </div>
      <p style=""color:#888;font-size:13px;margin-top:24px;"">
        Responda diretamente para: <a href=""mailto:{email}"" style=""color:{Primary};"">{email}</a>
      </p>");

    public static string EmailConfirmation(string name, string confirmUrl) => Layout("Confirme seu e-mail", $@"
      <h2 style=""color:#333;margin-top:0;"">Confirme seu e-mail 📧</h2>
      <p style=""color:#555;line-height:1.6;"">Olá, <strong>{name}</strong>! Bem-vindo ao ShopBR!</p>
      <p style=""color:#555;line-height:1.6;"">
        Sua conta foi criada com sucesso. Clique no botão abaixo para confirmar seu e-mail e ativar todos os recursos da plataforma.
      </p>
      <div style=""text-align:center;margin:28px 0;"">
        <a href=""{confirmUrl}""
           style=""background:{Primary};color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;font-size:16px;"">
          Confirmar E-mail
        </a>
      </div>
      <p style=""color:#888;font-size:13px;"">
        Este link expira em <strong>24 horas</strong>. Se você não criou uma conta no ShopBR, ignore este e-mail.
      </p>
      <p style=""color:#888;font-size:12px;word-break:break-all;"">
        Ou copie e cole este link no navegador:<br/>
        <a href=""{confirmUrl}"" style=""color:{Primary};"">{confirmUrl}</a>
      </p>");

    public static string PasswordReset(string name, string token) => Layout("Recuperação de senha", $@"
      <h2 style=""color:#333;margin-top:0;"">Recuperação de senha 🔒</h2>
      <p style=""color:#555;line-height:1.6;"">Olá, <strong>{name}</strong>.</p>
      <p style=""color:#555;line-height:1.6;"">
        Recebemos uma solicitação para redefinir a senha da sua conta.
        Use o código abaixo (válido por 1 hora):
      </p>
      <div style=""text-align:center;margin:24px 0;"">
        <span style=""background:{BgLight};border:2px dashed {Primary};color:{Primary};
                      padding:12px 28px;border-radius:6px;font-size:22px;font-weight:bold;
                      letter-spacing:4px;display:inline-block;"">
          {token}
        </span>
      </div>
      <p style=""color:#888;font-size:13px;"">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>");
}

namespace ECommerce.Infrastructure.Services;

internal static class EmailTemplates
{
    // ── Design Tokens ──────────────────────────────────────────────────────────
    private const string Primary      = "#ee4d2d";
    private const string PrimaryDark  = "#c73d1f";
    private const string BgPage       = "#f0eeeb";
    private const string BgCard       = "#ffffff";
    private const string BgSubtle     = "#f7f6f4";
    private const string Border       = "#e8e6e3";
    private const string TextPrimary  = "#1a1a1a";
    private const string TextBody     = "#4a4a4a";
    private const string TextMuted    = "#888888";
    private const string Success      = "#16a34a";
    private const string FontStack    = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

    // ── Base Layout ────────────────────────────────────────────────────────────
    private static string Layout(string title, string preheader, string bodyContent) => $@"<!DOCTYPE html>
<html lang=""pt-BR"" xmlns=""http://www.w3.org/1999/xhtml"">
<head>
  <meta charset=""UTF-8""/>
  <meta name=""viewport"" content=""width=device-width,initial-scale=1.0""/>
  <meta http-equiv=""X-UA-Compatible"" content=""IE=edge""/>
  <title>{title}</title>
</head>
<body style=""margin:0;padding:0;background:{BgPage};font-family:{FontStack};-webkit-font-smoothing:antialiased;"">

  <!-- Preheader (hidden preview text) -->
  <div style=""display:none;max-height:0;overflow:hidden;color:{BgPage};"">
    {preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;
  </div>

  <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""background:{BgPage};"">
    <tr>
      <td align=""center"" style=""padding:40px 16px 48px;"">

        <!-- Card -->
        <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
               style=""max-width:580px;background:{BgCard};border-radius:16px;
                      border:1px solid {Border};overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.06),0 1px 4px rgba(0,0,0,0.04);"">

          <!-- Brand Header -->
          <tr>
            <td style=""padding:28px 40px 24px;border-bottom:1px solid {Border};"">
              <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
                <tr>
                  <td>
                    <table cellpadding=""0"" cellspacing=""0"" border=""0"">
                      <tr>
                        <td style=""background:{Primary};border-radius:10px;padding:8px 12px;vertical-align:middle;"">
                          <span style=""color:#fff;font-size:16px;font-weight:800;letter-spacing:-0.3px;"">ShopBR</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style=""padding:40px 40px 32px;"">
              {bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style=""background:{BgSubtle};border-top:1px solid {Border};
                        padding:20px 40px;text-align:center;"">
              <p style=""margin:0 0 6px;font-size:12px;color:{TextMuted};line-height:1.5;"">
                &copy; {DateTime.UtcNow.Year} ShopBR &mdash; Todos os direitos reservados
              </p>
              <p style=""margin:0;font-size:11px;color:#aaa;line-height:1.5;"">
                Este é um e-mail automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>";

    // ── Shared: CTA Button ─────────────────────────────────────────────────────
    private static string Button(string href, string label) => $@"
      <table cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:0 auto;"">
        <tr>
          <td style=""background:{Primary};border-radius:10px;
                      box-shadow:0 2px 8px rgba(238,77,45,0.32);"">
            <a href=""{href}""
               style=""display:inline-block;padding:14px 32px;color:#fff;font-size:15px;
                       font-weight:700;text-decoration:none;letter-spacing:-0.1px;
                       font-family:{FontStack};"">
              {label}
            </a>
          </td>
        </tr>
      </table>";

    // ── Shared: Info Box ───────────────────────────────────────────────────────
    private static string InfoBox(string content) => $@"
      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""background:{BgSubtle};border-radius:10px;border:1px solid {Border};margin:24px 0 0;"">
        <tr>
          <td style=""padding:14px 18px;"">
            <p style=""margin:0;font-size:13px;color:{TextMuted};line-height:1.6;"">{content}</p>
          </td>
        </tr>
      </table>";

    // ── Shared: Divider ────────────────────────────────────────────────────────
    private static string Divider() =>
        $@"<table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"" style=""margin:28px 0;"">
             <tr><td style=""border-top:1px solid {Border};""></td></tr>
           </table>";

    // ── Shared: OrderDetail Row ────────────────────────────────────────────────
    private static string DetailRow(string label, string value) => $@"
      <tr>
        <td style=""padding:10px 16px;border-bottom:1px solid {Border};"">
          <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0"">
            <tr>
              <td style=""font-size:13px;color:{TextMuted};"">
                {label}
              </td>
              <td align=""right"" style=""font-size:14px;color:{TextPrimary};font-weight:600;"">
                {value}
              </td>
            </tr>
          </table>
        </td>
      </tr>";

    // ── Templates ──────────────────────────────────────────────────────────────

    public static string EmailConfirmation(string name, string confirmUrl) => Layout(
        "Confirme seu e-mail — ShopBR",
        $"Olá {name}, confirme seu e-mail para ativar sua conta no ShopBR.",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#fff5f3;border-radius:50%;padding:18px;
                    border:1.5px solid #ffd5cc;"">
          <div style=""font-size:32px;line-height:1;"">✉️</div>
        </div>
      </div>

      <!-- Title -->
      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;line-height:1.25;"">
        Confirme seu e-mail
      </h1>

      <!-- Subtitle -->
      <p style=""margin:0 0 28px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Olá, <strong style=""color:{TextPrimary};"">{name}</strong> — bem-vindo ao ShopBR!<br/>
        Clique no botão abaixo para ativar sua conta.
      </p>

      <!-- CTA -->
      <div style=""text-align:center;margin-bottom:28px;"">
        {Button(confirmUrl, "Confirmar E-mail")}
      </div>

      <!-- Info -->
      {InfoBox($"&#128274;&nbsp; Este link expira em <strong>24 horas</strong>. Se você não criou uma conta no ShopBR, ignore este e-mail com segurança.")}

      {Divider()}

      <!-- URL fallback -->
      <p style=""margin:0 0 6px;font-size:12px;color:{TextMuted};"">
        Botão não funcionando? Copie e cole no navegador:
      </p>
      <p style=""margin:0;font-size:11px;color:#aaa;word-break:break-all;
                 background:{BgSubtle};border-radius:6px;padding:10px 12px;
                 font-family:'Courier New',monospace;border:1px solid {Border};"">
        {confirmUrl}
      </p>");

    public static string Welcome(string name) => Layout(
        "Bem-vindo ao ShopBR!",
        $"Olá {name}, sua conta está pronta. Explore as melhores ofertas!",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#fff5f3;border-radius:50%;padding:18px;
                    border:1.5px solid #ffd5cc;"">
          <div style=""font-size:32px;line-height:1;"">🎉</div>
        </div>
      </div>

      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;"">
        Bem-vindo, {name}!
      </h1>

      <p style=""margin:0 0 28px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Sua conta foi criada com sucesso.<br/>
        Explore nossos produtos e aproveite as melhores ofertas.
      </p>

      <div style=""text-align:center;margin-bottom:28px;"">
        {Button("https://novastore-smoky.vercel.app/products", "Explorar Produtos")}
      </div>

      {InfoBox("Qualquer dúvida estamos à disposição. Boas compras!")}");

    public static string OrderConfirmation(string name, string orderNumber, decimal total) => Layout(
        $"Pedido {orderNumber} confirmado!",
        $"Seu pedido {orderNumber} foi recebido e está sendo processado.",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#f0fdf4;border-radius:50%;padding:18px;
                    border:1.5px solid #bbf7d0;"">
          <div style=""font-size:32px;line-height:1;"">✅</div>
        </div>
      </div>

      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;"">
        Pedido confirmado!
      </h1>

      <p style=""margin:0 0 28px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Olá, <strong style=""color:{TextPrimary};"">{name}</strong>.<br/>
        Recebemos seu pedido e ele está sendo processado.
      </p>

      <!-- Order Details -->
      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""border-radius:10px;border:1px solid {Border};overflow:hidden;margin-bottom:28px;"">
        {DetailRow("Número do pedido", $"#{orderNumber}")}
        {DetailRow("Total", $"R$ {total:N2}")}
      </table>

      <div style=""text-align:center;margin-bottom:28px;"">
        {Button("https://novastore-smoky.vercel.app/orders", "Acompanhar Pedido")}
      </div>

      {InfoBox("Você receberá atualizações sobre seu pedido por e-mail.")}");

    public static string OrderStatusChanged(string name, string orderNumber, string statusLabel) => Layout(
        $"Pedido {orderNumber} atualizado",
        $"Seu pedido {orderNumber} foi atualizado para: {statusLabel}.",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#fffbeb;border-radius:50%;padding:18px;
                    border:1.5px solid #fde68a;"">
          <div style=""font-size:32px;line-height:1;"">📦</div>
        </div>
      </div>

      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;"">
        Pedido atualizado
      </h1>

      <p style=""margin:0 0 20px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Olá, <strong style=""color:{TextPrimary};"">{name}</strong>.<br/>
        Seu pedido <strong>#{orderNumber}</strong> foi atualizado.
      </p>

      <!-- Status Badge -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <span style=""display:inline-block;background:{Primary};color:#fff;
                      padding:8px 22px;border-radius:20px;font-size:14px;font-weight:700;
                      letter-spacing:0.2px;"">
          {statusLabel}
        </span>
      </div>

      <div style=""text-align:center;margin-bottom:28px;"">
        {Button("https://novastore-smoky.vercel.app/orders", "Ver Detalhes")}
      </div>");

    public static string PaymentConfirmed(string name, string orderNumber, decimal total) => Layout(
        $"Pagamento aprovado — {orderNumber}",
        $"O pagamento do pedido {orderNumber} foi aprovado. Valor: R$ {total:N2}.",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#f0fdf4;border-radius:50%;padding:18px;
                    border:1.5px solid #bbf7d0;"">
          <div style=""font-size:32px;line-height:1;"">💳</div>
        </div>
      </div>

      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;"">
        Pagamento aprovado!
      </h1>

      <p style=""margin:0 0 28px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Olá, <strong style=""color:{TextPrimary};"">{name}</strong>.<br/>
        O pagamento do seu pedido foi confirmado com sucesso.
      </p>

      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""border-radius:10px;border:1px solid {Border};overflow:hidden;margin-bottom:28px;"">
        {DetailRow("Número do pedido", $"#{orderNumber}")}
        {DetailRow("Valor pago", $"R$ {total:N2}")}
        {DetailRow("Status", "<span style='color:#16a34a;font-weight:700;'>Aprovado</span>")}
      </table>

      <div style=""text-align:center;margin-bottom:28px;"">
        {Button("https://novastore-smoky.vercel.app/orders", "Acompanhar Entrega")}
      </div>

      {InfoBox("Seu pedido está sendo preparado para envio. Você receberá atualizações em breve.")}");

    public static string PasswordReset(string name, string resetUrl) => Layout(
        "Recuperação de senha — ShopBR",
        "Clique no botão abaixo para redefinir sua senha. O link expira em 1 hora.",
        $@"
      <!-- Icon -->
      <div style=""text-align:center;margin-bottom:28px;"">
        <div style=""display:inline-block;background:#fafaf8;border-radius:50%;padding:18px;
                    border:1.5px solid {Border};"">
          <div style=""font-size:32px;line-height:1;"">🔒</div>
        </div>
      </div>

      <h1 style=""margin:0 0 12px;font-size:24px;font-weight:800;color:{TextPrimary};
                  letter-spacing:-0.5px;text-align:center;"">
        Redefinição de senha
      </h1>

      <p style=""margin:0 0 28px;font-size:15px;color:{TextBody};line-height:1.65;text-align:center;"">
        Olá, <strong style=""color:{TextPrimary};"">{name}</strong>.<br/>
        Clique no botão abaixo para criar uma nova senha.<br/>
        <span style=""font-size:13px;color:{TextMuted};"">Este link expira em <strong>1 hora</strong>.</span>
      </p>

      {Button(resetUrl, "Redefinir senha")}

      {InfoBox("Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanece a mesma.")}");

    public static string ContactMessage(string senderName, string senderEmail, string subject, string message) => Layout(
        $"[Contato] {subject}",
        $"Nova mensagem de {senderName} via formulário de contato.",
        $@"
      <h1 style=""margin:0 0 20px;font-size:22px;font-weight:800;color:{TextPrimary};letter-spacing:-0.5px;"">
        Nova mensagem de contato
      </h1>

      <table width=""100%"" cellpadding=""0"" cellspacing=""0"" border=""0""
             style=""border-radius:10px;border:1px solid {Border};overflow:hidden;margin-bottom:24px;"">
        {DetailRow("Nome", senderName)}
        {DetailRow("E-mail", $"<a href='mailto:{senderEmail}' style='color:{Primary};text-decoration:none;'>{senderEmail}</a>")}
        {DetailRow("Assunto", subject)}
      </table>

      <p style=""margin:0 0 10px;font-size:13px;font-weight:600;color:{TextMuted};
                 text-transform:uppercase;letter-spacing:0.5px;"">
        Mensagem
      </p>
      <div style=""background:{BgSubtle};border-left:3px solid {Primary};border-radius:0 8px 8px 0;
                   padding:16px 20px;margin-bottom:24px;"">
        <p style=""margin:0;font-size:14px;color:{TextBody};line-height:1.7;white-space:pre-wrap;"">{message}</p>
      </div>

      <p style=""margin:0;font-size:13px;color:{TextMuted};"">
        Responder para:
        <a href=""mailto:{senderEmail}"" style=""color:{Primary};text-decoration:none;font-weight:600;"">{senderEmail}</a>
      </p>");
}

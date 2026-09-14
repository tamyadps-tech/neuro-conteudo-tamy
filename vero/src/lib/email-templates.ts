function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
});

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b2421;">
  <div style="max-width:560px;margin:0 auto;background-color:#ffffff;">
    <div style="background:linear-gradient(135deg,#0f6e64 0%,#0a4f48 100%);color:#fbf8f3;padding:32px 24px;text-align:center;">
      <p style="margin:0;font-size:20px;font-weight:700;">Vero</p>
    </div>
    <div style="padding:28px 24px;">
      ${bodyHtml}
    </div>
    <div style="padding:20px 24px;border-top:1px solid #e4dccc;text-align:center;">
      <p style="margin:0;font-size:12px;color:#5b6763;">
        Vero · <a href="mailto:suporte@vero.app" style="color:#0f6e64;">suporte@vero.app</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#0f6e64;color:#fbf8f3;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">${escapeHtml(label)}</a>`;
}

export function bookingConfirmationEmail({
  clientName,
  professionalName,
  scheduledAt,
  progressUrl,
}: {
  clientName: string;
  professionalName: string;
  scheduledAt: string;
  progressUrl: string;
}): { subject: string; html: string } {
  const when = dateFormatter.format(new Date(scheduledAt));
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(clientName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Sua sessão com <strong>${escapeHtml(professionalName)}</strong> foi agendada para:
    </p>
    <p style="font-size:18px;font-weight:600;margin:16px 0;">${escapeHtml(when)}</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Guarde o link abaixo — é como você acompanha o progresso das suas sessões, sem precisar de senha.
    </p>
    <p style="margin:24px 0;">${button(progressUrl, "Ver meu progresso")}</p>
  `;
  return {
    subject: `Sessão confirmada com ${professionalName}`,
    html: shell("Sessão confirmada — Vero", body),
  };
}

export function sessionSummaryEmail({
  clientName,
  professionalName,
  topics,
  homework,
  nextSessionAt,
  progressUrl,
}: {
  clientName: string;
  professionalName: string;
  topics: string[];
  homework: string | null;
  nextSessionAt: string | null;
  progressUrl: string;
}): { subject: string; html: string } {
  const topicsHtml =
    topics.length > 0
      ? `<div style="margin:16px 0;">
          <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f6e64;margin:0 0 8px;">Tópicos abordados</p>
          ${topics
            .map(
              (t) =>
                `<span style="display:inline-block;background:#e4f2ef;color:#0a4f48;border-radius:999px;padding:4px 10px;font-size:12px;margin:0 4px 4px 0;">${escapeHtml(t)}</span>`
            )
            .join("")}
        </div>`
      : "";

  const homeworkHtml = homework
    ? `<div style="margin:16px 0;background:#fff8e1;border-left:4px solid #fbc02d;padding:12px 16px;border-radius:6px;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#f57c00;margin:0 0 6px;">Tarefa até a próxima sessão</p>
        <p style="font-size:14px;margin:0;color:#1b2421;">${escapeHtml(homework)}</p>
      </div>`
    : "";

  const nextSessionHtml = nextSessionAt
    ? `<div style="margin:16px 0;background:#e4f2ef;border-left:4px solid #0f6e64;padding:12px 16px;border-radius:6px;">
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;color:#0f6e64;margin:0 0 6px;">Próxima sessão</p>
        <p style="font-size:14px;margin:0;color:#1b2421;">${escapeHtml(dateFormatter.format(new Date(nextSessionAt)))}</p>
      </div>`
    : "";

  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(clientName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Aqui está o resumo da sua sessão com <strong>${escapeHtml(professionalName)}</strong>.
    </p>
    ${topicsHtml}
    ${homeworkHtml}
    ${nextSessionHtml}
    <p style="margin:24px 0;">${button(progressUrl, "Ver histórico completo")}</p>
  `;
  return {
    subject: `Resumo da sua sessão com ${professionalName}`,
    html: shell("Resumo da sessão — Vero", body),
  };
}

export function professionalApprovedEmail({
  professionalName,
  dashboardUrl,
}: {
  professionalName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(professionalName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Boas notícias: sua candidatura foi <strong>aprovada</strong> e seu
      perfil já está visível na Vero.
    </p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Use o link abaixo pra configurar sua disponibilidade e acompanhar
      suas sessões — sem senha, guarde-o num lugar seguro.
    </p>
    <p style="margin:24px 0;">${button(dashboardUrl, "Acessar meu painel")}</p>
  `;
  return {
    subject: "Sua candidatura foi aprovada — Vero",
    html: shell("Candidatura aprovada — Vero", body),
  };
}

export function professionalRejectedEmail({
  professionalName,
  notes,
}: {
  professionalName: string;
  notes: string | null;
}): { subject: string; html: string } {
  const notesHtml = notes
    ? `<p style="font-size:14px;line-height:1.6;color:#5b6763;"><strong>Observação:</strong> ${escapeHtml(notes)}</p>`
    : "";
  const body = `
    <p style="font-size:16px;">Olá, <strong>${escapeHtml(professionalName)}</strong>,</p>
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Depois de revisar sua candidatura, não conseguimos aprová-la nesta
      etapa do vetting da Vero.
    </p>
    ${notesHtml}
    <p style="font-size:14px;line-height:1.6;color:#5b6763;">
      Dúvidas? Responda este email ou escreva pra
      <a href="mailto:suporte@vero.app" style="color:#0f6e64;">suporte@vero.app</a>.
    </p>
  `;
  return {
    subject: "Sobre sua candidatura — Vero",
    html: shell("Sobre sua candidatura — Vero", body),
  };
}

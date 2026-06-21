export const EMAIL_CAMPAIGN_STATUS_LABELS = {

    DRAFT: "Borrador",

    SCHEDULED: "Programada",

    SENDING: "Enviando",

    SENT: "Enviada",

    FAILED: "Fallida",

    ARCHIVED: "Archivada",

};



export const EMAIL_CAMPAIGN_AUDIENCE_LABELS = {

    ALL_USERS: "Todos los usuarios",

    CONFIRMED_EMAIL: "Email confirmado",

    PENDING_EMAIL: "Email pendiente",

    ACTIVE_SUBSCRIPTION: "Suscripción activa",

    EXPIRED_SUBSCRIPTION: "Suscripción vencida",

    NEWSLETTER_SUBSCRIBERS: "Newsletter",

    SUSPENDED_BUSINESS_ADMINS: "Negocios suspendidos (sin plan)",

    BUSINESS_ADMINS_PLAN_EXPIRING_5D: "Plan vence en 5 días",

    BUSINESS_ADMINS_PLAN_EXPIRING_TODAY: "Plan vence hoy",

    PLATFORM_PROSPECTS: "Prospectos (no clientes)",

    CUSTOM_SEGMENT: "Segmento personalizado",

};



export const EMAIL_CAMPAIGN_STATUS_STYLES = {

    DRAFT: "border-slate-200 bg-slate-100 text-slate-600",

    SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",

    SENDING: "border-amber-200 bg-amber-50 text-amber-700",

    SENT: "border-primary/20 bg-primary/10 text-primary",

    FAILED: "border-red-200 bg-red-50 text-red-700",

    ARCHIVED: "border-slate-200 bg-slate-50 text-slate-500",

};



export function audienceLabel(type) {

    return EMAIL_CAMPAIGN_AUDIENCE_LABELS[type] ?? type ?? "—";

}



export function statusLabel(status) {

    return EMAIL_CAMPAIGN_STATUS_LABELS[status] ?? status ?? "—";

}



const DEFAULT_AUTO_RUN_DAY = 5;

const DEFAULT_AUTO_RUN_HOUR = 9;

const SCHEDULE_TIMEZONE = "America/Santiago";



export function isAutomatedCampaign(campaign) {

    return ["MONTHLY", "DAILY", "WEEKLY"].includes(campaign?.scheduleFrequency);

}



const WEEKDAY_LABELS = {
    0: "domingo",
    1: "lunes",
    2: "martes",
    3: "miércoles",
    4: "jueves",
    5: "viernes",
    6: "sábado",
};

export function formatWeeklyRunDays(weekdays = [1, 3, 0]) {
    return weekdays.map((d) => WEEKDAY_LABELS[d] ?? d).join(", ");
}



export function getCampaignAutoRunDay(campaign) {

    const fromParams = Number(campaign?.audienceParams?.autoRunDay);

    if (fromParams >= 1 && fromParams <= 28) return fromParams;

    return DEFAULT_AUTO_RUN_DAY;

}



export function getCampaignAutoRunHour() {

    return DEFAULT_AUTO_RUN_HOUR;

}



/** Texto corto para tabla: "Automática" | "Manual" */

export function scheduleModeLabel(campaign) {

    return isAutomatedCampaign(campaign) ? "Automática" : "Manual";

}



/** Descripción completa de cuándo se ejecuta */

export function scheduleDetailLabel(campaign) {

    if (!isAutomatedCampaign(campaign)) {

        return "Solo se envía manualmente desde el panel admin.";

    }

    const hour = getCampaignAutoRunHour();

    const hourLabel = `${String(hour).padStart(2, "0")}:00`;



    if (campaign.scheduleFrequency === "DAILY") {

        const daysBefore = Number(campaign?.audienceParams?.daysBeforeExpiry);

        const trigger =

            daysBefore === 5

                ? "cuando el plan vence en 5 días"

                : daysBefore === 0

                  ? "cuando el plan vence hoy"

                  : "según audiencia del día";

        return `Todos los días · ${hourLabel} (${SCHEDULE_TIMEZONE}) · ${trigger}`;

    }

    if (campaign.scheduleFrequency === "WEEKLY") {
        const weekdays = campaign?.audienceParams?.autoRunWeekdays ?? [1, 3, 0];
        const dayList = formatWeeklyRunDays(weekdays);
        const prospectNote =
            campaign?.audienceType === "PLATFORM_PROSPECTS"
                ? " · máx. 1 correo/mes por prospecto · 3 variantes de mensaje"
                : "";
        return `${dayList} · ${hourLabel} (${SCHEDULE_TIMEZONE})${prospectNote}`;
    }



    const day = getCampaignAutoRunDay(campaign);

    return `Día ${day} de cada mes · ${hourLabel} (${SCHEDULE_TIMEZONE})`;

}



export const SCHEDULE_MODE_STYLES = {

    automated: "border-secondary/25 bg-secondary/10 text-secondary",

    manual: "border-slate-200 bg-slate-100 text-slate-600",

};

export function formatCampaignSender(campaign) {
    if (!campaign?.senderEmail) return null;
    const name = campaign.senderName?.trim() || "AppsFly";
    return `${name} <${campaign.senderEmail}>`;
}


"""Brevo transactional email helper.

Templates are inlined HTML — the spec forbids using Brevo's drag-and-drop
templates because they're hard to keep in sync with the brand. Send
calls are best-effort: if Brevo is misconfigured, log and continue
rather than failing the user-facing request.
"""

from __future__ import annotations

import logging
from html import escape
from typing import TYPE_CHECKING

from app.config import get_settings

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)
settings = get_settings()


def _shell(title: str, body_html: str) -> str:
    """Wrap body fragment in the Aspira-branded email shell."""
    return f"""\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{escape(title)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f4f1ec; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1a1d28;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:560px; width:100%;">
            <tr>
              <td style="background:#1c2440; padding:24px 28px; border-radius:12px 12px 0 0;">
                <span style="font-family:Georgia, serif; font-size:24px; color:#f4f1ec; letter-spacing:-0.5px;">
                  Aspira
                </span>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff; padding:32px 28px; border-radius:0 0 12px 12px;">
                {body_html}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 4px; font-size:12px; color:#7d818d;">
                Sent via Aspira, a public service platform.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def _send(to_email: str, to_name: str, subject: str, html: str) -> None:
    """Best-effort send. Returns silently if Brevo isn't configured."""
    if not settings.BREVO_API_KEY:
        logger.info("Brevo not configured; skipping email '%s' to %s", subject, to_email)
        return
    try:
        import sib_api_v3_sdk
        from sib_api_v3_sdk.rest import ApiException
    except ImportError:
        logger.warning("sib_api_v3_sdk not installed; skipping email")
        return

    config = sib_api_v3_sdk.Configuration()
    config.api_key["api-key"] = settings.BREVO_API_KEY
    api = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(config))
    payload = sib_api_v3_sdk.SendSmtpEmail(
        sender={"name": settings.FROM_NAME, "email": settings.FROM_EMAIL},
        to=[{"email": to_email, "name": to_name}],
        subject=subject,
        html_content=html,
    )
    try:
        api.send_transac_email(payload)
    except ApiException:
        logger.exception("Brevo send failed for '%s' to %s", subject, to_email)


def send_welcome(to_email: str | None, to_name: str, citizen_id: int) -> None:
    if not to_email:
        return
    citizen_label = f"#C-{citizen_id:05d}"
    body = f"""\
        <h1 style="font-family:Georgia, serif; font-size:24px; margin:0 0 12px;">
          Welcome to Aspira, {escape(to_name)}.
        </h1>
        <p style="font-size:14px; line-height:1.6; color:#3b3f4d;">
          Your citizen account is active. Your ID is
          <strong style="font-family:'JetBrains Mono', monospace;">{citizen_label}</strong>.
        </p>
        <p style="font-size:14px; line-height:1.6; color:#3b3f4d;">
          Submit feedback whenever you encounter an issue with a public service.
          Track the response from the relevant authority right inside Aspira.
        </p>"""
    _send(to_email, to_name, "Welcome to Aspira", _shell("Welcome to Aspira", body))


def send_feedback_confirmation(
    to_email: str | None,
    to_name: str,
    feedback_id: int,
    service_name: str,
) -> None:
    if not to_email:
        return
    label = f"#FB-{feedback_id:05d}"
    body = f"""\
        <h1 style="font-family:Georgia, serif; font-size:24px; margin:0 0 12px;">
          Your feedback was received.
        </h1>
        <p style="font-size:14px; line-height:1.6; color:#3b3f4d;">
          Reference: <strong style="font-family:'JetBrains Mono', monospace;">{label}</strong>
          ({escape(service_name)}).
        </p>
        <p style="font-size:14px; line-height:1.6; color:#3b3f4d;">
          An administrator will review and respond. We will email you again on
          every status change.
        </p>"""
    _send(
        to_email,
        to_name,
        f"Feedback received: {label}",
        _shell("Feedback received", body),
    )


def send_status_update(
    to_email: str | None,
    to_name: str,
    feedback_id: int,
    new_status: str,
    admin_comment: str,
) -> None:
    if not to_email:
        return
    label = f"#FB-{feedback_id:05d}"
    pretty_status = new_status.replace("_", " ").title()
    body = f"""\
        <h1 style="font-family:Georgia, serif; font-size:24px; margin:0 0 12px;">
          Status updated: {escape(pretty_status)}
        </h1>
        <p style="font-size:14px; line-height:1.6; color:#3b3f4d;">
          Your feedback <strong style="font-family:'JetBrains Mono', monospace;">{label}</strong>
          has been updated.
        </p>
        <blockquote style="margin:16px 0; padding:12px 16px; border-left:3px solid #d4ad58; background:#faf6ed; font-size:14px; color:#3b3f4d;">
          {escape(admin_comment)}
        </blockquote>"""
    _send(
        to_email,
        to_name,
        f"Update on your feedback {label}: {pretty_status}",
        _shell("Status update", body),
    )


__all__ = [
    "send_feedback_confirmation",
    "send_status_update",
    "send_welcome",
]

import { Resend } from 'resend'

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    _resend = new Resend(key)
  }
  return _resend
}

function getFromEmail(): string {
  const email = process.env.RESEND_FROM_EMAIL
  if (!email) throw new Error('RESEND_FROM_EMAIL environment variable is required')
  return email
}

export async function sendEmail(params: {
  to: string
  subject: string
  react: React.ReactElement
  replyTo?: string
  tags?: { name: string; value: string }[]
}) {
  return getResend().emails.send({
    from: getFromEmail(),
    ...params,
  })
}

export { getResend as resend }

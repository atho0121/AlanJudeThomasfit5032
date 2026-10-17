import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret, defineString } from 'firebase-functions/params'
import sgMail from '@sendgrid/mail'

initializeApp()

const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY')
const SENDER_EMAIL = defineString('SENDER_EMAIL') // must be a verified SendGrid sender

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FILENAME_RE = /^[\w.\- ]{1,100}$/            // CHANGED: safe filenames only
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/         // CHANGED: valid base64 only
const MAX_RECIPIENTS = 50
const MAX_ATTACHMENT_BASE64 = 5_000_000
const ALLOWED_TYPES = ['application/pdf', 'text/csv']

export const sendEmail = onCall({ secrets: [SENDGRID_API_KEY] }, async request => {
  // 1. Must be signed in.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in.')
  }

  // 2. Must be an admin (checked server-side, never trust the client).
  const profile = await getFirestore().doc(`users/${request.auth.uid}`).get()
  if (profile.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can send email.')
  }

  // 3. Validate input.
  const { recipients, subject, message, attachment } = request.data ?? {}

  if (!Array.isArray(recipients) || recipients.length === 0) {
    throw new HttpsError('invalid-argument', 'Select at least one recipient.')
  }
  if (recipients.length > MAX_RECIPIENTS) {
    throw new HttpsError('invalid-argument', `Maximum ${MAX_RECIPIENTS} recipients per send.`)
  }
  const list = [...new Set(recipients.map(r => String(r).trim().toLowerCase()))]
  if (!list.every(email => EMAIL_RE.test(email))) {
    throw new HttpsError('invalid-argument', 'One or more email addresses are invalid.')
  }
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 150) {
    throw new HttpsError('invalid-argument', 'Subject is required (max 150 characters).')
  }
  if (typeof message !== 'string' || !message.trim() || message.length > 5000) {
    throw new HttpsError('invalid-argument', 'Message is required (max 5000 characters).')
  }

  const msg = {
    to: list, // sendMultiple sends each person their own copy (no shared To line)
    from: { email: SENDER_EMAIL.value(), name: 'Canopy Collective' }, // CHANGED: sender name
    subject: subject.trim(),
    text: message
  }

  if (attachment) {
    const { filename, type, content } = attachment
    if (
      typeof filename !== 'string' || !FILENAME_RE.test(filename) ||   // CHANGED
      !ALLOWED_TYPES.includes(type) ||
      typeof content !== 'string' || content.length > MAX_ATTACHMENT_BASE64 ||
      !BASE64_RE.test(content)                                         // CHANGED
    ) {
      throw new HttpsError('invalid-argument', 'Invalid attachment.')
    }
    msg.attachments = [{ content, filename, type, disposition: 'attachment' }]
  }

  // 4. Send.
  try {
    sgMail.setApiKey(SENDGRID_API_KEY.value())
    await sgMail.sendMultiple(msg)
  } catch (err) {
    console.error('SendGrid error', err.response?.body ?? err)
    throw new HttpsError('internal', 'The email provider rejected the request.')
  }

  return { sent: list.length }
})
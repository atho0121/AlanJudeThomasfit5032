<script setup>
import { ref } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'
import { buildPDF, pdfToBase64, buildCSV, textToBase64 } from '../utils/export'

const props = defineProps({
  recipients: { type: Array, required: true }, // [{ name, email }]
  events: { type: Array, required: true },
  eventColumns: { type: Array, required: true }
})

const subject = ref('')
const message = ref('')
const attachmentChoice = ref('none')
const sending = ref(false)
const status = ref('')
const error = ref('')

const sendEmail = httpsCallable(functions, 'sendEmail')

// CHANGED: async, because buildPDF is async
async function buildAttachment() {
  if (attachmentChoice.value === 'events-pdf') {
    const doc = await buildPDF('Canopy Collective events', props.eventColumns, props.events)
    return { filename: 'canopy-events.pdf', type: 'application/pdf', content: await pdfToBase64(doc) }
  }
  if (attachmentChoice.value === 'events-csv') {
    return {
      filename: 'canopy-events.csv',
      type: 'text/csv',
      content: textToBase64('\uFEFF' + buildCSV(props.eventColumns, props.events))
    }
  }
  return null
}

async function handleSend() {
  status.value = ''
  error.value = ''
  if (props.recipients.length === 0) {
    error.value = 'Select at least one user in the users table first.'
    return
  }
  if (!subject.value.trim() || !message.value.trim()) {
    error.value = 'Subject and message are required.'
    return
  }
  sending.value = true
  try {
    const result = await sendEmail({
      recipients: props.recipients.map(r => r.email),
      subject: subject.value,
      message: message.value,
      attachment: await buildAttachment() // CHANGED: await
    })
    // CHANGED: accepted for delivery, not confirmed delivered
    status.value = `${result.data.sent} email(s) queued for delivery.`
    subject.value = ''
    message.value = ''
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Sending failed.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="bulk-email" @submit.prevent="handleSend">
    <h2>Send email to selected users</h2>
    <p>{{ recipients.length }} recipient(s) selected in the users table.</p>

    <div class="form-group">
      <label for="email-subject">Subject</label>
      <input id="email-subject" v-model="subject" type="text" maxlength="150" required />
    </div>

    <div class="form-group">
      <label for="email-message">Message</label>
      <textarea id="email-message" v-model="message" rows="5" maxlength="5000" required></textarea>
    </div>

    <div class="form-group">
      <label for="email-attachment">Attachment</label>
      <select id="email-attachment" v-model="attachmentChoice">
        <option value="none">No attachment</option>
        <option value="events-pdf">Events list (PDF)</option>
        <option value="events-csv">Events list (CSV)</option>
      </select>
    </div>

    <button type="submit" class="primary-button" :disabled="sending">
      {{ sending ? 'Sending...' : 'Send email' }}
    </button>

    <p v-if="status" role="status">{{ status }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
  </form>
</template>

<style scoped>
.bulk-email { max-width: 640px; margin-top: 24px; }
</style>
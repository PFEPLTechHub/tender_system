import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') })

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tender_details ORDER BY basics_id DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:basicsId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tender_details WHERE basics_id=?', [req.params.basicsId])
    res.json(rows[0] || null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/:basicsId', async (req, res) => {
  try {
    const id = req.params.basicsId
    const payload = req.body || {}
    // Map camelCase keys from UI to DB column names
    const map = {
      uniqueTenderNo: 'unique_tender_no',
      tenderId: 'tender_id_display',
      // projectName: 'name_of_work', // This column doesn't exist in tender_details
      // department: 'department_authority', // This column doesn't exist in tender_details
      formOfTenderDocumentsFee: 'form_of_tender_documents_fee',
      formOfEmd: 'form_of_emd',
      bidOpeningDate: 'bid_opening_date',
      physicallyNeededDocuments: 'physically_needed_documents',
      pfeplJvShare: 'pfepl_jv_share_percent',
      noOfBidsSubmitted: 'number_of_bids_submitted',
      bidsSubmitted: 'bids_submitted',
      // typeOfProject: 'type_of_project', // This column doesn't exist in tender_details
      costOfWork: 'cost_of_work_cr',
      tenderDocumentsFee: 'tender_document_fee',
      emdAmount: 'emd_amount_cr',
      emdBgFdrNo: 'emd_bg_fdr_no',
      emdBgFdrIssuedInFavorOf: 'emd_bg_fdr_issued_in_favor_of',
      emdBgFdrStatusDate: 'emd_bg_fdr_status_date',
      emdBgFdrDueDate: 'emd_bg_fdr_due_date',
      preBidMeetingDate: 'pre_bid_meeting_date',
      physicalDocumentSubmissionDueDate: 'physical_doc_submission_due',
      selfJvType: 'self_jv_type',
      bidSubmissionDate: 'bid_submission_date',
      totalExpensesIncurred: 'total_expenses_against_bid',
      completionPeriodMonths: 'completion_period_months',
      remarks: 'remarks',
      status: 'status_'
    }
    const dbPayload = {}
    Object.keys(payload || {}).forEach(k => {
      if (map[k]) {
        // Handle null/empty values - convert empty strings to null for database
        const value = payload[k]
        dbPayload[map[k]] = (value === '' || value === null || value === undefined) ? null : value
      }
    })
    const [exists] = await pool.query('SELECT 1 FROM tender_details WHERE basics_id=? LIMIT 1', [id])
    if (exists.length) {
      const cols = Object.keys(dbPayload)
      const set = cols.map(c => `${c}=?`).join(', ')
      const values = cols.map(c => dbPayload[c])
      await pool.query(`UPDATE tender_details SET ${set} WHERE basics_id=?`, [...values, id])
    } else {
      const cols = Object.keys(dbPayload)
      const placeholders = cols.map(()=>'?').join(', ')
      await pool.query(`INSERT INTO tender_details (basics_id, ${cols.join(', ')}) VALUES (?, ${placeholders})`, [id, ...cols.map(c=>dbPayload[c])])
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/:basicsId/attachments', upload.array('files'), async (req, res) => {
  try {
    const id = req.params.basicsId
    const files = req.files || []
    const inserts = files.map(f => [id, f.originalname, `/uploads/${f.filename}`, f.mimetype])
    if (inserts.length) {
      await pool.query(
        'INSERT INTO tender_attachments (basics_id, file_name, file_url, mime_type) VALUES ?',[inserts]
      )
    }
    res.json({ uploaded: files.length, files: files.map(f=>({name:f.originalname, url:`/uploads/${f.filename}`, type:f.mimetype})) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router



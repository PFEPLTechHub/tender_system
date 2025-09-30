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
    const [rows] = await pool.query('SELECT * FROM project_details ORDER BY basics_id DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:basicsId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM project_details WHERE basics_id=?', [req.params.basicsId])
    res.json(rows[0] || null)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/:basicsId', async (req, res) => {
  try {
    const id = req.params.basicsId
    const payload = req.body || {}
    console.log('Project POST request - ID:', id, 'Payload:', payload)
    // Map camelCase keys from UI to DB column names
    const map = {
      projectNo: 'project_no',
      dateOfLoa: 'date_of_loa',
      additionalSecurityDeposit: 'additional_security_deposit',
      asdActualReturnDate: 'asd_actual_return_date',
      asdPlannedReturnDate: 'asd_planned_return_date',
      psdBgFdrActualDate: 'psd_bg_fdr_actual_date',
      asdBgFdrNo: 'asd_bg_fdr_no',
      nameOfWork: 'name_of_work',
      dateOfWorkOrder: 'date_of_work_order',
      formOfAsd: 'form_of_asd',
      asdBgFdrValidity: 'asd_bg_fdr_validity',
      asdBgFdrStatus: 'asd_bg_fdr_status',
      performanceSecurityDeposit: 'performance_security_deposit',
      psdBgFdrNo: 'psd_bg_fdr_no',
      asdBgFdrIssuedInFavorOf: 'asd_bg_fdr_issued_in_favor_of',
      psdBgFdrReturnDate: 'psd_bg_fdr_return_date',
      formOfPsd: 'form_of_psd',
      psdBgFdrValidity: 'psd_bg_fdr_validity',
      psdBgFdrStatus: 'psd_bg_fdr_status',
      startingDate: 'starting_date',
      completionDate: 'completion_date',
      workOrderValue: 'work_order_value',
      psdBgFdrIssuedInFavorOf: 'psd_bg_fdr_issued_in_favor_of',
      durationOfProject: 'duration_of_project_months',
      actualDateOfCompletion: 'actual_date_of_completion',
      dateOfAmendment: 'date_of_amendment',
      dlpEndDate: 'dlp_end_date',
      remarks: 'p_remark',
      workCompletionCertificateTaken: 'work_completion_certificate_taken',
      revisedWorkOrder: 'work_order_after_variation',
      defectsLiabilityPeriod: 'defects_liability_period_months'
    }
    const dbPayload = {}
    Object.keys(payload || {}).forEach(k => {
      if (map[k]) {
        // Handle null/empty values - convert empty strings to null for database
        const value = payload[k]
        dbPayload[map[k]] = (value === '' || value === null || value === undefined) ? null : value
      }
    })
    console.log('Mapped payload:', dbPayload)
    const [exists] = await pool.query('SELECT 1 FROM project_details WHERE basics_id=? LIMIT 1', [id])
    console.log('Existing record check:', exists.length > 0 ? 'UPDATE' : 'INSERT')
    if (exists.length) {
      const cols = Object.keys(dbPayload)
      const set = cols.map(c => `${c}=?`).join(', ')
      const values = cols.map(c => dbPayload[c])
      console.log('UPDATE query:', `UPDATE project_details SET ${set} WHERE basics_id=?`)
      console.log('UPDATE values:', [...values, id])
      await pool.query(`UPDATE project_details SET ${set} WHERE basics_id=?`, [...values, id])
    } else {
      const cols = Object.keys(dbPayload)
      const placeholders = cols.map(()=>'?').join(', ')
      console.log('INSERT query:', `INSERT INTO project_details (basics_id, ${cols.join(', ')}) VALUES (?, ${placeholders})`)
      console.log('INSERT values:', [id, ...cols.map(c=>dbPayload[c])])
      await pool.query(`INSERT INTO project_details (basics_id, ${cols.join(', ')}) VALUES (?, ${placeholders})`, [id, ...cols.map(c=>dbPayload[c])])
    }
    console.log('Database operation completed successfully')
    res.json({ ok: true })
  } catch (e) {
    console.error('Project save error:', e)
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
        'INSERT INTO project_attachments (basics_id, file_name, file_url, mime_type) VALUES ?',[inserts]
      )
    }
    res.json({ uploaded: files.length, files: files.map(f=>({name:f.originalname, url:`/uploads/${f.filename}`, type:f.mimetype})) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router
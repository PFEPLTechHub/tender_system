import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.post('/demo', async (_req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [basicResult] = await conn.query(
      `INSERT INTO basics_shared (project_work_name, internal_project_no, type_of_project, department_authority)
       VALUES (?, ?, ?, ?)`,
      ['Demo Project - System Check', 'DEMO-0001', 'Infrastructure', 'Demo Department']
    )
    const basicsId = basicResult.insertId

    await conn.query(
      `INSERT INTO tender_details (
        basics_id, unique_tender_no, tender_id_display, cost_of_work_cr, tender_document_fee,
        form_of_tender_documents_fee, form_of_emd, emd_amount_cr, emd_bg_fdr_no,
        emd_bg_fdr_issued_in_favor_of, emd_bg_fdr_status_date, emd_bg_fdr_due_date,
        pre_bid_meeting_date, physical_doc_submission_due, bid_opening_date, self_jv_type,
        physically_needed_documents, bid_submission_date, pfepl_jv_share_percent,
        total_expenses_against_bid, number_of_bids_submitted, remarks, bids_submitted, status_
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        basicsId, 'TND-DEMO-0001', 'DEMO-TND-1', 1.23, 1000,
        'ONLINE', 'BG', 0.05, 'EMD-DEMO-1',
        'Demo Authority', '2025-01-10', '2025-01-20',
        '2025-01-12', '2025-01-18', '2025-01-21', 'Self',
        'Docs list', '2025-01-18', 100,
        1000, 1, 'Demo tender seed', 'Yes', 'Bidding Pending'
      ]
    )

    await conn.query(
      `INSERT INTO project_details (
        basics_id, project_no, date_of_loa, psd_bg_fdr_validity, additional_security_deposit, psd_bg_fdr_status,
        asd_actual_return_date, starting_date, asd_planned_return_date, completion_date, psd_bg_fdr_actual_date,
        work_order_value, psd_bg_fdr_issued_in_favor_of, name_of_work, date_of_work_order, duration_of_project_months,
        actual_date_of_completion, date_of_amendment, asd_bg_fdr_validity, performance_security_deposit,
        work_completion_certificate_taken, psd_bg_fdr_no, work_order_after_variation, asd_bg_fdr_issued_in_favor_of,
        defects_liability_period_months, psd_bg_fdr_return_date, dlp_end_date, remarks, form_of_psd
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        basicsId, 'PRJ-DEMO-0001', '2025-01-05', '2025-12-31', 0.0, 'Not Returned',
        null, '2025-02-01', '2025-12-31', '2025-12-31', null,
        10.5, 'Demo Authority', 'Demo Project - System Check', '2025-01-06', 10,
        null, null, '2025-12-31', 0.0,
        'No', 'PSD-DEMO-1', 10.5, 'Demo Authority',
        6, null, null, 'Demo project seed', 'BG'
      ]
    )

    await conn.commit()
    res.json({ ok: true, basicsId })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ ok: false, error: e.message })
  } finally {
    conn.release()
  }
})

// Danger: wipe demo data (truncate child tables and basics)
router.post('/wipe-all', async (_req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.query('SET FOREIGN_KEY_CHECKS=0')
    await conn.query('TRUNCATE TABLE project_attachments')
    await conn.query('TRUNCATE TABLE project_details')
    await conn.query('TRUNCATE TABLE tender_details')
    await conn.query('TRUNCATE TABLE bidders')
    await conn.query('TRUNCATE TABLE bidder_details')
    await conn.query('TRUNCATE TABLE milestones')
    await conn.query('TRUNCATE TABLE extensions')
    await conn.query('TRUNCATE TABLE basics_shared')
    await conn.query('SET FOREIGN_KEY_CHECKS=1')
    await conn.commit()
    res.json({ ok: true })
  } catch (e) {
    await conn.rollback()
    res.status(500).json({ ok: false, error: e.message })
  } finally {
    conn.release()
  }
})

export default router



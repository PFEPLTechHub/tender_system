import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM basics_shared ORDER BY id DESC')
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    // Join basics with tender_details and project_details to get complete record
    const [rows] = await pool.query(`
      SELECT 
        b.*,
        t.unique_tender_no, t.tender_id_display, t.cost_of_work_cr,
        t.tender_document_fee, t.form_of_tender_documents_fee,
        t.emd_amount_cr, t.form_of_emd, t.emd_bg_fdr_no,
        t.emd_bg_fdr_issued_in_favor_of, t.emd_bg_fdr_status_date,
        t.emd_bg_fdr_due_date, t.pre_bid_meeting_date,
        t.physical_doc_submission_due, t.bid_opening_date,
        t.self_jv_type, t.physically_needed_documents,
        t.bid_submission_date, t.pfepl_jv_share_percent,
        t.total_expenses_against_bid, t.number_of_bids_submitted,
        t.completion_period_months, t.remarks, t.bids_submitted, t.status_,
        p.project_no, p.form_of_psd, p.date_of_loa,
        p.psd_bg_fdr_validity, p.additional_security_deposit,
        p.psd_bg_fdr_status, p.asd_actual_return_date,
        p.starting_date, p.asd_planned_return_date, p.completion_date,
        p.psd_bg_fdr_actual_date, p.work_order_value,
        p.psd_bg_fdr_issued_in_favor_of, p.date_of_work_order,
        p.duration_of_project_months, p.actual_date_of_completion,
        p.date_of_amendment, p.asd_bg_fdr_validity,
        p.performance_security_deposit, p.work_completion_certificate_taken,
        p.psd_bg_fdr_no, p.work_order_after_variation,
        p.asd_bg_fdr_issued_in_favor_of, p.defects_liability_period_months,
        p.psd_bg_fdr_return_date, p.dlp_end_date, p.remarks AS project_remarks
      FROM basics_shared b
      LEFT JOIN tender_details t ON t.basics_id = b.id
      LEFT JOIN project_details p ON p.basics_id = b.id
      WHERE b.id = ?
    `, [req.params.id])
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' })
    }
    
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const payload = req.body || {}
    
    // 1. Insert into basics_shared
    const [result] = await connection.query(
      'INSERT INTO basics_shared (project_work_name, internal_project_no, type_of_project, department_authority, year) VALUES (?,?,?,?,?)',
      [
        payload.project_work_name || null,
        payload.internal_project_no || null,
        payload.type_of_project || null,
        payload.department_authority || null,
        payload.year || null
      ]
    )
    
    const basicsId = result.insertId
    
    // 2. Insert tender_details if any tender data exists
    const hasTenderData = payload.unique_tender_no || payload.cost_of_work_cr || payload.emd_amount_cr
    if (hasTenderData) {
      await connection.query(
        `INSERT INTO tender_details (
          basics_id, unique_tender_no, tender_id_display, cost_of_work_cr,
          tender_document_fee, form_of_tender_documents_fee, emd_amount_cr,
          form_of_emd, emd_bg_fdr_no, emd_bg_fdr_issued_in_favor_of,
          emd_bg_fdr_status_date, emd_bg_fdr_due_date, pre_bid_meeting_date,
          physical_doc_submission_due, bid_opening_date, self_jv_type,
          physically_needed_documents, bid_submission_date, pfepl_jv_share_percent,
          total_expenses_against_bid, number_of_bids_submitted,
          completion_period_months, remarks, bids_submitted, status_
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          basicsId,
          payload.unique_tender_no || null,
          payload.tender_id_display || null,
          payload.cost_of_work_cr || null,
          payload.tender_document_fee || null,
          payload.form_of_tender_documents_fee || null,
          payload.emd_amount_cr || null,
          payload.form_of_emd || null,
          payload.emd_bg_fdr_no || null,
          payload.emd_bg_fdr_issued_in_favor_of || null,
          payload.emd_bg_fdr_status_date || null,
          payload.emd_bg_fdr_due_date || null,
          payload.pre_bid_meeting_date || null,
          payload.physical_doc_submission_due || null,
          payload.bid_opening_date || null,
          payload.self_jv_type || null,
          payload.physically_needed_documents || null,
          payload.bid_submission_date || null,
          payload.pfepl_jv_share_percent || null,
          payload.total_expenses_against_bid || null,
          payload.number_of_bids_submitted || null,
          payload.completion_period_months || null,
          payload.remarks || null,
          payload.bids_submitted || null,
          payload.status_ || null
        ]
      )
    }
    
    // 3. Insert project_details if any project data exists
    const hasProjectData = payload.project_no || payload.work_order_value || payload.starting_date
    if (hasProjectData) {
      await connection.query(
        `INSERT INTO project_details (
          basics_id, project_no, form_of_psd, date_of_loa,
          psd_bg_fdr_validity, additional_security_deposit, psd_bg_fdr_status,
          asd_actual_return_date, starting_date, asd_planned_return_date,
          completion_date, psd_bg_fdr_actual_date, work_order_value,
          psd_bg_fdr_issued_in_favor_of, date_of_work_order,
          duration_of_project_months, actual_date_of_completion,
          date_of_amendment, asd_bg_fdr_validity, performance_security_deposit,
          work_completion_certificate_taken, psd_bg_fdr_no,
          work_order_after_variation, asd_bg_fdr_issued_in_favor_of,
          defects_liability_period_months, psd_bg_fdr_return_date,
          dlp_end_date, remarks
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          basicsId,
          payload.project_no || null,
          payload.form_of_psd || null,
          payload.date_of_loa || null,
          payload.psd_bg_fdr_validity || null,
          payload.additional_security_deposit || null,
          payload.psd_bg_fdr_status || null,
          payload.asd_actual_return_date || null,
          payload.starting_date || null,
          payload.asd_planned_return_date || null,
          payload.completion_date || null,
          payload.psd_bg_fdr_actual_date || null,
          payload.work_order_value || null,
          payload.psd_bg_fdr_issued_in_favor_of || null,
          payload.date_of_work_order || null,
          payload.duration_of_project_months || null,
          payload.actual_date_of_completion || null,
          payload.date_of_amendment || null,
          payload.asd_bg_fdr_validity || null,
          payload.performance_security_deposit || null,
          payload.work_completion_certificate_taken || null,
          payload.psd_bg_fdr_no || null,
          payload.work_order_after_variation || null,
          payload.asd_bg_fdr_issued_in_favor_of || null,
          payload.defects_liability_period_months || null,
          payload.psd_bg_fdr_return_date || null,
          payload.dlp_end_date || null,
          payload.project_remarks || null
        ]
      )
    }
    
    await connection.commit()
    res.json({ id: basicsId, success: true })
  } catch (e) {
    await connection.rollback()
    console.error('POST /api/basics error:', e)
    res.status(500).json({ error: e.message })
  } finally {
    connection.release()
  }
})

router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    
    const id = req.params.id
    const payload = req.body || {}
    
    // 1. Update basics_shared
    const [basicResult] = await connection.query(
      'UPDATE basics_shared SET project_work_name=?, internal_project_no=?, type_of_project=?, department_authority=?, year=? WHERE id=?',
      [
        payload.project_work_name || null,
        payload.internal_project_no || null,
        payload.type_of_project || null,
        payload.department_authority || null,
        payload.year || null,
        id
      ]
    )
    
    if (basicResult.affectedRows === 0) {
      throw new Error(`No record found with id ${id}`)
    }
    
    // 2. Update or insert tender_details
    const [tenderExists] = await connection.query('SELECT 1 FROM tender_details WHERE basics_id=?', [id])
    const hasTenderData = payload.unique_tender_no || payload.cost_of_work_cr || payload.emd_amount_cr
    
    if (hasTenderData) {
      if (tenderExists.length > 0) {
        // Update existing
        await connection.query(
          `UPDATE tender_details SET
            unique_tender_no=?, tender_id_display=?, cost_of_work_cr=?,
            tender_document_fee=?, form_of_tender_documents_fee=?, emd_amount_cr=?,
            form_of_emd=?, emd_bg_fdr_no=?, emd_bg_fdr_issued_in_favor_of=?,
            emd_bg_fdr_status_date=?, emd_bg_fdr_due_date=?, pre_bid_meeting_date=?,
            physical_doc_submission_due=?, bid_opening_date=?, self_jv_type=?,
            physically_needed_documents=?, bid_submission_date=?, pfepl_jv_share_percent=?,
            total_expenses_against_bid=?, number_of_bids_submitted=?,
            completion_period_months=?, remarks=?, bids_submitted=?, status_=?
          WHERE basics_id=?`,
          [
            payload.unique_tender_no || null, payload.tender_id_display || null,
            payload.cost_of_work_cr || null, payload.tender_document_fee || null,
            payload.form_of_tender_documents_fee || null, payload.emd_amount_cr || null,
            payload.form_of_emd || null, payload.emd_bg_fdr_no || null,
            payload.emd_bg_fdr_issued_in_favor_of || null, payload.emd_bg_fdr_status_date || null,
            payload.emd_bg_fdr_due_date || null, payload.pre_bid_meeting_date || null,
            payload.physical_doc_submission_due || null, payload.bid_opening_date || null,
            payload.self_jv_type || null, payload.physically_needed_documents || null,
            payload.bid_submission_date || null, payload.pfepl_jv_share_percent || null,
            payload.total_expenses_against_bid || null, payload.number_of_bids_submitted || null,
            payload.completion_period_months || null, payload.remarks || null,
            payload.bids_submitted || null, payload.status_ || null,
            id
          ]
        )
      } else {
        // Insert new
        await connection.query(
          `INSERT INTO tender_details (
            basics_id, unique_tender_no, tender_id_display, cost_of_work_cr,
            tender_document_fee, form_of_tender_documents_fee, emd_amount_cr,
            form_of_emd, emd_bg_fdr_no, emd_bg_fdr_issued_in_favor_of,
            emd_bg_fdr_status_date, emd_bg_fdr_due_date, pre_bid_meeting_date,
            physical_doc_submission_due, bid_opening_date, self_jv_type,
            physically_needed_documents, bid_submission_date, pfepl_jv_share_percent,
            total_expenses_against_bid, number_of_bids_submitted,
            completion_period_months, remarks, bids_submitted, status_
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id, payload.unique_tender_no || null, payload.tender_id_display || null,
            payload.cost_of_work_cr || null, payload.tender_document_fee || null,
            payload.form_of_tender_documents_fee || null, payload.emd_amount_cr || null,
            payload.form_of_emd || null, payload.emd_bg_fdr_no || null,
            payload.emd_bg_fdr_issued_in_favor_of || null, payload.emd_bg_fdr_status_date || null,
            payload.emd_bg_fdr_due_date || null, payload.pre_bid_meeting_date || null,
            payload.physical_doc_submission_due || null, payload.bid_opening_date || null,
            payload.self_jv_type || null, payload.physically_needed_documents || null,
            payload.bid_submission_date || null, payload.pfepl_jv_share_percent || null,
            payload.total_expenses_against_bid || null, payload.number_of_bids_submitted || null,
            payload.completion_period_months || null, payload.remarks || null,
            payload.bids_submitted || null, payload.status_ || null
          ]
        )
      }
    }
    
    // 3. Update or insert project_details
    const [projectExists] = await connection.query('SELECT 1 FROM project_details WHERE basics_id=?', [id])
    const hasProjectData = payload.project_no || payload.work_order_value || payload.starting_date
    
    if (hasProjectData) {
      if (projectExists.length > 0) {
        // Update existing
        await connection.query(
          `UPDATE project_details SET
            project_no=?, form_of_psd=?, date_of_loa=?,
            psd_bg_fdr_validity=?, additional_security_deposit=?, psd_bg_fdr_status=?,
            asd_actual_return_date=?, starting_date=?, asd_planned_return_date=?,
            completion_date=?, psd_bg_fdr_actual_date=?, work_order_value=?,
            psd_bg_fdr_issued_in_favor_of=?, date_of_work_order=?,
            duration_of_project_months=?, actual_date_of_completion=?,
            date_of_amendment=?, asd_bg_fdr_validity=?, performance_security_deposit=?,
            work_completion_certificate_taken=?, psd_bg_fdr_no=?,
            work_order_after_variation=?, asd_bg_fdr_issued_in_favor_of=?,
            defects_liability_period_months=?, psd_bg_fdr_return_date=?,
            dlp_end_date=?, remarks=?
          WHERE basics_id=?`,
          [
            payload.project_no || null, payload.form_of_psd || null,
            payload.date_of_loa || null, payload.psd_bg_fdr_validity || null,
            payload.additional_security_deposit || null, payload.psd_bg_fdr_status || null,
            payload.asd_actual_return_date || null, payload.starting_date || null,
            payload.asd_planned_return_date || null, payload.completion_date || null,
            payload.psd_bg_fdr_actual_date || null, payload.work_order_value || null,
            payload.psd_bg_fdr_issued_in_favor_of || null, payload.date_of_work_order || null,
            payload.duration_of_project_months || null, payload.actual_date_of_completion || null,
            payload.date_of_amendment || null, payload.asd_bg_fdr_validity || null,
            payload.performance_security_deposit || null, payload.work_completion_certificate_taken || null,
            payload.psd_bg_fdr_no || null, payload.work_order_after_variation || null,
            payload.asd_bg_fdr_issued_in_favor_of || null, payload.defects_liability_period_months || null,
            payload.psd_bg_fdr_return_date || null, payload.dlp_end_date || null,
            payload.project_remarks || null,
            id
          ]
        )
      } else {
        // Insert new
        await connection.query(
          `INSERT INTO project_details (
            basics_id, project_no, form_of_psd, date_of_loa,
            psd_bg_fdr_validity, additional_security_deposit, psd_bg_fdr_status,
            asd_actual_return_date, starting_date, asd_planned_return_date,
            completion_date, psd_bg_fdr_actual_date, work_order_value,
            psd_bg_fdr_issued_in_favor_of, date_of_work_order,
            duration_of_project_months, actual_date_of_completion,
            date_of_amendment, asd_bg_fdr_validity, performance_security_deposit,
            work_completion_certificate_taken, psd_bg_fdr_no,
            work_order_after_variation, asd_bg_fdr_issued_in_favor_of,
            defects_liability_period_months, psd_bg_fdr_return_date,
            dlp_end_date, remarks
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            id, payload.project_no || null, payload.form_of_psd || null,
            payload.date_of_loa || null, payload.psd_bg_fdr_validity || null,
            payload.additional_security_deposit || null, payload.psd_bg_fdr_status || null,
            payload.asd_actual_return_date || null, payload.starting_date || null,
            payload.asd_planned_return_date || null, payload.completion_date || null,
            payload.psd_bg_fdr_actual_date || null, payload.work_order_value || null,
            payload.psd_bg_fdr_issued_in_favor_of || null, payload.date_of_work_order || null,
            payload.duration_of_project_months || null, payload.actual_date_of_completion || null,
            payload.date_of_amendment || null, payload.asd_bg_fdr_validity || null,
            payload.performance_security_deposit || null, payload.work_completion_certificate_taken || null,
            payload.psd_bg_fdr_no || null, payload.work_order_after_variation || null,
            payload.asd_bg_fdr_issued_in_favor_of || null, payload.defects_liability_period_months || null,
            payload.psd_bg_fdr_return_date || null, payload.dlp_end_date || null,
            payload.project_remarks || null
          ]
        )
      }
    }
    
    await connection.commit()
    res.json({ ok: true, id: parseInt(id) })
  } catch (e) {
    await connection.rollback()
    console.error('PUT /api/basics/:id error:', e)
    res.status(500).json({ error: e.message })
  } finally {
    connection.release()
  }
})

export default router



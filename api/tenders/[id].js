import { pool } from '../../../server/db.js'

export default async function handler(req, res) {
  const { method, query } = req
  const { id } = query

  if (!id) {
    return res.status(400).json({ error: 'ID is required' })
  }

  try {
    switch (method) {
      case 'GET':
        const [rows] = await pool.query('SELECT * FROM tenders WHERE basics_id = ?', [id])
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' })
        }
        return res.json(rows[0])

      case 'POST':
        const tenderData = req.body
        
        const [result] = await pool.query(
          'INSERT INTO tenders (basics_id, name_of_work, unique_tender_no, tender_id_display, cost_of_work_cr, tender_document_fee, form_of_tender_documents_fee, emd_amount_cr, form_of_emd, emd_bg_fdr_no, emd_bg_fdr_issued_in_favor_of, emd_bg_fdr_status_date, emd_bg_fdr_due_date, pre_bid_meeting_date, physical_doc_submission_due, bid_opening_date, self_jv_type, physically_needed_documents, bid_submission_date, pfepl_jv_share_percent, total_expenses_against_bid, number_of_bids_submitted, remarks, bids_submitted, status_) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id, tenderData.name_of_work, tenderData.unique_tender_no, tenderData.tender_id_display, tenderData.cost_of_work_cr, tenderData.tender_document_fee, tenderData.form_of_tender_documents_fee, tenderData.emd_amount_cr, tenderData.form_of_emd, tenderData.emd_bg_fdr_no, tenderData.emd_bg_fdr_issued_in_favor_of, tenderData.emd_bg_fdr_status_date, tenderData.emd_bg_fdr_due_date, tenderData.pre_bid_meeting_date, tenderData.physical_doc_submission_due, tenderData.bid_opening_date, tenderData.self_jv_type, tenderData.physically_needed_documents, tenderData.bid_submission_date, tenderData.pfepl_jv_share_percent, tenderData.total_expenses_against_bid, tenderData.number_of_bids_submitted, tenderData.remarks, tenderData.bids_submitted, tenderData.status_
          ]
        )
        
        return res.json({ id: result.insertId, basics_id: id, ...tenderData })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: error.message })
  }
}

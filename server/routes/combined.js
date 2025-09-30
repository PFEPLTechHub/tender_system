import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id AS id,
             b.project_work_name AS nameOfWork,
             b.type_of_project AS category,
             b.department_authority AS department,
             b.year AS year,
             t.unique_tender_no, 
             t.status_ AS status,
             t.cost_of_work_cr AS projectValue,
             t.tender_document_fee AS tenderDocumentsFee,
             t.form_of_tender_documents_fee AS formOfTenderDocumentsFee,
             t.emd_amount_cr AS emd,
             t.form_of_emd AS formOfEmd,
             t.completion_period_months AS completionPeriod,
             t.physical_doc_submission_due AS lastDateOfSubmission,
             t.remarks AS remarks,
             p.project_no AS projectNo,
             p.date_of_loa AS dateOfLoa,
             p.date_of_work_order AS dateOfWorkOrder,
             p.starting_date AS startingDate,
             p.duration_of_project_months AS durationOfProject,
             p.completion_date AS completionDate,
             p.actual_date_of_completion AS actualDateOfCompletion,
             p.work_order_value AS workOrderValue,
             p.work_order_after_variation AS revisedWorkOrder,
             p.p_remark AS projectRemarks
      FROM basics_shared b
      LEFT JOIN tender_details t ON t.basics_id=b.id
      LEFT JOIN project_details p ON p.basics_id=b.id
      ORDER BY b.id ASC`)
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

export default router



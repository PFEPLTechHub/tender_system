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
        const [rows] = await pool.query('SELECT * FROM project_details WHERE basics_id = ?', [id])
        if (rows.length === 0) {
          return res.status(404).json({ error: 'Record not found' })
        }
        return res.json(rows[0])

      case 'POST':
        const projectData = req.body || {}
        console.log('Creating project for basics_id:', id, 'with data:', projectData)
        
        const [result] = await pool.query(
          'INSERT INTO project_details (basics_id, name_of_work, project_no, form_of_psd, date_of_loa, psd_bg_fdr_validity, additional_security_deposit, psd_bg_fdr_status, asd_actual_return_date, starting_date, asd_planned_return_date, completion_date, psd_bg_fdr_actual_date, work_order_value, psd_bg_fdr_issued_in_favor_of, date_of_work_order, duration_of_project_months, actual_date_of_completion, date_of_amendment, asd_bg_fdr_validity, performance_security_deposit, work_completion_certificate_taken, psd_bg_fdr_no, work_order_after_variation, asd_bg_fdr_issued_in_favor_of, defects_liability_period_months, psd_bg_fdr_return_date, dlp_end_date, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id, 
            projectData.name_of_work || null, 
            projectData.project_no || null, 
            projectData.form_of_psd || null, 
            projectData.date_of_loa || null, 
            projectData.psd_bg_fdr_validity || null, 
            projectData.additional_security_deposit || null, 
            projectData.psd_bg_fdr_status || null, 
            projectData.asd_actual_return_date || null, 
            projectData.starting_date || null, 
            projectData.asd_planned_return_date || null, 
            projectData.completion_date || null, 
            projectData.psd_bg_fdr_actual_date || null, 
            projectData.work_order_value || null, 
            projectData.psd_bg_fdr_issued_in_favor_of || null, 
            projectData.date_of_work_order || null, 
            projectData.duration_of_project_months || null, 
            projectData.actual_date_of_completion || null, 
            projectData.date_of_amendment || null, 
            projectData.asd_bg_fdr_validity || null, 
            projectData.performance_security_deposit || null, 
            projectData.work_completion_certificate_taken || null, 
            projectData.psd_bg_fdr_no || null, 
            projectData.work_order_after_variation || null, 
            projectData.asd_bg_fdr_issued_in_favor_of || null, 
            projectData.defects_liability_period_months || null, 
            projectData.psd_bg_fdr_return_date || null, 
            projectData.dlp_end_date || null, 
            projectData.remarks || null
          ]
        )
        
        return res.json({ id: result.insertId, basics_id: id, ...projectData })

      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Database error:', error)
    return res.status(500).json({ error: error.message })
  }
}

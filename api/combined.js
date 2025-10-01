import { pool } from '../server/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all data from basics, tenders, and projects tables
    const [basics] = await pool.query('SELECT * FROM basics ORDER BY id DESC')
    const [tenders] = await pool.query('SELECT * FROM tenders ORDER BY id DESC')
    const [projects] = await pool.query('SELECT * FROM projects ORDER BY id DESC')

    // Combine data
    const combined = []
    
    // Process tenders
    tenders.forEach(tender => {
      const basic = basics.find(b => b.id === tender.basics_id)
      combined.push({
        id: tender.basics_id || tender.id,
        category: 'Tender',
        nameOfWork: basic?.project_work_name || tender.name_of_work || '',
        department: basic?.department_authority || '',
        typeOfProject: basic?.type_of_project || '',
        internalProjectNo: basic?.internal_project_no || '',
        year: basic?.year || '',
        status: tender.status_ || '',
        tenderId: tender.tender_id_display || '',
        projectValue: tender.cost_of_work_cr || '',
        tenderDocumentsFee: tender.tender_document_fee || '',
        formOfTenderDocumentsFee: tender.form_of_tender_documents_fee || '',
        emd: tender.emd_amount_cr || '',
        formOfEmd: tender.form_of_emd || '',
        emdBgFdrNo: tender.emd_bg_fdr_no || '',
        emdBgFdrIssuedInFavorOf: tender.emd_bg_fdr_issued_in_favor_of || '',
        emdBgFdrStatusDate: tender.emd_bg_fdr_status_date || '',
        emdBgFdrDueDate: tender.emd_bg_fdr_due_date || '',
        preBidMeetingDate: tender.pre_bid_meeting_date || '',
        physicalDocumentSubmissionDueDate: tender.physical_doc_submission_due || '',
        bidOpeningDate: tender.bid_opening_date || '',
        selfJvType: tender.self_jv_type || '',
        physicallyNeededDocuments: tender.physically_needed_documents || '',
        bidSubmissionDate: tender.bid_submission_date || '',
        pfeplJvShare: tender.pfepl_jv_share_percent || '',
        totalExpensesIncurred: tender.total_expenses_against_bid || '',
        noOfBidsSubmitted: tender.number_of_bids_submitted || '',
        remarks: tender.remarks || '',
        bidsSubmitted: tender.bids_submitted || ''
      })
    })

    // Process projects
    projects.forEach(project => {
      const basic = basics.find(b => b.id === project.basics_id)
      combined.push({
        id: project.basics_id || project.id,
        category: 'Project',
        nameOfWork: basic?.project_work_name || project.name_of_work || '',
        department: basic?.department_authority || '',
        typeOfProject: basic?.type_of_project || '',
        internalProjectNo: basic?.internal_project_no || '',
        year: basic?.year || '',
        status: project.psd_bg_fdr_status || '',
        projectNo: project.project_no || '',
        formOfPsd: project.form_of_psd || '',
        dateOfLoa: project.date_of_loa || '',
        psdBgFdrValidity: project.psd_bg_fdr_validity || '',
        additionalSecurityDeposit: project.additional_security_deposit || '',
        psdBgFdrStatus: project.psd_bg_fdr_status || '',
        asdActualReturnDate: project.asd_actual_return_date || '',
        startingDate: project.starting_date || '',
        asdPlannedReturnDate: project.asd_planned_return_date || '',
        completionDate: project.completion_date || '',
        psdBgFdrActualDate: project.psd_bg_fdr_actual_date || '',
        workOrderValue: project.work_order_value || '',
        psdBgFdrIssuedInFavorOf: project.psd_bg_fdr_issued_in_favor_of || '',
        dateOfWorkOrder: project.date_of_work_order || '',
        durationOfProject: project.duration_of_project_months || '',
        actualDateOfCompletion: project.actual_date_of_completion || '',
        dateOfAmendment: project.date_of_amendment || '',
        asdBgFdrValidity: project.asd_bg_fdr_validity || '',
        performanceSecurityDeposit: project.performance_security_deposit || '',
        workCompletionCertificateTaken: project.work_completion_certificate_taken || '',
        psdBgFdrNo: project.psd_bg_fdr_no || '',
        revisedWorkOrder: project.work_order_after_variation || '',
        asdBgFdrIssuedInFavorOf: project.asd_bg_fdr_issued_in_favor_of || '',
        defectsLiabilityPeriod: project.defects_liability_period_months || '',
        psdBgFdrReturnDate: project.psd_bg_fdr_return_date || '',
        dlpEndDate: project.dlp_end_date || '',
        remarks: project.remarks || ''
      })
    })

    // Sort by ID
    combined.sort((a, b) => (a.id || 0) - (b.id || 0))

    res.json(combined)
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: error.message })
  }
}

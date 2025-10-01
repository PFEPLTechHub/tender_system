// Use localhost for development, empty string for production (Vercel)
const BASE = window.location.hostname === 'localhost' ? 'http://localhost:5175' : ''

async function http(method, path, body, isForm) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const getBasics = (id) => http('GET', `/api/basics/${id}`)
export const createBasics = (payload) => http('POST', `/api/basics`, payload)
export const updateBasics = (id, payload) => http('PUT', `/api/basics/${id}`, payload)

export const getTender = (basicsId) => http('GET', `/api/tenders/${basicsId}`)
export const saveTender = (basicsId, payload) => http('POST', `/api/tenders/${basicsId}`, payload)
export const updateTender = (basicsId, payload) => http('PUT', `/api/tenders/${basicsId}`, payload)
export const uploadTenderFiles = (basicsId, fileList) => {
  const form = new FormData()
  Array.from(fileList || []).forEach(f => form.append('files', f))
  return http('POST', `/api/tenders/${basicsId}/attachments`, form, true)
}

export const getProject = (basicsId) => http('GET', `/api/projects/${basicsId}`)
export const saveProject = (basicsId, payload) => http('POST', `/api/projects/${basicsId}`, payload)
export const updateProject = (basicsId, payload) => http('PUT', `/api/projects/${basicsId}`, payload)
export const uploadProjectFiles = (basicsId, fileList) => {
  const form = new FormData()
  Array.from(fileList || []).forEach(f => form.append('files', f))
  return http('POST', `/api/projects/${basicsId}/attachments`, form, true)
}

export const getCombined = () => http('GET', `/api/combined`)

// Enhanced API functions for comprehensive data fetching
export const getAllBasics = () => http('GET', `/api/basics`)
export const getAllTenders = () => http('GET', `/api/tenders`)
export const getAllProjects = () => http('GET', `/api/projects`)

// Combined data fetching for unified views
export const getUnifiedData = async () => {
  try {
    const [basics, tenders, projects] = await Promise.all([
      getAllBasics(),
      getAllTenders(),
      getAllProjects()
    ]);
    
    // Combine and normalize data
    const unified = [];
    
    // Process tenders
    if (Array.isArray(tenders)) {
      tenders.forEach(tender => {
        const basic = Array.isArray(basics) ? basics.find(b => b.id === tender.basics_id) : null;
        unified.push({
          id: tender.basics_id || tender.id,
          category: 'Tender',
          nameOfWork: basic?.project_work_name || tender.name_of_work || '',
          department: basic?.department_authority || '',
          typeOfProject: basic?.type_of_project || '',
          internalProjectNo: basic?.internal_project_no || '',
          // Tender specific fields
          uniqueTenderNo: tender.unique_tender_no || '',
          tenderId: tender.tender_id_display || '',
          costOfWork: tender.cost_of_work_cr || '',
          tenderDocumentsFee: tender.tender_document_fee || '',
          formOfTenderDocumentsFee: tender.form_of_tender_documents_fee || '',
          emdAmount: tender.emd_amount_cr || '',
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
          bidsSubmitted: tender.bids_submitted || '',
          status: tender.status_ || ''
        });
      });
    }
    
    // Process projects
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        const basic = Array.isArray(basics) ? basics.find(b => b.id === project.basics_id) : null;
        unified.push({
          id: project.basics_id || project.id,
          category: 'Project',
          nameOfWork: basic?.project_work_name || project.name_of_work || '',
          department: basic?.department_authority || '',
          typeOfProject: basic?.type_of_project || '',
          internalProjectNo: basic?.internal_project_no || '',
          // Project specific fields
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
        });
      });
    }
    
    return unified.sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (error) {
    console.error('Error fetching unified data:', error);
    return [];
  }
};

// Task Management API Functions
export const getAllTasks = () => http('GET', '/api/tasks')
export const getTasksByType = (type) => http('GET', `/api/tasks/type/${type}`)
export const getTasksByProject = (projectId) => http('GET', `/api/tasks/project/${projectId}`)
export const getTask = (id) => http('GET', `/api/tasks/${id}`)
export const createTask = (payload) => http('POST', '/api/tasks', payload)
export const updateTask = (id, payload) => http('PUT', `/api/tasks/${id}`, payload)
export const deleteTask = (id) => http('DELETE', `/api/tasks/${id}`)
export const completeTask = (id, payload) => http('PATCH', `/api/tasks/${id}/complete`, payload)

// Extensions API Functions
export const getExtensionsByBasicsId = (basicsId) => http('GET', `/api/extensions/basics/${basicsId}`)
export const getExtension = (id) => http('GET', `/api/extensions/${id}`)
export const createExtension = (payload) => http('POST', '/api/extensions', payload)
export const updateExtension = (id, payload) => http('PUT', `/api/extensions/${id}`, payload)
export const deleteExtension = (id) => http('DELETE', `/api/extensions/${id}`)
export const deleteExtensionsByBasicsId = (basicsId) => http('DELETE', `/api/extensions/basics/${basicsId}`)
export const bulkUpdateExtensions = (basicsId, extensions) => http('POST', `/api/extensions/basics/${basicsId}/bulk`, { extensions })

// Milestones API Functions
export const getMilestonesByBasicsId = (basicsId) => http('GET', `/api/milestones/basics/${basicsId}`)
export const getMilestone = (id) => http('GET', `/api/milestones/${id}`)
export const createMilestone = (payload) => http('POST', '/api/milestones', payload)
export const updateMilestone = (id, payload) => http('PUT', `/api/milestones/${id}`, payload)
export const toggleMilestone = (id) => http('PATCH', `/api/milestones/${id}/toggle`)
export const deleteMilestone = (id) => http('DELETE', `/api/milestones/${id}`)
export const deleteMilestonesByBasicsId = (basicsId) => http('DELETE', `/api/milestones/basics/${basicsId}`)
export const bulkUpdateMilestones = (basicsId, milestones) => http('POST', `/api/milestones/basics/${basicsId}/bulk`, { milestones })

// Bidder Details API Functions
export const getBidderDetailsByBasicsId = (basicsId) => http('GET', `/api/bidderdetails/basics/${basicsId}`)
export const getBidderDetails = (id) => http('GET', `/api/bidderdetails/${id}`)
export const createOrUpdateBidderDetails = (payload) => http('POST', '/api/bidderdetails', payload)
export const updateBidderDetails = (id, payload) => http('PUT', `/api/bidderdetails/${id}`, payload)
export const deleteBidderDetails = (id) => http('DELETE', `/api/bidderdetails/${id}`)
export const deleteBidderDetailsByBasicsId = (basicsId) => http('DELETE', `/api/bidderdetails/basics/${basicsId}`)

// Bidders API Functions
export const getBiddersByBasicsId = (basicsId) => http('GET', `/api/bidderdetails/basics/${basicsId}/bidders`)
export const createBidder = (payload) => http('POST', '/api/bidderdetails/bidders', payload)
export const updateBidder = (id, payload) => http('PUT', `/api/bidderdetails/bidders/${id}`, payload)
export const deleteBidder = (id) => http('DELETE', `/api/bidderdetails/bidders/${id}`)
export const deleteBiddersByBasicsId = (basicsId) => http('DELETE', `/api/bidderdetails/basics/${basicsId}/bidders`)
export const bulkUpdateBidders = (basicsId, bidders) => http('POST', `/api/bidderdetails/basics/${basicsId}/bidders/bulk`, { bidders })



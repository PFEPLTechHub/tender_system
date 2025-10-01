// src/screens/Forms.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { getBasics } from "../../api/client";
import { saveBasic } from "../../api/basics";
import { useToast } from "../../components/ToastContainer";

const Forms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = id === 'new';

  // Editable by default
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [dataType, setDataType] = useState('project'); // Track if this is tender or project data

  // Theme + lock window scroll (content area will scroll)
  useEffect(() => {
    const prevBg = document.body.style.background;
    const prevColor = document.body.style.color;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.body.style.background = "#0f0f10";
    document.body.style.color = "#e9e9ee";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.background = prevBg;
      document.body.style.color = prevColor;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const makeBlank = () => ({
    id: parseInt(id || "1", 10),

    // Basics
    projectName: "",
    internalProjectNo: "",
    typeOfProject: "Survey",
    department: "",
    year: "",

    // Tender
    uniqueTenderNo: "",
    tenderId: "",
    costOfWork: "",
    tenderDocumentsFee: "",
    formOfTenderDocumentsFee: "ONLINE",
    formOfEmd: "ONLINE",
    emdAmount: "",
    emdBgFdrNo: "",
    emdBgFdrIssuedInFavorOf: "",
    emdBgFdrStatusDate: "",
    emdBgFdrDueDate: "",
    preBidMeetingDate: "",
    physicalDocumentSubmissionDueDate: "",
    bidOpeningDate: "",
    selfJvType: "Self",
    physicallyNeededDocuments: "",
    bidSubmissionDate: "",
    pfeplJvShare: "",
    totalExpensesIncurred: "",
    noOfBidsSubmitted: "",
    completionPeriodMonths: "",
    remarks: "",
    bidsSubmitted: "No",
    status: "Bidding Pending",

    // Project
    srNoOrUniqueProjectNo: "",
    formOfPsd: "BG",
    dateOfLoaLoi: "",
    psdBgFdrValidity: "",
    additionalSecurityDeposit: "",
    psdBgFdrStatus: "Not Returned",
    asdActualReturnDate: "",
    startingDateOfProject: "",
    asdPlannedReturnDate: "",
    completionDateAsPerWorkOrder: "",
    psdBgFdrActualDate: "",
    valueOfContractOrWorkOrder: "",
    psdBgFdrIssuedInFavorOf: "",
    nameOfWork: "",
    dateOfWorkOrder: "",
    durationOfProject: "",
    actualDateOfCompletion: "",
    dateOfAmendment: "",
    asdBgFdrValidity: "",
    performanceSecurityDeposit: "",
    workCompletionCertificateTaken: "No",
    psdBgFdrNo: "",
    workOrderAfterVariation: "",
    asdBgFdrIssuedInFavorOf: "",
    defectsLiabilityPeriod: "",
    psdBgFdrReturnDate: "",
    dlpEndDate: "",

    // Attachments
    attachments: [],
    projectAttachments: [],
  });

  // Load data from database or start with blank form
  useEffect(() => {
    const loadData = async () => {
      if (id && id !== 'new') {
        try {
          console.log(`📖 Loading record #${id}...`);
          // Fetch complete record from /api/basics/:id
          const data = await getBasics(id);

          // Map database fields to form fields
          const combinedData = {
            ...makeBlank(),
            id: parseInt(id),
            // Basic information
            projectName: data?.project_work_name || '',
            internalProjectNo: data?.internal_project_no || '',
            typeOfProject: data?.type_of_project || '',
            department: data?.department_authority || '',
            year: data?.year || '',
            
            // Tender fields
            uniqueTenderNo: data?.unique_tender_no || '',
            tenderId: data?.tender_id_display || '',
            costOfWork: data?.cost_of_work_cr || '',
            tenderDocumentsFee: data?.tender_document_fee || '',
            formOfTenderDocumentsFee: data?.form_of_tender_documents_fee || 'ONLINE',
            formOfEmd: data?.form_of_emd || 'ONLINE',
            emdAmount: data?.emd_amount_cr || '',
            emdBgFdrNo: data?.emd_bg_fdr_no || '',
            emdBgFdrIssuedInFavorOf: data?.emd_bg_fdr_issued_in_favor_of || '',
            emdBgFdrStatusDate: data?.emd_bg_fdr_status_date || '',
            emdBgFdrDueDate: data?.emd_bg_fdr_due_date || '',
            preBidMeetingDate: data?.pre_bid_meeting_date || '',
            physicalDocumentSubmissionDueDate: data?.physical_doc_submission_due || '',
            bidOpeningDate: data?.bid_opening_date || '',
            selfJvType: data?.self_jv_type || 'Self',
            physicallyNeededDocuments: data?.physically_needed_documents || '',
            bidSubmissionDate: data?.bid_submission_date || '',
            pfeplJvShare: data?.pfepl_jv_share_percent || '',
            totalExpensesIncurred: data?.total_expenses_against_bid || '',
            noOfBidsSubmitted: data?.number_of_bids_submitted || '',
            completionPeriodMonths: data?.completion_period_months || '',
            remarks: data?.remarks || '',
            bidsSubmitted: data?.bids_submitted || 'No',
            status: data?.status_ || 'Bidding Pending',
            
            // Project fields
            srNoOrUniqueProjectNo: data?.project_no || '',
            formOfPsd: data?.form_of_psd || 'BG',
            dateOfLoaLoi: data?.date_of_loa || '',
            psdBgFdrValidity: data?.psd_bg_fdr_validity || '',
            additionalSecurityDeposit: data?.additional_security_deposit || '',
            psdBgFdrStatus: data?.psd_bg_fdr_status || 'Not Returned',
            asdActualReturnDate: data?.asd_actual_return_date || '',
            startingDateOfProject: data?.starting_date || '',
            asdPlannedReturnDate: data?.asd_planned_return_date || '',
            completionDateAsPerWorkOrder: data?.completion_date || '',
            psdBgFdrActualDate: data?.psd_bg_fdr_actual_date || '',
            valueOfContractOrWorkOrder: data?.work_order_value || '',
            psdBgFdrIssuedInFavorOf: data?.psd_bg_fdr_issued_in_favor_of || '',
            nameOfWork: data?.name_of_work || data?.project_work_name || '',
            dateOfWorkOrder: data?.date_of_work_order || '',
            durationOfProject: data?.duration_of_project_months || '',
            actualDateOfCompletion: data?.actual_date_of_completion || '',
            dateOfAmendment: data?.date_of_amendment || '',
            asdBgFdrValidity: data?.asd_bg_fdr_validity || '',
            performanceSecurityDeposit: data?.performance_security_deposit || '',
            workCompletionCertificateTaken: data?.work_completion_certificate_taken || 'No',
            psdBgFdrNo: data?.psd_bg_fdr_no || '',
            workOrderAfterVariation: data?.work_order_after_variation || '',
            asdBgFdrIssuedInFavorOf: data?.asd_bg_fdr_issued_in_favor_of || '',
            defectsLiabilityPeriod: data?.defects_liability_period_months || '',
            psdBgFdrReturnDate: data?.psd_bg_fdr_return_date || '',
            dlpEndDate: data?.dlp_end_date || '',
            projectRemarks: data?.project_remarks || ''
          };

          console.log('✅ Loaded record:', combinedData);
          setFormData(combinedData);
          setIsEditing(false); // existing record starts read-only
        } catch (error) {
          console.error('❌ Error loading form data:', error);
          toast.error(`✗ Error loading: ${error.message}`, 5000);
          setFormData(makeBlank());
        }
      } else {
        // Start with blank form for new entries
        console.log('📝 Starting new form...');
        setFormData(makeBlank());
        setIsEditing(true);
      }
    };

    loadData();
  }, [id]);


  const onChange = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  

  // STRICT numeric inputs helpers
  const blockKeys = (e, allowDecimal) => {
    const bad = allowDecimal ? ["e", "E", "+", "-"] : ["e", "E", "+", "-", "."];
    if (bad.includes(e.key)) e.preventDefault();
  };
  const blurOnWheel = (e) => e.currentTarget.blur();

  const numberProps = {
    type: "number",
    inputMode: "decimal",
    step: "0.01",
    min: "0",
    onKeyDown: (e) => blockKeys(e, true),
    onWheel: blurOnWheel,
  };
  const intProps = {
    type: "number",
    inputMode: "numeric",
    step: "1",
    min: "0",
    onKeyDown: (e) => blockKeys(e, false),
    onWheel: blurOnWheel,
  };

  const onFiles = (field) => (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setFormData((p) => ({ ...p, [field]: [...(p[field] || []), ...mapped] }));
  };

  const removeFile = (field, idx) => {
    setFormData((p) => ({
      ...p,
      [field]: (p[field] || []).filter((_, i) => i !== idx),
    }));
  };

  // Function to transform form data to project structure (matching API expectations)
  const transformToProjectForm = (data) => {
    return {
      name_of_work: data.nameOfWork || data.projectName || '',
      project_no: data.srNoOrUniqueProjectNo || data.internalProjectNo || '',
      form_of_psd: data.formOfPsd || 'BG',
      date_of_loa: data.dateOfLoaLoi || '',
      psd_bg_fdr_validity: data.psdBgFdrValidity || '',
      additional_security_deposit: data.additionalSecurityDeposit || '',
      psd_bg_fdr_status: data.psdBgFdrStatus || 'Not Returned',
      asd_actual_return_date: data.asdActualReturnDate || '',
      starting_date: data.startingDateOfProject || '',
      asd_planned_return_date: data.asdPlannedReturnDate || '',
      completion_date: data.completionDateAsPerWorkOrder || '',
      psd_bg_fdr_actual_date: data.psdBgFdrActualDate || '',
      work_order_value: data.valueOfContractOrWorkOrder || data.costOfWork || '',
      psd_bg_fdr_issued_in_favor_of: data.psdBgFdrIssuedInFavorOf || '',
      date_of_work_order: data.dateOfWorkOrder || '',
      duration_of_project_months: data.durationOfProject || '',
      actual_date_of_completion: data.actualDateOfCompletion || '',
      date_of_amendment: data.dateOfAmendment || '',
      asd_bg_fdr_validity: data.asdBgFdrValidity || '',
      performance_security_deposit: data.performanceSecurityDeposit || '',
      work_completion_certificate_taken: data.workCompletionCertificateTaken || 'No',
      psd_bg_fdr_no: data.psdBgFdrNo || '',
      work_order_after_variation: data.workOrderAfterVariation || '',
      asd_bg_fdr_issued_in_favor_of: data.asdBgFdrIssuedInFavorOf || '',
      defects_liability_period_months: data.defectsLiabilityPeriod || '',
      psd_bg_fdr_return_date: data.psdBgFdrReturnDate || '',
      dlp_end_date: data.dlpEndDate || '',
      remarks: data.projectRemarks || ''
    }
  }

  // Function to transform form data to tender structure (matching API expectations)
  const transformToTenderForm = (data) => {
    return {
      name_of_work: data.projectName || data.nameOfWork || '',
      unique_tender_no: data.uniqueTenderNo || '',
      tender_id_display: data.tenderId || '',
      cost_of_work_cr: data.costOfWork || data.valueOfContractOrWorkOrder || '',
      tender_document_fee: data.tenderDocumentsFee || '',
      form_of_tender_documents_fee: data.formOfTenderDocumentsFee || 'ONLINE',
      emd_amount_cr: data.emdAmount || '',
      form_of_emd: data.formOfEmd || 'ONLINE',
      emd_bg_fdr_no: data.emdBgFdrNo || '',
      emd_bg_fdr_issued_in_favor_of: data.emdBgFdrIssuedInFavorOf || '',
      emd_bg_fdr_status_date: data.emdBgFdrStatusDate || '',
      emd_bg_fdr_due_date: data.emdBgFdrDueDate || '',
      pre_bid_meeting_date: data.preBidMeetingDate || '',
      physical_doc_submission_due: data.physicalDocumentSubmissionDueDate || '',
      bid_opening_date: data.bidOpeningDate || '',
      self_jv_type: data.selfJvType || 'Self',
      physically_needed_documents: data.physicallyNeededDocuments || '',
      bid_submission_date: data.bidSubmissionDate || '',
      pfepl_jv_share_percent: data.pfeplJvShare || '',
      total_expenses_against_bid: data.totalExpensesIncurred || '',
      number_of_bids_submitted: data.noOfBidsSubmitted || '',
      completion_period_months: data.completionPeriodMonths || '',
      remarks: data.remarks || '',
      bids_submitted: data.bidsSubmitted || 'No',
      status_: data.status || 'Bidding Pending'
    }
  }


  const handleSaveAll = async () => {
    if (!formData || isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Prepare complete payload with all form data
      const payload = {
        // Basic info
        project_work_name: formData.projectName || formData.nameOfWork || '',
        internal_project_no: formData.internalProjectNo || `AUTO-${Date.now()}`,
        type_of_project: formData.typeOfProject || 'Survey',
        department_authority: formData.department || '',
        year: formData.year || '',
        
        // Tender data
        unique_tender_no: formData.uniqueTenderNo || '',
        tender_id_display: formData.tenderId || '',
        cost_of_work_cr: formData.costOfWork || '',
        tender_document_fee: formData.tenderDocumentsFee || '',
        form_of_tender_documents_fee: formData.formOfTenderDocumentsFee || 'ONLINE',
        emd_amount_cr: formData.emdAmount || '',
        form_of_emd: formData.formOfEmd || 'ONLINE',
        emd_bg_fdr_no: formData.emdBgFdrNo || '',
        emd_bg_fdr_issued_in_favor_of: formData.emdBgFdrIssuedInFavorOf || '',
        emd_bg_fdr_status_date: formData.emdBgFdrStatusDate || '',
        emd_bg_fdr_due_date: formData.emdBgFdrDueDate || '',
        pre_bid_meeting_date: formData.preBidMeetingDate || '',
        physical_doc_submission_due: formData.physicalDocumentSubmissionDueDate || '',
        bid_opening_date: formData.bidOpeningDate || '',
        self_jv_type: formData.selfJvType || 'Self',
        physically_needed_documents: formData.physicallyNeededDocuments || '',
        bid_submission_date: formData.bidSubmissionDate || '',
        pfepl_jv_share_percent: formData.pfeplJvShare || '',
        total_expenses_against_bid: formData.totalExpensesIncurred || '',
        number_of_bids_submitted: formData.noOfBidsSubmitted || '',
        completion_period_months: formData.completionPeriodMonths || '',
        remarks: formData.remarks || '',
        bids_submitted: formData.bidsSubmitted || 'No',
        status_: formData.status || 'Bidding Pending',
        
        // Project data
        project_no: formData.srNoOrUniqueProjectNo || '',
        form_of_psd: formData.formOfPsd || 'BG',
        date_of_loa: formData.dateOfLoaLoi || '',
        psd_bg_fdr_validity: formData.psdBgFdrValidity || '',
        additional_security_deposit: formData.additionalSecurityDeposit || '',
        psd_bg_fdr_status: formData.psdBgFdrStatus || 'Not Returned',
        asd_actual_return_date: formData.asdActualReturnDate || '',
        starting_date: formData.startingDateOfProject || '',
        asd_planned_return_date: formData.asdPlannedReturnDate || '',
        completion_date: formData.completionDateAsPerWorkOrder || '',
        psd_bg_fdr_actual_date: formData.psdBgFdrActualDate || '',
        work_order_value: formData.valueOfContractOrWorkOrder || '',
        psd_bg_fdr_issued_in_favor_of: formData.psdBgFdrIssuedInFavorOf || '',
        date_of_work_order: formData.dateOfWorkOrder || '',
        duration_of_project_months: formData.durationOfProject || '',
        actual_date_of_completion: formData.actualDateOfCompletion || '',
        date_of_amendment: formData.dateOfAmendment || '',
        asd_bg_fdr_validity: formData.asdBgFdrValidity || '',
        performance_security_deposit: formData.performanceSecurityDeposit || '',
        work_completion_certificate_taken: formData.workCompletionCertificateTaken || 'No',
        psd_bg_fdr_no: formData.psdBgFdrNo || '',
        work_order_after_variation: formData.workOrderAfterVariation || '',
        asd_bg_fdr_issued_in_favor_of: formData.asdBgFdrIssuedInFavorOf || '',
        defects_liability_period_months: formData.defectsLiabilityPeriod || '',
        psd_bg_fdr_return_date: formData.psdBgFdrReturnDate || '',
        dlp_end_date: formData.dlpEndDate || '',
        project_remarks: formData.projectRemarks || ''
      };
      
      console.log('💾 Saving form data...', payload);
      
      // Use saveBasic helper which handles POST vs PUT automatically
      const recordId = (isNew || id === 'new') ? null : id;
      const result = await saveBasic(payload, recordId);
      
      console.log('✅ Save successful!', result);
      toast.success('✓ Data saved successfully!', 3000);
      
      // If this was a new record, navigate to the edit view
      if (isNew && result?.id) {
        setTimeout(() => navigate(`/forms/${result.id}`), 1000);
      }
    } catch (error) {
      console.error('💥 Save failed:', error);
      toast.error(`✗ Save failed: ${error.message}`, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(makeBlank());
  };

  if (!formData) return null;

  return (
    <div className="preview-root">
      <style>{`
        :root{
          --bg-0:#0f0f10; --bg-1:#141417; --card:#1a1b1f;
          --muted:#A3A3A3; --text:#e8e8ea; --text-dim:#b8b8bc;
          --stroke:#2a2b31; --focus:#7c5cff; --chip:#20222a;
          --radius:14px; --shadow:0 8px 24px rgba(0,0,0,.35);
          --appbar:64px; --fab:64px;
        }
        .preview-root{height:100dvh;background:var(--bg-0);display:flex;overflow:hidden;min-height:0}
        .page{flex:1;display:grid;grid-template-rows:var(--appbar) 1fr var(--fab);height:100%;min-height:0;overflow:hidden}
        .appbar{background:linear-gradient(180deg,var(--bg-1),rgba(20,20,23,.85));border-bottom:1px solid var(--stroke);display:flex;align-items:center;height:var(--appbar);flex:0 0 auto}
        .appbar-inner{max-width:1400px;margin:0 auto;padding:0 20px;width:100%;display:flex;align-items:center;gap:12px;color:var(--text)}
        .title{font-size:18px;font-weight:700}
        .chip{padding:6px 10px;background:var(--chip);border:1px solid var(--stroke);border-radius:999px;color:var(--text-dim)}
        .content{min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
        .wrap{max-width:1200px;margin:0 auto;padding:16px 20px;min-height:0}
        .stack{display:grid;gap:18px;min-height:0}
        .panel{background:var(--card);border:1px solid var(--stroke);border-radius:var(--radius);box-shadow:var(--shadow);overflow:hidden}
        .panel header{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,#1b1c21,#17181d);border-bottom:1px solid var(--stroke)}
        .panel header .h{font-size:16px;font-weight:800}
        .panel header .sub{color:var(--text-dim);font-size:12px}
        .panel .body{padding:16px}
        .row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media (max-width:720px){ .row-2{grid-template-columns:1fr} }
        label{font-size:12px;color:var(--text-dim);margin-bottom:6px;display:block}
        input,select,textarea{width:100%;background:#121317;color:var(--text);border:1px solid var(--stroke);border-radius:10px;padding:10px 12px;outline:none}
        textarea{resize:vertical;min-height:86px}
        input:focus,select:focus,textarea:focus{border-color:var(--focus);box-shadow:0 0 0 3px rgba(124,92,255,.2)}
        .file-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
        .file-row img{height:40px;border-radius:6px}
        .file-row a{color:var(--text)}
        .fabbar{border-top:1px solid var(--stroke);background:linear-gradient(180deg, rgba(15,15,16,0), rgba(15,15,16,.7) 25%, rgba(20,20,23,.95));height:var(--fab);display:flex;align-items:center;flex:0 0 auto}
        .fabbar-inner{max-width:1200px;margin:0 auto;padding:0 18px;width:100%;display:flex;gap:10px;align-items:center;justify-content:flex-end}
        .btn{appearance:none;border:none;border-radius:12px;padding:10px 16px;font-weight:600;cursor:pointer}
        .btn-ghost{background:#22232a;color:var(--text);border:1px solid var(--stroke)}
        .btn-ok{background:var(--focus);color:#fff}
        .btn-danger{background:#2a1212;color:#ffb4b4;border:1px solid #4c1b1b}
      `}</style>

      <div className="page">
        {/* Header */}
        <div className="appbar">
          <div className="appbar-inner">
            <div className="title" style={{marginLeft: '70px'}}>FORM</div>
            <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
              {!isEditing && (
                <button className="btn btn-ok" type="button" onClick={() => { setIsEditing(true); toast.info('📝 Edit mode enabled', 2000); }}>Edit</button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <main className="content">
          <div className="wrap">
            <div className="stack">
              {/* Basics */}
              <section className="panel">
                <header>
                  <div>
                    <div className="h">Basics (Shared)</div>
                    <div className="sub">Project / Work meta</div>
                  </div>
                </header>
                <div className="body">
                  <div className="row-2">
                    <div>
                      <label>Project / Work Name</label>
                      <input value={formData.projectName} onChange={onChange("projectName")} placeholder="Project name" disabled={!isEditing} />
                    </div>
                    <div>
                      <label>Internal Project No (PFEPL)</label>
                      <input value={formData.internalProjectNo} onChange={onChange("internalProjectNo")} placeholder="PRJ/2025/001" disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Type of Project</label>
                      <select value={formData.typeOfProject} onChange={onChange("typeOfProject")} disabled={!isEditing}>
                        <option>Survey</option><option>Construction</option><option>Consultancy</option><option>Civil</option>
                      </select>
                    </div>
                    <div>
                      <label>Department / Authority</label>
                      <input value={formData.department} onChange={onChange("department")} placeholder="Department" disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Year</label>
                      <input type="number" value={formData.year} onChange={onChange("year")} placeholder="2025" disabled={!isEditing} min="2000" max="2100" />
                    </div>
                    <div></div>
                  </div>
                </div>
              </section>

              {/* Tender */}
              <section className="panel">
                <header>
                  <div>
                    <div className="h">Tender Details</div>
                    <div className="sub">EMD, documents, dates, fees</div>
                  </div>
                </header>
                <div className="body">
                  <div className="row-2">
                    <div>
                      <label>Unique Tender No</label>
                      <input value={formData.uniqueTenderNo} onChange={onChange("uniqueTenderNo")} placeholder="TND/2025/0012" />
                    </div>
                    <div>
                      <label>Tender ID</label>
                      <input value={formData.tenderId} onChange={onChange("tenderId")} placeholder="Auto/Manual" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Cost of Work acc. to Tender</label>
                      <input {...numberProps} value={formData.costOfWork} onChange={onChange("costOfWork")} placeholder="0.00" disabled={!isEditing} />
                    </div>
                    <div>
                      <label>Tender Document Fee</label>
                      <input {...numberProps} value={formData.tenderDocumentsFee} onChange={onChange("tenderDocumentsFee")} placeholder="0.00" disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Form of Tender Documents Fee</label>
                      <select value={formData.formOfTenderDocumentsFee} onChange={onChange("formOfTenderDocumentsFee")} disabled={!isEditing}> 
                        <option>ONLINE</option><option>OFFLINE</option>
                      </select>
                    </div>
                    <div>
                      <label>EMD Amount</label>
                      <input {...numberProps} value={formData.emdAmount} onChange={onChange("emdAmount")} placeholder="0.00" disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Form of EMD</label>
                      <select value={formData.formOfEmd} onChange={onChange("formOfEmd")}>
                        <option>ONLINE</option><option>BG</option><option>FDR</option><option>EBG</option>
                      </select>
                    </div>
                    <div>
                      <label>EMD BG/FDR No</label>
                      <input value={formData.emdBgFdrNo} onChange={onChange("emdBgFdrNo")} placeholder="EMD-XXXX-YYYY" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>EMD BG/FDR Issued in Favor of</label>
                      <input value={formData.emdBgFdrIssuedInFavorOf} onChange={onChange("emdBgFdrIssuedInFavorOf")} placeholder="Authority / Bank" />
                    </div>
                    <div>
                      <label>EMD BG/FDR Status Date</label>
                      <input type="date" value={formData.emdBgFdrStatusDate} onChange={onChange("emdBgFdrStatusDate")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>EMD BG/FDR Due Date</label>
                      <input type="date" value={formData.emdBgFdrDueDate} onChange={onChange("emdBgFdrDueDate")} />
                    </div>
                    <div>
                      <label>Pre Bid Meeting Date</label>
                      <input type="date" value={formData.preBidMeetingDate} onChange={onChange("preBidMeetingDate")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Physical Document Submission Due Date</label>
                      <input type="date" value={formData.physicalDocumentSubmissionDueDate} onChange={onChange("physicalDocumentSubmissionDueDate")} />
                    </div>
                    <div>
                      <label>Bid Opening Date</label>
                      <input type="date" value={formData.bidOpeningDate} onChange={onChange("bidOpeningDate")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Self/JV Type</label>
                      <select value={formData.selfJvType} onChange={onChange("selfJvType")}><option>Self</option><option>JV</option></select>
                    </div>
                    <div>
                      <label>Physically Needed Documents</label>
                      <input value={formData.physicallyNeededDocuments} onChange={onChange("physicallyNeededDocuments")} placeholder="List items" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Bid Submission Date</label>
                      <input type="date" value={formData.bidSubmissionDate} onChange={onChange("bidSubmissionDate")} />
                    </div>
                    <div>
                      <label>PFEPL JV Share (%)</label>
                      <input {...numberProps} value={formData.pfeplJvShare} onChange={onChange("pfeplJvShare")} placeholder="0.00" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Total Expenses Incurred Against Bid</label>
                      <input {...numberProps} value={formData.totalExpensesIncurred} onChange={onChange("totalExpensesIncurred")} placeholder="0.00" disabled={!isEditing} />
                    </div>
                    <div>
                      <label>No. of Bids Submitted</label>
                      <input {...intProps} value={formData.noOfBidsSubmitted} onChange={onChange("noOfBidsSubmitted")} placeholder="0" disabled={!isEditing} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Completion Period (months)</label>
                      <input {...intProps} value={formData.completionPeriodMonths} onChange={onChange("completionPeriodMonths")} placeholder="0" disabled={!isEditing} />
                    </div>
                    <div>
                      <label>Bids Submitted</label>
                      <select value={formData.bidsSubmitted} onChange={onChange("bidsSubmitted")} disabled={!isEditing}><option>No</option><option>Yes</option></select>
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Tender Remarks</label>
                      <input value={formData.remarks} onChange={onChange("remarks")} placeholder="Notes…" disabled={!isEditing} />
                    </div>
                    <div>
                      <label>Status</label>
                      <select value={formData.status} onChange={onChange("status")} disabled={!isEditing}>
                        <option>Bidding Pending</option><option>Submitted</option><option>Awarded</option><option>Not Qualified</option><option>Cancelled</option><option>Live</option><option>Bidded</option>
                      </select>
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Attachments</label>
                      <input type="file" multiple onChange={onFiles("attachments")} disabled={!isEditing} />
                      <div style={{marginTop:8}}>
                        {(formData.attachments || []).map((f, i) => (
                          <div key={i} className="file-row">
                            {f.type?.startsWith("image/") ? <img src={f.url} alt={f.name} /> : (
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <FontAwesomeIcon icon={faFileExcel} />
                                <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                              </div>
                            )}
                            {isEditing && <button className="btn btn-ghost" type="button" onClick={()=>removeFile("attachments", i)}>Remove</button>}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div></div>
                  </div>
                </div>
              </section>

              {/* Project */}
              <section className="panel">
                <header>
                  <div>
                    <div className="h">Project Details</div>
                    <div className="sub">Work order, PSD/ASD, DLP, completion</div>
                  </div>
                </header>
                <div className="body">
                  <div className="row-2">
                    <div>
                      <label>Sr No / Unique Project No (PFEPL Internal)</label>
                      <input value={formData.srNoOrUniqueProjectNo} onChange={onChange("srNoOrUniqueProjectNo")} placeholder="PRJ/2025/001" />
                    </div>
                    <div>
                      <label>Form Of PSD</label>
                      <select value={formData.formOfPsd} onChange={onChange("formOfPsd")}><option>BG</option><option>FDR</option></select>
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Date Of LOA / LOI</label>
                      <input type="date" value={formData.dateOfLoaLoi} onChange={onChange("dateOfLoaLoi")} />
                    </div>
                    <div>
                      <label>PSD BG/FDR Validity</label>
                      <input type="date" value={formData.psdBgFdrValidity} onChange={onChange("psdBgFdrValidity")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Additional Security Deposit (ASD)</label>
                      <input {...numberProps} value={formData.additionalSecurityDeposit} onChange={onChange("additionalSecurityDeposit")} placeholder="0.00" />
                    </div>
                    <div>
                      <label>PSD BG/FDR Status</label>
                      <select value={formData.psdBgFdrStatus} onChange={onChange("psdBgFdrStatus")}><option>Not Returned</option><option>Returned</option></select>
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>ASD Actual Return Date</label>
                      <input type="date" value={formData.asdActualReturnDate} onChange={onChange("asdActualReturnDate")} />
                    </div>
                    <div>
                      <label>Starting Date Of Project</label>
                      <input type="date" value={formData.startingDateOfProject} onChange={onChange("startingDateOfProject")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>ASD Planned Return Date</label>
                      <input type="date" value={formData.asdPlannedReturnDate} onChange={onChange("asdPlannedReturnDate")} />
                    </div>
                    <div>
                      <label>Completion Date As Per Work Order</label>
                      <input type="date" value={formData.completionDateAsPerWorkOrder} onChange={onChange("completionDateAsPerWorkOrder")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>PSD BG/FDR Actual Date</label>
                      <input type="date" value={formData.psdBgFdrActualDate} onChange={onChange("psdBgFdrActualDate")} />
                    </div>
                    <div>
                      <label>Value Of Contract/Work Order</label>
                      <input {...numberProps} value={formData.valueOfContractOrWorkOrder} onChange={onChange("valueOfContractOrWorkOrder")} placeholder="0.00" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>PSD BG/FDR Issued In Favor Of</label>
                      <input value={formData.psdBgFdrIssuedInFavorOf} onChange={onChange("psdBgFdrIssuedInFavorOf")} placeholder="Authority / Bank" />
                    </div>
                    <div>
                      <label>Name Of Work</label>
                      <input value={formData.nameOfWork} onChange={onChange("nameOfWork")} placeholder="Work description" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Date Of Work Order</label>
                      <input type="date" value={formData.dateOfWorkOrder} onChange={onChange("dateOfWorkOrder")} />
                    </div>
                    <div>
                      <label>Duration Of Project (months)</label>
                      <input {...intProps} value={formData.durationOfProject} onChange={onChange("durationOfProject")} placeholder="0" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Actual Date Of Completion</label>
                      <input type="date" value={formData.actualDateOfCompletion} onChange={onChange("actualDateOfCompletion")} />
                    </div>
                    <div>
                      <label>Date Of Amendment</label>
                      <input type="date" value={formData.dateOfAmendment} onChange={onChange("dateOfAmendment")} />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>ASD BG/FDR Validity</label>
                      <input type="date" value={formData.asdBgFdrValidity} onChange={onChange("asdBgFdrValidity")} />
                    </div>
                    <div>
                      <label>Remarks</label>
                      <input value={formData.projectRemarks || ""} onChange={onChange("projectRemarks")} placeholder="Notes…" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>Performance Security Deposit (PSD)</label>
                      <input {...numberProps} value={formData.performanceSecurityDeposit} onChange={onChange("performanceSecurityDeposit")} placeholder="0.00" />
                    </div>
                    <div>
                      <label>Work Completion Certificate Taken</label>
                      <select value={formData.workCompletionCertificateTaken} onChange={onChange("workCompletionCertificateTaken")}><option>No</option><option>Yes</option></select>
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>PSD BG/FDR No</label>
                      <input value={formData.psdBgFdrNo} onChange={onChange("psdBgFdrNo")} placeholder="PSD-XXXX-YYYY" />
                    </div>
                    <div>
                      <label>Work Order After Variation</label>
                      <input value={formData.workOrderAfterVariation} onChange={onChange("workOrderAfterVariation")} placeholder="Details if any" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>ASD BG/FDR Issued In Favor Of</label>
                      <input value={formData.asdBgFdrIssuedInFavorOf} onChange={onChange("asdBgFdrIssuedInFavorOf")} placeholder="Authority / Bank" />
                    </div>
                    <div>
                      <label>Defects Liability Period (months)</label>
                      <input {...intProps} value={formData.defectsLiabilityPeriod} onChange={onChange("defectsLiabilityPeriod")} placeholder="0" />
                    </div>
                  </div>

                  <div className="row-2" style={{marginTop:12}}>
                    <div>
                      <label>PSD BG/FDR Return Date</label>
                      <input type="date" value={formData.psdBgFdrReturnDate} onChange={onChange("psdBgFdrReturnDate")} />
                    </div>
                    <div>
                      <label>DLP End Date</label>
                      <input type="date" value={formData.dlpEndDate} onChange={onChange("dlpEndDate")} />
                    </div>
                  </div>

                  <div style={{marginTop:12}}>
                    <label>Attachments</label>
                    <input type="file" multiple onChange={onFiles("projectAttachments")} />
                    <div style={{marginTop:8}}>
                      {(formData.projectAttachments || []).map((f, i) => (
                        <div key={i} className="file-row">
                          {f.type?.startsWith("image/") ? <img src={f.url} alt={f.name} /> : (
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <FontAwesomeIcon icon={faFileExcel} />
                              <a href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                            </div>
                          )}
                          <button className="btn btn-ghost" type="button" onClick={()=>removeFile("projectAttachments", i)}>Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer actions */}
        <div className="fabbar">
          <div className="fabbar-inner">
            <button className="btn btn-danger" type="button" onClick={() => navigate('/dashboard')} disabled={isSaving}>Back</button>
            {isEditing && (
              <button className="btn btn-ok" type="button" onClick={async()=>{ await handleSaveAll(); navigate('/dashboard'); }} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
            </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;

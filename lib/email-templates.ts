import { formatCurrency, formatDate } from "@/lib/utils"

interface TenderEmailData {
  recipientName: string
  tenderTitle: string
  tenderReference: string
  bidAmount: number
  companyName: string
  evaluationScore?: number
  evaluationComments?: string
  nextSteps?: string
}

export const emailTemplates = {
  shortlisted: (data: TenderEmailData) => ({
    subject: `Bid Shortlisted - ${data.tenderTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B0082; margin-bottom: 20px;">Bid Shortlisted Notification</h2>
        
        <p>Dear ${data.recipientName},</p>
        
        <p>We are pleased to inform you that your bid for the following tender has been shortlisted:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tender Reference:</strong> ${data.tenderReference}</p>
          <p><strong>Title:</strong> ${data.tenderTitle}</p>
          <p><strong>Bid Amount:</strong> ${formatCurrency(data.bidAmount)}</p>
          <p><strong>Company:</strong> ${data.companyName}</p>
        </div>

        <p>Your bid has passed the initial evaluation stage and has been shortlisted for final evaluation.</p>
        
        <div style="margin-top: 20px;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Your bid will undergo detailed technical and financial evaluation</li>
            <li>You may be contacted for additional information or clarification</li>
            <li>Final results will be communicated once the evaluation is complete</li>
          </ul>
        </div>

        <p style="margin-top: 20px;">Please log in to your account to view more details.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          Procurement Team
        </p>
      </div>
    `
  }),

  evaluated: (data: TenderEmailData) => ({
    subject: `Bid Evaluation Complete - ${data.tenderTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B0082; margin-bottom: 20px;">Bid Evaluation Notification</h2>
        
        <p>Dear ${data.recipientName},</p>
        
        <p>The evaluation of your bid for the following tender has been completed:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tender Reference:</strong> ${data.tenderReference}</p>
          <p><strong>Title:</strong> ${data.tenderTitle}</p>
          <p><strong>Bid Amount:</strong> ${formatCurrency(data.bidAmount)}</p>
          <p><strong>Evaluation Score:</strong> ${data.evaluationScore}/100</p>
        </div>

        ${data.evaluationComments ? `
          <div style="margin-top: 20px;">
            <p><strong>Evaluation Comments:</strong></p>
            <p>${data.evaluationComments}</p>
          </div>
        ` : ''}

        <p style="margin-top: 20px;">${data.nextSteps || 'The final decision will be communicated shortly.'}</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          Procurement Team
        </p>
      </div>
    `
  }),

  awarded: (data: TenderEmailData) => ({
    subject: `Tender Award Notification - ${data.tenderTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B0082; margin-bottom: 20px;">🎉 Congratulations! Tender Awarded</h2>
        
        <p>Dear ${data.recipientName},</p>
        
        <p>We are delighted to inform you that your bid has been successful and you have been awarded the following tender:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tender Reference:</strong> ${data.tenderReference}</p>
          <p><strong>Title:</strong> ${data.tenderTitle}</p>
          <p><strong>Awarded Amount:</strong> ${formatCurrency(data.bidAmount)}</p>
          <p><strong>Company:</strong> ${data.companyName}</p>
        </div>

        <div style="margin-top: 20px;">
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Please log in to your account to review and accept the award</li>
            <li>Submit required documentation within 7 working days</li>
            <li>Schedule contract signing meeting</li>
            <li>Begin project implementation planning</li>
          </ul>
        </div>

        <p style="margin-top: 20px;">Our team will contact you shortly to guide you through the next steps.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          Procurement Team
        </p>
      </div>
    `
  }),

  rejected: (data: TenderEmailData) => ({
    subject: `Bid Status Update - ${data.tenderTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4B0082; margin-bottom: 20px;">Bid Status Notification</h2>
        
        <p>Dear ${data.recipientName},</p>
        
        <p>Thank you for your participation in the following tender:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tender Reference:</strong> ${data.tenderReference}</p>
          <p><strong>Title:</strong> ${data.tenderTitle}</p>
          <p><strong>Bid Amount:</strong> ${formatCurrency(data.bidAmount)}</p>
        </div>

        <p>We regret to inform you that your bid was not successful on this occasion.</p>

        ${data.evaluationComments ? `
          <div style="margin-top: 20px;">
            <p><strong>Feedback:</strong></p>
            <p>${data.evaluationComments}</p>
          </div>
        ` : ''}

        <p style="margin-top: 20px;">We encourage you to participate in future tender opportunities.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          Procurement Team
        </p>
      </div>
    `
  })
} 
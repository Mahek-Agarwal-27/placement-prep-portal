import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean, professional PDF report of user data.
 * @param {Object} data - The user data payload from /api/users/export-data
 */
export const generateUserDataPDF = (data) => {
  const doc = new jsPDF();
  const { user, dsaProgress = [], resumeHistory = [], aiInteractionHistory = [], activityTimeline = [] } = data;

  const userName = user?.name || 'Student';
  const userEmail = user?.email || 'N/A';
  const college = user?.profile?.college || 'N/A';
  const targetRole = user?.placementGoal?.targetRole || 'Software Engineer';
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  let y = 15;

  // Title Header Banner
  doc.setFillColor(37, 99, 235); // Blue #2563EB
  doc.rect(0, 0, 210, 28, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('HireNova AI — Student Placement & Prep Report', 14, 14);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated on: ${dateStr}`, 14, 22);

  y = 38;

  // Student Profile Card
  doc.setDrawColor(229, 231, 235); // Gray #E5E7EB
  doc.setFillColor(248, 250, 252); // Soft gray #F8FAFC
  doc.roundedRect(14, y, 182, 38, 3, 3, 'FD');

  doc.setTextColor(17, 24, 39); // Text dark #111827
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Student Profile Summary', 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${userName}`, 20, y + 18);
  doc.text(`Email: ${userEmail}`, 20, y + 25);
  doc.text(`College: ${college}`, 20, y + 32);

  doc.text(`Target Role: ${targetRole}`, 110, y + 18);
  doc.text(`Prep Level: ${user?.placementGoal?.prepLevel || 'Intermediate'}`, 110, y + 25);
  doc.text(`Total DSA Solved: ${dsaProgress.length}`, 110, y + 32);

  y += 48;

  // Section 1: Placement Metrics
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('1. Key Placement Metrics', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const latestATS = resumeHistory.length > 0 ? `${resumeHistory[0].atsScore}/100` : 'No Resume Uploaded';
  doc.text(`• Latest Resume ATS Score: ${latestATS}`, 18, y);
  y += 6;
  doc.text(`• Total AI Study Sessions: ${aiInteractionHistory.length}`, 18, y);
  y += 6;
  doc.text(`• Total Tracked Activities: ${activityTimeline.length}`, 18, y);

  y += 12;

  // Section 2: DSA Solved Problems
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('2. DSA Problem Progress (Recent 5)', 14, y);
  y += 6;

  if (dsaProgress.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('No DSA problems recorded yet.', 18, y);
    y += 8;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    dsaProgress.slice(0, 5).forEach((q) => {
      doc.text(`• [${q.difficulty || 'Easy'}] ${q.title} (${q.topic || 'DSA'}) - ${q.status || 'solved'}`, 18, y);
      y += 6;
    });
  }

  y += 8;

  // Section 3: AI Interaction History
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text('3. AI Notes & Interactions (Recent 5)', 14, y);
  y += 6;

  if (aiInteractionHistory.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('No AI history interactions logged yet.', 18, y);
    y += 8;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    aiInteractionHistory.slice(0, 5).forEach((ai) => {
      doc.text(`• [${ai.category?.toUpperCase() || 'NOTE'}] ${ai.title}`, 18, y);
      y += 6;
    });
  }

  y += 12;

  // Footer
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 280, 196, 280);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('HireNova AI — Enterprise Placement Companion | Confidential Data Export', 14, 286);

  // Save PDF file
  doc.save(`HireNova_Placement_Report_${userName.replace(/\s+/g, '_')}.pdf`);
};

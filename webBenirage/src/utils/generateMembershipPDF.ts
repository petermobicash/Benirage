import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Define types for form data
interface MembershipFormData {
  applicationId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fatherName?: string;
  motherName?: string;
  photoUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  occupation?: string;
  education?: string;
  organization?: string;
  englishLevel?: string;
  frenchLevel?: string;
  kinyarwandaLevel?: string;
  skills: string[];
  workExperience?: string;
  interests: string[];
  whyJoin: string;
  membershipCategory?: string;
  reference1Name?: string;
  reference1Contact?: string;
  reference1Relationship?: string;
  reference2Name?: string;
  reference2Contact?: string;
  reference2Relationship?: string;
  dataConsent: boolean;
  termsAccepted: boolean;
  codeOfConductAccepted: boolean;
  communicationConsent: boolean;
}

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): string => {
  if (!dateOfBirth) return 'N/A';
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return `${age} years old`;
};

// Function to generate the PDF
export const generateMembershipPDF = async (formData: MembershipFormData): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add gradient background
  const addGradientBackground = (startColor: string, height: number) => {
    // jsPDF doesn't support gradients directly, so we'll simulate with solid colors
    pdf.setFillColor(startColor);
    pdf.rect(0, yPosition, pageWidth, height, 'F');
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, icon: string, color: string = '#05294b') => {
    pdf.setFillColor('#f8fafc');
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
    pdf.setTextColor(color);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${icon} ${title}`, margin + 5, yPosition + 10);
    yPosition += 20;
  };

  // Helper function to add text field
  const addTextField = (label: string, value: string, x: number = margin, y: number = yPosition) => {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#05294b');
    pdf.text(label, x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#000000');
    pdf.text(value || 'N/A', x, y + 5);
    yPosition = y + 10;
  };

  // Header with purple gradient
  addGradientBackground('#8b5cf6', 50);
  pdf.setTextColor('#ffffff');
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BENIRAGE Membership Application', pageWidth / 2, yPosition + 15, { align: 'center' });
  // Add Approved status
  pdf.setFillColor('#22c55e');
  pdf.rect(pageWidth - margin - 80, yPosition + 5, 70, 15, 'F');
  pdf.setTextColor('#ffffff');
  pdf.setFontSize(10);
  pdf.text('✅ APPROVED', pageWidth - margin - 45, yPosition + 15, { align: 'center' });
  // Add Application ID
  pdf.setFillColor('#fbbf24');
  pdf.rect(margin, yPosition + 25, pageWidth - 2 * margin, 15, 'F');
  pdf.setTextColor('#92400e');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Application ID: ${formData.applicationId || 'N/A'}`, pageWidth / 2, yPosition + 35, { align: 'center' });
  yPosition += 55;

  // Applicant info section (left: photo, name, title; right: logo)
  pdf.setFillColor('#ffffff');
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 60, 'F');

  // Left side: Photo, name, title
  if (formData.photoUrl) {
    try {
      // Assume photoUrl is already a base64 data URL or a valid URL
      if (formData.photoUrl.startsWith('data:')) {
        pdf.addImage(formData.photoUrl, 'JPEG', margin + 10, yPosition + 10, 40, 40);
      } else {
        const imgData = await fetch(formData.photoUrl).then(res => res.blob()).then(blob => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        });
        pdf.addImage(imgData, 'JPEG', margin + 10, yPosition + 10, 40, 40);
      }
    } catch (error) {
      console.error('Error loading user photo:', error);
      // Add a placeholder
      pdf.setDrawColor('#d1d5db');
      pdf.setLineWidth(1);
      pdf.rect(margin + 10, yPosition + 10, 40, 40, 'S');
      pdf.setFontSize(8);
      pdf.text('Photo', margin + 30, yPosition + 30, { align: 'center' });
    }
  }
  pdf.setTextColor('#000000');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${formData.firstName} ${formData.lastName}`, margin + 60, yPosition + 15);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formData.membershipCategory || 'Member', margin + 60, yPosition + 25);
  pdf.text(`Age: ${calculateAge(formData.dateOfBirth || '')}`, margin + 60, yPosition + 35);

  // Right side: Benirage logo
  try {
    const logoData = await fetch('/benirage.png').then(res => res.blob()).then(blob => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });
    pdf.addImage(logoData, 'PNG', pageWidth - margin - 50, yPosition + 10, 40, 40);
  } catch (error) {
    console.error('Error loading logo:', error);
    // Add a placeholder for logo
    pdf.setDrawColor('#d1d5db');
    pdf.setLineWidth(1);
    pdf.rect(pageWidth - margin - 50, yPosition + 10, 40, 40, 'S');
    pdf.setFontSize(8);
    pdf.text('Logo', pageWidth - margin - 30, yPosition + 30, { align: 'center' });
  }
  yPosition += 70;

  // Personal Information Section
  addSectionHeader('Personal Information', '👤');
  addTextField('Full Name:', `${formData.firstName} ${formData.lastName}`);
  addTextField('Email:', formData.email);
  addTextField('Phone:', formData.phone);
  if (formData.fatherName) addTextField('Father\'s Name:', formData.fatherName);
  if (formData.motherName) addTextField('Mother\'s Name:', formData.motherName);
  addTextField('Gender:', formData.gender || 'N/A');
  addTextField('Date of Birth:', formData.dateOfBirth || 'N/A');
  yPosition += 10;

  // Location Information Section
  addSectionHeader('Location Information', '📍');
  addTextField('Country:', formData.country || 'N/A');
  addTextField('District:', formData.district || 'N/A');
  addTextField('Sector:', formData.sector || 'N/A');
  addTextField('Cell:', formData.cell || 'N/A');
  addTextField('Village:', formData.village || 'N/A');
  yPosition += 10;

  // Education & Work Section
  addSectionHeader('Education & Work', '🎓');
  addTextField('Occupation:', formData.occupation || 'N/A');
  addTextField('Education Level:', formData.education || 'N/A');
  addTextField('Organization:', formData.organization || 'N/A');
  if (formData.workExperience) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Work Experience:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    const splitText = pdf.splitTextToSize(formData.workExperience, pageWidth - 2 * margin - 10);
    pdf.text(splitText, margin, yPosition + 5);
    yPosition += splitText.length * 5 + 10;
  }
  yPosition += 10;

  // Language Skills Section
  addSectionHeader('Language Skills', '🌐');
  addTextField('English Level:', formData.englishLevel || 'N/A');
  addTextField('French Level:', formData.frenchLevel || 'N/A');
  addTextField('Kinyarwanda Level:', formData.kinyarwandaLevel || 'N/A');
  yPosition += 10;

  // Skills Section
  addSectionHeader('Skills & Expertise', '⚡');
  if (formData.skills.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formData.skills.join(', '), margin, yPosition);
    yPosition += 15;
  } else {
    addTextField('Skills:', 'None selected');
  }
  yPosition += 10;

  // Interests Section
  addSectionHeader('Areas of Interest', '💡');
  if (formData.interests.length > 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formData.interests.join(', '), margin, yPosition);
    yPosition += 15;
  } else {
    addTextField('Interests:', 'None selected');
  }
  yPosition += 10;

  // References Section
  addSectionHeader('References', '📞');
  if (formData.reference1Name) {
    addTextField('Reference 1 Name:', formData.reference1Name);
    addTextField('Contact:', formData.reference1Contact || 'N/A');
    addTextField('Relationship:', formData.reference1Relationship || 'N/A');
  }
  if (formData.reference2Name) {
    addTextField('Reference 2 Name:', formData.reference2Name);
    addTextField('Contact:', formData.reference2Contact || 'N/A');
    addTextField('Relationship:', formData.reference2Relationship || 'N/A');
  }
  yPosition += 10;

  // Why Join Section
  addSectionHeader('Why Join BENIRAGE?', '❓');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reason:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  const splitWhyJoin = pdf.splitTextToSize(formData.whyJoin, pageWidth - 2 * margin - 10);
  pdf.text(splitWhyJoin, margin, yPosition + 5);
  yPosition += splitWhyJoin.length * 5 + 15;

  // Check if we need a new page
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  // Declaration Section
  addGradientBackground('#9ca3af', 30);
  pdf.setDrawColor('#1e3a8a');
  pdf.setLineWidth(2);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 80, 'S');
  pdf.setTextColor('#000000');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Declaration & Consent', margin + 5, yPosition + 10);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const declarationText = 'I hereby declare that all the information provided in this application is true and accurate to the best of my knowledge. I understand that any false information may result in the rejection of my application or termination of membership.';
  const splitDeclaration = pdf.splitTextToSize(declarationText, pageWidth - 2 * margin - 10);
  pdf.text(splitDeclaration, margin + 5, yPosition + 20);
  yPosition += 90;

  // Consent Checkboxes
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Consents:', margin, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formData.dataConsent ? '☑️' : '☐', margin + 30, yPosition);
  pdf.text('Data Consent', margin + 40, yPosition);
  yPosition += 5;
  pdf.text(formData.termsAccepted ? '☑️' : '☐', margin + 30, yPosition);
  pdf.text('Terms Accepted', margin + 40, yPosition);
  yPosition += 5;
  pdf.text(formData.codeOfConductAccepted ? '☑️' : '☐', margin + 30, yPosition);
  pdf.text('Code of Conduct', margin + 40, yPosition);
  yPosition += 5;
  pdf.text(formData.communicationConsent ? '☑️' : '☐', margin + 30, yPosition);
  pdf.text('Communication Consent', margin + 40, yPosition);
  yPosition += 15;

  // Signature Sections
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Signatures:', margin, yPosition);
  yPosition += 10;

  // Member Signature
  pdf.text('Member:', margin, yPosition);
  pdf.line(margin + 30, yPosition - 2, margin + 100, yPosition - 2);
  pdf.text(`${formData.firstName} ${formData.lastName}`, margin + 30, yPosition + 5);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin + 30, yPosition + 10);
  yPosition += 20;

  // Secretary General Signature
  pdf.text('Secretary General / Custodian:', margin, yPosition);
  pdf.line(margin + 50, yPosition - 2, margin + 120, yPosition - 2);
  pdf.text('Name: ________________________', margin + 50, yPosition + 5);
  pdf.text('Date: ________________________', margin + 50, yPosition + 10);
  yPosition += 20;

  // Legal Representative Signature
  pdf.text('Legal Representative:', margin, yPosition);
  pdf.line(margin + 40, yPosition - 2, margin + 110, yPosition - 2);
  pdf.text('Name: ________________________', margin + 40, yPosition + 5);
  pdf.text('Date: ________________________', margin + 40, yPosition + 10);
  yPosition += 20;

  // Official Stamp Placeholder
  pdf.setDrawColor('#d97706');
  pdf.setLineWidth(1);
  pdf.circle(pageWidth - margin - 30, yPosition - 10, 20, 'S');
  pdf.text('Official Stamp', pageWidth - margin - 50, yPosition + 5, { align: 'center' });
  yPosition += 30;

  // Footer
  addGradientBackground('#05294b', 40);
  pdf.setTextColor('#cfb53b');
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BENIRAGE', margin + 10, pageHeight - 25);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('© 2025 BENIRAGE. All rights reserved.', pageWidth / 2, pageHeight - 25, { align: 'center' });
  pdf.text('Contact • Support • Privacy', pageWidth - margin - 10, pageHeight - 25, { align: 'right' });
  // Add logo in footer
  try {
    const logoData = await fetch('/benirage.png').then(res => res.blob()).then(blob => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    });
    pdf.addImage(logoData, 'PNG', margin + 10, pageHeight - 35, 20, 20);
  } catch (error) {
    console.error('Error loading footer logo:', error);
  }

  // Save the PDF
  pdf.save(`Membership_Application_${formData.firstName}_${formData.lastName}.pdf`);
};
import Section from '../components/ui/Section';

const Privacy = () => {
  return (
    <div>
      {/* Hero Section */}
      <Section background="white" padding="xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            BENIRAGE Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Effective Date: October 21, 2025
          </p>
          <p className="text-lg text-gray-600">
            Last Updated: October 21, 2025
          </p>
        </div>
      </Section>

      {/* Privacy Policy Content */}
      <Section background="white" padding="xl">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2>1. Introduction</h2>
          <p>
            BENIRAGE is a non-governmental organization (NGO) founded in May 2024, and officially registered under legal personality number 000070|RGB|NGO|LP|01|2025 by the Rwanda Governance Board (RGB).
          </p>
          <p>
            At BENIRAGE, we are committed to protecting the privacy and personal data of our members, partners, beneficiaries, researchers, volunteers, and website visitors. This Privacy Policy explains how we collect, use, store, and protect your information when you interact with our organization—whether through our website, digital platforms, events, or community programs.
          </p>
          <p>
            By engaging with BENIRAGE, you agree to the terms of this Privacy Policy.
          </p>

          <h2>2. Purpose of Data Collection</h2>
          <p>
            As a cultural and educational organization, BENIRAGE collects personal information solely to support our mission of promoting Rwandan heritage, education, research, and cultural preservation. We use data responsibly to improve our programs, manage communications, and maintain transparent relationships with our stakeholders.
          </p>

          <h2>3. Information We Collect</h2>
          <p>We collect both personal and non-personal information, including:</p>

          <h3>a. Information You Provide Directly</h3>
          <ul>
            <li>Identity information: name, date of birth, gender, and nationality</li>
            <li>Contact details: email, phone number, postal address</li>
            <li>Membership or volunteer information: registration details, participation in activities or events</li>
            <li>Donor and partner information: contributions, organization name, and contact records</li>
            <li>Communication records: feedback, messages, or correspondence with BENIRAGE</li>
          </ul>

          <h3>b. Information Collected Automatically</h3>
          <p>When you visit our website or digital platforms, we may collect:</p>
          <ul>
            <li>IP address, browser type, and device data</li>
            <li>Usage patterns, pages visited, and interaction time</li>
            <li>Cookies and similar technologies (for analytics and site functionality)</li>
          </ul>

          <h2>4. How We Use Your Information</h2>
          <p>We use collected information for the following legitimate purposes:</p>
          <ul>
            <li>To manage membership and volunteer participation</li>
            <li>To communicate with you about BENIRAGE's programs, events, and opportunities</li>
            <li>To process donations and maintain donor records</li>
            <li>To conduct educational, cultural, or research-related activities</li>
            <li>To evaluate and improve our initiatives and digital platforms</li>
            <li>To comply with national laws, audit requirements, or reporting obligations</li>
          </ul>
          <p>We do not sell, rent, or trade personal information to any third parties.</p>

          <h2>5. Data Sharing and Disclosure</h2>
          <p>Your information may be shared only in limited circumstances:</p>
          <ul>
            <li>With trusted partners or service providers who assist in hosting, communication, or event management — under strict confidentiality agreements</li>
            <li>With government authorities where required by Rwandan law or to comply with lawful requests</li>
            <li>With your explicit consent, when you agree to participate in research, interviews, or public projects</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We take appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, loss, or misuse. Our systems and data are hosted on secure platforms (such as AWS or equivalent cloud services) and managed in accordance with international best practices in data protection.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain personal data only as long as necessary to fulfill the purpose for which it was collected, or as required by law. When information is no longer needed, it is securely deleted or anonymized.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Correct or update your information</li>
            <li>Withdraw your consent for communications or participation</li>
            <li>Request deletion of your personal data (subject to legal or contractual obligations)</li>
          </ul>
          <p>
            To exercise these rights, contact us at: 📧 privacy@benirage.org
          </p>
        </div>
      </Section>
    </div>
  );
};

export default Privacy;
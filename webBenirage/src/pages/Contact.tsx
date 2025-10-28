import React, { useState } from 'react';
import { submitContactForm } from '../lib/supabase';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    organization: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Supabase database
      const result = await submitContactForm({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        subject: formData.subject,
        message: formData.message,
        status: 'new'
      });
      
      if (result.success) {
        alert('Thank you for your message! We have received your inquiry and will get back to you within 24 hours.');
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', subject: '', message: '',
          organization: ''
        });
      } else {
        throw new Error('Submission failed');
      }
      
    } catch (error) {
      console.error('Contact form error:', error);
      alert('There was an error submitting your message. Please try again or contact us directly at info@benirage.org');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <Section background="blue" padding="xl">
        <div className="text-center">
          <div className="text-6xl mb-6">📞</div>
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
            We'd love to hear from you. Connect with BENIRAGE today.
          </p>
        </div>
      </Section>

      {/* Contact Methods */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
            How to Reach Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">📧</div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Email
            </h3>
            <p className="text-yellow-600 font-semibold text-lg mb-2">info@benirage.org</p>
            <p className="text-gray-600 text-sm mb-4">Send us a detailed message</p>
            <a href="mailto:info@benirage.org">
              <Button variant="outline" size="sm">
                Send Email
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">📞</div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Phone
            </h3>
            <p className="text-yellow-600 font-semibold text-lg mb-2">(+250) 788 123 456</p>
            <p className="text-gray-600 text-sm mb-4">Call us during office hours</p>
            <a href="tel:+250788123456">
              <Button variant="outline" size="sm">
                Call Now
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">💬</div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              WhatsApp
            </h3>
            <p className="text-yellow-600 font-semibold text-lg mb-2">(+250) 788 123 456</p>
            <p className="text-gray-600 text-sm mb-4">Quick messages and support</p>
            <a href="https://wa.me/250788123456" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Chat on WhatsApp
              </Button>
            </a>
          </Card>

          <Card variant="premium" className="text-center hover:scale-105 transition-transform">
            <div className="text-5xl mb-6">📍</div>
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Address
            </h3>
            <p className="text-yellow-600 font-semibold text-lg mb-2">Kigali, Rwanda</p>
            <p className="text-gray-600 text-sm mb-4">Visit our office location</p>
            <a href="https://maps.google.com/?q=Kigali,Rwanda" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                View Location
              </Button>
            </a>
          </Card>
        </div>
      </Section>

      {/* Contact Form */}
      <Section background="cultural" padding="xl">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Send us a Message
            </h2>
            <p className="text-xl text-gray-700">
              Whether you have questions, want to get involved, or need more information
            </p>
          </div>

          <Card variant="premium">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-blue-900 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-blue-900 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-blue-900 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="+250 ... or your country code"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-blue-900 mb-2">
                  Organization (Optional)
                </label>
                <input
                  type="text"
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Your organization or company"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-blue-900 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Membership">Membership Information</option>
                  <option value="Volunteer Opportunities">Volunteer Opportunities</option>
                  <option value="Partnership">Partnership Proposal</option>
                  <option value="Donation">Donation & Support</option>
                  <option value="Programs">Programs & Events</option>
                  <option value="Media & Press">Media & Press</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feedback">Feedback & Suggestions</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-blue-900 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  placeholder="Tell us more about your inquiry, questions, or how we can help you..."
                />
              </div>

              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending Message...' : 'Send Message'}
                </Button>
                <p className="text-sm text-gray-600 mt-4">
                  We typically respond within 24 hours during business days
                </p>
              </div>
            </form>
          </Card>
        </div>
      </Section>

      {/* Office Hours */}
      <Section background="white" padding="xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="premium">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                🕒 Office Hours
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium">9:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium">Closed</span>
                </div>
                <div className="flex justify-between">
                  <span>Public Holidays:</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  📱 WhatsApp support available 24/7 for urgent matters
                </p>
              </div>
            </Card>

            <Card variant="premium">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                📍 Visit Our Office
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">🏢</div>
                  <div>
                    <p className="font-medium text-blue-900">BENIRAGE Headquarters</p>
                    <p className="text-gray-600">Kigali, Rwanda</p>
                    <p className="text-gray-600 text-sm">Detailed address provided upon appointment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">📞</div>
                  <div>
                    <p className="font-medium text-blue-900">Schedule a Visit</p>
                    <p className="text-gray-600">Call ahead to schedule an appointment</p>
                    <p className="text-gray-600 text-sm">We welcome visitors and community members</p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <a href="https://maps.google.com/?q=Kigali,Rwanda" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full">
                    🗺️ View on Map
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Contact;
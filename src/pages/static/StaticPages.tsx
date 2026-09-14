import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

// About Page
export const AboutPage: React.FC = () => {
  return (
    <div className="gov-static-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'About IP-SAKTI Sahayak', link: '/about' }]} />
      <div className="gov-container static-container">
        <div className="gov-card p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={32} className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold">About IP-SAKTI Sahayak (IP शक्ति सहायक)</h1>
              <p className="text-muted">National Ayurveda Intellectual Property & Regulatory Portal</p>
            </div>
          </div>
          <p className="mb-4">
            IP-SAKTI Sahayak is a specialized public-service technological platform inspired by the structured information architecture of national portals like India Post. Its primary mission is to empower Ayurveda innovators, Vaidyas, botanical drug developers, and academic researchers to understand and navigate the complex landscape of intellectual property.
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">Core Pillars of the Platform:</h2>
          <ul className="cat-list mb-6">
            <li>• <strong>Task First, Feature Second:</strong> Users describe their problems in plain Indian languages rather than memorizing legal jargon.</li>
            <li>• <strong>Evidence-Grounded RAG Engine:</strong> Every legal finding is tied to exact statutory clauses (Patents Act 1970, Biodiversity Act 2002, AYUSH guidelines).</li>
            <li>• <strong>Safe Abstention & Transparency:</strong> The platform refrains from confident guesswork when formulation facts are incomplete.</li>
            <li>• <strong>Human Expert in the Loop:</strong> Facilitates seamless case escalation to empanelled patent attorneys and Traditional Knowledge experts.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Contact Page
export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="gov-static-page" id="main-content">
      <Breadcrumbs customTrail={[{ title: 'Contact & Grievance', link: '/contact' }]} />
      <div className="gov-container static-container">
        <div className="gov-card p-8">
          <h1 className="text-2xl font-bold mb-2">Contact & Grievance Redressal</h1>
          <p className="text-muted mb-6">
            Reach out to our National Ayurveda IP Facilitation cell or submit queries regarding case review status.
          </p>

          <div className="contact-grid">
            <div className="contact-info-col">
              <div className="contact-info-item">
                <Mail size={18} className="text-primary" />
                <div>
                  <strong>Email Support</strong>
                  <p>support@ipsakti.gov.in / helpdesk@ipsakti.in</p>
                </div>
              </div>
              <div className="contact-info-item">
                <Phone size={18} className="text-secondary" />
                <div>
                  <strong>National IP Helpline</strong>
                  <p>1800-11-AYUSH (Toll-Free, Mon-Fri 9:30 AM to 6:00 PM IST)</p>
                </div>
              </div>
              <div className="contact-info-item">
                <MapPin size={18} className="text-accent" />
                <div>
                  <strong>Ayurveda IP Facilitation Cell</strong>
                  <p>New Delhi, India</p>
                </div>
              </div>
            </div>

            <div className="contact-form-col">
              {sent ? (
                <div className="gov-card bg-success-bg p-6 text-center">
                  <CheckCircle2 size={32} className="text-success mx-auto mb-2" />
                  <h3 className="font-bold">Message Submitted Successfully</h3>
                  <p className="text-sm">A support representative will respond to your registered email within 24 business hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-field-group">
                    <label className="gov-input-label">Your Name</label>
                    <input type="text" className="gov-input" required placeholder="Dr. / Vaidya / Innovator Name" />
                  </div>
                  <div className="form-field-group">
                    <label className="gov-input-label">Email Address</label>
                    <input type="email" className="gov-input" required placeholder="name@domain.com" />
                  </div>
                  <div className="form-field-group">
                    <label className="gov-input-label">Message / Inquiry</label>
                    <textarea rows={3} className="gov-textarea" required placeholder="Describe your query or case ID..." />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    <Send size={16} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

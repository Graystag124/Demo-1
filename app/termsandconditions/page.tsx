import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Byberr',
  description: 'Byberr Terms and Conditions - Please read these terms carefully before using our platform.',
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-primary mb-12">Last Updated: November 26, 2025</p>

        <div className="space-y-12">
          <section>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Welcome to Byberr! These Terms of Service ("Terms") govern your access to and use of the Byberr platform, 
              including any content, functionality, and services offered on or through byberr.com.
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Please read these Terms carefully before using our platform. By accessing or using our services, you agree 
              to be bound by these Terms and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">1. Account Registration</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You must be at least 18 years old to create an account.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You agree to provide accurate and complete information when creating your account.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">2. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              {[
                "Violate any laws or regulations",
                "Infringe on intellectual property rights",
                "Upload or transmit viruses or malicious code",
                "Interfere with the security of the service",
                "Engage in fraudulent activities",
                "Harass or harm other users"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">3. Content Ownership</h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of all content you submit, post, or display on our platform. By making content available, you grant Byberr a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">4. Payments and Fees</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>All fees are non-refundable unless otherwise stated.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>You are responsible for any applicable taxes.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>We reserve the right to change our fees at any time with notice.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">5. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your access to our services at any time, with or without cause, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b border-border pb-2">6. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the maximum extent permitted by law, Byberr shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services.
            </p>
          </section>

          <section className="bg-muted/40 p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-2">If you have any questions about these Terms, please contact us at:</p>
            <p className="text-primary">support@byberr.com</p>
          </section>

          <div className="pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
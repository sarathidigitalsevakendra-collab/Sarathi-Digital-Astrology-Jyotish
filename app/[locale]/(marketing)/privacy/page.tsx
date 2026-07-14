import { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSection,
  LegalSubsection,
  LegalParagraph,
  LegalList,
  LegalCallout,
  LegalTable,
  LegalTableHead,
  LegalTableBody,
  LegalTableRow,
  LegalTableHeader,
  LegalTableCell,
  LegalContactBox,
  LegalFooter,
  LegalLink,
} from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy | Jyotishya",
  description:
    "How we collect, use, and protect your personal data in compliance with IT Act 2000 and GDPR",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" effectiveDate="January 1, 2025">
      <LegalSection title="1. Introduction">
        <LegalParagraph>
          Welcome to Jyotishya ("we," "our," or "us"). We are committed to protecting your personal
          information and your right to privacy. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our website and mobile application
          (collectively, the "Service").
        </LegalParagraph>

        <LegalParagraph>
          This Privacy Policy is designed to comply with the Information Technology Act, 2000 and
          the Information Technology (Reasonable Security Practices and Procedures and Sensitive
          Personal Data or Information) Rules, 2011, as well as the General Data Protection
          Regulation (GDPR) for users in the European Economic Area.
        </LegalParagraph>

        <LegalParagraph>
          By using our Service, you agree to the collection and use of information in accordance
          with this Privacy Policy. If you do not agree with our policies and practices, please do
          not use our Service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <LegalSubsection title="2.1 Personal Information You Provide">
          <LegalParagraph>
            We collect the following personal information that you voluntarily provide:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>Account Information:</strong> Name, email address, phone number, password
            </li>
            <li>
              <strong>Birth Details:</strong> Date of birth, time of birth, place of birth (city,
              state, country, coordinates)
            </li>
            <li>
              <strong>Profile Information:</strong> Gender, preferred language, timezone
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely by Razorpay (we do not store
              complete card details)
            </li>
            <li>
              <strong>Communication Data:</strong> Messages you send through our consultation
              booking system
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="2.2 Information Collected Automatically">
          <LegalParagraph>When you access our Service, we automatically collect:</LegalParagraph>
          <LegalList>
            <li>
              <strong>Usage Data:</strong> Pages viewed, features used, time spent on Service, click
              patterns
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type, operating system,
              device identifiers
            </li>
            <li>
              <strong>Location Data:</strong> Approximate location based on IP address (for timezone
              and regional content)
            </li>
            <li>
              <strong>Cookies and Tracking:</strong> Session cookies, analytics cookies (see Section
              7 for details)
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="2.3 Information from Third Parties">
          <LegalList>
            <li>
              <strong>OAuth Providers:</strong> If you sign in with Google, we receive your name,
              email, and profile photo
            </li>
            <li>
              <strong>Payment Gateway:</strong> Razorpay shares transaction status and payment IDs
              with us
            </li>
            <li>
              <strong>Analytics Services:</strong> Vercel Analytics, Sentry (error monitoring)
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <LegalParagraph>We use your information for the following purposes:</LegalParagraph>
        <LegalList>
          <li>
            <strong>Service Delivery:</strong> Generate birth charts, calculate astrological
            predictions, provide daily horoscopes
          </li>
          <li>
            <strong>Personalization:</strong> Customize AI interpretations based on your birth
            details and preferences
          </li>
          <li>
            <strong>Account Management:</strong> Create and manage your account, authenticate users,
            handle subscriptions
          </li>
          <li>
            <strong>Payment Processing:</strong> Process payments, prevent fraud, issue refunds via
            Razorpay
          </li>
          <li>
            <strong>Communication:</strong> Send transactional emails (welcome, subscription
            confirmations, booking updates)
          </li>
          <li>
            <strong>Improvement:</strong> Analyze usage patterns to improve features, fix bugs,
            optimize performance
          </li>
          <li>
            <strong>Legal Compliance:</strong> Comply with applicable laws, respond to legal
            requests, enforce our Terms of Service
          </li>
          <li>
            <strong>Security:</strong> Monitor for suspicious activity, prevent unauthorized access,
            protect user data
          </li>
        </LegalList>

        <LegalCallout type="info" title="Marketing Communications">
          We will NOT send marketing emails or promotional content unless you explicitly opt-in. You
          can unsubscribe from marketing emails at any time by clicking the "unsubscribe" link.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="4. Third-Party Services & Data Sharing">
        <LegalParagraph>
          We share your information with the following trusted third-party service providers:
        </LegalParagraph>

        <LegalTable>
          <LegalTableHead>
            <LegalTableRow>
              <LegalTableHeader>Service</LegalTableHeader>
              <LegalTableHeader>Purpose</LegalTableHeader>
              <LegalTableHeader>Privacy Policy</LegalTableHeader>
            </LegalTableRow>
          </LegalTableHead>
          <LegalTableBody>
            <LegalTableRow>
              <LegalTableCell>Supabase</LegalTableCell>
              <LegalTableCell>Database & Authentication</LegalTableCell>
              <LegalTableCell>
                <LegalLink href="https://supabase.com/privacy">supabase.com/privacy</LegalLink>
              </LegalTableCell>
            </LegalTableRow>
            <LegalTableRow>
              <LegalTableCell>OpenAI</LegalTableCell>
              <LegalTableCell>AI-powered interpretations</LegalTableCell>
              <LegalTableCell>
                <LegalLink href="https://openai.com/privacy">openai.com/privacy</LegalLink>
              </LegalTableCell>
            </LegalTableRow>
            <LegalTableRow>
              <LegalTableCell>Razorpay</LegalTableCell>
              <LegalTableCell>Payment processing</LegalTableCell>
              <LegalTableCell>
                <LegalLink href="https://razorpay.com/privacy">razorpay.com/privacy</LegalLink>
              </LegalTableCell>
            </LegalTableRow>
            <LegalTableRow>
              <LegalTableCell>Vercel</LegalTableCell>
              <LegalTableCell>Hosting & Analytics</LegalTableCell>
              <LegalTableCell>
                <LegalLink href="https://vercel.com/legal/privacy-policy">
                  vercel.com/legal/privacy-policy
                </LegalLink>
              </LegalTableCell>
            </LegalTableRow>
            <LegalTableRow>
              <LegalTableCell>Sentry</LegalTableCell>
              <LegalTableCell>Error monitoring</LegalTableCell>
              <LegalTableCell>
                <LegalLink href="https://sentry.io/privacy">sentry.io/privacy</LegalLink>
              </LegalTableCell>
            </LegalTableRow>
          </LegalTableBody>
        </LegalTable>

        <LegalParagraph>
          <strong>We will NEVER:</strong>
        </LegalParagraph>
        <LegalList>
          <li>Sell your personal information to third parties</li>
          <li>Share your birth chart data with advertisers</li>
          <li>Use your data for purposes other than those stated in this policy</li>
          <li>Transfer your data outside of secure, compliant service providers</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Your Privacy Rights">
        <LegalParagraph>
          Under Indian law (IT Act 2000) and GDPR (for EU users), you have the following rights:
        </LegalParagraph>

        <LegalSubsection title="5.1 Access & Portability">
          <LegalList>
            <li>
              <strong>Right to Access:</strong> Request a copy of all personal data we hold about
              you
            </li>
            <li>
              <strong>Data Export:</strong> Download your birth charts, consultation history, and
              account data in JSON format
            </li>
            <li>
              <strong>How to Exercise:</strong> Go to Settings → Export My Data or email{" "}
              <LegalLink href="mailto:privacy@jyotirvidya.app">privacy@jyotirvidya.app</LegalLink>
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="5.2 Correction & Update">
          <LegalList>
            <li>
              <strong>Right to Rectification:</strong> Correct inaccurate or incomplete data
            </li>
            <li>
              <strong>How to Exercise:</strong> Update your profile in Settings or contact support
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="5.3 Deletion & Erasure">
          <LegalList>
            <li>
              <strong>Right to be Forgotten:</strong> Request deletion of your account and all
              associated data
            </li>
            <li>
              <strong>Data Retention:</strong> We will delete your data within 30 days of your
              request, except where retention is required by law
            </li>
            <li>
              <strong>How to Exercise:</strong> Go to Settings → Delete Account or email{" "}
              <LegalLink href="mailto:privacy@jyotirvidya.app">privacy@jyotirvidya.app</LegalLink>
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="5.4 Withdraw Consent">
          <LegalList>
            <li>
              <strong>Marketing Communications:</strong> Unsubscribe from emails at any time
            </li>
            <li>
              <strong>Cookies:</strong> Disable cookies in your browser settings (may affect Service
              functionality)
            </li>
            <li>
              <strong>Analytics:</strong> Opt out of analytics tracking by disabling cookies
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalCallout type="warning" title="Response Time">
          We will respond to all privacy requests within 30 days. For urgent requests, please
          mention "URGENT" in your email subject line.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="6. Data Security">
        <LegalParagraph>
          We implement industry-standard security measures to protect your data:
        </LegalParagraph>
        <LegalList>
          <li>
            <strong>Encryption in Transit:</strong> All data transmitted using TLS 1.3 encryption
            (HTTPS)
          </li>
          <li>
            <strong>Encryption at Rest:</strong> Database encrypted using AES-256 (Supabase)
          </li>
          <li>
            <strong>Authentication:</strong> Passwords hashed using bcrypt, support for OAuth 2.0
          </li>
          <li>
            <strong>Access Controls:</strong> Role-based access control (RBAC) for admin functions
          </li>
          <li>
            <strong>Regular Audits:</strong> Quarterly security reviews, vulnerability scanning
          </li>
          <li>
            <strong>Incident Response:</strong> 24-hour breach notification policy via email
          </li>
        </LegalList>

        <LegalCallout type="danger" title="Data Breach Notification">
          In the unlikely event of a data breach affecting your personal information, we will notify
          you within 72 hours via email and display a prominent notice on our Service.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="7. Cookies & Tracking Technologies">
        <LegalSubsection title="7.1 Types of Cookies We Use">
          <LegalList>
            <li>
              <strong>Essential Cookies:</strong> Required for authentication, session management
              (cannot be disabled)
            </li>
            <li>
              <strong>Analytics Cookies:</strong> Vercel Analytics to understand usage patterns (can
              be disabled)
            </li>
            <li>
              <strong>Preference Cookies:</strong> Remember your language, theme, and settings
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="7.2 Cookie Management">
          <LegalParagraph>You can control cookies through:</LegalParagraph>
          <LegalList>
            <li>Our cookie consent banner (shown on first visit)</li>
            <li>Your browser settings (Chrome: Settings → Privacy → Cookies)</li>
            <li>
              Third-party opt-out:{" "}
              <LegalLink href="https://www.youronlinechoices.com">youronlinechoices.com</LegalLink>
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <LegalParagraph>
          Our Service is NOT intended for users under 18 years of age. We do not knowingly collect
          personal information from children under 18. If you are a parent or guardian and believe
          your child has provided us with personal information, please contact us immediately at{" "}
          <LegalLink href="mailto:privacy@jyotirvidya.app">privacy@jyotirvidya.app</LegalLink>.
        </LegalParagraph>
        <LegalParagraph>
          If we discover that we have collected data from a child under 18 without parental consent,
          we will delete such information within 48 hours.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Data Retention">
        <LegalParagraph>We retain your data for the following periods:</LegalParagraph>
        <LegalList>
          <li>
            <strong>Active Accounts:</strong> Data retained while your account is active
          </li>
          <li>
            <strong>Deleted Accounts:</strong> 30-day grace period, then permanently deleted
          </li>
          <li>
            <strong>Payment Records:</strong> 7 years (as required by Indian tax law)
          </li>
          <li>
            <strong>Usage Logs:</strong> 90 days, then anonymized or deleted
          </li>
          <li>
            <strong>Marketing Emails:</strong> Deleted immediately upon unsubscribe
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. International Data Transfers">
        <LegalParagraph>
          Your data may be transferred to and processed in countries other than India, including the
          United States (Vercel, OpenAI) and Europe (Supabase). These countries may have different
          data protection laws than India.
        </LegalParagraph>
        <LegalParagraph>
          We ensure that all data transfers comply with applicable laws through:
        </LegalParagraph>
        <LegalList>
          <li>Standard Contractual Clauses (SCCs) with third-party processors</li>
          <li>Privacy Shield certification (where applicable)</li>
          <li>Adequate data protection safeguards as per GDPR Article 46</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="11. Changes to This Privacy Policy">
        <LegalParagraph>
          We may update this Privacy Policy from time to time to reflect changes in our practices,
          technology, legal requirements, or for other operational reasons.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Notification of Changes:</strong>
        </LegalParagraph>
        <LegalList>
          <li>Material changes: Email notification + prominent notice on homepage for 30 days</li>
          <li>Minor changes: Updated "Last Updated" date at the top of this page</li>
        </LegalList>
        <LegalParagraph>
          Continued use of the Service after changes constitutes acceptance of the updated Privacy
          Policy.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Contact Us">
        <LegalParagraph>
          If you have any questions, concerns, or requests regarding this Privacy Policy or our data
          practices, please contact us:
        </LegalParagraph>

        <LegalContactBox>
          <p className="mb-2 text-slate-900">
            <strong>Jyotishya</strong>
          </p>
          <p className="mb-2 text-slate-600">
            Email:{" "}
            <LegalLink href="mailto:privacy@jyotirvidya.app">privacy@jyotirvidya.app</LegalLink>
          </p>
          <p className="mb-2 text-slate-600">
            Data Protection Officer:{" "}
            <LegalLink href="mailto:dpo@jyotirvidya.app">dpo@jyotirvidya.app</LegalLink>
          </p>
          <p className="mb-2 text-slate-600">
            Support:{" "}
            <LegalLink href="mailto:support@jyotirvidya.app">support@jyotirvidya.app</LegalLink>
          </p>
          <p className="text-slate-600">
            Response Time: Within 48 hours for urgent privacy requests, 7 days for general inquiries
          </p>
        </LegalContactBox>
      </LegalSection>

      <LegalSection title="13. Grievance Redressal (India)">
        <LegalParagraph>
          In accordance with the Information Technology Act, 2000 and rules made thereunder, if you
          have any grievances regarding the processing of your personal data, please contact our
          Grievance Officer:
        </LegalParagraph>

        <LegalContactBox>
          <p className="mb-2 text-slate-900">
            <strong>Grievance Officer</strong>
          </p>
          <p className="mb-2 text-slate-600">Name: [To be appointed]</p>
          <p className="mb-2 text-slate-600">
            Email:{" "}
            <LegalLink href="mailto:grievance@jyotirvidya.app">grievance@jyotirvidya.app</LegalLink>
          </p>
          <p className="text-slate-600">
            Resolution Time: Grievances will be acknowledged within 48 hours and resolved within 30
            days
          </p>
        </LegalContactBox>
      </LegalSection>

      <LegalFooter>
        <LegalParagraph>
          This Privacy Policy was last updated on{" "}
          {new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          and is effective from January 1, 2025.
        </LegalParagraph>
      </LegalFooter>
    </LegalPageLayout>
  );
}

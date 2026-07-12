import { Metadata } from "next";
import {
  LegalPageLayout,
  LegalSection,
  LegalSubsection,
  LegalParagraph,
  LegalList,
  LegalOrderedList,
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
  title: "Terms of Service | Jyotishya",
  description: "Terms and conditions for using Jyotishya astrology services",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" effectiveDate="January 1, 2025">
      <LegalSection title="1. Acceptance of Terms">
        <LegalParagraph>
          Welcome to Jyotishya. By accessing or using our website, mobile application, and services
          (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms").
          If you do not agree to these Terms, please do not use our Service.
        </LegalParagraph>

        <LegalParagraph>
          These Terms constitute a legally binding agreement between you ("User," "you," or "your")
          and Jyotishya ("we," "us," or "our"). By creating an account or using the Service, you
          represent that you are at least 18 years old and have the legal capacity to enter into
          this agreement.
        </LegalParagraph>

        <LegalCallout type="danger" title="IMPORTANT DISCLAIMER">
          Jyotishya provides astrological readings, predictions, and consultations for{" "}
          <strong>entertainment and self-reflection purposes only</strong>. Our Service is NOT a
          substitute for professional advice in medical, legal, financial, or psychological matters.
          Always consult qualified professionals for important life decisions.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="2. Service Description">
        <LegalSubsection title="2.1 What We Provide">
          <LegalParagraph>Jyotishya offers the following services:</LegalParagraph>
          <LegalList>
            <li>
              <strong>Birth Chart Generation:</strong> Vedic and Western astrological birth charts
              based on your date, time, and place of birth
            </li>
            <li>
              <strong>Daily Horoscopes:</strong> Personalized daily predictions for all 12 zodiac
              signs
            </li>
            <li>
              <strong>AI-Powered Interpretations:</strong> AI-generated astrological insights using
              OpenAI technology
            </li>
            <li>
              <strong>Astrologer Consultations:</strong> Live consultations with verified Vedic
              astrologers (paid service)
            </li>
            <li>
              <strong>Kundli Management:</strong> Save, favorite, and share your birth charts
            </li>
            <li>
              <strong>Compatibility Analysis:</strong> Astrological compatibility reports for
              relationships
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="2.2 What We Are NOT">
          <LegalList>
            <li>
              <strong>NOT Medical Advice:</strong> Astrological guidance cannot diagnose, treat, or
              cure any medical condition. Consult a licensed doctor for health issues.
            </li>
            <li>
              <strong>NOT Legal Advice:</strong> Astrological readings do not replace legal counsel.
              Consult a lawyer for legal matters.
            </li>
            <li>
              <strong>NOT Financial Advice:</strong> Astrological predictions do not constitute
              investment advice. Consult a certified financial advisor.
            </li>
            <li>
              <strong>NOT Psychological Counseling:</strong> Our Service does not replace therapy.
              Seek help from licensed mental health professionals.
            </li>
            <li>
              <strong>NOT Guaranteed Predictions:</strong> Astrology is an interpretive art. We make
              no guarantees about the accuracy of predictions or outcomes.
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <LegalSubsection title="3.1 Account Creation">
          <LegalList>
            <li>You must be at least 18 years old to create an account</li>
            <li>
              You must provide accurate, complete, and current information during registration
            </li>
            <li>You are limited to one account per person</li>
            <li>
              You may not create an account using a false identity or impersonate another person
            </li>
            <li>You may sign up using email/password or OAuth providers (Google)</li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.2 Account Security">
          <LegalList>
            <li>You are responsible for maintaining the confidentiality of your password</li>
            <li>You are responsible for all activities that occur under your account</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>
              We are not liable for any loss or damage arising from your failure to protect your
              account credentials
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.3 Account Termination">
          <LegalParagraph>
            We reserve the right to suspend or terminate your account if:
          </LegalParagraph>
          <LegalList>
            <li>You violate these Terms of Service</li>
            <li>You engage in fraudulent, abusive, or illegal activities</li>
            <li>Your account remains inactive for more than 2 years</li>
            <li>You request account deletion (within 30 days)</li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="4. Subscription Plans & Payments">
        <LegalSubsection title="4.1 Pricing Tiers">
          <LegalParagraph>Jyotishya offers the following subscription plans:</LegalParagraph>

          <LegalTable>
            <LegalTableHead>
              <LegalTableRow>
                <LegalTableHeader>Tier</LegalTableHeader>
                <LegalTableHeader>Price</LegalTableHeader>
                <LegalTableHeader>Features</LegalTableHeader>
              </LegalTableRow>
            </LegalTableHead>
            <LegalTableBody>
              <LegalTableRow>
                <LegalTableCell>Free</LegalTableCell>
                <LegalTableCell>₹0/month</LegalTableCell>
                <LegalTableCell>3 birth charts/month, daily horoscope</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Basic</LegalTableCell>
                <LegalTableCell>₹49/month</LegalTableCell>
                <LegalTableCell>10 charts/month, compatibility reports</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Premium</LegalTableCell>
                <LegalTableCell>₹99/month</LegalTableCell>
                <LegalTableCell>
                  Unlimited charts, AI interpretations, priority support
                </LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Pro</LegalTableCell>
                <LegalTableCell>₹199/month</LegalTableCell>
                <LegalTableCell>Everything + 30min live consultation/month</LegalTableCell>
              </LegalTableRow>
            </LegalTableBody>
          </LegalTable>
        </LegalSubsection>

        <LegalSubsection title="4.2 Payment Terms">
          <LegalList>
            <li>
              <strong>Payment Methods:</strong> Credit/debit cards, UPI, net banking via Razorpay
            </li>
            <li>
              <strong>Billing Cycle:</strong> Subscriptions are billed monthly on the date of
              purchase
            </li>
            <li>
              <strong>Auto-Renewal:</strong> Subscriptions automatically renew unless canceled
              before the next billing date
            </li>
            <li>
              <strong>Currency:</strong> All prices are in Indian Rupees (INR) and include
              applicable GST
            </li>
            <li>
              <strong>Price Changes:</strong> We reserve the right to change pricing with 30 days'
              notice to active subscribers
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="4.3 Cancellation & Refunds">
          <LegalList>
            <li>
              <strong>Cancel Anytime:</strong> You can cancel your subscription at any time from
              Settings
            </li>
            <li>
              <strong>Access Until End:</strong> After cancellation, you retain access until the end
              of the current billing period
            </li>
            <li>
              <strong>No Partial Refunds:</strong> Cancellations do not entitle you to a prorated
              refund for the current period
            </li>
            <li>
              <strong>7-Day Money-Back Guarantee:</strong> First-time subscribers may request a full
              refund within 7 days if:
              <ul className="mt-2 list-circle space-y-1 pl-6">
                <li>Service is unavailable more than 50% of the time</li>
                <li>Features described do not work as advertised</li>
              </ul>
            </li>
            <li>
              <strong>Refund Process:</strong> Approved refunds are processed within 5-7 business
              days to the original payment method
            </li>
          </LegalList>

          <LegalParagraph>
            See our <LegalLink href="/refund-policy">Refund Policy</LegalLink> for complete details.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="4.4 Consultation Payments">
          <LegalList>
            <li>
              <strong>Hourly Rate:</strong> Live consultations are charged at the astrologer's
              hourly rate (typically ₹500-₹1,000/hour)
            </li>
            <li>
              <strong>Booking Policy:</strong> Payment is required at the time of booking
            </li>
            <li>
              <strong>Cancellation:</strong> Cancel 24+ hours before the session for a full refund
            </li>
            <li>
              <strong>No-Show:</strong> If the astrologer does not show up, you receive a full
              refund + ₹200 credit
            </li>
            <li>
              <strong>User No-Show:</strong> No refund if you miss your scheduled consultation
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="5. Prohibited Uses">
        <LegalParagraph>
          You agree NOT to use the Service for any of the following purposes:
        </LegalParagraph>
        <LegalList>
          <li>
            <strong>Illegal Activities:</strong> Any purpose that violates Indian law or the law of
            your jurisdiction
          </li>
          <li>
            <strong>Harassment:</strong> Harassing, abusing, or threatening astrologers, staff, or
            other users
          </li>
          <li>
            <strong>Impersonation:</strong> Impersonating another person or entity
          </li>
          <li>
            <strong>False Information:</strong> Providing false birth details to receive inaccurate
            readings (your responsibility)
          </li>
          <li>
            <strong>Automated Access:</strong> Using bots, scrapers, or automated tools to access
            the Service without permission
          </li>
          <li>
            <strong>Commercial Use:</strong> Reselling, redistributing, or commercially exploiting
            our content without written permission
          </li>
          <li>
            <strong>Reverse Engineering:</strong> Attempting to decompile, reverse engineer, or
            extract source code
          </li>
          <li>
            <strong>Data Mining:</strong> Extracting data from the Service for commercial purposes
          </li>
          <li>
            <strong>Security Violations:</strong> Attempting to breach security, access unauthorized
            areas, or interfere with Service operations
          </li>
        </LegalList>

        <LegalCallout type="warning" title="Violation Consequences">
          Violation of these prohibitions may result in immediate account suspension, termination
          without refund, and potential legal action.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="6. Intellectual Property Rights">
        <LegalSubsection title="6.1 Your Content">
          <LegalList>
            <li>
              <strong>Birth Data Ownership:</strong> You own all rights to your birth details and
              personal information
            </li>
            <li>
              <strong>Generated Charts:</strong> Birth charts generated from your data are licensed
              to you for personal use
            </li>
            <li>
              <strong>License to Us:</strong> By using the Service, you grant us a non-exclusive
              license to use your data to provide the Service
            </li>
            <li>
              <strong>AI Interpretations:</strong> AI-generated content based on your chart is
              licensed to you for personal, non-commercial use
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="6.2 Our Content">
          <LegalList>
            <li>
              <strong>Platform Ownership:</strong> Jyotishya owns all rights to the Service,
              including code, design, logos, and trademarks
            </li>
            <li>
              <strong>Content Ownership:</strong> Daily horoscopes, educational articles, and
              original astrological content are our intellectual property
            </li>
            <li>
              <strong>Restrictions:</strong> You may not copy, modify, distribute, sell, or lease
              any part of our Service without written permission
            </li>
            <li>
              <strong>Trademark:</strong> "Jyotishya" and associated logos are trademarks and may
              not be used without permission
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="7. Disclaimer of Warranties">
        <LegalCallout type="info">
          <LegalParagraph>
            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY
            KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </LegalParagraph>

          <LegalParagraph>
            <strong>We specifically disclaim:</strong>
          </LegalParagraph>
          <LegalList>
            <li>Any guarantee that astrological predictions will be accurate or come true</li>
            <li>Any guarantee of specific results or outcomes from using the Service</li>
            <li>Any warranty that the Service will be uninterrupted, secure, or error-free</li>
            <li>
              Any warranty that data transmission will be secure or encrypted beyond our stated
              security measures
            </li>
            <li>
              Any warranty that third-party astrologers will provide satisfactory consultations
            </li>
          </LegalList>

          <LegalParagraph>
            <strong>Astrological Accuracy:</strong> Astrology is an interpretive discipline, not an
            exact science. The accuracy of birth charts depends on the precision of birth time and
            location data you provide. We cannot guarantee the accuracy of predictions or
            interpretations.
          </LegalParagraph>

          <LegalParagraph>
            <strong>AI-Generated Content:</strong> AI interpretations are generated by machine
            learning models and may contain errors, biases, or inaccuracies. Always use critical
            thinking when evaluating AI-generated content.
          </LegalParagraph>
        </LegalCallout>
      </LegalSection>

      <LegalSection title="8. Limitation of Liability">
        <LegalCallout type="danger">
          <LegalParagraph>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, JYOTISHYA, ITS DIRECTORS, EMPLOYEES, PARTNERS,
            AND AFFILIATES SHALL NOT BE LIABLE FOR:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>Decisions Based on Readings:</strong> Any actions you take based on
              astrological readings, predictions, or consultations
            </li>
            <li>
              <strong>Indirect Damages:</strong> Loss of profits, data, goodwill, or other
              intangible losses
            </li>
            <li>
              <strong>Third-Party Actions:</strong> Actions or advice provided by third-party
              astrologers on our platform
            </li>
            <li>
              <strong>Service Interruptions:</strong> Downtime, data loss, or unavailability of the
              Service
            </li>
            <li>
              <strong>Third-Party Failures:</strong> Failures of payment gateways (Razorpay),
              hosting providers (Vercel), or AI services (OpenAI)
            </li>
            <li>
              <strong>Security Breaches:</strong> Unauthorized access to your account due to your
              failure to secure credentials
            </li>
          </LegalList>

          <LegalParagraph>
            <strong>Maximum Liability Cap:</strong> In no event shall our total liability to you
            exceed the amount you paid to us in the three (3) months immediately preceding the
            claim. If you are a free user, our maximum liability is ₹500 (Five Hundred Rupees).
          </LegalParagraph>
        </LegalCallout>
      </LegalSection>

      <LegalSection title="9. Indemnification">
        <LegalParagraph>
          You agree to indemnify, defend, and hold harmless Jyotishya and its affiliates from any
          claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
        </LegalParagraph>
        <LegalList>
          <li>Your violation of these Terms of Service</li>
          <li>Your violation of any law or regulation</li>
          <li>Your violation of any rights of a third party</li>
          <li>Your use or misuse of the Service</li>
          <li>Any content you submit or upload to the Service</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. Service Availability & Uptime">
        <LegalList>
          <li>
            <strong>Uptime Goal:</strong> We aim for 95% uptime, but do not guarantee continuous
            availability
          </li>
          <li>
            <strong>Maintenance Windows:</strong> Scheduled maintenance will be announced 48 hours
            in advance when possible
          </li>
          <li>
            <strong>Emergency Downtime:</strong> We reserve the right to suspend the Service for
            emergency maintenance without notice
          </li>
          <li>
            <strong>No Compensation:</strong> Service interruptions do not entitle you to refunds or
            compensation unless they persist for more than 72 consecutive hours
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="11. Third-Party Services">
        <LegalParagraph>Our Service integrates with third-party providers:</LegalParagraph>
        <LegalList>
          <li>
            <strong>Razorpay:</strong> Payment processing (subject to Razorpay's terms)
          </li>
          <li>
            <strong>OpenAI:</strong> AI-powered interpretations (subject to OpenAI's terms)
          </li>
          <li>
            <strong>Google OAuth:</strong> Sign-in with Google (subject to Google's terms)
          </li>
          <li>
            <strong>Vercel:</strong> Hosting and analytics
          </li>
        </LegalList>
        <LegalParagraph>
          We are not responsible for the actions, policies, or services of these third parties. Your
          use of third-party services is subject to their respective terms and conditions.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Dispute Resolution & Governing Law">
        <LegalSubsection title="12.1 Governing Law">
          <LegalParagraph>
            These Terms shall be governed by and construed in accordance with the laws of India,
            without regard to conflict of law principles. Any disputes arising from these Terms or
            your use of the Service shall be subject to the exclusive jurisdiction of the courts in
            Bangalore, Karnataka, India.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="12.2 Dispute Resolution Process">
          <LegalParagraph>In the event of a dispute:</LegalParagraph>
          <LegalOrderedList>
            <li>
              <strong>Informal Resolution:</strong> Contact us at{" "}
              <LegalLink href="mailto:legal@jyotirvidya.app">legal@jyotirvidya.app</LegalLink> to
              attempt good-faith resolution (30 days)
            </li>
            <li>
              <strong>Mediation:</strong> If informal resolution fails, disputes may be submitted to
              mediation
            </li>
            <li>
              <strong>Arbitration:</strong> Unresolved disputes shall be settled by binding
              arbitration in Bangalore under the Arbitration and Conciliation Act, 1996
            </li>
            <li>
              <strong>Court Action:</strong> Only after arbitration may either party file suit in
              Bangalore courts
            </li>
          </LegalOrderedList>
        </LegalSubsection>

        <LegalSubsection title="12.3 Class Action Waiver">
          <LegalParagraph>
            You agree that disputes will be resolved on an individual basis only. You waive any
            right to participate in class-action lawsuits or class-wide arbitration against
            Jyotishya.
          </LegalParagraph>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="13. Changes to Terms">
        <LegalParagraph>
          We reserve the right to modify these Terms at any time. Material changes will be
          communicated via:
        </LegalParagraph>
        <LegalList>
          <li>Email notification to registered users</li>
          <li>Prominent notice on the homepage for 30 days</li>
          <li>Update to the "Last Updated" date at the top of this page</li>
        </LegalList>
        <LegalParagraph>
          Continued use of the Service after changes constitutes acceptance of the updated Terms. If
          you do not agree to the changes, you must stop using the Service and may request account
          deletion.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="14. Severability">
        <LegalParagraph>
          If any provision of these Terms is found to be invalid or unenforceable by a court of law,
          the remaining provisions shall remain in full force and effect. The invalid provision
          shall be replaced with a valid provision that most closely reflects the original intent.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="15. Entire Agreement">
        <LegalParagraph>
          These Terms, together with our Privacy Policy and Refund Policy, constitute the entire
          agreement between you and Jyotishya regarding the use of the Service. These Terms
          supersede all prior agreements, understandings, or representations.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="16. Contact Information">
        <LegalParagraph>
          For questions about these Terms of Service, please contact us:
        </LegalParagraph>

        <LegalContactBox>
          <p className="mb-2 text-white">
            <strong>Jyotishya</strong>
          </p>
          <p className="mb-2 text-slate-300">
            Email: <LegalLink href="mailto:legal@jyotirvidya.app">legal@jyotirvidya.app</LegalLink>
          </p>
          <p className="mb-2 text-slate-300">
            Support:{" "}
            <LegalLink href="mailto:support@jyotirvidya.app">support@jyotirvidya.app</LegalLink>
          </p>
          <p className="text-slate-300">
            Response Time: 7 business days for legal inquiries, 48 hours for support
          </p>
        </LegalContactBox>
      </LegalSection>

      <LegalFooter>
        <LegalParagraph>
          By using Jyotishya, you acknowledge that you have read, understood, and agree to be bound
          by these Terms of Service.
        </LegalParagraph>
        <LegalParagraph>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </LegalParagraph>
      </LegalFooter>
    </LegalPageLayout>
  );
}

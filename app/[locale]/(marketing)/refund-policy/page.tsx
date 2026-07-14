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
  title: "Refund Policy | Jyotishya",
  description: "Cancellation and refund policy for Jyotishya subscriptions and consultations",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund & Cancellation Policy" effectiveDate="January 1, 2025">
      <LegalSection title="1. Overview">
        <LegalParagraph>
          At Jyotishya, we strive to provide high-quality astrological services. This Refund Policy
          explains the terms and conditions for cancellations and refunds for our subscription plans
          and consultation bookings.
        </LegalParagraph>

        <LegalParagraph>
          This policy is designed to be fair to both users and our business, while complying with
          Indian consumer protection laws and Razorpay payment gateway requirements.
        </LegalParagraph>

        <LegalCallout type="info" title="Important Note">
          All refunds are processed through Razorpay to the original payment method used during
          purchase. Refund processing time is 5-7 business days from the date of approval.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="2. Subscription Refund Policy">
        <LegalSubsection title="2.1 7-Day Money-Back Guarantee">
          <LegalParagraph>
            We offer a <strong>7-day money-back guarantee</strong> for first-time subscribers to
            Premium and Pro plans. You are eligible for a full refund if you cancel within 7 days of
            your initial subscription and meet the following conditions:
          </LegalParagraph>

          <LegalCallout type="success" title="✅ Eligible for Refund">
            <LegalList>
              <li>
                <strong>Service Unavailability:</strong> The Service was unavailable for more than
                50% of the time during your 7-day period
              </li>
              <li>
                <strong>Feature Non-Delivery:</strong> Key features described in your plan (e.g., AI
                interpretations, unlimited charts) did not work as advertised
              </li>
              <li>
                <strong>Technical Issues:</strong> Critical bugs prevented you from using core
                features despite our support efforts to resolve them
              </li>
              <li>
                <strong>First-Time Subscriber:</strong> This is your first paid subscription to
                Jyotishya (upgrading from Free tier)
              </li>
            </LegalList>
          </LegalCallout>

          <LegalCallout type="danger" title="❌ NOT Eligible for Refund">
            <LegalList>
              <li>
                <strong>Buyer's Remorse:</strong> "I changed my mind" or "I don't need astrology
                anymore"
              </li>
              <li>
                <strong>Dissatisfaction with Predictions:</strong> "The horoscope wasn't accurate"
                or "I didn't like the AI interpretation"
              </li>
              <li>
                <strong>User Error:</strong> Incorrect birth details provided by you resulting in
                inaccurate charts
              </li>
              <li>
                <strong>Used Service Extensively:</strong> Generated more than 10 charts or used the
                Service extensively during the 7-day period
              </li>
              <li>
                <strong>Repeat Subscriber:</strong> You have subscribed, canceled, and re-subscribed
                before
              </li>
            </LegalList>
          </LegalCallout>
        </LegalSubsection>

        <LegalSubsection title="2.2 Cancellation Policy">
          <LegalList>
            <li>
              <strong>Cancel Anytime:</strong> You can cancel your subscription at any time from
              your Account Settings
            </li>
            <li>
              <strong>Access Until Period End:</strong> After cancellation, you retain full access
              to premium features until the end of your current billing period
            </li>
            <li>
              <strong>No Partial Refunds:</strong> Canceling mid-cycle does not entitle you to a
              prorated refund for unused days
            </li>
            <li>
              <strong>Auto-Renewal Stops:</strong> Your subscription will not renew for the next
              billing cycle
            </li>
            <li>
              <strong>Downgrade to Free:</strong> After your paid period ends, your account
              automatically downgrades to the Free tier
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="2.3 How to Cancel Your Subscription">
          <LegalOrderedList>
            <li>Log in to your Jyotishya account</li>
            <li>
              Go to <strong>Settings</strong> → <strong>Subscription</strong>
            </li>
            <li>
              Click <strong>"Cancel Subscription"</strong>
            </li>
            <li>Select a reason for cancellation (optional feedback)</li>
            <li>Confirm cancellation</li>
            <li>You will receive a confirmation email within 5 minutes</li>
          </LegalOrderedList>
        </LegalSubsection>

        <LegalSubsection title="2.4 How to Request a Refund (7-Day Window)">
          <LegalOrderedList>
            <li>
              Email{" "}
              <LegalLink href="mailto:refunds@jyotirvidya.app">refunds@jyotirvidya.app</LegalLink>{" "}
              within 7 days of purchase
            </li>
            <li>Include your account email, subscription plan, and reason for refund request</li>
            <li>
              Provide evidence if claiming service unavailability or feature non-delivery
              (screenshots, error messages)
            </li>
            <li>Our team will review your request within 48 hours</li>
            <li>If approved, refund will be processed within 5-7 business days</li>
          </LegalOrderedList>

          <LegalCallout type="info" title="Refund Processing Time">
            Razorpay processes refunds within 5-7 business days. The exact time for the refund to
            reflect in your account depends on your bank or payment provider (typically 7-10
            business days total).
          </LegalCallout>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="3. Consultation Refund Policy">
        <LegalSubsection title="3.1 Cancellation by User (Before Session)">
          <LegalList>
            <li>
              <strong>24+ Hours Before:</strong> Full refund (100%) if you cancel at least 24 hours
              before the scheduled session
            </li>
            <li>
              <strong>12-24 Hours Before:</strong> 50% refund (50% cancellation fee applies)
            </li>
            <li>
              <strong>Less than 12 Hours:</strong> No refund (100% cancellation fee applies)
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.2 Astrologer No-Show">
          <LegalParagraph>
            If the astrologer does not show up for your scheduled consultation:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>Full Refund:</strong> 100% refund of the consultation fee
            </li>
            <li>
              <strong>Bonus Credit:</strong> Additional ₹200 account credit for the inconvenience
            </li>
            <li>
              <strong>Priority Rebooking:</strong> Priority access to rebook with another verified
              astrologer
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.3 User No-Show">
          <LegalList>
            <li>
              <strong>No Refund:</strong> If you miss your scheduled consultation without prior
              cancellation, no refund is provided
            </li>
            <li>
              <strong>Grace Period:</strong> Astrologers will wait up to 10 minutes for you to join
            </li>
            <li>
              <strong>Rescheduling:</strong> If you notify us within 1 hour of the scheduled time,
              we may offer a one-time reschedule (subject to astrologer availability)
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.4 Dissatisfaction with Consultation">
          <LegalParagraph>
            We carefully vet all astrologers on our platform. However, if you are dissatisfied with
            your consultation quality:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>Report Issue:</strong> Contact{" "}
              <LegalLink href="mailto:support@jyotirvidya.app">support@jyotirvidya.app</LegalLink>{" "}
              within 24 hours of the session
            </li>
            <li>
              <strong>Valid Complaints:</strong> Astrologer was rude, session ended early, or
              significant technical issues disrupted the session
            </li>
            <li>
              <strong>Refund Discretion:</strong> Refunds for quality issues are reviewed
              case-by-case at our sole discretion
            </li>
            <li>
              <strong>Not Eligible:</strong> "I didn't like the prediction" or "The astrologer's
              style didn't match my preference" are not valid refund reasons
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="3.5 How to Cancel a Consultation">
          <LegalOrderedList>
            <li>
              Go to <strong>My Consultations</strong>
            </li>
            <li>Find the upcoming consultation</li>
            <li>
              Click <strong>"Cancel Booking"</strong>
            </li>
            <li>Select a reason (optional)</li>
            <li>Confirm cancellation</li>
            <li>
              Refund (if applicable) will be processed automatically based on the timing of your
              cancellation
            </li>
          </LegalOrderedList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="4. Refund Process & Timeline">
        <LegalSubsection title="4.1 Automatic Refunds">
          <LegalParagraph>
            The following refunds are processed automatically without requiring manual approval:
          </LegalParagraph>
          <LegalList>
            <li>Consultation canceled 24+ hours before session</li>
            <li>Astrologer no-show (after verification)</li>
            <li>Duplicate payment (technical error)</li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="4.2 Manual Review Required">
          <LegalParagraph>
            The following refund requests require manual review by our team (48-hour response time):
          </LegalParagraph>
          <LegalList>
            <li>7-day money-back guarantee claims</li>
            <li>Consultation quality complaints</li>
            <li>Service unavailability claims</li>
            <li>Disputed charges</li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="4.3 Refund Timeline">
          <LegalTable>
            <LegalTableHead>
              <LegalTableRow>
                <LegalTableHeader>Step</LegalTableHeader>
                <LegalTableHeader>Timeframe</LegalTableHeader>
              </LegalTableRow>
            </LegalTableHead>
            <LegalTableBody>
              <LegalTableRow>
                <LegalTableCell>Request submission</LegalTableCell>
                <LegalTableCell>Immediate (email confirmation sent)</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Review & approval</LegalTableCell>
                <LegalTableCell>24-48 hours (business days)</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Razorpay processing</LegalTableCell>
                <LegalTableCell>5-7 business days</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>Bank credit</LegalTableCell>
                <LegalTableCell>2-3 business days (depends on bank)</LegalTableCell>
              </LegalTableRow>
              <LegalTableRow>
                <LegalTableCell>
                  <strong>Total time</strong>
                </LegalTableCell>
                <LegalTableCell>
                  <strong>7-14 business days</strong>
                </LegalTableCell>
              </LegalTableRow>
            </LegalTableBody>
          </LegalTable>
        </LegalSubsection>

        <LegalSubsection title="4.4 Refund Methods">
          <LegalList>
            <li>
              <strong>Original Payment Method:</strong> Refunds are issued to the original payment
              method used (credit card, debit card, UPI, net banking)
            </li>
            <li>
              <strong>No Cash Refunds:</strong> We do not provide cash refunds or bank transfers
            </li>
            <li>
              <strong>Account Credit Option:</strong> For consultation refunds, you may opt for
              instant account credit instead of a refund (credited immediately)
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="5. Chargebacks & Disputed Charges">
        <LegalSubsection title="5.1 Contact Us First">
          <LegalParagraph>
            Before initiating a chargeback with your bank, please contact us at{" "}
            <LegalLink href="mailto:refunds@jyotirvidya.app">refunds@jyotirvidya.app</LegalLink>. We
            are committed to resolving billing issues quickly and fairly.
          </LegalParagraph>
        </LegalSubsection>

        <LegalSubsection title="5.2 Chargeback Consequences">
          <LegalList>
            <li>
              <strong>Account Suspension:</strong> Initiating a chargeback may result in immediate
              account suspension
            </li>
            <li>
              <strong>Evidence Submission:</strong> We will submit evidence to your bank showing
              that the charge was legitimate and services were delivered
            </li>
            <li>
              <strong>Fees:</strong> If the chargeback is found to be invalid, you may be liable for
              chargeback processing fees (₹500-₹1,000)
            </li>
            <li>
              <strong>Future Access:</strong> Accounts with invalid chargebacks may be permanently
              banned from using Jyotishya
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="5.3 Valid Chargeback Scenarios">
          <LegalParagraph>
            We understand that chargebacks may be necessary in the following situations:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>Unauthorized Charges:</strong> Your credit card was used without your
              permission
            </li>
            <li>
              <strong>No Response:</strong> We failed to respond to your refund request within 7
              business days
            </li>
            <li>
              <strong>Service Not Delivered:</strong> You paid for a subscription but never received
              access to premium features
            </li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="6. Exceptions & Special Cases">
        <LegalSubsection title="6.1 Extended Service Outages">
          <LegalParagraph>
            If the Service experiences an outage lasting more than 72 consecutive hours:
          </LegalParagraph>
          <LegalList>
            <li>Premium subscribers will receive a prorated account credit for the downtime</li>
            <li>Active consultation bookings will be rescheduled at no additional charge</li>
            <li>
              Users may request a full refund of their current billing period if the outage persists
              beyond 7 days
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="6.2 Account Termination by Jyotishya">
          <LegalParagraph>
            If we terminate your account for violating our Terms of Service:
          </LegalParagraph>
          <LegalList>
            <li>
              <strong>No Refund:</strong> Subscription fees are non-refundable in case of
              termination due to policy violations
            </li>
            <li>
              <strong>Unused Consultations:</strong> Prepaid consultations that have not occurred
              will be refunded
            </li>
          </LegalList>
        </LegalSubsection>

        <LegalSubsection title="6.3 Death or Serious Illness">
          <LegalParagraph>
            In cases of user death or serious illness preventing use of the Service:
          </LegalParagraph>
          <LegalList>
            <li>
              Family members or legal representatives may contact us with supporting documentation
              (death certificate, medical records)
            </li>
            <li>We will provide a prorated refund for the unused portion of the subscription</li>
            <li>Consultation refunds will be processed in full</li>
          </LegalList>
        </LegalSubsection>
      </LegalSection>

      <LegalSection title="7. Non-Refundable Items">
        <LegalParagraph>
          The following are <strong>strictly non-refundable</strong>:
        </LegalParagraph>
        <LegalList>
          <li>
            <strong>Completed Consultations:</strong> Live consultations that have already occurred
          </li>
          <li>
            <strong>Downloaded Content:</strong> Birth charts you have saved or downloaded
          </li>
          <li>
            <strong>Account Credits:</strong> Promotional credits or bonus credits cannot be
            refunded for cash
          </li>
          <li>
            <strong>Third-Party Purchases:</strong> Payments made to third-party astrologers outside
            our platform
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Contact for Refund Requests">
        <LegalParagraph>
          For refund requests, questions, or concerns about this policy, please contact:
        </LegalParagraph>

        <LegalContactBox>
          <p className="mb-2 text-slate-900">
            <strong>Refund Support</strong>
          </p>
          <p className="mb-2 text-slate-600">
            Email: <LegalLink href="mailto:support@jyotirvidya.app">support@jyotirvidya.app</LegalLink>
          </p>
          <p className="mb-2 text-slate-600">
            Finance: <LegalLink href="mailto:billing@jyotirvidya.app">billing@jyotirvidya.app</LegalLink>
          </p>
          <p className="mb-2 text-slate-600">Phone: [To be added]</p>
          <p className="text-slate-600">
            Response Time: 24-48 business hours
          </p>
        </LegalContactBox>
      </LegalSection>

      <LegalSection title="9. Changes to This Policy">
        <LegalParagraph>
          We reserve the right to modify this Refund Policy at any time. Material changes will be
          communicated via:
        </LegalParagraph>
        <LegalList>
          <li>Email notification to active subscribers</li>
          <li>Prominent notice on the homepage for 30 days</li>
          <li>Update to the "Last Updated" date at the top of this page</li>
        </LegalList>
        <LegalParagraph>
          The updated policy will apply to all purchases made after the effective date of the
          change. Purchases made before the change will be governed by the policy in effect at the
          time of purchase.
        </LegalParagraph>
      </LegalSection>

      <LegalFooter>
        <LegalParagraph>
          This Refund Policy was last updated on{" "}
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

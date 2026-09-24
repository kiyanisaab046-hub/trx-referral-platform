import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function PrivacyPolicy() {
  return (
    <main className="flex flex-col min-h-screen bg-transparent text-white font-satoshi">
      <NavBar />
      <div className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(232,67,147,0.15)]">
          <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight mb-4">
            Privacy Policy
          </h1>
          <p className="text-soft-gray mb-10 text-lg">Welcome to Unique Income Plane.</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p>
              Your privacy is very important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform, website, and services.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-2">We may collect the following information from users:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Wallet Address / Payment Details</li>
                <li>Account Information</li>
                <li>Referral Information</li>
                <li>Device & Browser Information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Create and manage your account</li>
                <li>Process transactions and commissions</li>
                <li>Provide customer support</li>
                <li>Improve platform performance</li>
                <li>Send updates, announcements, and notifications</li>
                <li>Prevent fraud and unauthorized activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Data Protection</h2>
              <p>
                We use secure systems and advanced protection methods to keep your information safe. Your personal data is protected against unauthorized access, misuse, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Sharing of Information</h2>
              <p className="mb-2">We do not sell or rent your personal information to third parties. Information may only be shared when:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Required by law</li>
                <li>Needed for payment processing</li>
                <li>Necessary for platform security and operations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookies & Tracking</h2>
              <p>
                Our website may use cookies and tracking technologies to improve user experience, analyze traffic, and enhance system functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. User Responsibilities</h2>
              <p>
                Users are responsible for maintaining the confidentiality of their account credentials and passwords.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of external websites.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Privacy Policy</h2>
              <p>
                Unique Income Plane reserves the right to update or modify this Privacy Policy at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
              <p>
                If you have any questions regarding this Privacy Policy, please contact our support team.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-primary/20 text-center font-display">
              <p className="text-xl font-bold text-white">Unique Income Plane</p>
              <p className="text-primary mt-2 uppercase tracking-widest text-sm">Secure • Trusted • Professional</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

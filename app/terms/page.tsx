import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function TermsOfService() {
  return (
    <main className="flex flex-col min-h-screen bg-transparent text-white font-satoshi">
      <NavBar />
      <div className="flex-grow pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-2xl border border-primary/20 shadow-[0_0_50px_rgba(232,67,147,0.15)]">
          <h1 className="text-4xl md:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-highlight mb-4">
            Terms of Service
          </h1>
          <p className="text-soft-gray mb-10 text-lg">Welcome to Unique Income Plane.</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <p>
              Please read these Terms of Service carefully before using the Unique Income Plane platform. By accessing or using our services, you agree to be bound by these terms.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By registering an account, accessing, or using the Unique Income Plane website and platform, you acknowledge that you have read, understood, and agreed to these Terms of Service, as well as our Privacy Policy. If you do not agree, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <p>
                To use our platform, you must be of legal age in your jurisdiction and possess the legal authority to enter into these terms. Our services are not intended for use by minors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must provide accurate and complete information during registration.</li>
                <li>You are solely responsible for keeping your login credentials secure.</li>
                <li>You are fully responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized access or breach of security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Deposits and Withdrawals</h2>
              <p>
                All transactions, including deposits and withdrawals, are subject to the processing times, minimum/maximum limits, and fees associated with the respective payment methods and network conditions (e.g., blockchain networks). Unique Income Plane is not responsible for delays caused by third-party processors or network congestion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Risk Disclaimer</h2>
              <p>
                Participating in income plans and digital asset transactions involves inherent risks. Past performance is not indicative of future results. You acknowledge that you are participating at your own risk and that Unique Income Plane shall not be held liable for any financial losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Activities</h2>
              <p className="mb-2">Users are strictly prohibited from:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Engaging in fraudulent or illegal activities.</li>
                <li>Creating multiple accounts to exploit referral or bonus systems.</li>
                <li>Interfering with the security, performance, or integrity of the platform.</li>
                <li>Using automated bots or scripts without authorization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at our sole discretion, without prior notice, if we suspect you have violated these Terms of Service or engaged in fraudulent behavior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Modifications to Terms</h2>
              <p>
                Unique Income Plane reserves the right to modify or replace these Terms at any time. We will provide notice of significant changes on our website. Your continued use of the platform after any changes constitutes acceptance of the new Terms.
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

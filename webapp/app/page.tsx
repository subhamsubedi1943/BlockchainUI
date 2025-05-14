import Link from "next/link";
import Aurora from "@/components/ui/aurora";
import { Button } from "@/components/ui/button";
// Import SpotlightCard - Assuming the path is correct relative to this file
import SpotlightCard from "@/components/ui/spotlightcard";

import { ArrowRight, CheckCircle, Factory, ShoppingBag, PackageSearch, Blocks, ShieldCheck, LocateFixed, Users, Wallet, Eye, GitBranch, Layers3, Sparkles, Github } from "lucide-react";

// Project Name Constant
const PROJECT_NAME = "MediSure";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-100 selection:bg-teal-500/30">

      {/* Top Aurora Effect with requested colors */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none z-0">
        <Aurora
          colorStops={["#00D8FF", "#7CFF67", "#00D8FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
          className="mix-blend-screen"
        />
      </div>

      {/* Background Aurora Effect - Teal Theme (keep existing) */}
      <div className="absolute inset-0 -z-10 opacity-25 pointer-events-none">
        <Aurora
          colorStops={["#00D8FF", "#14B8A6", "#5EEAD4", "#0F766E"]} // Teal shades
          blend={0.4}
          amplitude={0.7}
          speed={0.25}
          className="mix-blend-screen"
        />
      </div>

      {/* Main content area */}
      <div className="relative z-10 w-full max-w-7xl px-4 sm:px-8 py-16 sm:py-24 flex flex-col items-center gap-20 md:gap-32">

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 pt-12 sm:pt-20">
           {/* Use Layers3 icon as logo */}
           <Layers3 className="w-14 h-14 text-teal-400 mb-3"/>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 !leading-tight">
            {PROJECT_NAME}
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl">
            Ensuring Pharmaceutical Integrity, Block by Block. Secure, transparent, and verifiable medicine tracking powered by blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-6">
             {/* Updated Primary Button */}
            <Button asChild size="lg" className="group bg-teal-500 hover:bg-teal-600 text-black font-semibold px-7 py-3 text-base rounded-lg shadow-lg shadow-teal-500/30 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-teal-500/40 flex items-center gap-2">
              <Link href="/dashboard">
                Access Dashboard
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            {/* GitHub Button */}
            <Button variant="outline" size="lg" asChild className="bg-white/5 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10 backdrop-blur-md px-7 py-3 text-base rounded-lg transition-colors duration-300 flex items-center gap-2">
              <a href="https://github.com/abhigyanpatwari" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub Repo
              </a>
            </Button>
          </div>
        </section>

        {/* Combined Features/Benefits/How-it-Works Section - Bento Box Style using SpotlightCard */}
        <section id="features" className="w-full scroll-mt-20">
          {/* Optional Title */}
          {/* <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-12 sm:mb-16">Core Capabilities</h2> */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

              {/* Large Card - Why Pharma Ledger & Benefits */}
              {/* Apply layout classes directly to SpotlightCard */}
              <SpotlightCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 order-1 flex flex-col p-5 sm:p-6"> {/* Added padding here */}
                 <Sparkles className="w-8 h-8 text-teal-400 mb-4 flex-shrink-0" />
                 <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white">Why Choose {PROJECT_NAME}?</h3>
                 <p className="text-sm sm:text-base text-gray-400 mb-6 leading-relaxed flex-grow">
                    {PROJECT_NAME} offers unparalleled security and transparency for the pharmaceutical supply chain. By leveraging blockchain, we create an immutable record, preventing counterfeits and ensuring patient safety from production to pharmacy.
                 </p>
                 <h4 className="text-base font-medium mb-3 text-gray-200">Key Benefits:</h4>
                 <ul className="space-y-2 text-sm sm:text-base">
                    <BenefitItem text="Prevent Counterfeit Medicines" />
                    <BenefitItem text="Enhance Supply Chain Transparency" />
                    <BenefitItem text="Improve Patient Safety and Trust" />
                    <BenefitItem text="Streamline Audits and Compliance" />
                 </ul>
              </SpotlightCard>

              {/* Feature 1 - Immutability */}
              <SpotlightCard className="order-2 lg:order-2 flex flex-col p-5 sm:p-6">
                 <ShieldCheck className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Immutable Ledger</h3>
                 <p className="text-sm text-gray-400">Records are permanent and tamper-proof via blockchain.</p>
              </SpotlightCard>

               {/* Feature 2 - Real-time Tracking */}
              <SpotlightCard className="order-3 lg:order-3 flex flex-col p-5 sm:p-6">
                 <LocateFixed className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Real-Time Tracking</h3>
                 <p className="text-sm text-gray-400">Instantly access medicine journey and current status.</p>
              </SpotlightCard>

              {/* Feature 3 - Role Access */}
              <SpotlightCard className="order-5 lg:order-5 flex flex-col p-5 sm:p-6">
                 <Users className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Role-Based Access</h3>
                 <p className="text-sm text-gray-400">Dedicated dashboards for Manufacturers & Retailers.</p>
              </SpotlightCard>

               {/* Feature 4 - Wallet Integration */}
              <SpotlightCard className="order-6 lg:order-6 flex flex-col p-5 sm:p-6">
                 <Wallet className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Web3 Integration</h3>
                 <p className="text-sm text-gray-400">Secure contract interaction via standard wallets.</p>
              </SpotlightCard>

               {/* How it Works (Simplified Workflow) */}
              <SpotlightCard className="md:col-span-2 lg:col-span-2 order-4 lg:order-4 flex flex-col p-5 sm:p-6">
                  <Blocks className="w-7 h-7 text-teal-400 mb-3" />
                  <h3 className="text-lg font-semibold mb-2 text-white">Simple Workflow</h3>
                  <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1.5">
                      <li>Manufacturers register batches onto the secure ledger (<Factory className="inline-block w-4 h-4 -mt-1" />).</li>
                      <li>Batch details & IDs stored immutably on-chain (<ShieldCheck className="inline-block w-4 h-4 -mt-1" />).</li>
                      <li>Retailers verify shipments against blockchain record (<ShoppingBag className="inline-block w-4 h-4 -mt-1" />).</li>
                      <li>Consumers/Regulators track medicine journey (<PackageSearch className="inline-block w-4 h-4 -mt-1" />).</li>
                  </ol>
              </SpotlightCard>

               {/* Blockchain Transparency */}
               <SpotlightCard className="order-7 lg:order-7 flex flex-col p-5 sm:p-6">
                 <Eye className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Chain Transparency</h3>
                 <p className="text-sm text-gray-400">View block details & activity directly in the dashboard.</p>
              </SpotlightCard>

              {/* Supply Chain Visibility */}
              <SpotlightCard className="order-8 lg:order-8 flex flex-col p-5 sm:p-6">
                 <GitBranch className="w-7 h-7 text-teal-400 mb-3" />
                 <h3 className="text-lg font-semibold mb-2 text-white">Chain Visibility</h3>
                 <p className="text-sm text-gray-400">Enhanced oversight to identify discrepancies.</p>
              </SpotlightCard>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="text-center flex flex-col items-center gap-5 mt-16 sm:mt-24">
             <h3 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                Secure Your Supply Chain Today
             </h3>
             <p className="text-gray-400 max-w-xl">
               Access the {PROJECT_NAME} dashboard to start leveraging the power of blockchain for pharmaceutical integrity.
             </p>
             {/* Reusing Primary Button Style */}
             <Button asChild size="lg" className="group mt-4 bg-teal-500 hover:bg-teal-600 text-black font-semibold px-8 py-3 text-base rounded-lg shadow-lg shadow-teal-500/30 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-teal-500/40 flex items-center gap-2">
              <Link href="/dashboard">
                Launch Dashboard
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 pt-8 mt-20 md:mt-28 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {PROJECT_NAME}. Secure Tracking Solutions.</p>
           <div className="flex gap-4 items-center">
            {/* Example GitHub Link */}
            {/* <a href="YOUR_GITHUB_REPO_LINK" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-teal-400 transition-colors"> ... GitHub SVG ... </a> */}
            <span className="text-sm text-gray-600">Powered by Blockchain</span>
           </div>
        </footer>

      </div> {/* End main content wrapper */}
    </div> // End main container
  );
}


// REMOVED BentoCard Helper Component

// Helper component for Benefit Items (used inside SpotlightCard)
function BenefitItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-teal-400 mt-1 flex-shrink-0" />
            <span className="text-gray-300">{text}</span>
        </li>
    );
}


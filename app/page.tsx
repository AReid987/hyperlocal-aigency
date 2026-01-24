import CityScanner from '@/components/3d/CityScanner';

export default function Home() {
  return (
    <>
      {/* 3D City Background */}
      <CityScanner />
      
      {/* Scrollable Content Overlay */}
      <main className="relative w-full" style={{ zIndex: 10 }}>
        <section 
          id="hero" 
          className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-transparent"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-6 text-neon">
              The Void Reactor
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto">
              A scrollytelling exploration of autonomous infrastructure
            </p>
          </div>
        </section>

        <section 
          id="hunt" 
          className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-black bg-opacity-50"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl mb-6 text-zinc-100">
              The Hunt
            </h2>
            <p className="text-lg text-zinc-400">
              Target acquisition and classification in the digital void
            </p>
          </div>
        </section>

        <section 
          id="audit" 
          className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-black bg-opacity-60"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl mb-6 text-zinc-100">
              The Audit
            </h2>
            <p className="text-lg text-zinc-400">
              Real-time verification and validation protocols
            </p>
          </div>
        </section>

        <section 
          id="ghost" 
          className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-black bg-opacity-70"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl mb-6 text-zinc-100">
              The Ghost
            </h2>
            <p className="text-lg text-zinc-400">
              Disqualification cascade and system responses
            </p>
          </div>
        </section>

        <section 
          id="infrastructure" 
          className="min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16 bg-black bg-opacity-80"
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl sm:text-5xl mb-6 text-zinc-100">
              The Infrastructure
            </h2>
            <p className="text-lg text-zinc-400">
              Autonomous systems and operational architecture
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

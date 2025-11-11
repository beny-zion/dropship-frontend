'use client';

export default function PolicyPageLayout({ title, lastUpdated, children }) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm font-light text-neutral-500 tracking-wide">
              עדכון אחרון: {lastUpdated}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <div className="prose-custom space-y-12">
            {children}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-light mb-4">יש שאלות?</h2>
            <p className="text-sm font-light text-neutral-600 mb-6">
              אנחנו כאן לעזור. צרו איתנו קשר בכל עניין
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:03-6253700"
                className="px-6 py-3 border border-black text-black text-sm font-light tracking-wide hover:bg-black hover:text-white transition-colors"
              >
                צור קשר טלפוני
              </a>
              <a
                href="mailto:info@example.com"
                className="px-6 py-3 bg-black text-white text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
              >
                שלח דוא״ל
              </a>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .prose-custom h2 {
          font-size: 1.5rem;
          font-weight: 300;
          margin-bottom: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e5e5;
        }

        .prose-custom h2:first-child {
          border-top: none;
          padding-top: 0;
        }

        .prose-custom h3 {
          font-size: 1.125rem;
          font-weight: 400;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
        }

        .prose-custom p {
          font-weight: 300;
          line-height: 1.8;
          color: #404040;
          margin-bottom: 1rem;
        }

        .prose-custom ul,
        .prose-custom ol {
          font-weight: 300;
          line-height: 1.8;
          color: #404040;
          margin-right: 1.5rem;
          margin-bottom: 1rem;
        }

        .prose-custom li {
          margin-bottom: 0.5rem;
        }

        .prose-custom strong {
          font-weight: 400;
          color: #000;
        }

        .prose-custom a {
          color: #000;
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.2s;
        }

        .prose-custom a:hover {
          opacity: 0.7;
        }

        .prose-custom .info-box {
          background: #fafafa;
          border: 1px solid #e5e5e5;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .prose-custom .highlight-box {
          background: #000;
          color: #fff;
          padding: 2rem;
          margin: 2rem 0;
        }

        .prose-custom .highlight-box p {
          color: #a3a3a3;
        }

        .prose-custom .highlight-box strong {
          color: #fff;
        }
      `}</style>
    </div>
  );
}

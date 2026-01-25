export function MetricsSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              75%
            </div>
            <div className="text-slate-600 font-medium">Faster Legal Research</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              30s
            </div>
            <div className="text-slate-600 font-medium">Average Response Time</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-slate-900 mb-3">
              99.8%
            </div>
            <div className="text-slate-600 font-medium">Citation Accuracy</div>
          </div>
        </div>
      </div>
    </section>
  )
}

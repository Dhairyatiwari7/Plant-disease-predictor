import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { statsAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, predictionsRes] = await Promise.all([
          statsAPI.getDashboardStats(),
          statsAPI.getRecentPredictions(6),
        ]);
        setStats(statsRes.data);
        setRecentPredictions(predictionsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpload = () => {
    navigate('/predict');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  const handleOpenLibrary = () => {
    navigate('/about');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined text-primary text-5xl">
              progress_activity
            </span>
          </div>
          <p className="text-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-surface-container-low px-lg py-xl md:py-32">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl items-center relative z-10">
          <div className="flex flex-col gap-md">
            <h1 className="font-display-lg text-display-lg md:text-display-lg text-on-surface leading-tight">
              Precision Diagnostics for <span className="text-primary">Tomato Health</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Harness the power of AI to identify crop diseases instantly. AgroLens provides field-ready, high-accuracy analysis to protect your harvest and maximize yield.
            </p>
            <div className="flex flex-wrap gap-md mt-base">
              <button
                onClick={handleUpload}
                className="h-[48px] px-xl bg-primary text-white font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-sm"
              >
                <span className="material-symbols-outlined">photo_camera</span>
                Get Started
              </button>
              <button
                onClick={handleLearnMore}
                className="h-[48px] px-xl border border-outline-variant text-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center gap-sm"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="rounded-xl overflow-hidden shadow-xl border border-outline-variant">
              <img
                alt="Diagnostic Hero"
                className="w-full aspect-video object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR12MUoZuyaYm7o5o-67Y94lbJnvUEL61nmC9h5SZTRLgdGaHpg0xrPQhPdP7CDTbHpv5Sv9v2-XnZs3b0JGAAVIDvYah-KfspT5InnRXj8voXrGHYPVcXxBXbpPMwdQ3JDUvaXKrPQdAhZeynN--7XoVtAbmSqZ2Lv4TujMzN1Xo7dnWg-UkBiuHbhEvcxgz8OrQVoIlIt93Zc-Rs-EorJ7bHu6LPGv8vmhD4DrWNT4wH5RvZgCE5BDf54ncLGojfTQhUMOpn5wU"
              />
            </div>
            {/* Floating Status Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-md rounded-xl shadow-lg border border-outline-variant flex items-center gap-sm">
              <div className="bg-primary/10 p-sm rounded-full">
                <span className="material-symbols-outlined text-primary">check_circle</span>
              </div>
              <div>
                <p className="text-label-md font-label-md text-on-surface">AI Active</p>
                <p className="text-caption font-caption text-on-surface-variant">99.2% Model Accuracy</p>
              </div>
            </div>
          </div>
        </div>
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </section>

      {/* Quick Stats */}
      <section className="px-lg -mt-12 relative z-20">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
              <span className="text-on-surface-variant text-caption font-caption uppercase tracking-wider">Total Predictions</span>
              <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.total_predictions || 0}</span>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
              <span className="text-on-surface-variant text-caption font-caption uppercase tracking-wider">Success Rate</span>
              <span className="text-headline-lg font-headline-lg text-primary">{stats?.success_rate || '0'}%</span>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
              <span className="text-on-surface-variant text-caption font-caption uppercase tracking-wider">Avg Confidence</span>
              <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.avg_confidence || '0'}%</span>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
              <span className="text-on-surface-variant text-caption font-caption uppercase tracking-wider">Last Scan</span>
              <span className="text-title-md font-title-md text-on-surface mt-base">{stats?.last_scan || 'Never'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions & Recent Predictions */}
      <section className="px-lg py-xl">
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Left: Quick Actions */}
          <div className="lg:col-span-4 flex flex-col gap-md">
            <h2 className="text-title-md font-title-md text-on-surface mb-xs">Diagnostic Actions</h2>
            <button
              onClick={handleUpload}
              className="w-full p-lg bg-primary text-white rounded-xl flex items-center justify-between group hover:brightness-110 transition-all"
            >
              <div className="flex items-center gap-md">
                <div className="bg-white/20 p-sm rounded-lg">
                  <span className="material-symbols-outlined text-white">upload_file</span>
                </div>
                <div className="text-left">
                  <p className="font-bold">Upload New Image</p>
                  <p className="text-xs opacity-80">JPG, PNG up to 10MB</p>
                </div>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button
              onClick={handleViewHistory}
              className="w-full p-lg bg-white border border-outline-variant text-on-surface rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-md">
                <div className="bg-surface-container-low p-sm rounded-lg">
                  <span className="material-symbols-outlined text-primary">history</span>
                </div>
                <div className="text-left">
                  <p className="font-bold">View History</p>
                  <p className="text-xs text-on-surface-variant">Access all previous scans</p>
                </div>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
            <button
              onClick={handleOpenLibrary}
              className="w-full p-lg bg-white border border-outline-variant text-on-surface rounded-xl flex items-center justify-between group hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-md">
                <div className="bg-surface-container-low p-sm rounded-lg">
                  <span className="material-symbols-outlined text-primary">school</span>
                </div>
                <div className="text-left">
                  <p className="font-bold">Disease Library</p>
                  <p className="text-xs text-on-surface-variant">Learn about common threats</p>
                </div>
              </div>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>

          {/* Right: Recent Predictions */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-title-md font-title-md text-on-surface">Recent Predictions</h2>
              <Link to="/history" className="text-primary font-label-md text-label-md hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {recentPredictions.length > 0 ? (
                recentPredictions.map((pred) => (
                  <div key={pred.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-all">
                    <img
                      alt={pred.disease}
                      className="w-full h-32 object-cover"
                      src={pred.image_url || 'https://via.placeholder.com/300x128'}
                    />
                    <div className="p-md">
                      <div className="flex justify-between items-start mb-xs">
                        <h3 className="font-bold text-on-surface">{pred.disease}</h3>
                        <span className={`${
                          pred.is_infected ? 'bg-error-container text-on-error-container' : 'bg-primary/10 text-primary'
                        } text-[10px] font-bold px-xs py-[1px] rounded uppercase`}>
                          {pred.is_infected ? 'Infected' : 'Healthy'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-sm">
                        <span className="text-caption text-on-surface-variant">{(pred.confidence * 100).toFixed(1)}% Match</span>
                        <span className="text-caption text-on-surface-variant">{new Date(pred.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-on-surface-variant">
                  <p>No predictions yet. Start by uploading an image!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { diseaseAPI } from '../services/api';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Modal State Control Blocks
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [predictionToDelete, setPredictionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await diseaseAPI.getPredictions(
          (currentPage - 1) * itemsPerPage,
          itemsPerPage
        );
        setPredictions(response.data);
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [currentPage]);

  const confirmDelete = async () => {
    if (!predictionToDelete) return;
    
    setDeleting(true);
    try {
      await diseaseAPI.deletePrediction(predictionToDelete.id);
      setPredictions(predictions.filter(p => p.id !== predictionToDelete.id));
      setPredictionToDelete(null);
    } catch (error) {
      console.error('Failed to delete prediction:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = pred.disease.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'infected' && pred.is_infected) ||
      (filter === 'healthy' && !pred.is_infected);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-on-surface-variant">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-lg py-xl relative">
      {/* Page Header */}
      <section className="mb-xl">
        <h1 className="text-headline-lg font-headline-lg mb-lg">Diagnostic History</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-md">
          <div className="lg:col-span-2 bg-surface p-lg rounded-xl border border-outline-variant flex items-center gap-md">
            <span className="material-symbols-outlined text-outline">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-body-md font-body-md text-on-surface-variant"
              placeholder="Search diseases or crop types..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-surface p-lg rounded-xl border border-outline-variant flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-caption font-caption text-outline">Filter</span>
              <select
                className="bg-transparent border-none focus:ring-0 text-label-md font-label-md outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="infected">Infected</option>
                <option value="healthy">Healthy</option>
              </select>
            </div>
          </div>

          <div className="bg-surface p-lg rounded-xl border border-outline-variant flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-caption font-caption text-outline">Sort</span>
              <span className="text-label-md font-label-md">Newest First</span>
            </div>
            <span className="material-symbols-outlined text-outline">sort</span>
          </div>
        </div>
      </section>

      {/* Prediction Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg mb-xl">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map((pred) => (
            <div
              key={pred.id}
              className={`bg-surface rounded-xl border ${
                pred.is_infected ? 'border-l-4 border-l-error' : ''
              } border-outline-variant overflow-hidden hover:shadow-lg transition-all group`}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  alt={pred.disease}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pred.image_url || 'https://via.placeholder.com/300x200'}
                />
                <div className={`absolute top-md right-md ${
                  pred.is_infected ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
                } px-sm py-xs rounded-full text-caption font-caption flex items-center gap-xs`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {pred.is_infected ? 'warning' : 'verified'}
                  </span>
                  {(pred.confidence * 100).toFixed(0)}% Match
                </div>
              </div>

              <div className="p-lg">
                <div className="flex justify-between items-start mb-xs">
                  <h3 className="text-title-md font-title-md text-on-surface">{pred.disease}</h3>
                  <span className="text-caption font-caption text-outline">
                    {new Date(pred.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-body-md font-body-md text-on-surface-variant mb-lg">
                  Tomato Plant
                </p>
                <div className="flex gap-md">
                  <button 
                    onClick={() => setSelectedPrediction(pred)}
                    className="flex-grow border border-outline-variant text-primary font-bold h-12 rounded-lg flex items-center justify-center gap-xs hover:bg-primary/5 transition-colors"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                    View
                  </button>
                  <button
                    onClick={() => setPredictionToDelete(pred)}
                    className="w-12 h-12 border border-outline-variant text-error rounded-lg flex items-center justify-center hover:bg-error-container/20 transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4">
              search_off
            </span>
            <p className="text-on-surface-variant text-label-md">No predictions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <section className="mt-xl flex flex-col md:flex-row justify-between items-center gap-md border-t border-outline-variant pt-lg">
        <div className="flex items-center gap-md">
          <span className="text-label-md font-label-md text-on-surface-variant">Results per page:</span>
          <select className="bg-surface border border-outline-variant rounded-lg text-label-md font-label-md px-md py-1 focus:ring-primary focus:border-primary outline-none">
            <option>12</option>
            <option>24</option>
            <option>48</option>
          </select>
        </div>
        <div className="flex items-center gap-xs">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">
            {currentPage}
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <p className="text-label-md font-label-md text-on-surface-variant">
          Page {currentPage}
        </p>
      </section>

      {/* Form Type Detail Viewer Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface max-w-2xl w-full rounded-2xl overflow-hidden border border-outline-variant shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Diagnostic Summary</h2>
                <p className="text-caption font-caption text-on-surface-variant mt-xs">
                  ID reference: {selectedPrediction.id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedPrediction(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-on-surface/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-lg overflow-y-auto space-y-lg flex-grow">
              <div className="w-full h-64 rounded-xl overflow-hidden bg-black/5 relative border border-outline-variant">
                <img 
                  src={selectedPrediction.image_url || 'https://via.placeholder.com/600x400'} 
                  alt={selectedPrediction.disease} 
                  className="w-full h-full object-contain mx-auto"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
                  <span className="text-caption font-caption text-outline block">Condition Diagnosis</span>
                  <span className="text-title-md font-bold text-on-surface block mt-xs">{selectedPrediction.disease}</span>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
                  <span className="text-caption font-caption text-outline block">Analysis Status</span>
                  <div className="mt-xs flex items-center gap-xs">
                    <span className={`w-3 h-3 rounded-full ${selectedPrediction.is_infected ? 'bg-error' : 'bg-primary'}`}></span>
                    <span className="text-body-md font-bold">
                      {selectedPrediction.is_infected ? 'Infection Flagged' : 'Healthy Specimen'}
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
                  <span className="text-caption font-caption text-outline block">Model Match Certainty</span>
                  <span className="text-title-md font-bold text-primary block mt-xs">
                    {(selectedPrediction.confidence * 100).toFixed(2)}% Confidence
                  </span>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
                  <span className="text-caption font-caption text-outline block">Processed Date & Time</span>
                  <span className="text-body-md text-on-surface block mt-xs">
                    {new Date(selectedPrediction.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-lg border-t border-outline-variant bg-surface-container-low flex justify-end">
              <button 
                onClick={() => setSelectedPrediction(null)}
                className="px-xl h-11 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
              >
                Dismiss Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Form-Type Confirmation Deletion Modal */}
      {predictionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-md">
          <div className="bg-surface max-w-md w-full rounded-2xl border border-outline-variant shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-lg border-b border-outline-variant bg-error-container/10 flex items-center gap-md text-error">
              <span className="material-symbols-outlined text-3xl">warning_row</span>
              <div>
                <h3 className="text-title-lg font-bold">Confirm Deletion</h3>
                <p className="text-caption font-caption text-on-surface-variant">This operation is irreversible.</p>
              </div>
            </div>

            <div className="p-lg space-y-md text-body-md text-on-surface-variant">
              <p>You are about to remove the diagnostic prediction logs associated with:</p>
              <div className="p-md rounded-xl bg-surface-container-low border border-outline-variant flex items-center gap-md">
                <img 
                  src={predictionToDelete.image_url || 'https://via.placeholder.com/80x80'} 
                  alt="" 
                  className="w-12 h-12 rounded-lg object-cover bg-black/5"
                />
                <div>
                  <h4 className="font-bold text-on-surface">{predictionToDelete.disease}</h4>
                  <p className="text-caption text-outline">{new Date(predictionToDelete.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-caption text-error font-medium">
                Clicking confirm will immediately erase this entry from your diagnostic record logs permanently.
              </p>
            </div>

            <div className="p-lg border-t border-outline-variant bg-surface-container-low flex items-center justify-end gap-md">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setPredictionToDelete(null)}
                className="px-lg h-11 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-on-surface/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="px-xl h-11 bg-error text-white font-bold rounded-lg hover:brightness-90 transition-all flex items-center gap-xs disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Purging...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default History;
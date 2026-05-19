import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseAPI } from '../services/api';

const Predict = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await diseaseAPI.predict(image);
      setResult(response.data);
    } catch (err) {
      if (err.requiresLogin) {
        navigate('/login');
        return;
      }
      // Extract error message (handles both string and object errors)
      const errorMsg = err.message || 'Failed to process image';
      setError(errorMsg);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-lg py-xl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-headline-lg font-headline-lg mb-lg text-on-surface">Disease Prediction</h1>
        <p className="text-body-lg font-body-lg text-on-surface-variant mb-xl">
          Upload a clear image of a tomato leaf to get an instant diagnostic analysis.
        </p>

        {!result ? (
          <div className="bg-surface border border-outline-variant rounded-xl p-xl">
            {/* Image Upload Area */}
            <div className="mb-xl">
              <label className="block text-label-md font-label-md text-on-surface-variant mb-md">
                Select Image
              </label>
              <div className="relative">
                {preview ? (
                  <div className="relative w-full">
                    <img
                      alt="Preview"
                      className="w-full rounded-lg border border-outline-variant"
                      src={preview}
                    />
                    <button
                      onClick={() => { setImage(null); setPreview(null); }}
                      className="absolute top-2 right-2 bg-error text-white p-2 rounded-full hover:brightness-90"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline rounded-lg p-lg cursor-pointer hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-primary text-5xl mb-md">photo_camera</span>
                    <p className="text-label-md font-label-md text-on-surface">Click to upload image</p>
                    <p className="text-caption font-caption text-on-surface-variant">PNG, JPG up to 10MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-xl bg-error-container border border-error/20 p-md rounded-lg flex items-start gap-md">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-on-error-container">{error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handlePredict}
              disabled={!image || loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-sm"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">search</span>
                  Analyze Image
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-xl">
            {/* Result Card */}
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
              <div className="bg-surface-container-high p-xl flex items-center gap-lg">
                <img
                  alt="Analysis"
                  className="w-24 h-24 rounded-lg object-cover"
                  src={preview}
                />
                <div>
                  <h2 className="text-title-md font-title-md text-on-surface mb-xs">
                    {result.disease}
                  </h2>
                  <p className={`text-label-md font-label-md ${
                    result.is_infected ? 'text-error' : 'text-primary'
                  }`}>
                    {result.is_infected ? 'INFECTED' : 'HEALTHY'}
                  </p>
                  <p className="text-body-md font-body-md text-on-surface-variant mt-sm">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="p-xl space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="p-md bg-surface-container-low rounded-lg">
                    <p className="text-caption font-caption text-on-surface-variant uppercase mb-xs">
                      Diagnosis
                    </p>
                    <p className="text-body-md font-body-md text-on-surface">
                      {result.disease}
                    </p>
                  </div>
                  <div className="p-md bg-surface-container-low rounded-lg">
                    <p className="text-caption font-caption text-on-surface-variant uppercase mb-xs">
                      Confidence Score
                    </p>
                    <p className="text-body-md font-body-md text-on-surface">
                      {(result.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {result.description && (
                  <div className="p-md bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-label-md font-label-md text-primary mb-xs">Description</p>
                    <p className="text-body-md font-body-md text-on-surface">
                      {result.description}
                    </p>
                  </div>
                )}

                {result.treatment && (
                  <div className="p-md bg-secondary-container/20 rounded-lg border border-secondary-container/40">
                    <p className="text-label-md font-label-md text-on-secondary-container mb-xs">Recommended Treatment</p>
                    <p className="text-body-md font-body-md text-on-surface">
                      {result.treatment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-md">
              <button
                onClick={handleReset}
                className="flex-1 h-12 border border-outline-variant text-primary font-bold rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Analyze Another
              </button>
              <button
                onClick={() => navigate('/history')}
                className="flex-1 h-12 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-sm"
              >
                <span className="material-symbols-outlined">history</span>
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Predict;

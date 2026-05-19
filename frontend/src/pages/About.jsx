import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const diseaseData = [
  {
    id: 1,
    name: 'Bacterial Spot',
    scientific: 'Xanthomonas perforans',
    severity: 'High',
    symptoms: 'Small, water-soaked spots on leaves that turn dark brown or black. Centers may dry up and drop out, creating a "shot-hole" appearance.',
    treatment: 'Apply copper-based bactericides early in the cycle. Remove and destroy heavily infected plant debris.',
    prevention: 'Use pathogen-free seeds, avoid overhead watering, and refrain from working in fields when foliage is wet.',
    infected: true,
  },
  {
    id: 2,
    name: 'Early Blight',
    scientific: 'Alternaria solani',
    severity: 'High',
    symptoms: 'Dark spots with distinctive concentric target-like rings appearing first on older leaves near the ground.',
    treatment: 'Apply preventive chlorothalonil or copper fungicides upon early identification.',
    prevention: 'Enforce a minimum 3-year crop rotation cycle, maximize plant spacing, and use mulch to stop soil splashing.',
    infected: true,
  },
  {
    id: 3,
    name: 'Late Blight',
    scientific: 'Phytophthora infestans',
    severity: 'Critical',
    symptoms: 'Large, irregular water-soaked lesions on leaves turning quickly paper-brown. A noticeable white fungal fuzz develops underneath in humid conditions.',
    treatment: 'Immediate destruction and safe disposal of infected plants. Fungicides can only protect healthy surrounding tissue.',
    prevention: 'Plant certified disease-resistant crop varieties and ensure low-humidity airflow management.',
    infected: true,
  },
  {
    id: 4,
    name: 'Leaf Mold',
    scientific: 'Passalora fulva',
    severity: 'Medium',
    symptoms: 'Pale green or yellow spots appearing on upper leaf surfaces, accompanied by an olive-green velvety mold layer underneath.',
    treatment: 'Improve greenhouse air circulation using fans and quickly prune lower leaves to drop humidity.',
    prevention: 'Maintain structural space for continuous airflow and keep nighttime greenhouse temperatures regulated.',
    infected: true,
  },
  {
    id: 5,
    name: 'Healthy Crop',
    scientific: 'Solanum lycopersicum',
    severity: 'Optimal',
    symptoms: 'Vibrant green, uniform foliage free from spotting, wilting, or yellow margins. Stems are sturdy, and fruit development is robust.',
    treatment: 'No disease management needed. Maintain standard irrigation and nutrient feeding timelines.',
    prevention: 'Continue routine soil testing, sanitizing pruning shears, and checking daily field diagnostics.',
    infected: false,
  },
];

const About = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);

  // Form State Values
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  const goToPredict = () => navigate('/predict');

  // Triggers native user mail client submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const targetEmail = "dhairyatiwari186@gmail.com";
    const subject = encodeURIComponent(`AgroLens Support Request from ${fullName}`);
    const body = encodeURIComponent(`Hi Support Team,\n\nYou have received a new consultation inquiry.\n\nFrom: ${fullName}\nMessage:\n${message}`);
    
    // Open system mail runner
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full py-xl px-lg bg-surface-container-low overflow-hidden">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row items-center gap-xl">
          <div className="flex-1 space-y-md">
            <span className="bg-primary-container/20 text-on-primary-container px-md py-xs rounded-full font-label-md text-label-md inline-block uppercase tracking-wider">
              Educational Resources
            </span>
            <h1 className="text-display-lg font-display-lg text-on-surface md:text-headline-lg lg:text-display-lg">
              Understanding Tomato Diseases
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-xl">
              Employing our custom deep learning model architecture to identify common threats to your tomato crops. Learn to identify, treat, and prevent conditions covered under our diagnostic framework.
            </p>
            <div className="flex gap-md pt-base">
              <button
                onClick={goToPredict}
                className="bg-primary text-on-primary h-[48px] px-xl rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                Start Scanning
              </button>
            </div>
          </div>
          <div className="flex-1 w-full aspect-video md:aspect-square rounded-xl overflow-hidden shadow-sm border border-outline-variant">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiJ0wsuN8dDWpvrhacbyf621KUAlwY_xNTlmn1HR21vwfvFsXoVtIdYCfBBRnFp7yPz-mFjaFR4osEy8exMmhp1tVUBl2sqBqQq454K8VtsFaYpHr0TX7JRRsUN9pNwXuxsTH22w6r640d4UB4hef97zpYabUnuAB4L74yQY86p3TKJG1idLcOp6fwGjsUZgWyWuS_BNFJp6bEL86cfRUl-K_FpRIqr8z1PLEG6JHhYet1XBjuohCalZsxEbGK524E0K3qtoA40bc"
              alt="Tomato disease comparison"
            />
          </div>
        </div>
      </section>

      {/* Disease Encyclopedia */}
      <section className="max-w-container-max mx-auto px-lg py-xl">
        <div className="mb-xl">
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Supported Diagnostic Targets</h2>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Scientific profiles for the conditions our Tomato Disease Detection model is actively trained to recognize.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {diseaseData.map((disease) => (
            <div
              key={disease.id}
              className="bg-surface border border-outline-variant rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => setExpandedId(expandedId === disease.id ? null : disease.id)}
            >
              <div className="p-lg space-y-md">
                <div className="flex justify-between items-start gap-sm">
                  <div>
                    <h3 className="text-title-md font-title-md text-on-surface">{disease.name}</h3>
                    <p className="text-caption font-caption text-on-surface-variant italic">{disease.scientific}</p>
                  </div>
                  <span className={`${
                    disease.infected ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'
                  } px-md py-xs rounded-full flex items-center gap-xs font-label-md text-label-md whitespace-nowrap`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {disease.infected ? 'warning' : 'check_circle'}
                    </span>
                    {disease.severity}
                  </span>
                </div>

                <div className="p-md bg-surface-container rounded-lg">
                  <p className="font-label-md text-label-md text-primary mb-xs">Key Symptoms</p>
                  <p className="text-body-md font-body-md text-on-surface-variant text-sm leading-relaxed">
                    {disease.symptoms}
                  </p>
                </div>

                {expandedId === disease.id && (
                  <div className="space-y-md border-t border-outline-variant pt-md animate-fadeIn">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface mb-xs font-bold">Field Action & Treatment</p>
                      <p className="text-body-md font-body-md text-on-surface-variant text-sm leading-relaxed">
                        {disease.treatment}
                      </p>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface mb-xs font-bold">Long-term Prevention</p>
                      <p className="text-body-md font-body-md text-on-surface-variant text-sm leading-relaxed">
                        {disease.prevention}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-lg pb-md flex items-center justify-between text-outline border-t border-transparent pt-xs">
                <span className="text-caption font-caption text-primary font-medium">
                  {expandedId === disease.id ? 'Collapse details' : 'Expand full profile'}
                </span>
                <span className="material-symbols-outlined transition-transform duration-200"
                  style={{
                    transform: expandedId === disease.id ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  expand_more
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container-lowest py-xl">
        <div className="max-w-container-max mx-auto px-lg">
          <div className="text-center mb-xl">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Frequently Asked Questions</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">
              System capabilities and tips for maximizing diagnostic performance.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-md">
            {[
              {
                q: 'Which conditions can this application identify?',
                a: 'The system is optimized for a robust classification envelope targeting 4 major leaf pathologies (Bacterial Spot, Early Blight, Late Blight, and Leaf Mold) as well as validating completely healthy tomato crop leaf conditions.',
              },
              {
                q: 'What is the best way to capture an image for scanning?',
                a: 'For top diagnostic performance, capture high-resolution images in uniform daylight. Avoid heavy shadows, focus explicitly on a single leaf branch, and make sure the leaf fills a minimum of 60% of your camera framework boundary.',
              },
              {
                q: 'Can the app predict diseases on fruits or soil directly?',
                a: 'The core AI classification engine is specifically optimized for tomato leaf patterns. While fruit symptoms sometimes correlate with these visual metrics, we recommend assessing active foliar tissue for leaf-level diagnoses.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-outline-variant rounded-xl bg-surface overflow-hidden">
                <button 
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full p-lg text-left flex justify-between items-center hover:bg-surface-container-low transition-colors"
                >
                  <span className="font-title-md text-title-md text-on-surface">{faq.q}</span>
                  <span className="material-symbols-outlined transition-transform"
                        style={{ transform: openFaqIdx === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>
                {openFaqIdx === idx && (
                  <div className="px-lg pb-lg text-body-md font-body-md text-on-surface-variant animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-container-max mx-auto px-lg py-xl">
        <div className="bg-primary text-on-primary rounded-xl p-xl flex flex-col md:flex-row items-center gap-xl">
          <div className="flex-1 space-y-md">
            <h2 className="text-headline-lg font-headline-lg">Need Expert Support?</h2>
            <p className="text-body-lg font-body-lg opacity-90">
              If you are facing an intensive local outbreak or need enterprise assistance configuring regional precision farm monitoring tools, reach out to our desk.
            </p>
            <div className="flex flex-col sm:flex-row gap-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined">mail</span>
                <span className="font-label-md">dhairyatiwari186@gmail.com</span>
              </div>
            </div>
          </div>
          <div className="flex-none bg-surface p-lg rounded-xl text-on-surface w-full max-w-md shadow-lg">
            <form className="space-y-md" onSubmit={handleFormSubmit}>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                <input
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-xs transition-colors"
                  placeholder="Your Name here"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">Message</label>
                <textarea
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-xs transition-colors h-24"
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-secondary-container text-on-secondary-container h-[48px] rounded-lg font-bold hover:opacity-95 transition-opacity"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
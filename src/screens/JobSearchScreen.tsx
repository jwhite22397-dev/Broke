import { useState } from 'react';
import { ArrowLeft, Briefcase, Check, X, Clock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getAvailableJobs } from '../game/simulation/careerSystem';
import { formatCurrency } from '../game/simulation/financialSystem';
import { getEntryLevelJobs } from '../data/jobs/jobs';
import type { Job } from '../game/models/types';

export function JobSearchScreen() {
  const { gameState, setScreen, applyForJob } = useGameStore();
  const [applying, setApplying] = useState<string | null>(null);
  const [result, setResult] = useState<{ jobId: string; success: boolean } | null>(null);

  if (!gameState) return null;

  const availableJobs = getAvailableJobs(gameState);
  const entryLevelJobs = getEntryLevelJobs();
  
  const jobsToShow = availableJobs.length > 0 ? availableJobs : entryLevelJobs;

  const handleApply = (job: Job) => {
    setApplying(job.id);
    setResult(null);

    setTimeout(() => {
      const success = applyForJob(job);
      setResult({ jobId: job.id, success });
      setApplying(null);

      if (success) {
        setTimeout(() => {
          setScreen('career');
        }, 1500);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <button
        onClick={() => setScreen(gameState.employment ? 'career' : 'home')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Job Search</h1>
      <p className="text-slate-400 mb-6">
        Apply for positions that match your skills and experience.
      </p>

      {/* Current qualifications */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-2">Your Qualifications</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500">Education:</span>
            <span className="ml-2 capitalize">{gameState.education.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-slate-500">Experience:</span>
            <span className="ml-2">{Math.floor(gameState.totalWorkExperience / 12)}y {gameState.totalWorkExperience % 12}m</span>
          </div>
        </div>
      </div>

      {/* Job listings */}
      <div className="space-y-3">
        {jobsToShow.map((job) => {
          const isApplying = applying === job.id;
          const jobResult = result?.jobId === job.id ? result : null;
          const monthlyPay = job.isHourly 
            ? Math.round(((job.basePayMin + job.basePayMax) / 2) * job.hoursPerWeek * 4.33)
            : Math.round((job.basePayMin + job.basePayMax) / 2 / 12);

          return (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-slate-500 capitalize">{job.industry.replaceAll('_', ' ')}</p>
                </div>
                <span className="text-green-400 font-semibold">
                  ~{formatCurrency(monthlyPay)}/mo
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="px-2 py-1 bg-slate-700 rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  {job.hoursPerWeek}h/week
                </span>
                {job.benefits && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    Benefits
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full ${
                  job.stressLevel <= 40 ? 'bg-green-500/20 text-green-400' :
                  job.stressLevel <= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {job.stressLevel <= 40 ? 'Low Stress' : job.stressLevel <= 60 ? 'Moderate' : 'High Stress'}
                </span>
              </div>

              {jobResult ? (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                  jobResult.success 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {jobResult.success ? (
                    <>
                      <Check size={20} />
                      <span className="font-semibold">Hired!</span>
                    </>
                  ) : (
                    <>
                      <X size={20} />
                      <span>Not selected. Try again later.</span>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleApply(job)}
                  disabled={isApplying || !!result}
                  className={`w-full btn-primary ${isApplying ? 'opacity-50' : ''}`}
                >
                  {isApplying ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </span>
                  ) : (
                    'Apply'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {jobsToShow.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400">
            No jobs match your current qualifications.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Consider education or training to unlock more opportunities.
          </p>
        </div>
      )}
    </div>
  );
}

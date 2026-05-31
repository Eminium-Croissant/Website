import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../../components/utils/CloudflareI18n';
import useAuth from '../../hooks/useAuth';

interface Report {
  id: number;
  reporter_id: string;
  reporter_username?: string;
  reported_user_id: string;
  reported_username?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  expires_at: string;
  ban_votes: number;
  keep_votes: number;
  user_vote?: 'ban' | 'keep';
}

interface ReportsResponse {
  success: boolean;
  reports?: Report[];
  message?: string;
}

interface VoteResponse {
  success: boolean;
  message: string;
  report?: Report;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

function getTimeRemaining(expiresAt: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, expired: false };
}

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<number, { hours: number; minutes: number; seconds: number; expired: boolean }>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.admin) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.admin) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<number, { hours: number; minutes: number; seconds: number; expired: boolean }> = {};
      reports.forEach(report => {
        if (report.status === 'pending') {
          newTimers[report.id] = getTimeRemaining(report.expires_at);
        }
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [reports]);

  const fetchReports = async () => {
    setLoadingReports(true);
    setError(null);
    try {
      const res = await fetch('/api/reports', {
        credentials: 'include',
      });

      const data: ReportsResponse = await res.json();

      if (data.success && data.reports) {
        setReports(data.reports);
      } else {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      setError('Failed to fetch reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleVote = async (reportId: number, vote: 'ban' | 'keep') => {
    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ vote }),
      });

      const data: VoteResponse = await res.json();

      if (data.success) {
        fetchReports();
      } else {
        setError(data.message || 'Failed to vote');
      }
    } catch (error) {
      setError('Failed to vote');
    }
  };

  if (loading) {
    return (
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='container py-8'>
          <div className='text-white'>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user || !user.admin) {
    return null;
  }

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='container py-8'>
        <h2 className='text-3xl font-bold text-white mb-8'>Admin Reports</h2>

        {error && (
          <div className='mb-6 p-4 rounded-lg bg-red-600 text-white'>
            {error}
            <button onClick={() => setError(null)} className='ml-4 underline'>
              Dismiss
            </button>
          </div>
        )}

        <button
          onClick={fetchReports}
          className='mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
        >
          Refresh
        </button>

        {loadingReports ? (
          <div className='text-white'>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className='text-gray-400'>No reports found.</div>
        ) : (
          <div className='space-y-6'>
            {reports.map(report => {
              const timer = timers[report.id] || getTimeRemaining(report.expires_at);
              const isExpired = timer.expired;
              const totalVotes = report.ban_votes + report.keep_votes;
              const banPercentage = totalVotes > 0 ? (report.ban_votes / totalVotes) * 100 : 0;

              return (
                <div
                  key={report.id}
                  className={`bg-gray-800 rounded-lg p-6 border ${
                    report.status === 'approved'
                      ? 'border-green-500'
                      : report.status === 'rejected'
                      ? 'border-red-500'
                      : 'border-gray-600'
                  }`}
                >
                  <div className='flex justify-between items-start mb-4'>
                    <div>
                      <h3 className='text-xl font-bold text-white'>Report #{report.id}</h3>
                      <p className='text-gray-400 text-sm'>
                        Created: {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === 'approved'
                          ? 'bg-green-600 text-white'
                          : report.status === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                    <div className='bg-gray-700 rounded-lg p-4'>
                      <p className='text-gray-400 text-sm mb-1'>Reporter</p>
                      <p className='text-white font-medium'>
                        {report.reporter_username || report.reporter_id}
                      </p>
                    </div>
                    <div className='bg-gray-700 rounded-lg p-4'>
                      <p className='text-gray-400 text-sm mb-1'>Reported User</p>
                      <p className='text-white font-medium'>
                        {report.reported_username || report.reported_user_id}
                      </p>
                    </div>
                  </div>

                  <div className='bg-gray-700 rounded-lg p-4 mb-4'>
                    <p className='text-gray-400 text-sm mb-1'>Reason</p>
                    <p className='text-white'>{report.reason}</p>
                  </div>

                  {report.status === 'pending' && (
                    <>
                      <div className='mb-4'>
                        {isExpired ? (
                          <div className='text-red-400 font-medium'>Voting period expired</div>
                        ) : (
                          <div className='text-yellow-400 font-medium'>
                            Time remaining: {timer.hours}h {timer.minutes}m {timer.seconds}s
                          </div>
                        )}
                      </div>

                      <div className='flex items-center gap-4 mb-4'>
                        <div className='flex-1 bg-gray-700 rounded-full h-4 overflow-hidden'>
                          <div
                            className='bg-red-600 h-full transition-all duration-300'
                            style={{ width: `${banPercentage}%` }}
                          />
                        </div>
                        <div className='text-white text-sm whitespace-nowrap'>
                          {report.ban_votes} ban / {report.keep_votes} keep
                        </div>
                      </div>

                      {!isExpired && (
                        <div className='flex gap-4'>
                          <button
                            onClick={() => handleVote(report.id, 'ban')}
                            disabled={!!report.user_vote}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                              report.user_vote === 'ban'
                                ? 'bg-red-700 text-white cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Vote to Ban
                          </button>
                          <button
                            onClick={() => handleVote(report.id, 'keep')}
                            disabled={!!report.user_vote}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                              report.user_vote === 'keep'
                                ? 'bg-green-700 text-white cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            Vote to Keep
                          </button>
                        </div>
                      )}

                      {report.user_vote && (
                        <div className='mt-2 text-gray-400 text-sm'>
                          You voted: {report.user_vote === 'ban' ? 'Ban' : 'Keep'}
                        </div>
                      )}
                    </>
                  )}

                  {report.status === 'approved' && (
                    <div className='mt-4 p-4 bg-green-900 rounded-lg text-green-300'>
                      <p className='font-medium'>Result: Approved for banning</p>
                      <p className='text-sm mt-1'>
                        Please manually ban user {report.reported_user_id} from the database.
                      </p>
                    </div>
                  )}

                  {report.status === 'rejected' && (
                    <div className='mt-4 p-4 bg-red-900 rounded-lg text-red-300'>
                      <p className='font-medium'>Result: Rejected</p>
                      <p className='text-sm mt-1'>
                        The community voted to keep this user. No action needed.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

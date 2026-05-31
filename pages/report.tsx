import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n';
import useAuth from '../hooks/useAuth';

interface ReportResponse {
  success: boolean;
  message: string;
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  };
}

export default function ReportPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reportedUserId, setReportedUserId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          reason,
        }),
      });

      const data: ReportResponse = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setReportedUserId('');
        setReason('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
    } finally {
      setSubmitting(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
      <div className='container py-8'>
        <h2 className='text-3xl font-bold text-white mb-8'>Report a User</h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6 max-w-2xl'>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='reportedUserId' className='text-gray-200'>
              User ID to report:
            </label>
            <input
              type='text'
              id='reportedUserId'
              value={reportedUserId}
              onChange={e => setReportedUserId(e.target.value)}
              required
              className='bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter the user ID'
            />
          </div>

          <div className='flex flex-col space-y-2'>
            <label htmlFor='reason' className='text-gray-200'>
              Reason for report:
            </label>
            <textarea
              id='reason'
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={4}
              required
              className='bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Please explain why you are reporting this user'
            />
          </div>

          <button
            type='submit'
            disabled={submitting}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>

        <div className='mt-8 text-gray-400 text-sm'>
          <p>
            Your report will be reviewed by admins. The voting period lasts 24 hours. After that, a decision will be made based on the votes.
          </p>
        </div>
      </div>
    </div>
  );
}

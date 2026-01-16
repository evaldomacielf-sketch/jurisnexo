import { useState, useEffect } from 'react';

export function usePlan() {
  const [plan, setPlan] = useState<{
    plan: string;
    status: string;
    daysLeft: number;
    features: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tenants/me/plan`,
        {
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    plan,
    loading,
    isFeatureEnabled: (feature: string) => plan?.features?.[feature] === true,
  };
}

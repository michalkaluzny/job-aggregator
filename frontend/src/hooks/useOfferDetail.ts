import { useState, useEffect } from 'react';
import { fetchOffer } from '../api/offers';
import { Offer } from '../types/offer';

// Fetches a single offer by guid. Returns null offer when guid is null.
export function useOfferDetail(guid: string | null) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guid) {
      setError(null);
      return;
    }

    // Reset error and start loading, but keep showing the previous offer so
    // the drawer doesn't flash empty during a transition
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchOffer(guid)
      .then((data) => {
        if (!cancelled) setOffer(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guid]);

  return { offer, loading, error };
}

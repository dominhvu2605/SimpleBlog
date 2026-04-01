'use client';

import { useEffect } from 'react';

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire-and-forget — don't block render or surface errors to user
    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, { method: 'POST' }).catch(
      () => {}
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

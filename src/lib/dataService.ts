import { ToastyDataset } from '../types';

const SNAPSHOT_URL = './data/toasty-data.json';

export const dataService = {
  /**
   * Loads the build-time validated public JSON snapshot generated from Google Sheets
   * by GitHub Actions (private financial fields and raw DOBs are stripped at build time).
   */
  fetchStaticSnapshot: async (bustCache = false): Promise<ToastyDataset> => {
    const url = bustCache ? `${SNAPSHOT_URL}?t=${Date.now()}` : SNAPSHOT_URL;
    const res = await fetch(url, { cache: bustCache ? 'no-store' : 'default' });
    if (!res.ok) {
      throw new Error(`Failed to load static club snapshot (${res.status})`);
    }
    return (await res.json()) as ToastyDataset;
  },
};

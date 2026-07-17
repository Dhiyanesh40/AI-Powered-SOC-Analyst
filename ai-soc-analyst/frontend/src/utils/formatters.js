export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleString();
};

export const formatConfidence = (score) => {
  if (score === undefined || score === null) return 'N/A';
  // convert decimals to percentage if < 1
  const pct = score <= 1 ? score * 100 : score;
  return `${pct.toFixed(1)}%`;
};

export const formatDuration = (ms) => {
  if (ms === undefined || ms === null) return '0 ms';
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
};

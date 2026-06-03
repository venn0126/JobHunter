export function getCareerVaultPath(evidenceId?: string, options: { jobId?: string } = {}) {
  const searchParams = new URLSearchParams();
  if (options.jobId) {
    searchParams.set("job", options.jobId);
  }
  if (evidenceId) {
    searchParams.set("evidence", evidenceId);
  }

  const search = searchParams.toString();
  return search ? `/resume?${search}` : "/resume";
}

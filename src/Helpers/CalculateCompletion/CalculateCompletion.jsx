export const CalculateCompletion = (row) => {
  const passedCount = row?.passed_tests || 0;
  const failedCount = row?.failed_tests || 0;
  const skippedCount = row?.skipped_tests || 0;
  const totalCount = row?.total_cases_in_suites
    ? row?.total_cases_in_suites
    : row?.total_tests || 0;
  const percentage = totalCount
    ? parseFloat(
        (
          ((passedCount + failedCount + skippedCount) / totalCount) *
          100
        ).toFixed(2)
      )
    : 0;

  return { passedCount, failedCount, skippedCount, percentage };
};

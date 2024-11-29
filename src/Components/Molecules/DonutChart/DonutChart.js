// Merged function to calculate completion and render donut chart
const DonutChart = ({ row }) => {
  const passedCount = row?.testStats?.passedTests || 0;
  const failedCount = row?.testStats?.failedTests || 0;
  const skippedCount = row?.testStats?.skippedTests || 0;
  const totalCount = row?.testStats?.totalTests || 0;

  // Calculate the percentage
  const total = passedCount + failedCount + skippedCount;
  const percentage = totalCount
    ? parseFloat(((total / totalCount) * 100).toFixed(2))
    : 0;

  const passedPercentage = total ? (passedCount / total) * 100 : 0;
  const failedPercentage = total ? (failedCount / total) * 100 : 0;
  const skippedPercentage = total ? (skippedCount / total) * 100 : 0;

  return (
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background:
          total === totalCount
            ? `conic-gradient(
                #39B100 0 ${passedPercentage}%,
                #E35050 ${passedPercentage}% ${
                passedPercentage + failedPercentage
              }%,
                lightgrey ${skippedPercentage}% ${100}%
              )`
            : `conic-gradient(
                orange 0 ${percentage}%,
                lightgrey ${percentage}% ${100}%
              )`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Inner white circle to make the donut thinner */}
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "8px",
          fontWeight: "bold",
        }}
      >
        {percentage}%
      </div>
    </div>
  );
};
export default DonutChart;

// How to use this donut chart component

// export default function App() {
//     const rowData = {
//       passed_tests: 15,
//       failed_tests: 20,
//       skipped_tests: 5,
//       total_cases_in_suites: 40, // or use total_tests
//     };

//     return (
//       <div>
//         <DonutChart row={rowData} />
//       </div>
//     );
//   }

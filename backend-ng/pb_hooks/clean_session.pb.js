// Clean old sessions

cronAdd("Clean old sessions", "*/2 * * * *", () => {
  const SESSION_DURATION = 360; // Session duration in days

  console.log("Clean old sessions");

  const cutoffDate = new Date();

  cutoffDate.setDate(cutoffDate.getDate() - SESSION_DURATION);

  const records = $app.findAllRecords(
    "sessions",
    $dbx.exp("timestamp < {:cutoff} OR timestamp= '' OR timestamp IS NULL", {
      cutoff: cutoffDate.toISOString(),
    })
  );
  records.forEach((record) => $app.delete(record));
});

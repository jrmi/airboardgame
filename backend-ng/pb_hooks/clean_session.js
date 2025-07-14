// Clean old sessions

cronAdd("Clean old sessions", "*/2 * * * *", () => {
  const SESSION_DURATION = 90; // Session duration in days

  console.log("Clean old sessions");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - SESSION_DURATION);

  $app
    .dao()
    .db()
    .newQuery(
      "DELETE FROM sessions WHERE timestamp < {:cutoff} OR timestamp= '' OR timestamp IS NULL"
    )
    .bind({ cutoff: cutoffDate.toISOString() })
    .execute();
});

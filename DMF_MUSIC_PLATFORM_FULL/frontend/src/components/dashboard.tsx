export default function Dashboard(){
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gold">DMF Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="p-4 bg-blue-900 rounded">Total Revenue<br/><strong>$0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Active Tracks<br/><strong>0</strong></div>
        <div className="p-4 bg-blue-900 rounded">Bots Online<br/><strong>0</strong></div>
      </div>
    </div>
  );
}

export default function CoverageDonut({ percent }: { percent: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0" role="img" aria-label={`${percent}%`}>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#065f46" strokeWidth="12"
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform="rotate(-90 50 50)" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
        fontSize="22" fontWeight="700" fill="#1e3a5f">{percent}%</text>
    </svg>
  );
}

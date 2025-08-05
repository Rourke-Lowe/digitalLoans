export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon 
          points="50,10 80,30 80,50 50,70 20,50 20,30" 
          fill="#2563eb"
        />
        <polygon 
          points="50,30 80,50 80,70 50,90 20,70 20,50" 
          fill="#60a5fa"
        />
        <polygon 
          points="35,20 65,20 65,40 35,40" 
          fill="#1e40af"
        />
        <polygon 
          points="35,60 65,60 65,80 35,80" 
          fill="#3b82f6"
        />
      </svg>
    </div>
  );
}
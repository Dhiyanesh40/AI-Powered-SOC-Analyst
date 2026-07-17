import clsx from 'clsx';

export default function Loader({ text = 'Analyzing...', className }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center gap-4 py-12',
        className
      )}
    >
      {/* Spinner */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div
          className={clsx(
            'absolute inset-0 rounded-full',
            'border-2 border-cyan-500/20'
          )}
        />
        {/* Spinning ring */}
        <div
          className={clsx(
            'absolute inset-0 rounded-full',
            'border-2 border-transparent border-t-cyan-500 border-r-cyan-500',
            'animate-spin'
          )}
        />
        {/* Inner pulse */}
        <div
          className={clsx(
            'absolute inset-3 rounded-full',
            'bg-cyan-500/10 animate-pulse'
          )}
        />
        {/* Core dot */}
        <div
          className={clsx(
            'absolute inset-[45%] rounded-full',
            'bg-cyan-400 shadow-lg shadow-cyan-500/50'
          )}
        />
      </div>

      {/* Text */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-400 tracking-wide">
          {text}
        </span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

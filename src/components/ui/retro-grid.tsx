import { cn } from '@/lib/utils'

interface RetroGridProps {
  className?: string
  angle?: number
  cellSize?: number
  lineColor?: string
  fadeFromColor?: string
}

export function RetroGrid({
  className,
  angle = 65,
  cellSize = 52,
  lineColor = 'rgba(11,143,172,0.07)',
  fadeFromColor = 'white',
}: RetroGridProps) {
  const gridStyles = {
    '--grid-angle': `${angle}deg`,
    '--cell-size': `${cellSize}px`,
    '--line': lineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]', className)}
      style={gridStyles}
      aria-hidden
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className="animate-retro-grid [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]"
          style={{
            backgroundImage: `linear-gradient(to right, var(--line) 1px, transparent 0), linear-gradient(to bottom, var(--line) 1px, transparent 0)`,
          }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(to top, ${fadeFromColor} 0%, transparent 90%)` }}
      />
    </div>
  )
}
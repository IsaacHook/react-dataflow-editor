const minCurveExtent = 104
export function makeCurvePath(
	[x1, y1]: [number, number],
	[x2, y2]: [number, number]
): string {
	const dx = x2 - x1
	const mx = x1 + dx / 2
	const dy = y2 - y1
	const my = y1 + dy / 2
	const qx = x1 + Math.max(Math.min(minCurveExtent, Math.abs(dy / 2)), dx / 4)
	return `M ${x1} ${y1} Q ${qx} ${y1} ${mx} ${my} T ${x2} ${y2}`
}
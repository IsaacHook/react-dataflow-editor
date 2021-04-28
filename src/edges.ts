import { select } from "d3-selection"
import { makeCurvePath } from "./curve.js"
import type { Edge, ReadonlyCanvasRef, Schema } from "./interfaces.js"
import { getKey, getSourcePosition, getTargetPosition } from "./utils.js"

export function setEdgePosition(
	this: SVGGElement,
	sourcePosition: [number, number],
	targetPosition: [number, number]
) {
	const d = makeCurvePath(sourcePosition, targetPosition)
	select(this).selectAll("path.curve").attr("d", d)
}

export const updateEdges = <S extends Schema>(ref: ReadonlyCanvasRef<S>) => {
	const decorateEdges = ref.decorateEdges || ((node) => {})

	return () => {
		ref.edges
			.selectAll<SVGGElement, Edge<S>>("g.edge")
			.data<Edge<S>>(Object.values(ref.graph.edges), getKey)
			.join(
				(enter) => {
					const edges = enter
						.append("g")
						.classed("edge", true)
						.attr("data-id", getKey)
						.attr("data-source", ({ source: { id } }) => id)
						.attr("data-target", ({ target: { id } }) => id)
						.attr("data-output", ({ source: { output } }) => output)
						.attr("data-input", ({ target: { input } }) => input)

					edges.each(function ({ source, target }) {
						const sourcePosition = getSourcePosition(ref, source)
						const targetPosition = getTargetPosition(ref, target)
						const d = makeCurvePath(sourcePosition, targetPosition)
						const g = select(this)
						g.append("path")
							.classed("outer curve", true)
							.attr("stroke-width", 8)
							.attr("stroke", "dimgrey")
							.attr("fill", "none")
							.attr("d", d)
						g.append("path")
							.classed("inner curve", true)
							.attr("stroke-width", 6)
							.attr("stroke", "lightgrey")
							.attr("fill", "none")
							.attr("d", d)
					})

					edges.call(decorateEdges)

					return edges
				},
				(update) => {
					update.attr("data-target", ({ target: { id } }) => id)
					update.attr("data-input", ({ target: { input } }) => input)
					update.each(function ({ source, target }) {
						setEdgePosition.call(
							this,
							getSourcePosition(ref, source),
							getTargetPosition(ref, target)
						)
					})

					update.call(decorateEdges)

					return update
				},
				(exit) => exit.remove()
			)
	}
}

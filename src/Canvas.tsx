import React, {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"
import { useDispatch, useSelector } from "react-redux"
import { Dispatch } from "redux"

import { useDrop } from "react-dnd"

import { select } from "d3-selection"

import * as actions from "./redux/actions.js"

import {
	SystemState,
	CanvasRef,
	Schema,
	Node,
	Edge,
	Values,
} from "./interfaces.js"

import { BlockContent } from "./Block.js"

import { attachPreview } from "./preview.js"
import { updateNodes } from "./nodes.js"
import { updateEdges } from "./edges.js"
import { defaultBackgroundColor, defaultBorderColor, snap } from "./utils.js"

const svgStyle = `
g.node > foreignObject { overflow: visible }
g.node > g.frame circle.port { cursor: grab }
g.node > g.frame circle.port.hidden { display: none }
g.node > g.frame > g.outputs > circle.port.dragging { cursor: grabbing }

g.edge.hidden { display: none }
g.edge > path.curve {
	stroke: gray;
	stroke-width: 6px;
	fill: none;
}

g.preview.hidden { display: none }
g.preview > path.curve {
	stroke: gray;
	stroke-width: 6px;
	fill: none;
	stroke-dasharray: 8 6;
}
g.preview > circle {
	fill: ${defaultBackgroundColor};
	stroke: ${defaultBorderColor};
	stroke-width: 4px;
}
`

export interface CanvasProps<K extends string, V extends Values<K>> {
	unit: number
	dimensions: [number, number]
	schema: Schema<K, V>
	onChange: (nodes: Map<number, Node<K, V>>, edges: Map<number, Edge>) => void
}

export function Canvas<K extends string, V extends Values<K>>({
	unit,
	dimensions,
	schema,
	onChange,
}: CanvasProps<K, V>) {
	const dispatch = useDispatch<Dispatch<actions.SystemAction<K, V>>>()

	const nodes = useSelector(({ nodes }: SystemState<K, V>) => nodes)
	const edges = useSelector(({ edges }: SystemState<K, V>) => edges)

	const [X, Y] = dimensions

	const ref = useMemo<CanvasRef<K, V>>(
		() => ({
			svg: select<SVGSVGElement | null, unknown>(null),
			contentDimensions: new Map(),
			canvasDimensions: [0, 0],
			unit,
			dimensions: [X, Y],
			schema,
			nodes,
			edges,
			dispatch,
		}),
		[unit, X, Y, schema, dispatch]
	)

	ref.nodes = nodes
	ref.edges = edges

	useEffect(() => onChange(nodes, edges), [nodes, edges])

	const svgRef = useRef<SVGSVGElement | null>(null)
	const attachSVG = useCallback((svg: SVGSVGElement) => {
		svgRef.current = svg
		ref.svg = select<SVGSVGElement | null, unknown>(svg)
		ref.svg.select<SVGGElement>("g.preview").call(attachPreview)
	}, [])

	const update = useMemo(
		() => ({ nodes: updateNodes(ref), edges: updateEdges(ref) }),
		[]
	)

	const [children, setChildren] = useState<[number, HTMLDivElement][]>([])

	useLayoutEffect(() => {
		const children: [number, HTMLDivElement][] = []
		update.nodes().each(function (this: HTMLDivElement, { id }: Node<K, V>) {
			children.push([id, this])
		})
		setChildren(children)
	}, [nodes])

	useLayoutEffect(() => {
		update.edges()
	}, [edges, nodes])

	const height = unit * Y

	const [{}, drop] = useDrop<{ type: "block"; kind: K }, void, {}>({
		accept: ["block"],
		drop({ kind }, monitor) {
			const { x, y } = monitor.getSourceClientOffset()!
			const { left, top } = svgRef.current!.getBoundingClientRect()
			const position = snap([x - left, y - top], unit, dimensions)
			dispatch(actions.createNode(kind, position))
		},
	})

	return (
		<div ref={drop} className="canvas" style={{ height }}>
			<svg
				ref={attachSVG}
				xmlns="http://www.w3.org/2000/svg"
				height={height}
				style={{
					backgroundImage:
						"radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)",
					backgroundSize: `${unit}px ${unit}px`,
					backgroundPositionX: `-${unit / 2}px`,
					backgroundPositionY: `-${unit / 2}px`,
				}}
			>
				<style>{svgStyle}</style>
				<g className="edges"></g>
				<g className="nodes"></g>
				<g className="preview"></g>
				{children.map(([id, container]) => (
					<Portal key={id} id={id} schema={schema} container={container} />
				))}
			</svg>
		</div>
	)
}

interface PortalProps<K extends string, V extends Values<K>> {
	container: HTMLDivElement
	id: number
	schema: Schema<K, V>
}

const portal = <K extends string, V extends Values<K>>({
	container,
	id,
	schema,
}: PortalProps<K, V>) => {
	return createPortal(<BlockContent id={id} schema={schema} />, container)
}

const Portal = (memo(portal) as unknown) as typeof portal
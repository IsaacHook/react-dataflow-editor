import React, { useMemo } from "react"

import { ParamUpdateBehaviour } from "./paramUpdate"
import type { GetParams, Kinds, Node, Schema } from "./state.js"

import {
	getParamIndex,
	getParamOffsetY,
	paramWidth,
	paramTextInputMargin,
	paramHeight,
	toTranslate,
	nodeMarginX,
	fontSize
} from "./utils.js"

export interface GraphParamProps<S extends Schema, K extends keyof S> {
	kinds: Kinds<S>
	node: Node<S, K>
	param: GetParams<S, K>
	paramUpdate: ParamUpdateBehaviour | undefined
}

export function GraphParam<S extends Schema, K extends keyof S>(
	props: GraphParamProps<S, K>
) {
	const value = props.node.params[props.param]?.value ?? ''
	const transform = useMemo(() => {
		const index = getParamIndex(props.kinds, props.node.kind, props.param)
		const offsetY = getParamOffsetY(index, props.kinds, props.node.kind)
		return toTranslate([0, offsetY])
	}, [])

	const onChange = (event: any) => {
		if (props.paramUpdate && props.param !== null) {
			props.paramUpdate(props.node, props.param, event.target.value)
		}
	  };

	return (
		<g
			data-id={props.node.id}
			data-input={props.param}
			data-value={value}
			transform={transform}
		>
		<text
			stroke="none"
			transform={`translate (${nodeMarginX}, ${0})`}
			x={0}
			fontSize={fontSize}
			dominantBaseline="middle"
			>
			{props.param}
		</text>
		
		{/* TODO: inherit width and height of bounding box from input element */}
		<foreignObject x={nodeMarginX} y={paramTextInputMargin} width={paramWidth} height={paramHeight}>
			<input
				type="text"
				size={4}
				value={value}
				onChange={onChange}
			/>
		</foreignObject>
		</g>
	)
}
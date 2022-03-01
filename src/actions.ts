import { nanoid } from "nanoid"
import type { Focus, Position, Schema, Source, Target, GetParams } from "./state.js"

export type EditorAction<S extends Schema> =
	| CreateNodeAction<S>
	| MoveNodeAction
	| ModifyParamAction
	| DeleteNodeAction
	| CreateEdgeAction<S>
	| MoveEdgeAction<S>
	| DeleteEdgeAction
	| FocusAction

export type CreateNodeAction<S extends Schema> = {
	type: "node/create"
	id: string
	kind: keyof S
	position: Position
}

export const createNode = <S extends Schema>(
	name: string,
	kind: keyof S,
	position: Position
): CreateNodeAction<S> => ({
	type: "node/create",
	id: `${name.split('.')[0]}_${nanoid(10)}`,
	kind,
	position,
})

export type ModifyParamAction = {
	type: "node/param"
	id: string
	param: GetParams<Schema>
	value: string
}

export const modifyParam = <S extends Schema, K extends keyof S>(id: string, param: GetParams<S, K>, value: string): ModifyParamAction => ({
	type: "node/param",
	id,
	param,
	value
})

export type MoveNodeAction = {
	type: "node/move"
	id: string
	position: Position
}

export const moveNode = (id: string, position: Position): MoveNodeAction => ({
	type: "node/move",
	id,
	position,
})

export type DeleteNodeAction = { type: "node/delete"; id: string }

export const deleteNode = (id: string): DeleteNodeAction => ({
	type: "node/delete",
	id,
})

export type CreateEdgeAction<S extends Schema> = {
	type: "edge/create"
	id: string
	source: Source<S>
	target: Target<S>
}

export const createEdge = <S extends Schema>(
	source: Source<S>,
	target: Target<S>
): CreateEdgeAction<S> => ({
	type: "edge/create",
	id: nanoid(10),
	source,
	target,
})

export type MoveEdgeAction<S extends Schema> = {
	type: "edge/move"
	id: string
	target: Target<S>
}

export const moveEdge = <S extends Schema>(
	id: string,
	target: Target<S>
): MoveEdgeAction<S> => ({
	type: "edge/move",
	id,
	target,
})

export type DeleteEdgeAction = { type: "edge/delete"; id: string }

export const deleteEdge = (id: string): DeleteEdgeAction => ({
	type: "edge/delete",
	id,
})

export type FocusAction = {
	type: "focus"
	subject: Focus | null
}

export const focus = (subject: Focus | null): FocusAction => ({
	type: "focus",
	subject,
})

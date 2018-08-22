// @flow
import type {
  Reducer as ReduxReducer, StoreEnhancer, Dispatch, Store,
} from 'redux';

export type State = {};

export type Action = {
  type: string;
  state?: State;
};

export type Reducer = ReduxReducer<State, Action>;

export type Enhancer = StoreEnhancer<State, Action, Dispatch<Action>>;

export type CreateStore = (reducer: Reducer, initialState: ?State, enhancer: ?Enhancer) =>
  Store<State, Action, Dispatch<Action>>;

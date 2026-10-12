import { Component, type ErrorInfo, type ReactNode } from 'react'
import DataErrorPanel from './DataErrorPanel'

type RouteErrorBoundaryProps = {
  children: ReactNode
  message?: string
}

type RouteErrorBoundaryState = {
  error: Error | null
}

/** Keeps a route from unmounting the whole app when its render throws. */
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <DataErrorPanel
          message={this.props.message ?? 'No se pudo mostrar esta pantalla.'}
          onRetry={() => this.setState({ error: null })}
        />
      )
    }
    return this.props.children
  }
}

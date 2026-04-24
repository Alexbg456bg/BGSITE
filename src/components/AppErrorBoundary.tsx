import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info)
  }

  private handleReload = () => {
    window.location.reload()
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="rounded-[2rem] border border-[var(--border)] bg-white px-8 py-10 shadow-[0_24px_50px_rgba(15,61,46,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--forest)]">
              Възникна проблем
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)]">
              Нещо се обърка при зареждането на сайта
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Страницата няма да остане на счупен екран. Можеш да презаредиш или
              да се върнеш към началото.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
              >
                Презареди
              </button>
              <Link
                to="/"
                className="rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--forest-deep)] transition hover:border-[var(--forest)]"
              >
                Към началото
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

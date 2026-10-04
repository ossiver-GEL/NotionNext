import { act, fireEvent, render, screen } from '@testing-library/react'
import CommentTurnstile from '@/components/CommentTurnstile'

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ onReady }) => <button onClick={onReady}>加载验证脚本</button>
}))

describe('Comment verification lifecycle', () => {
  let options
  const onTokenChange = jest.fn()
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    window.turnstile = {
      render: jest.fn((element, config) => {
        options = config
        return 'widget-1'
      }),
      reset: jest.fn(),
      remove: jest.fn()
    }
  })
  afterEach(() => {
    delete window.turnstile
    document.documentElement.classList.remove('dark')
  })

  test('clears expired tokens and lets readers retry verification', () => {
    render(
      <CommentTurnstile
        siteKey='test-site-key'
        onTokenChange={onTokenChange}
        resetKey={0}
      />
    )
    fireEvent.click(screen.getByText('加载验证脚本'))
    act(() => options.callback('fresh-token'))
    expect(onTokenChange).toHaveBeenLastCalledWith('fresh-token')
    act(() => options['expired-callback']())
    expect(onTokenChange).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('status')).toHaveTextContent('验证已过期')
    fireEvent.click(screen.getByRole('button', { name: '重新验证' }))
    expect(window.turnstile.reset).toHaveBeenCalledWith('widget-1')
  })

  test('creates a fresh challenge after a submit attempt and removes it on unmount', () => {
    const view = render(
      <CommentTurnstile
        siteKey='test-site-key'
        onTokenChange={onTokenChange}
        resetKey={0}
      />
    )
    fireEvent.click(screen.getByText('加载验证脚本'))
    act(() => options.callback('spent-token'))
    view.rerender(
      <CommentTurnstile
        siteKey='test-site-key'
        onTokenChange={onTokenChange}
        resetKey={1}
      />
    )
    expect(onTokenChange).toHaveBeenLastCalledWith('')
    expect(window.turnstile.render).toHaveBeenCalledTimes(2)
    expect(window.turnstile.remove).toHaveBeenCalledWith('widget-1')
    view.unmount()
    expect(window.turnstile.remove).toHaveBeenCalledTimes(2)
  })
})

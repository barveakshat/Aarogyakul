import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { createServer } from 'vite'

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
  key: (index) => [...storage.keys()][index] ?? null,
  get length() {
    return storage.size
  },
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent',
})

try {
  const [{ default: LandingPage }, { default: LoginPage, loginErrorMessage }, { default: RegisterPage }, { AuthProvider }, format, { ApiRequestError }, { isFamilyLoading }] = await Promise.all([
    vite.ssrLoadModule('/src/pages/LandingPage.tsx'),
    vite.ssrLoadModule('/src/pages/LoginPage.tsx'),
    vite.ssrLoadModule('/src/pages/RegisterPage.tsx'),
    vite.ssrLoadModule('/src/context/AuthContext.tsx'),
    vite.ssrLoadModule('/src/utils/format.ts'),
    vite.ssrLoadModule('/src/api/client.ts'),
    vite.ssrLoadModule('/src/context/ProfileContext.tsx'),
  ])

  const renderPage = (Page, path) => renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: [path] },
      React.createElement(AuthProvider, null, React.createElement(Page)),
    ),
  )

  const landing = renderPage(LandingPage, '/')
  assert.match(landing, /A medical report is more than a PDF/)
  assert.match(landing, /View Live Demo/)
  assert.match(landing, /Start with the report you already have/)

  const login = renderPage(LoginPage, '/login')
  assert.match(login, /Welcome back/)
  assert.match(login, /type="email"/)
  assert.match(login, /type="password"/)

  const register = renderPage(RegisterPage, '/register')
  assert.match(register, /Account setup/)
  assert.match(register, /Phone number/)
  assert.match(register, /minLength="8"/)

  assert.equal(loginErrorMessage(new ApiRequestError('Invalid email or password', 401, 'INVALID_CREDENTIALS')), 'Incorrect email or password. Please check your details and try again.')
  assert.equal(loginErrorMessage(new ApiRequestError('Too many requests', 429, 'RATE_LIMITED')), 'Too many sign-in attempts. Please wait a minute, then try again.')
  assert.equal(loginErrorMessage(new ApiRequestError('Network Error')), 'Unable to reach the server. Check your connection and try again.')
  assert.equal(isFamilyLoading('existing-user', null), true)
  assert.equal(isFamilyLoading('existing-user', 'existing-user'), false)

  assert.equal(format.documentTypeLabel('BLOOD_REPORT'), 'Blood report')
  assert.equal(format.statusLabel('COMPLETED'), 'Completed')
  assert.equal(format.initials('Aarogya Kul'), 'AK')

  console.log('Frontend smoke tests passed: landing, login, register, and shared formatters.')
} finally {
  await vite.close()
}

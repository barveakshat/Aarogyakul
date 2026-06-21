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
  const [{ default: LandingPage }, { default: LoginPage }, { default: RegisterPage }, { AuthProvider }, format] = await Promise.all([
    vite.ssrLoadModule('/src/pages/LandingPage.tsx'),
    vite.ssrLoadModule('/src/pages/LoginPage.tsx'),
    vite.ssrLoadModule('/src/pages/RegisterPage.tsx'),
    vite.ssrLoadModule('/src/context/AuthContext.tsx'),
    vite.ssrLoadModule('/src/utils/format.ts'),
  ])

  const renderPage = (Page, path) => renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: [path] },
      React.createElement(AuthProvider, null, React.createElement(Page)),
    ),
  )

  const landing = renderPage(LandingPage, '/')
  assert.match(landing, /A calmer way to understand every family health report/)
  assert.match(landing, /AI Report Reader/)
  assert.match(landing, /Create health workspace/)

  const login = renderPage(LoginPage, '/login')
  assert.match(login, /Welcome back/)
  assert.match(login, /type="email"/)
  assert.match(login, /type="password"/)

  const register = renderPage(RegisterPage, '/register')
  assert.match(register, /Create your profile/)
  assert.match(register, /Phone number/)
  assert.match(register, /Family name/)
  assert.match(register, /Profile photo/)
  assert.match(register, /minLength="8"/)

  assert.equal(format.documentTypeLabel('BLOOD_REPORT'), 'Blood report')
  assert.equal(format.statusLabel('COMPLETED'), 'Completed')
  assert.equal(format.initials('Aarogya Kul'), 'AK')

  console.log('Frontend smoke tests passed: landing, login, register, and shared formatters.')
} finally {
  await vite.close()
}

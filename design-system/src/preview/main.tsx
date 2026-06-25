// SPDX-License-Identifier: Apache-2.0
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Preview } from './Preview'
import '../foundation/fonts.css'
import '../foundation/tokens.css'

const el = document.getElementById('root')
if (el) createRoot(el).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
)

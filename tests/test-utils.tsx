import React, { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import { LanguageProvider } from '@/components/language-provider'

export function renderWithProviders(ui: React.ReactElement) {
  function Wrapper({ children }: PropsWithChildren) {
    return <LanguageProvider>{children}</LanguageProvider>
  }
  return render(ui, { wrapper: Wrapper })
}

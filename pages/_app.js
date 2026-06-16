import { ClerkProvider } from '@clerk/nextjs'
import { heIL } from '@clerk/localizations'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider localization={heIL}>
      <Component {...pageProps} />
    </ClerkProvider>
  )
}

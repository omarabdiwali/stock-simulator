import '@/styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { SnackbarProvider } from 'notistack'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SnackbarProvider>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </SnackbarProvider>
  )
}

import { homeJsonLd } from 'helpers/constants/seo'
import { HomeAbout } from 'components/homeAbout'
import { JsonLd } from 'components/jsonLd'

// The start screen. The game itself renders from the layout; this page adds the text under it for search engines
// and readers.
export default function StartPage() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <HomeAbout />
    </>
  )
}

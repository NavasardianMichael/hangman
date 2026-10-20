import { homeJsonLd } from 'helpers/constants/seo'
import { JsonLd } from 'components/jsonLd'

// The start screen. The game itself renders from the layout.
export default function StartPage() {
  return <JsonLd data={homeJsonLd} />
}

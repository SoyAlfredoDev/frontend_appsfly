import SeoArticlePage from '../../components/seo/SeoArticlePage'
import { requirePublicPage } from '../../seo/publicSeo'

const page = requirePublicPage('/precios')

export default function PreciosPage() {
  return <SeoArticlePage page={page} showPlans />
}

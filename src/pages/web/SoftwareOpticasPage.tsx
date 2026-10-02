import SeoArticlePage from '../../components/seo/SeoArticlePage'
import { requirePublicPage } from '../../seo/publicSeo'

const page = requirePublicPage('/software-para-opticas')

export default function SoftwareOpticasPage() {
  return <SeoArticlePage page={page} />
}

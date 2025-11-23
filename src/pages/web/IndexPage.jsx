import HeroComponent from './HeroComponent.jsx';
import WhyComponent from './WhyComponent.jsx';
import ReportsSection from './ReportsSection.jsx';
import WhatsAppButton from '../../components/WhatsAppButton.jsx';
import FooterSection from './FooterSection.jsx';


export default function IndexPage() {
    return (
        <div>
            <HeroComponent />
            <WhyComponent />
            <ReportsSection />
            <WhatsAppButton />
            <FooterSection />
        </div>
    );
}
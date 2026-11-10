import AboutCategories from "../components/About/Aboutcategories";
import AboutHero from "../components/About/Abouthero";
import AboutStats from "../components/About/Aboutstats";
import ContactForm from "../components/About/Contactform";
import FAQ from "../components/About/Faq";
import WhyChooseUs from "../components/About/Whychooseus";

export default function About() {
  return (
    <main className="w-full pb-12 pt-[100px] bg-[#e5e6e8]">
      <AboutHero />
      <AboutStats />
      <WhyChooseUs />
      <AboutCategories />
      <FAQ />
      <ContactForm />
    </main>
  );
}

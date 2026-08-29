import Navbar from "../Components/Navbar";
import Banner from "../Components/Banner";
import AIMatchmaking from "../Components/AIMatchmaking";
import WhyChooseUs from "../Components/Whychooseus";
import SuccessStories from "../Components/SuccessStories";
import FQA from "../Components/FQA";
import Footer from "../Components/Footer";
const LandingPage = () => {
  return (
    <>
      <div className="LandingPage">
        <Navbar />
        <Banner />
        <AIMatchmaking />
        <WhyChooseUs />
        <SuccessStories />
        <FQA />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;

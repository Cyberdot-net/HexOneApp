import React from "react";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";
export default function App() {

  React.useEffect(() => {
    document.body.classList.toggle("landing-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("landing-page");
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="wrapper" style={{minHeight: 'calc(100vh - 293px)'}}>
        <section className="section section-lg section-coins">
          <h1>Welcome HEX1!</h1>
        </section>
      </div>
      <Footer />
    </>
  );
}
